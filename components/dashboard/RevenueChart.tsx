import React from 'react';
import Card from '../common/Card';
import { useSettings } from '../../contexts/SettingsContext';

interface RevenueChartProps {
    data: {label: string, value: number}[]
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
    const { t, currency } = useSettings();
    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
    return (
        <Card title="Revenue Last 7 Days" className="h-full flex flex-col">
            <div className="flex-grow flex items-end gap-3 sm:gap-4">
                {data.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                         <div className="text-xs font-bold text-gray-600 dark:text-gray-300">{item.value.toLocaleString(t('language.code'), { style: 'currency', currency: currency, minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                         <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex items-end">
                            <div className="w-full bg-accent animate-bar-rise" style={{ height: `${(item.value / maxValue) * 100}%`, animationDelay: `${index * 50}ms` }}></div>
                         </div>
                         <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">{item.label}</div>
                    </div>
                ))}
            </div>
             <style>{`
                @keyframes bar-rise {
                    from { height: 0; }
                }
                .animate-bar-rise { animation: bar-rise 0.5s ease-out forwards; }
            `}</style>
        </Card>
    );
};

export default RevenueChart;
