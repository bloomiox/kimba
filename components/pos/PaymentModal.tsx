import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { CreditCardIcon, CheckCircleIcon } from '../common/Icons';
import type { PaymentMethod } from '../../types';

interface PaymentModalProps {
  total: number;
  onConfirm: (paymentMethod: PaymentMethod) => void;
  onCancel: () => void;
  onComplete: () => void;
}

// FIX: Changed to a named export to match the import in POSPage.
export const PaymentModal: React.FC<PaymentModalProps> = ({
  total,
  onConfirm,
  onCancel,
  onComplete,
}) => {
  const { t, currency } = useSettings();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [isPaid, setIsPaid] = useState(false);

  const handleConfirm = () => {
    onConfirm(selectedMethod);
    setIsPaid(true);
  };

  const langCode = t('language.code');
  const formattedTotal = total.toLocaleString(langCode, { style: 'currency', currency: currency });

  if (isPaid) {
    return (
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-8 text-center animate-fade-in">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t('pos.payment.success')}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Total paid: {formattedTotal}</p>
          <button
            onClick={onComplete}
            className="w-full px-6 py-3 bg-accent hover:opacity-90 rounded-lg font-semibold text-white"
          >
            {t('pos.payment.newSale')}
          </button>
        </div>
      </div>
    );
  }

  const paymentOptions: { id: PaymentMethod; label: string }[] = [
    { id: 'card', label: t('pos.payment.card') },
    { id: 'cash', label: t('pos.payment.cash') },
    { id: 'twint', label: t('pos.payment.twint') },
  ];

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 relative animate-fade-in">
        <h2 className="text-2xl font-bold mb-1 text-center">{t('pos.payment.title')}</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
          {t('pos.payment.pay', { amount: formattedTotal })}
        </p>
        <div className="space-y-3">
          {paymentOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setSelectedMethod(option.id)}
              className={`w-full p-4 border-2 rounded-lg font-semibold transition-all flex items-center gap-3 ${selectedMethod === option.id ? 'border-accent bg-accent/10' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}
            >
              <CreditCardIcon className="w-6 h-6" />
              {option.label}
            </button>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold text-gray-800 dark:text-gray-200"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            className="w-full px-6 py-3 bg-accent hover:opacity-90 rounded-lg font-semibold text-white"
          >
            {t('pos.payment.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};
