import React from 'react';
import Card from '../common/Card';
import { useSettings } from '../../contexts/SettingsContext';

interface RevenueChartProps {
    data: {label: string, value: number, salesCount?: number}[]
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
    const { t, currency } = useSettings();
    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
    const hasAnyData = data.some(d => d.value > 0);
    
    // Calculate additional metrics
    const totalRevenue = data.reduce((sum, d) => sum + d.value, 0);
    const totalSales = data.reduce((sum, d) => sum + (d.salesCount || 0), 0);
    const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    return (
        <Card title="Revenue Last 7 Days" className="h-full flex flex-col">
            <div className="flex items-end gap-3 sm:gap-4">
                {data.map((item, index) => {
                    // Calculate bar height with minimum height for zero values
                    const barHeight = item.value === 0 
                        ? (hasAnyData ? 2 : 8) // Small indicator if other days have data, larger if all zero
                        : Math.max((item.value / maxValue) * 100, 3); // Minimum 3% height for non-zero values
                    
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                             <div className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                {item.value.toLocaleString(t('language.code'), { 
                                    style: 'currency', 
                                    currency: currency, 
                                    minimumFractionDigits: 0, 
                                    maximumFractionDigits: 0 
                                })}
                             </div>
                             <div className="w-full h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex items-end">
                                <div 
                                    className={`w-full animate-bar-rise transition-colors ${
                                        item.value === 0 
                                            ? 'bg-gray-300 dark:bg-gray-600' // Muted color for zero values
                                            : 'bg-accent' // Accent color for actual revenue
                                    }`} 
                                    style={{ 
                                        height: `${barHeight}%`, 
                                        animationDelay: `${index * 50}ms` 
                                    }}
                                />
                             </div>
                             <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">{item.label}</div>
                        </div>
                    );
                })}
            </div>
             {!hasAnyData && (
                <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {t('dashboard.revenueChart.noData')}
                </div>
             )}
             
             {/* Additional Metrics */}
             <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                    <div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {totalRevenue.toLocaleString(t('language.code'), { 
                                style: 'currency', 
                                currency: currency, 
                                minimumFractionDigits: 0, 
                                maximumFractionDigits: 0 
                            })}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.revenueChart.totalRevenue')}</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {totalSales}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.revenueChart.totalSales')}</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {avgSaleValue > 0 ? avgSaleValue.toLocaleString(t('language.code'), { 
                                style: 'currency', 
                                currency: currency, 
                                minimumFractionDigits: 0, 
                                maximumFractionDigits: 0 
                            }) : '—'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.revenueChart.avgSaleValue')}</div>
                    </div>
                </div>
                
                {/* Average Sale Value Chart */}
                <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('dashboard.revenueChart.avgSaleValueTrend')}</h4>
                    <div className="flex items-end gap-2 sm:gap-3">
                        {data.map((item, index) => {
                            const avgValue = item.salesCount > 0 ? item.value / item.salesCount : 0;
                            const maxAvgValue = Math.max(...data.map(d => d.salesCount > 0 ? d.value / d.salesCount : 0), 1);
                            const barHeight = avgValue === 0 
                                ? 2 // Small indicator for no sales
                                : Math.max((avgValue / maxAvgValue) * 100, 5); // Minimum 5% height
                            
                            return (
                                <div key={`avg-${index}`} className="flex-1 flex flex-col items-center gap-1">
                                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                        {avgValue > 0 ? avgValue.toLocaleString(t('language.code'), { 
                                            style: 'currency', 
                                            currency: currency, 
                                            minimumFractionDigits: 0, 
                                            maximumFractionDigits: 0 
                                        }) : '—'}
                                    </div>
                                    <div className="w-full h-12 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex items-end">
                                        <div 
                                            className={`w-full transition-colors ${
                                                avgValue === 0 
                                                    ? 'bg-gray-300 dark:bg-gray-600' 
                                                    : 'bg-blue-500 dark:bg-blue-400'
                                            }`} 
                                            style={{ 
                                                height: `${barHeight}%`,
                                                transition: 'height 0.5s ease-out',
                                                transitionDelay: `${index * 50}ms`
                                            }}
                                        />
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
             </div>
             <style>{`
                @keyframes bar-rise {
                    from { height: 0; }
                }
                .animate-bar-rise { 
                    animation: bar-rise 0.5s ease-out forwards; 
                }
            `}</style>
        </Card>
    );
};

export default RevenueChart;
