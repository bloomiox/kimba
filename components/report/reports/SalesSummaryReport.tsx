import React, { useMemo } from 'react';
import type { Sale } from '../../../types';
import { useSettings } from '../../../contexts/SettingsContext';

interface SalesSummaryReportProps {
  sales: Sale[];
}

const SalesSummaryReport: React.FC<SalesSummaryReportProps> = ({ sales }) => {
  const { t, hairstylists } = useSettings();
  const langCode = t('language.code');
  const currency = t('currency.code');

  const hairstylistsById = useMemo(
    () =>
      hairstylists.reduce((acc, h) => ({ ...acc, [h.id]: h.name }), {} as Record<string, string>),
    [hairstylists]
  );

  const reportData = useMemo(() => {
    let grossSales = 0;
    let totalDiscounts = 0;
    let netSales = 0;
    let totalVat = 0;
    let totalTips = 0;
    let totalCollected = 0;
    const salesByPayment: Record<string, { count: number; total: number }> = {};
    const salesByHairstylist: Record<string, { count: number; total: number }> = {};

    for (const sale of sales) {
      grossSales += sale.subtotal;
      totalDiscounts += sale.discount?.amount || 0;
      netSales += sale.subtotal - (sale.discount?.amount || 0);
      totalVat += sale.vatAmount;
      totalTips += sale.tip;
      totalCollected += sale.total;

      if (!salesByPayment[sale.paymentMethod])
        salesByPayment[sale.paymentMethod] = { count: 0, total: 0 };
      salesByPayment[sale.paymentMethod].count++;
      salesByPayment[sale.paymentMethod].total += sale.total;

      if (!salesByHairstylist[sale.hairstylistId])
        salesByHairstylist[sale.hairstylistId] = { count: 0, total: 0 };
      salesByHairstylist[sale.hairstylistId].count++;
      salesByHairstylist[sale.hairstylistId].total += sale.total;
    }

    return {
      grossSales,
      totalDiscounts,
      netSales,
      totalVat,
      totalTips,
      totalCollected,
      salesByPayment,
      salesByHairstylist,
    };
  }, [sales]);

  const SummaryRow: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b dark:border-gray-700/50">
      <span className="font-medium">{label}</span>
      <span className="font-bold">
        {value.toLocaleString(langCode, { style: 'currency', currency })}
      </span>
    </div>
  );

  const renderBreakdownTable = (
    title: string,
    data: Record<string, { count: number; total: number }>,
    nameMap?: Record<string, string>
  ) => (
    <div>
      <h3 className="font-bold text-lg mb-2 mt-6">{title}</h3>
      <table className="w-full text-left text-sm">
        <thead className="border-b dark:border-gray-600">
          <tr>
            <th className="p-2">Item</th>
            <th className="p-2 text-right"># Sales</th>
            <th className="p-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([key, value]) => (
            <tr
              key={key}
              className="border-b dark:border-gray-700/50 even:bg-gray-100 dark:even:bg-gray-900/50"
            >
              <td className="p-2 capitalize">{nameMap ? nameMap[key] : key}</td>
              <td className="p-2 text-right">{value.count}</td>
              <td className="p-2 text-right font-semibold">
                {value.total.toLocaleString(langCode, { style: 'currency', currency })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
        <SummaryRow label="Gross Sales" value={reportData.grossSales} />
        <SummaryRow label="Discounts" value={-reportData.totalDiscounts} />
        <SummaryRow label="Net Sales" value={reportData.netSales} />
        <SummaryRow label="VAT" value={reportData.totalVat} />
        <SummaryRow label="Tips" value={reportData.totalTips} />
        <div className="flex justify-between py-2 font-bold text-xl mt-2">
          <span>Total Collected</span>
          <span>
            {reportData.totalCollected.toLocaleString(langCode, { style: 'currency', currency })}
          </span>
        </div>
      </div>

      {renderBreakdownTable('Sales by Payment Method', reportData.salesByPayment)}
      {renderBreakdownTable(
        'Sales by Hairstylist',
        reportData.salesByHairstylist,
        hairstylistsById
      )}
    </div>
  );
};

export default SalesSummaryReport;
