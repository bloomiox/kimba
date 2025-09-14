import React, { useState, useMemo } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { CreditCardIcon, CheckCircleIcon, XMarkIcon, UserIcon } from '../common/Icons';
import type { Appointment, Client, Service, Hairstylist, PaymentMethod } from '../../types';

interface AppointmentPaymentModalProps {
  appointment: Appointment;
  client: Client;
  service: Service;
  hairstylist: Hairstylist;
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
}

const AppointmentPaymentModal: React.FC<AppointmentPaymentModalProps> = ({
  appointment,
  client,
  service,
  hairstylist,
  isOpen,
  onClose,
  onPaymentComplete
}) => {
  const { t, currency, vatRate, addSale } = useSettings();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [isPaid, setIsPaid] = useState(false);
  const [tip, setTip] = useState<number>(0);
  const [useVat, setUseVat] = useState<boolean>(true);

  const calculations = useMemo(() => {
    const subtotal = service.price;
    const vatAmount = useVat ? subtotal * (vatRate / 100) : 0;
    const total = subtotal + vatAmount + tip;
    return { subtotal, vatAmount, total };
  }, [service.price, tip, useVat, vatRate]);

  const handleRoundUp = () => {
    const currentTotal = calculations.total - tip;
    const roundedTotal = Math.ceil(currentTotal);
    const newTip = roundedTotal - currentTotal;
    setTip(Number(newTip.toFixed(2)));
  };

  const handleConfirmPayment = () => {
    // Create a sale record for this appointment payment
    addSale({
      clientId: client.id,
      hairstylistId: hairstylist.id,
      items: [{
        id: service.id,
        name: service.name,
        price: service.price,
        type: 'service'
      }],
      subtotal: calculations.subtotal,
      discount: null,
      vatRate: useVat ? vatRate : 0,
      vatAmount: calculations.vatAmount,
      tip,
      total: calculations.total,
      paymentMethod: selectedMethod,
    });
    setIsPaid(true);
  };

  const handleComplete = () => {
    setIsPaid(false);
    setTip(0);
    setSelectedMethod('card');
    setUseVat(true);
    onPaymentComplete();
    onClose();
  };

  const langCode = t('language.code');
  const formattedTotal = calculations.total.toLocaleString(langCode, { style: 'currency', currency });
  const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);

  if (!isOpen) return null;

  if (isPaid) {
    return (
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8 text-center animate-fade-in">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t('pos.payment.success')}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            {t('booking.payment.paidFor')} {service.name}
          </p>
          <p className="text-lg font-semibold text-accent mb-6">{formattedTotal}</p>
          <button 
            onClick={handleComplete} 
            className="w-full px-6 py-3 bg-accent hover:opacity-90 rounded-lg font-semibold text-white"
          >
            {t('common.done')}
          </button>
        </div>
      </div>
    );
  }

  const paymentOptions: {id: PaymentMethod, label: string, icon: string}[] = [
    { id: 'card', label: t('pos.payment.card'), icon: '💳' },
    { id: 'cash', label: t('pos.payment.cash'), icon: '💵' },
    { id: 'twint', label: t('pos.payment.twint'), icon: '📱' },
  ];

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 text-center">{t('booking.payment.title')}</h2>
          
          {/* Client Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              {client.photoUrl ? (
                <img src={client.photoUrl} alt={client.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <div className="flex-grow">
              <p className="font-semibold text-lg">{client.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{client.email}</p>
              {client.phone && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{client.phone}</p>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-lg text-blue-900 dark:text-blue-100">{service.name}</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {appointmentDateTime.toLocaleDateString(langCode, { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {appointmentDateTime.toLocaleTimeString(langCode, { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} • {service.duration} {t('common.minutes')}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t('booking.payment.with')} {hairstylist.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {service.price.toLocaleString(langCode, { style: 'currency', currency })}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span>{t('pos.summary.subtotal')}</span>
              <span>{calculations.subtotal.toLocaleString(langCode, { style: 'currency', currency })}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <label htmlFor="vatToggle" className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  id="vatToggle" 
                  checked={useVat} 
                  onChange={e => setUseVat(e.target.checked)} 
                  className="w-4 h-4 rounded text-accent focus:ring-accent" 
                />
                {t('pos.summary.vat')} ({vatRate}%)
              </label>
              <span>{calculations.vatAmount.toLocaleString(langCode, { style: 'currency', currency })}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span>{t('pos.summary.tip')}</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleRoundUp} 
                  className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  {t('pos.summary.roundUp')}
                </button>
                <input 
                  type="number" 
                  value={tip} 
                  onChange={e => setTip(Number(e.target.value))} 
                  className="w-20 p-1 text-right bg-gray-100 dark:bg-gray-700 rounded-md text-sm" 
                  placeholder="0.00"
                  step="0.50"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-gray-600">
              <span>{t('pos.summary.total')}</span>
              <span>{formattedTotal}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold">{t('booking.payment.selectMethod')}</h3>
            {paymentOptions.map(option => (
              <button 
                key={option.id} 
                onClick={() => setSelectedMethod(option.id)}
                className={`w-full p-4 border-2 rounded-lg font-semibold transition-all flex items-center gap-3 ${
                  selectedMethod === option.id 
                    ? 'border-accent bg-accent/10' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <span className="text-2xl">{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={onClose} 
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold text-gray-800 dark:text-gray-200"
            >
              {t('common.cancel')}
            </button>
            <button 
              onClick={handleConfirmPayment} 
              className="flex-1 px-6 py-3 bg-accent hover:opacity-90 rounded-lg font-semibold text-white"
            >
              {t('booking.payment.payNow')} {formattedTotal}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentPaymentModal;