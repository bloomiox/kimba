import React, { useMemo } from 'react';
import type { Sale } from '../../../types';
import { useSettings } from '../../../contexts/SettingsContext';

interface DailyCloseoutReportProps {
  sales: Sale[];
}

const DailyCloseoutReport: React.FC<DailyCloseoutReportProps> = ({ sales }) => {
    const { t, hairstylists } = useSettings();
    const langCode = t('language.code');
    const currency = t('currency.code');

    const hairstylistsById = useMemo(() => hairstylists.reduce((acc, h) => ({...acc, [h.id]: h.name}), {} as Record<string, string>), [hairstylists]);

    const reportData = useMemo(() => {
        let totalSales = 0;
        let totalTips = 0;
        let totalVat = 0;
        const salesByPayment: Record<string, number> = {};
        const salesByHairstylist: Record<string, number> = {};

        for (const sale of sales) {
            totalSales += sale.total;
            totalTips += sale.tip;
            totalVat += sale.vatAmount;
            
            salesByPayment[sale.paymentMethod] = (salesByPayment[sale.paymentMethod] || 0) + sale.total;
            salesByHairstylist[sale.hairstylistId] = (salesByHairstylist[sale.hairstylistId] || 0) + sale.total;
        }

        return { totalSales, totalTips, totalVat, salesByPayment, salesByHairstylist };
    }, [sales]);

    const renderSummaryTable = (title: string, data: Record<string, number>, nameMap?: Record<string, string>) => (
        <div>
            <h3 className="font-bold text-lg mb-2 mt-4">{title}</h3>
            <table className="w-full text-left text-sm">
                <tbody>
                    {Object.entries(data).map(([key, value]) => (
                         <tr key={key} className="border-b dark:border-gray-700/50">
                            <td className="p-2 capitalize">{nameMap ? nameMap[key] : key}</td>
                            <td className="p-2 text-right font-semibold">{value.toLocaleString(langCode, {style: 'currency', currency})}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="max-w-xl mx-auto">
            <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <div className="flex justify-between text-xl font-bold py-2 border-b-2 border-black dark:border-gray-400">
                    <span>TOTAL SALES</span>
                    <span>{reportData.totalSales.toLocaleString(langCode, {style: 'currency', currency})}</span>
                </div>
                 <div className="flex justify-between text-sm py-1">
                    <span>Total Tips</span>
                    <span>{reportData.totalTips.toLocaleString(langCode, {style: 'currency', currency})}</span>
                </div>
                <div className="flex justify-between text-sm py-1">
                    <span>Total VAT</span>
                    <span>{reportData.totalVat.toLocaleString(langCode, {style: 'currency', currency})}</span>
                </div>
            </div>

            {renderSummaryTable("Sales by Payment Method", reportData.salesByPayment)}
            {renderSummaryTable("Sales by Hairstylist", reportData.salesByHairstylist, hairstylistsById)}
        </div>
    );
};

export default DailyCloseoutReport;
