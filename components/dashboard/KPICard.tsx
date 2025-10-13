import React from 'react';

interface KPICardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle: string;
  colorClass?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  colorClass = 'accent',
}) => (
  <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 flex items-start gap-4">
    <div
      className={`w-12 h-12 bg-${colorClass}/10 dark:bg-${colorClass}/20 rounded-xl flex items-center justify-center flex-shrink-0`}
    >
      <Icon className={`w-6 h-6 text-${colorClass}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
    </div>
  </div>
);

export default KPICard;
