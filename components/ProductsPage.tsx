import React, { useState, useMemo, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { mapToAccentColor } from '../utils/colorUtils';
import {
  ShoppingBagIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  ListIcon,
  GridIcon,
  UploadIcon,
  DownloadIcon,
} from './common/Icons';
import type { Product } from '../types';
import Button from './common/Button';
import Input from './common/Input';
import Card from './common/Card';
import Modal from './common/Modal';

type ViewMode = 'list' | 'card';
type SortField = 'name' | 'price' | 'inStock' | 'category' | 'createdAt';
type SortOrder = 'asc' | 'desc';

interface ProductFilters {
  category: string;
  inStock: 'all' | 'inStock' | 'lowStock' | 'outOfStock';
}

const ProductsPage: React.FC = () => {
  const { products, addProduct, deleteProduct, updateProduct, currency, t } = useSettings();
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [filters, setFilters] = useState<ProductFilters>({
    category: '',
    inStock: 'all',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category).filter(Boolean))].sort();
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const searchMatch =
        searchTerm === '' ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase());

      const categoryMatch = filters.category === '' || product.category === filters.category;

      let stockMatch = true;
      if (filters.inStock === 'inStock') stockMatch = product.inStock > 0;
      else if (filters.inStock === 'outOfStock') stockMatch = product.inStock === 0;
      else if (filters.inStock === 'lowStock')
        stockMatch = product.minStock ? product.inStock <= product.minStock : false;

      return searchMatch && categoryMatch && stockMatch;
    });

    return filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, searchTerm, sortField, sortOrder, filters]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.inStock === 0) return 'outOfStock';
    if (product.minStock && product.inStock <= product.minStock) return 'lowStock';
    return 'inStock';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'outOfStock':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'lowStock':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'inStock':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(t('language.code'), {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async e => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      if (!['name', 'price'].every(h => headers.includes(h))) {
        alert('CSV must contain at least "name" and "price" columns');
        return;
      }

      const productsToImport = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const product: any = {};
        headers.forEach((header, index) => {
          const value = values[index] || '';
          if (value) {
            switch (header) {
              case 'name':
                product.name = value;
                break;
              case 'description':
                product.description = value;
                break;
              case 'price':
                product.price = parseFloat(value);
                break;
              case 'cost_price':
                product.costPrice = parseFloat(value);
                break;
              case 'in_stock':
                product.inStock = parseInt(value);
                break;
              case 'min_stock':
                product.minStock = parseInt(value);
                break;
              case 'category':
                product.category = value;
                break;
              case 'brand':
                product.brand = value;
                break;
              case 'sku':
                product.sku = value;
                break;
              case 'barcode':
                product.barcode = value;
                break;
              case 'supplier':
                product.supplier = value;
                break;
              case 'image_url':
                product.imageUrl = value;
                break;
            }
          }
        });
        return product;
      });

      const importPromises = productsToImport
        .filter(p => p.name && p.price)
        .map(p =>
          addProduct({
            ...p,
            inStock: p.inStock || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
          })
        );

      await Promise.all(importPromises);
      alert(`Successfully imported ${importPromises.length} products`);
      setIsImportModalOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const downloadCSVTemplate = () => {
    const headers = [
      'name',
      'description',
      'price',
      'cost_price',
      'in_stock',
      'min_stock',
      'category',
      'brand',
      'sku',
      'barcode',
      'supplier',
      'image_url',
    ];
    const exampleRow = [
      'Sample Product',
      'A great product',
      '29.99',
      '15.00',
      '100',
      '10',
      'Hair Care',
      'BrandName',
      'SKU001',
      '123456789',
      'Supplier Inc',
      'https://example.com/image.jpg',
    ];
    const csvContent = [headers.join(','), exampleRow.join(',')].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'products_template.csv';
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm(t('confirmDeleteProducts', { count: 1 }))) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
      }
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProducts(filteredAndSortedProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(t('confirmDeleteProducts', { count: selectedProducts.length }))) {
      selectedProducts.forEach(id => deleteProduct(id));
      setSelectedProducts([]);
    }
  };

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${mapToAccentColor('bg-accent-100 dark:bg-accent-900/30')}`}
          >
            <ShoppingBagIcon
              className={`w-6 h-6 ${mapToAccentColor('text-accent-600 dark:text-accent-300')}`}
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
          <span
            className={`${mapToAccentColor('bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-200')} text-sm font-medium px-2.5 py-1 rounded-full`}
          >
            {filteredAndSortedProducts.length}
          </span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {selectedProducts.length > 0 ? (
            <Button onClick={handleDeleteSelected} variant="danger" className="flex-1 sm:flex-none">
              <TrashIcon className="w-4 h-4" />
              <span>Delete ({selectedProducts.length})</span>
            </Button>
          ) : (
            <>
              <Button onClick={() => setIsImportModalOpen(true)} className="flex-1 sm:flex-none">
                <UploadIcon className="w-4 h-4" />
                <span>Import</span>
              </Button>
              <Button onClick={() => handleOpenModal()} className="flex-1 sm:flex-none">
                <PlusIcon className="w-4 h-4" />
                <span>Add Product</span>
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="mb-6 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-sm">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <select
              value={filters.category}
              onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={filters.inStock}
              onChange={e => setFilters(prev => ({ ...prev, inStock: e.target.value as any }))}
              className="p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition"
            >
              <option value="all">All Stock</option>
              <option value="inStock">In Stock</option>
              <option value="lowStock">Low Stock</option>
              <option value="outOfStock">Out of Stock</option>
            </select>
            <div className={`flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-1`}>
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'card' ? `bg-white dark:bg-gray-700 shadow-sm ${mapToAccentColor('text-accent-600')}` : 'text-gray-500 hover:text-gray-700'}`}
              >
                <GridIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? `bg-white dark:bg-gray-700 shadow-sm ${mapToAccentColor('text-accent-600')}` : 'text-gray-500 hover:text-gray-700'}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {filteredAndSortedProducts.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center py-12">
          <ShoppingBagIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            No products found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Get started by adding your first product to the inventory.
          </p>
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="w-4 h-4" />
            <span>Add First Product</span>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex-shrink-0 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"
                checked={
                  selectedProducts.length > 0 &&
                  selectedProducts.length === filteredAndSortedProducts.length
                }
                onChange={handleSelectAll}
                ref={input => {
                  if (input)
                    input.indeterminate =
                      selectedProducts.length > 0 &&
                      selectedProducts.length < filteredAndSortedProducts.length;
                }}
              />
              <label className="text-sm text-gray-600 dark:text-gray-400">
                {selectedProducts.length > 0 ? `${selectedProducts.length} selected` : 'Select all'}
              </label>
            </div>
          </div>
          <div
            className={`flex-grow overflow-y-auto ${viewMode === 'card' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-3'}`}
          >
            {filteredAndSortedProducts.map(product =>
              viewMode === 'card' ? (
                <Card
                  key={product.id}
                  className={`overflow-hidden flex flex-col p-0 transition-all ${selectedProducts.includes(product.id) ? `ring-2 ${mapToAccentColor('ring-accent-500')}` : ''}`}
                >
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-gray-300 text-accent-600 focus:ring-accent-500"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                    />
                  </div>
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {product.description && (
                      <p
                        className="text-sm text-gray-600 dark:text-gray-400 mb-2 overflow-hidden"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {product.description}
                      </p>
                    )}
                    <div className="flex-grow" />
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatPrice(product.price)}
                      </span>
                      {product.costPrice && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Cost: {formatPrice(product.costPrice)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(getStockStatus(product))}`}
                      >
                        {product.inStock} in stock
                      </span>
                      {product.category && (
                        <span className="text-gray-500 dark:text-gray-400 truncate">
                          {product.category}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ) : (
                <Card
                  key={product.id}
                  className={`p-4 flex items-center gap-4 transition-all ${selectedProducts.includes(product.id) ? `ring-2 ${mapToAccentColor('ring-accent-500')}` : ''}`}
                >
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-accent-600 focus:ring-accent-500 flex-shrink-0"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                  />
                  <div className="flex items-center justify-between gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {product.sku && <span>SKU: {product.sku}</span>}
                          {product.category && <span>Category: {product.category}</span>}
                          {product.brand && <span>Brand: {product.brand}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatPrice(product.price)}
                      </div>
                      {product.costPrice && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Cost: {formatPrice(product.costPrice)}
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(getStockStatus(product))}`}
                      >
                        {product.inStock} in stock
                      </div>
                      {product.minStock && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Min: {product.minStock}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              )
            )}
          </div>
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        className="max-w-2xl"
      >
        <form
          onSubmit={async e => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const productData = {
              name: formData.get('name') as string,
              description: formData.get('description') as string,
              price: parseFloat(formData.get('price') as string),
              costPrice: parseFloat(formData.get('costPrice') as string) || undefined,
              inStock: parseInt(formData.get('inStock') as string) || 0,
              minStock: parseInt(formData.get('minStock') as string) || undefined,
              category: formData.get('category') as string,
              brand: formData.get('brand') as string,
              sku: formData.get('sku') as string,
              barcode: formData.get('barcode') as string,
              supplier: formData.get('supplier') as string,
              imageUrl: formData.get('imageUrl') as string,
              createdAt: editingProduct?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isActive: true,
            };

            try {
              if (editingProduct) {
                await updateProduct({ ...productData, id: editingProduct.id });
              } else {
                await addProduct(productData);
              }
              setIsModalOpen(false);
              setEditingProduct(null);
            } catch (error) {
              console.error('Error saving product:', error);
              alert('Error saving product. Please try again.');
            }
          }}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
        >
          <Input
            name="name"
            required
            defaultValue={editingProduct?.name || ''}
            placeholder="Product Name"
          />
          <textarea
            name="description"
            defaultValue={editingProduct?.description || ''}
            placeholder="Description"
            className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
            rows={3}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              name="price"
              step="0.01"
              required
              defaultValue={editingProduct?.price || ''}
              placeholder={`Price (${currency})`}
            />
            <Input
              type="number"
              name="costPrice"
              step="0.01"
              defaultValue={editingProduct?.costPrice || ''}
              placeholder={`Cost Price (${currency})`}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              name="inStock"
              defaultValue={editingProduct?.inStock || 0}
              placeholder="Stock Quantity"
            />
            <Input
              type="number"
              name="minStock"
              defaultValue={editingProduct?.minStock || ''}
              placeholder="Min Stock Level"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="category"
              defaultValue={editingProduct?.category || ''}
              placeholder="Category"
            />
            <Input name="brand" defaultValue={editingProduct?.brand || ''} placeholder="Brand" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="sku" defaultValue={editingProduct?.sku || ''} placeholder="SKU" />
            <Input
              name="barcode"
              defaultValue={editingProduct?.barcode || ''}
              placeholder="Barcode"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="supplier"
              defaultValue={editingProduct?.supplier || ''}
              placeholder="Supplier"
            />
            <Input
              type="url"
              name="imageUrl"
              defaultValue={editingProduct?.imageUrl || ''}
              placeholder="Image URL"
            />
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingProduct(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">{editingProduct ? 'Update Product' : 'Add Product'}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Products from CSV"
        className="max-w-lg"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              CSV Format Requirements:
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
              Headers should include: <strong>name</strong> (required) and <strong>price</strong>{' '}
              (required).
            </p>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>
                name, description, price, cost_price, in_stock, min_stock, category, brand, sku,
                barcode, supplier, image_url
              </li>
            </ul>
          </div>
          <div className="flex justify-center">
            <Button onClick={downloadCSVTemplate}>
              <DownloadIcon className="w-4 h-4" />
              <span>Download Template</span>
            </Button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select CSV File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition"
            />
          </div>
          <div className="pt-2 flex justify-end">
            <Button variant="secondary" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductsPage;
