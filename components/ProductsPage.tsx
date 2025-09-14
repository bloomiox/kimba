import React, { useState, useMemo, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import {
    ShoppingBagIcon, PlusIcon, CloseIcon, EditIcon, TrashIcon,
    FilterIcon, ListIcon, GridIcon, UploadIcon, DownloadIcon,
    CheckIcon, MoreVerticalIcon
} from './common/Icons';
import type { Product } from '../types';

type ViewMode = 'list' | 'card';
type SortField = 'name' | 'price' | 'inStock' | 'category' | 'createdAt';
type SortOrder = 'asc' | 'desc';

interface ProductFilters {
    category: string;
    inStock: 'all' | 'inStock' | 'lowStock' | 'outOfStock';
    priceRange: { min: number; max: number };
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
        priceRange: { min: 0, max: 1000 }
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const categories = useMemo(() => {
        const cats = products
            .map(p => p.category)
            .filter((cat): cat is string => Boolean(cat))
            .filter((cat, index, arr) => arr.indexOf(cat) === index)
            .sort();
        return cats;
    }, [products]);

    const filteredAndSortedProducts = useMemo(() => {
        let filtered = products.filter(product => {
            const searchMatch = searchTerm === '' ||
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.brand?.toLowerCase().includes(searchTerm.toLowerCase());

            const categoryMatch = filters.category === '' || product.category === filters.category;

            let stockMatch = true;
            if (filters.inStock === 'inStock') {
                stockMatch = product.inStock > 0;
            } else if (filters.inStock === 'outOfStock') {
                stockMatch = product.inStock === 0;
            } else if (filters.inStock === 'lowStock') {
                stockMatch = product.minStock ? product.inStock <= product.minStock : false;
            }

            return searchMatch && categoryMatch && stockMatch;
        });

        return filtered.sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            if (sortField === 'createdAt') {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            }

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [products, searchTerm, sortField, sortOrder, filters]);

    const handleSelectProduct = (productId: string) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleSelectAll = () => {
        if (selectedProducts.length === filteredAndSortedProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filteredAndSortedProducts.map(p => p.id));
        }
    };

    const handleDeleteSelected = () => {
        if (window.confirm(t('confirmDeleteProducts', { count: selectedProducts.length }))) {
            selectedProducts.forEach(id => deleteProduct(id));
            setSelectedProducts([]);
        }
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
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
            case 'outOfStock': return 'text-red-600 bg-red-50';
            case 'lowStock': return 'text-yellow-600 bg-yellow-50';
            case 'inStock': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD'
        }).format(price);
    };

    const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const csv = e.target?.result as string;
            const lines = csv.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            
            // Expected headers: name, description, price, cost_price, in_stock, min_stock, category, brand, sku, barcode, supplier, image_url
            const requiredHeaders = ['name', 'price'];
            const hasRequiredHeaders = requiredHeaders.every(header => headers.includes(header));
            
            if (!hasRequiredHeaders) {
                alert('CSV must contain at least "name" and "price" columns');
                return;
            }

            const products = lines.slice(1).filter(line => line.trim()).map(line => {
                const values = line.split(',').map(v => v.trim());
                const product: any = {};
                
                headers.forEach((header, index) => {
                    const value = values[index] || '';
                    switch (header) {
                        case 'name':
                            product.name = value;
                            break;
                        case 'description':
                            product.description = value;
                            break;
                        case 'price':
                            product.price = parseFloat(value) || 0;
                            break;
                        case 'cost_price':
                            product.costPrice = value ? parseFloat(value) : undefined;
                            break;
                        case 'in_stock':
                            product.inStock = parseInt(value) || 0;
                            break;
                        case 'min_stock':
                            product.minStock = value ? parseInt(value) : undefined;
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
                });

                // Set required fields
                product.createdAt = new Date().toISOString();
                product.updatedAt = new Date().toISOString();
                product.isActive = true;

                return product;
            });

            // Import products
            let importedCount = 0;
            const importPromises = products.map(async (product) => {
                if (product.name && product.price) {
                    try {
                        await addProduct(product);
                        importedCount++;
                    } catch (error) {
                        console.error('Error importing product:', product.name, error);
                    }
                }
            });

            Promise.all(importPromises).then(() => {
                alert(`Successfully imported ${importedCount} products`);
                setIsImportModalOpen(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            });
        };
        reader.readAsText(file);
    };

    const downloadCSVTemplate = () => {
        const headers = ['name', 'description', 'price', 'cost_price', 'in_stock', 'min_stock', 'category', 'brand', 'sku', 'barcode', 'supplier', 'image_url'];
        const csvContent = headers.join(',') + '\n' + 
                          'Sample Product,Sample description,29.99,15.00,100,10,Hair Care,Brand Name,SKU001,123456789,Supplier Name,https://example.com/image.jpg';
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'products_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <>
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <ShoppingBagIcon className="w-8 h-8 text-purple-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <span className="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                        {filteredAndSortedProducts.length}
                    </span>
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <UploadIcon className="w-4 h-4" />
                        <span>Import CSV</span>
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                    <div className="flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>

                        <select
                            value={filters.inStock}
                            onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.value as any }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">All Stock</option>
                            <option value="inStock">In Stock</option>
                            <option value="lowStock">Low Stock</option>
                            <option value="outOfStock">Out of Stock</option>
                        </select>

                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('card')}
                                className={`p-2 rounded-md transition-colors ${
                                    viewMode === 'card' 
                                        ? 'bg-white shadow-sm text-purple-600' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <GridIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-colors ${
                                    viewMode === 'list' 
                                        ? 'bg-white shadow-sm text-purple-600' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <ListIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {filteredAndSortedProducts.length === 0 ? (
                <div className="text-center py-12">
                    <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500 mb-6">Get started by adding your first product to the inventory.</p>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mx-auto"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>Add First Product</span>
                    </button>
                </div>
            ) : (
                <div className={viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                    {filteredAndSortedProducts.map(product => (
                        viewMode === 'card' ? (
                            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                {product.imageUrl && (
                                    <img 
                                        src={product.imageUrl} 
                                        alt={product.name}
                                        className="w-full h-48 object-cover"
                                    />
                                )}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                                        <div className="flex items-center space-x-1 ml-2">
                                            <button
                                                onClick={() => {
                                                    setEditingProduct(product);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-1 text-gray-400 hover:text-gray-600"
                                            >
                                                <EditIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Are you sure you want to delete this product?')) {
                                                        try {
                                                            await deleteProduct(product.id);
                                                        } catch (error) {
                                                            console.error('Error deleting product:', error);
                                                            alert('Error deleting product. Please try again.');
                                                        }
                                                    }
                                                }}
                                                className="p-1 text-gray-400 hover:text-red-600"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {product.description && (
                                        <p className="text-sm text-gray-600 mb-2 overflow-hidden" style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical'
                                        }}>{product.description}</p>
                                    )}
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                                        {product.costPrice && (
                                            <span className="text-sm text-gray-500">Cost: {formatPrice(product.costPrice)}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(getStockStatus(product))}`}>
                                            {product.inStock} in stock
                                        </span>
                                        {product.category && (
                                            <span className="text-gray-500">{product.category}</span>
                                        )}
                                    </div>
                                    {product.sku && (
                                        <div className="mt-2 text-xs text-gray-500">SKU: {product.sku}</div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        {product.imageUrl && (
                                            <img 
                                                src={product.imageUrl} 
                                                alt={product.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                            {product.description && (
                                                <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                                            )}
                                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                                {product.sku && <span>SKU: {product.sku}</span>}
                                                {product.category && <span>Category: {product.category}</span>}
                                                {product.brand && <span>Brand: {product.brand}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</div>
                                            {product.costPrice && (
                                                <div className="text-sm text-gray-500">Cost: {formatPrice(product.costPrice)}</div>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(getStockStatus(product))}`}>
                                                {product.inStock} in stock
                                            </div>
                                            {product.minStock && (
                                                <div className="text-xs text-gray-500 mt-1">Min: {product.minStock}</div>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => {
                                                    setEditingProduct(product);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-gray-600"
                                            >
                                                <EditIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Are you sure you want to delete this product?')) {
                                                        try {
                                                            await deleteProduct(product.id);
                                                        } catch (error) {
                                                            console.error('Error deleting product:', error);
                                                            alert('Error deleting product. Please try again.');
                                                        }
                                                    }
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-600"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>

        {/* Product Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
                    <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                        {editingProduct ? 'Edit Product' : 'Add Product'}
                    </h2>
                    <form onSubmit={async (e) => {
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
                    }} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                required 
                                defaultValue={editingProduct?.name || ''}
                                className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                            <textarea 
                                name="description" 
                                defaultValue={editingProduct?.description || ''}
                                className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" 
                                rows={3} 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price ({currency})</label>
                                <input 
                                    type="number" 
                                    name="price" 
                                    step="0.01" 
                                    required 
                                    defaultValue={editingProduct?.price || ''}
                                    className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cost Price ({currency})</label>
                                <input 
                                    type="number" 
                                    name="costPrice" 
                                    step="0.01" 
                                    defaultValue={editingProduct?.costPrice || ''}
                                    className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" 
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock Quantity</label>
                                <input 
                                    type="number" 
                                    name="inStock" 
                                    defaultValue={editingProduct?.inStock || 0}
                                    className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Min Stock</label>
                                <input 
                                    type="number" 
                                    name="minStock" 
                                    defaultValue={editingProduct?.minStock || ''}
                                    className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" 
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                <input 
                                    type="text" 
                                    name="category" 
                                    defaultValue={editingProduct?.category || ''}
                                    className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brand</label>
                                <input 
                                    type="text" 
                                    name="brand" 
                                    defaultValue={editingProduct?.brand || ''}
                                    className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" 
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SKU</label>
                                <input 
                                    type="text" 
                                    name="sku" 
                                    defaultValue={editingProduct?.sku || ''}
                                    className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Barcode</label>
                                <input 
                                    type="text" 
                                    name="barcode" 
                                    defaultValue={editingProduct?.barcode || ''}
                                    className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" 
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier</label>
                                <input 
                                    type="text" 
                                    name="supplier" 
                                    defaultValue={editingProduct?.supplier || ''}
                                    className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
                                <input 
                                    type="url" 
                                    name="imageUrl" 
                                    defaultValue={editingProduct?.imageUrl || ''}
                                    className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" 
                                />
                            </div>
                        </div>
                        <div className="pt-2 flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingProduct(null);
                                }} 
                                className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold text-gray-800 dark:text-gray-200"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-white">
                                {editingProduct ? 'Update Product' : 'Add Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* CSV Import Modal */}
        {isImportModalOpen && (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 relative">
                    <button 
                        onClick={() => setIsImportModalOpen(false)} 
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Import Products from CSV</h2>
                    
                    <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">CSV Format Requirements:</h3>
                            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                                Your CSV file should include these headers (in any order):
                            </p>
                            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                <li>• <strong>name</strong> (required) - Product name</li>
                                <li>• <strong>price</strong> (required) - Selling price</li>
                                <li>• <strong>description</strong> - Product description</li>
                                <li>• <strong>cost_price</strong> - Purchase/cost price</li>
                                <li>• <strong>in_stock</strong> - Current stock quantity</li>
                                <li>• <strong>min_stock</strong> - Minimum stock level</li>
                                <li>• <strong>category</strong> - Product category</li>
                                <li>• <strong>brand</strong> - Brand name</li>
                                <li>• <strong>sku</strong> - Stock keeping unit</li>
                                <li>• <strong>barcode</strong> - Product barcode</li>
                                <li>• <strong>supplier</strong> - Supplier name</li>
                                <li>• <strong>image_url</strong> - Product image URL</li>
                            </ul>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={downloadCSVTemplate}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <DownloadIcon className="w-4 h-4" />
                                <span>Download Template</span>
                            </button>
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
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900"
                            />
                        </div>

                        <div className="pt-2 flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={() => setIsImportModalOpen(false)} 
                                className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold text-gray-800 dark:text-gray-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default ProductsPage;