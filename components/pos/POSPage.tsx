import React, { useState, useMemo, useCallback } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { UserIcon, PlusIcon, TrashIcon } from '../common/Icons';
import type { Client, Hairstylist, SaleItem, Service, Product, PaymentMethod, ServiceGroup, Coupon } from '../../types';
import { PaymentModal } from './PaymentModal';

const POSPage: React.FC = () => {
    const { clients, hairstylists, services, serviceGroups, products, addSale, t, currency, vatRate, coupons } = useSettings();
    
    // State for the current transaction
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [selectedHairstylistId, setSelectedHairstylistId] = useState<string>('');
    const [cart, setCart] = useState<SaleItem[]>([]);
    const [tip, setTip] = useState<number>(0);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [couponError, setCouponError] = useState('');
    const [useVat, setUseVat] = useState<boolean>(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [clientSearch, setClientSearch] = useState('');
    const [catalogTab, setCatalogTab] = useState<'services' | 'products'>('services');

    const resetSale = useCallback(() => {
        setSelectedClientId(null);
        setSelectedHairstylistId('');
        setCart([]);
        setTip(0);
        setCouponCode('');
        setAppliedCoupon(null);
        setCouponError('');
        setUseVat(true);
        setClientSearch('');
        setIsPaymentModalOpen(false);
    }, []);
    
    const filteredClients = useMemo(() => 
        clientSearch ? clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())) : [],
        [clients, clientSearch]
    );

    const calculations = useMemo(() => {
        const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
        let discountAmount = 0;
        if (appliedCoupon) {
            if (appliedCoupon.discountType === 'fixed') {
                discountAmount = appliedCoupon.discountValue;
            } else { // percentage
                discountAmount = subtotal * (appliedCoupon.discountValue / 100);
            }
        }
        const discountedSubtotal = subtotal - discountAmount;
        const vatAmount = useVat ? discountedSubtotal * (vatRate / 100) : 0;
        const total = discountedSubtotal + vatAmount + tip;
        return { subtotal, discountAmount, vatAmount, total };
    }, [cart, tip, useVat, vatRate, appliedCoupon]);

    const handleApplyCoupon = () => {
        setCouponError('');
        const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
        if (coupon && coupon.isActive) {
            setAppliedCoupon(coupon);
        } else if (coupon && !coupon.isActive) {
            setCouponError(t('pos.coupon.inactive'));
            setAppliedCoupon(null);
        } else {
            setCouponError(t('pos.coupon.invalid'));
            setAppliedCoupon(null);
        }
    };

    const handleAddItem = (item: Service | Product, type: 'service' | 'product') => {
        const saleItem: SaleItem = { id: item.id, name: item.name, price: item.price, type };
        setCart(prev => [...prev, saleItem]);
    };

    const handleRemoveItem = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleRoundUp = () => {
        const currentTotal = calculations.total - tip;
        const roundedTotal = Math.ceil(currentTotal);
        const newTip = roundedTotal - currentTotal;
        setTip(Number(newTip.toFixed(2)));
    };

    const handleCheckout = (paymentMethod: PaymentMethod) => {
        if (!selectedHairstylistId || cart.length === 0) {
            alert("Please select a hairstylist and add items to the cart.");
            return;
        }
        addSale({
            clientId: selectedClientId,
            hairstylistId: selectedHairstylistId,
            items: cart,
            subtotal: calculations.subtotal,
            discount: appliedCoupon ? { amount: calculations.discountAmount, reason: appliedCoupon.code } : null,
            vatRate: useVat ? vatRate : 0,
            vatAmount: calculations.vatAmount,
            tip,
            total: calculations.total,
            paymentMethod,
        });
        // Success state is handled in the modal, which then calls resetSale
    };

    const ServiceTree: React.FC<{ parentId: string | null; level: number }> = ({ parentId, level }) => {
        const childGroups = serviceGroups.filter(g => g.parentId === parentId).sort((a,b) => a.name.localeCompare(b.name));
        const childServices = services.filter(s => s.parentId === parentId).sort((a,b) => a.name.localeCompare(b.name));
        return (
          <div className={`${level > 0 ? 'ml-4' : ''}`}>
            {childGroups.map(group => (
              <div key={group.id} className="my-1">
                <p className="font-semibold text-gray-500 dark:text-gray-400 mt-2">{group.name}</p>
                <ServiceTree parentId={group.id} level={level + 1} />
              </div>
            ))}
            {childServices.map(service => (
              <button key={service.id} onClick={() => handleAddItem(service, 'service')} className="w-full text-left p-2 my-1 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md transition-colors">
                {service.name} - {service.price.toLocaleString(langCode, {style: 'currency', currency})}
              </button>
            ))}
          </div>
        );
    };
    
    const langCode = t('language.code');

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full animate-fade-in">
            {/* Left Column: Cart & Checkout */}
            <div className="w-full lg:w-2/5 xl:w-1/3 flex flex-col gap-4">
                <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
                    <h3 className="font-bold mb-2 text-gray-800 dark:text-gray-200">{t('pos.customer')}</h3>
                    <div className="relative">
                        <input type="text" value={clientSearch} onChange={e => {setClientSearch(e.target.value); setSelectedClientId(null);}} placeholder={t('pos.selectCustomer')} className="w-full p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"/>
                        {clientSearch && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                {filteredClients.map(c => <button key={c.id} onClick={() => { setSelectedClientId(c.id); setClientSearch(c.name);}} className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">{c.name}</button>)}
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
                    <h3 className="font-bold mb-2 text-gray-800 dark:text-gray-200">{t('pos.hairstylist')}</h3>
                    <select value={selectedHairstylistId} onChange={e => setSelectedHairstylistId(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg">
                        <option value="" disabled>{t('pos.selectHairstylist')}</option>
                        {hairstylists.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                </div>
                <div className="flex-grow flex flex-col p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
                    {cart.length === 0 ? (
                        <div className="m-auto text-center text-gray-500">
                            <p>{t('pos.cart.empty')}</p>
                        </div>
                    ) : (
                        <div className="flex-grow overflow-y-auto -mr-2 pr-2">
                           {cart.map((item, index) => (
                               <div key={index} className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                                   <div>
                                       <p className="font-semibold">{item.name}</p>
                                       <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                                   </div>
                                   <div className="flex items-center gap-4">
                                       <p className="font-semibold">{item.price.toLocaleString(langCode, {style: 'currency', currency})}</p>
                                       <button onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                                   </div>
                               </div>
                           ))}
                        </div>
                    )}
                    <div className="flex-shrink-0 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between"><span>{t('pos.summary.subtotal')}</span><span>{calculations.subtotal.toLocaleString(langCode, {style: 'currency', currency})}</span></div>
                        <div className="flex justify-between items-center">
                            <span>{t('pos.summary.discount')}</span>
                            {appliedCoupon ? (
                                <div className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-2">
                                    <span>- {calculations.discountAmount.toLocaleString(langCode, {style: 'currency', currency})}</span>
                                    <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-red-500 text-xs">({t('common.remove')})</button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1">
                                    <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder={t('pos.coupon.code')} className="w-24 p-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-md uppercase" />
                                    <button onClick={handleApplyCoupon} className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300">{t('pos.summary.apply')}</button>
                                </div>
                            )}
                        </div>
                        {couponError && <p className="text-right text-xs text-red-500">{couponError}</p>}
                        <div className="flex justify-between items-center">
                            <label htmlFor="vatToggle" className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" id="vatToggle" checked={useVat} onChange={e => setUseVat(e.target.checked)} className="w-4 h-4 rounded text-accent focus:ring-accent" />
                                {t('pos.summary.vat')} ({vatRate}%)
                            </label>
                            <span>{calculations.vatAmount.toLocaleString(langCode, {style: 'currency', currency})}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>{t('pos.summary.tip')}</span>
                            <div className="flex items-center gap-2">
                                <button onClick={handleRoundUp} className="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300">{t('pos.summary.roundUp')}</button>
                                <input type="number" value={tip} onChange={e => setTip(Number(e.target.value))} className="w-16 p-1 text-right bg-gray-100 dark:bg-gray-700 rounded-md" placeholder="0.00" />
                            </div>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-gray-600">
                            <span>{t('pos.summary.total')}</span>
                            <span>{calculations.total.toLocaleString(langCode, {style: 'currency', currency})}</span>
                        </div>
                    </div>
                    <button onClick={() => setIsPaymentModalOpen(true)} disabled={cart.length === 0 || !selectedHairstylistId} className="w-full mt-4 py-3 bg-accent text-white font-bold rounded-lg hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                        {t('pos.checkout')}
                    </button>
                </div>
            </div>

            {/* Right Column: Catalog */}
            <div className="w-full lg:w-3/5 xl:w-2/3 p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50 flex flex-col">
                <div className="flex-shrink-0 flex border-b dark:border-gray-700 mb-2">
                    <button onClick={() => setCatalogTab('services')} className={`px-4 py-2 font-semibold ${catalogTab === 'services' ? 'text-accent border-b-2 border-accent' : 'text-gray-500'}`}>{t('pos.catalog.services')}</button>
                    <button onClick={() => setCatalogTab('products')} className={`px-4 py-2 font-semibold ${catalogTab === 'products' ? 'text-accent border-b-2 border-accent' : 'text-gray-500'}`}>{t('pos.catalog.products')}</button>
                </div>
                <div className="flex-grow overflow-y-auto -mr-2 pr-2">
                    {catalogTab === 'services' ? (
                        <ServiceTree parentId={null} level={0} />
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {products.map(product => (
                                <button key={product.id} onClick={() => handleAddItem(product, 'product')} className="p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md transition-colors text-left">
                                    <p className="font-semibold">{product.name}</p>
                                    <p className="text-sm">{product.price.toLocaleString(langCode, {style: 'currency', currency})}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {isPaymentModalOpen && <PaymentModal total={calculations.total} onConfirm={handleCheckout} onCancel={() => setIsPaymentModalOpen(false)} onComplete={resetSale} />}
        </div>
    );
};

export default POSPage;