import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Coupon } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { PlusIcon, TrashIcon, EditIcon } from '../common/Icons';
import Modal from '../common/Modal';

const CouponsTab: React.FC = () => {
    const { coupons, addCoupon, updateCoupon, deleteCoupon, t } = useSettings();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setEditingCoupon(null);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if(window.confirm(t('marketing.coupons.deleteConfirm'))) {
            deleteCoupon(id);
        }
    };
    
    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{t('marketing.coupons.title')}</h3>
                <Button onClick={handleNew}><PlusIcon className="w-5 h-5"/> {t('marketing.coupons.new')}</Button>
            </div>
            
            <Card>
                {coupons.length > 0 ? (
                    <div className="space-y-3">
                        {coupons.map(coupon => (
                           <div key={coupon.id} className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg flex justify-between items-center">
                               <div>
                                   <p className="font-bold font-mono text-accent">{coupon.code}</p>
                                   <p className="text-sm text-gray-500">{coupon.discountType === 'fixed' ? `${coupon.discountValue.toLocaleString(t('language.code'), {style: 'currency', currency: t('currency.code')})} off` : `${coupon.discountValue}% off`}</p>
                               </div>
                               <div className="flex items-center gap-4">
                                   <button onClick={() => updateCoupon({...coupon, isActive: !coupon.isActive})} className={`${coupon.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}>
                                        <span className={`${coupon.isActive ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}/>
                                   </button>
                                   <Button onClick={() => handleEdit(coupon)} variant="secondary" className="p-2"><EditIcon className="w-4 h-4"/></Button>
                                   <Button onClick={() => handleDelete(coupon.id)} variant="secondary" className="p-2 hover:bg-red-500/20 hover:text-red-500"><TrashIcon className="w-4 h-4"/></Button>
                               </div>
                           </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-8 text-gray-500">{t('marketing.coupons.empty')}</p>
                )}
            </Card>

            {isModalOpen && <CouponModal coupon={editingCoupon} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const CouponModal: React.FC<{coupon: Coupon | null, onClose: () => void}> = ({ coupon, onClose }) => {
    const { addCoupon, updateCoupon, t } = useSettings();
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const code = (formData.get('code') as string).toUpperCase();
        const discountType = formData.get('discountType') as 'fixed' | 'percentage';
        const discountValue = parseFloat(formData.get('discountValue') as string);
        
        const couponData = { code, discountType, discountValue, isActive: coupon?.isActive ?? true };

        if (coupon) {
            updateCoupon({ ...coupon, ...couponData });
        } else {
            addCoupon(couponData);
        }
        onClose();
    };
    
    return (
        <Modal isOpen={true} onClose={onClose} title={coupon ? t('marketing.coupons.editTitle') : t('marketing.coupons.newTitle')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="code" className="block text-sm font-medium">{t('marketing.coupons.form.code')}</label>
                    <input type="text" name="code" id="code" defaultValue={coupon?.code} required className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg uppercase font-mono" />
                </div>
                <div className="flex gap-4">
                    <div className="flex-grow">
                        <label htmlFor="discountType" className="block text-sm font-medium">{t('marketing.coupons.form.type')}</label>
                        <select name="discountType" id="discountType" defaultValue={coupon?.discountType || 'percentage'} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg">
                            <option value="percentage">{t('marketing.coupons.form.percentage')}</option>
                            <option value="fixed">{t('marketing.coupons.form.fixed')}</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="discountValue" className="block text-sm font-medium">{t('marketing.coupons.form.value')}</label>
                        <input type="number" name="discountValue" id="discountValue" defaultValue={coupon?.discountValue} required min="0" step="0.01" className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" />
                    </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" onClick={onClose} variant="secondary">{t('common.cancel')}</Button>
                    <Button type="submit">{t('common.save')}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default CouponsTab;