import React, { useMemo } from 'react';
import type { Appointment, Service } from '../../../types';
import { useSettings } from '../../../contexts/SettingsContext';

interface ServicePerformanceReportProps {
  appointments: Appointment[];
  services: Service[];
}

const ServicePerformanceReport: React.FC<ServicePerformanceReportProps> = ({
  appointments,
  services,
}) => {
  const { t } = useSettings();
  const langCode = t('language.code');
  const currency = t('currency.code');

  const servicesById = useMemo(
    () => services.reduce((acc, s) => ({ ...acc, [s.id]: s }), {} as Record<string, Service>),
    [services]
  );

  const reportData = useMemo(() => {
    const serviceStats: Record<string, { count: number; revenue: number }> = {};

    for (const service of services) {
      serviceStats[service.id] = { count: 0, revenue: 0 };
    }

    for (const app of appointments) {
      const service = servicesById[app.serviceId];
      if (service && serviceStats[service.id]) {
        serviceStats[service.id].count++;
        serviceStats[service.id].revenue += service.price;
      }
    }

    return Object.entries(serviceStats)
      .map(([id, stats]) => ({
        id,
        name: servicesById[id]?.name || 'Unknown',
        ...stats,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [appointments, services, servicesById]);

  return (
    <div>
      <table className="w-full text-left text-sm">
        <thead className="border-b dark:border-gray-600">
          <tr>
            <th className="p-2">Service</th>
            <th className="p-2 text-right">Times Booked</th>
            <th className="p-2 text-right">Total Revenue</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map(service => (
            <tr
              key={service.id}
              className="border-b dark:border-gray-700/50 even:bg-gray-100 dark:even:bg-gray-900/50"
            >
              <td className="p-2 font-medium">{service.name}</td>
              <td className="p-2 text-right">{service.count}</td>
              <td className="p-2 text-right font-semibold">
                {service.revenue.toLocaleString(langCode, { style: 'currency', currency })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServicePerformanceReport;
