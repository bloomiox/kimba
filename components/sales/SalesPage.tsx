import React, { useState, useMemo } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Sale } from '../../types';
import { CloseIcon, DollarSignIcon } from '../common/Icons';

const SalesPage: React.FC = () => {
  const { sales, clients, hairstylists, t, currency } = useSettings();
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [sort, setSort] = useState<'date-desc' | 'date-asc' | 'total-desc' | 'total-asc'>('date-desc');
  
  const langCode = t('language.code');

  const clientsById = useMemo(() => clients.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {} as Record<string, string>), [clients]);
  const hairstylistsById = useMemo(() => hairstylists.reduce((acc, h) => ({ ...acc, [h.id]: h.name }), {} as Record<string, string>), [hairstylists]);
  
  const sortedSales = useMemo(() => {
    return [...sales].sort((a, b) => {
      switch (sort) {
        case 'date-asc': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'total-desc': return b.total - a.total;
        case 'total-asc': return a.total - b.total;
        case 'date-desc':
        default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [sales, sort]);

  const SaleDetailsModal: React.FC<{ sale: Sale, onClose: () => void }> = ({ sale, onClose }) => {
    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fade-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('sales.receipt.title')}</h2>
                <div className="space-y-2 text-sm">
                    <p><strong>{t('sales.receipt.date')}:</strong> {new Date(sale.createdAt).toLocaleString(langCode, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    <p><strong>{t('pos.customer')}:</strong> {sale.clientId ? clientsById[sale.clientId] : t('pos.walkIn')}</p>
                    <p><strong>{t('pos.hairstylist')}:</strong> {hairstylistsById[sale.hairstylistId]}</p>
                </div>
                <div className="mt-4 pt-4 border-t dark:border-gray-600">
                    {sale.items.map((item, index) => (
                        <div key={index} className="flex justify-between">
                            <span>{item.name}</span>
                            <span>{item.price.toLocaleString(langCode, {style: 'currency', currency})}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-2 pt-2 border-t dark:border-gray-600 text-sm space-y-1">
                    <div className="flex justify-between"><span>{t('pos.summary.subtotal')}</span><span>{sale.subtotal.toLocaleString(langCode, {style: 'currency', currency})}</span></div>
                    {sale.discount && sale.discount.amount > 0 && <div className="flex justify-between text-green-600 dark:text-green-400"><span>{t('sales.receipt.discount')} ({sale.discount.reason})</span><span>- {sale.discount.amount.toLocaleString(langCode, {style: 'currency', currency})}</span></div>}
                    <div className="flex justify-between"><span>{t('pos.summary.vat')} ({sale.vatRate}%)</span><span>{sale.vatAmount.toLocaleString(langCode, {style: 'currency', currency})}</span></div>
                    <div className="flex justify-between"><span>{t('pos.summary.tip')}</span><span>{sale.tip.toLocaleString(langCode, {style: 'currency', currency})}</span></div>
                    <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t dark:border-gray-700"><span>{t('pos.summary.total')}</span><span>{sale.total.toLocaleString(langCode, {style: 'currency', currency})}</span></div>
                </div>
                 <div className="mt-4 text-center text-xs text-gray-500 capitalize">{t('sales.receipt.paidVia')} {sale.paymentMethod}</div>
            </div>
        </div>
    );
  };

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="flex-shrink-0 flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-3xl font-bold">{t('sales.title')}</h2>
        <select 
            value={sort}
            onChange={e => setSort(e.target.value as any)}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            aria-label="Sort sales"
          >
              <option value="date-desc">{t('sales.sort.dateDesc')}</option>
              <option value="date-asc">{t('sales.sort.dateAsc')}</option>
              <option value="total-desc">{t('sales.sort.totalDesc')}</option>
              <option value="total-asc">{t('sales.sort.totalAsc')}</option>
        </select>
      </div>

      <div className="flex-grow overflow-y-auto bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
        {sortedSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b dark:border-gray-700">
                <tr>
                  <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400">{t('sales.table.date')}</th>
                  <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400">{t('sales.table.customer')}</th>
                  <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 hidden md:table-cell">{t('sales.table.stylist')}</th>
                  <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 hidden sm:table-cell">{t('sales.table.payment')}</th>
                  <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right">{t('sales.table.total')}</th>
                </tr>
              </thead>
              <tbody>
                {sortedSales.map(sale => (
                  <tr key={sale.id} onClick={() => setViewingSale(sale)} className="border-b dark:border-gray-700/50 hover:bg-gray-100/50 dark:hover:bg-gray-900/40 cursor-pointer">
                    <td className="p-3 font-medium text-gray-900 dark:text-white">{new Date(sale.createdAt).toLocaleString(langCode, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="p-3 text-sm">{sale.clientId ? clientsById[sale.clientId] : <span className="italic text-gray-500">{t('pos.walkIn')}</span>}</td>
                    <td className="p-3 text-sm hidden md:table-cell">{hairstylistsById[sale.hairstylistId]}</td>
                    <td className="p-3 text-sm hidden sm:table-cell capitalize">{sale.paymentMethod}</td>
                    <td className="p-3 font-semibold text-right">{sale.total.toLocaleString(langCode, { style: 'currency', currency })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <DollarSignIcon className="w-12 h-12 mx-auto text-gray-400" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4">{t('sales.empty.title')}</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('sales.empty.subtitle')}</p>
          </div>
        )}
      </div>

      {viewingSale && <SaleDetailsModal sale={viewingSale} onClose={() => setViewingSale(null)} />}
    </div>
  );
};

export default SalesPage;