import React, { useState, useMemo } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import Card from '../common/Card';
import KPICard from '../dashboard/KPICard';
import Button from '../common/Button';
import { DollarSignIcon, ClipboardListIcon, CloseIcon, BarChartIcon, UsersIcon } from '../common/Icons';
import type { Appointment, Service, Sale } from '../../types';
import ReportModal from '../report/ReportModal';
import { getTodayString, formatDateForStorage } from '../../utils/dateUtils';

type TimePeriod = '7days' | '30days' | 'month';
type ReportType = 'salesSummary' | 'servicePerformance' | 'dailyCloseout' | 'clientList';

const MetricsView: React.FC = () => {
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('7days');
    const { appointments, services, sales, t, currency } = useSettings();
    const langCode = t('language.code');

    const filteredData = useMemo(() => {
        const now = new Date();
        let startDate = new Date();

        switch (timePeriod) {
        case '7days':
            startDate.setDate(now.getDate() - 7);
            break;
        case '30days':
            startDate.setDate(now.getDate() - 30);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        }
        startDate.setHours(0, 0, 0, 0);

        // Filter sales for revenue calculations
        const filteredSales = sales.filter(sale => {
            const saleDate = new Date(sale.createdAt);
            return saleDate >= startDate && saleDate <= now;
        });

        // Filter appointments for booking analytics
        const filteredAppointments = appointments.filter(app => {
            const appDate = new Date(`${app.date}T00:00:00`);
            return appDate >= startDate && appDate <= now;
        });

        const servicesById = services.reduce((acc, s) => ({ ...acc, [s.id]: s }), {} as Record<string, Service>);

        // Calculate revenue from actual sales
        let totalRevenue = 0;
        let totalSales = 0;
        const topServices: Record<string, { count: number; revenue: number }> = {};

        filteredSales.forEach(sale => {
            totalSales++;
            totalRevenue += sale.total;

            // Top Services from sales items
            sale.items.forEach(item => {
                if (item.type === 'service') {
                    if (!topServices[item.name]) {
                        topServices[item.name] = { count: 0, revenue: 0 };
                    }
                    topServices[item.name].count++;
                    topServices[item.name].revenue += item.price;
                }
            });
        });

        // Calculate booking patterns from appointments
        const bookingsByDay: number[] = Array(7).fill(0); // Sun - Sat
        const bookingsByTimeBlock = { morning: 0, afternoon: 0, evening: 0 };

        filteredAppointments.forEach(app => {
            // Bookings by Day
            const appDate = new Date(`${app.date}T00:00:00`);
            const dayOfWeek = appDate.getDay();
            bookingsByDay[dayOfWeek]++;

            // Bookings by Time Block
            const hour = parseInt(app.time.split(':')[0], 10);
            if (hour >= 8 && hour < 12) {
                bookingsByTimeBlock.morning++;
            } else if (hour >= 12 && hour < 17) {
                bookingsByTimeBlock.afternoon++;
            } else if (hour >= 17 && hour < 20) {
                bookingsByTimeBlock.evening++;
            }
        });

        const sortedTopServices = Object.entries(topServices)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
        
        const avgRevenue = totalSales > 0 ? totalRevenue / totalSales : 0;

        return {
        totalRevenue,
        totalSales,
        totalAppointments: filteredAppointments.length,
        avgRevenue,
        topServices: sortedTopServices,
        bookingsByDay,
        bookingsByTimeBlock,
        };
    }, [timePeriod, appointments, services, sales]);

    const BarChart: React.FC<{ data: number[]; labels: string[]; title: string }> = ({ data, labels, title }) => {
        const maxValue = Math.max(...data, 1);
        return (
        <Card title={title}>
            <div className="flex items-end gap-3 sm:gap-4 h-48">
            {data.map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs font-bold text-gray-600 dark:text-gray-300">{value}</div>
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex items-end">
                    <div className="w-full bg-accent animate-bar-rise" style={{ height: `${(value / maxValue) * 100}%`, animationDelay: `${index*50}ms` }}></div>
                </div>
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">{labels[index]}</div>
                </div>
            ))}
            </div>
        </Card>
        );
    };
  
    const dayLabels = [new Date(2024, 0, 7), new Date(2024, 0, 1), new Date(2024, 0, 2), new Date(2024, 0, 3), new Date(2024, 0, 4), new Date(2024, 0, 5), new Date(2024, 0, 6)].map(d => d.toLocaleString(langCode, {weekday: 'short'}))
    const timeBlockLabels = [t('analytics.timeBlocks.morning'), t('analytics.timeBlocks.afternoon'), t('analytics.timeBlocks.evening')];
    const timeBlockData = [
        filteredData.bookingsByTimeBlock.morning,
        filteredData.bookingsByTimeBlock.afternoon,
        filteredData.bookingsByTimeBlock.evening,
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                 <div className="flex items-center bg-gray-200 dark:bg-gray-900 p-1 rounded-lg">
                    {(['7days', '30days', 'month'] as TimePeriod[]).map(period => (
                        <button
                        key={period}
                        onClick={() => setTimePeriod(period)}
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${timePeriod === period ? 'bg-white dark:bg-gray-700 text-accent shadow' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                        {t(`analytics.period.${period}`)}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard 
                    icon={DollarSignIcon} 
                    title="Total Revenue" 
                    value={filteredData.totalRevenue.toLocaleString(langCode, { style: 'currency', currency: currency })}
                    subtitle="From completed sales"
                    colorClass="green-500"
                />
                <KPICard 
                    icon={ClipboardListIcon} 
                    title="Total Sales"
                    value={String(filteredData.totalSales)}
                    subtitle="Completed transactions"
                />
                <KPICard 
                    icon={ClipboardListIcon} 
                    title="Appointments"
                    value={String(filteredData.totalAppointments)}
                    subtitle="Scheduled bookings"
                    colorClass="purple-500"
                />
                <KPICard 
                    icon={DollarSignIcon} 
                    title="Avg Sale Value" 
                    value={filteredData.avgRevenue.toLocaleString(langCode, { style: 'currency', currency: currency })}
                    subtitle="Per transaction"
                    colorClass="blue-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card title={t('analytics.topServices')}>
                        <div className="space-y-3">
                            {filteredData.topServices.map(service => (
                                <div key={service.name} className="flex justify-between items-center">
                                    <span className="font-medium">{service.name}</span>
                                    <span className="font-semibold text-gray-600 dark:text-gray-300">{service.revenue.toLocaleString(langCode, { style: 'currency', currency: currency })}</span>
                                </div>
                            ))}
                            {filteredData.topServices.length === 0 && <p className="text-center text-gray-500 py-4">{t('analytics.noData')}</p>}
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <BarChart data={filteredData.bookingsByDay} labels={dayLabels} title={t('analytics.bookingsByDay')} />
                </div>
            </div>
            <div className="grid grid-cols-1">
                    <BarChart data={timeBlockData} labels={timeBlockLabels} title={t('analytics.bookingsByTime')} />
            </div>
        </div>
    );
};

const SalesView: React.FC = () => {
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
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 flex justify-end items-center mb-4">
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

const ReportView: React.FC = () => {
  const { t, sales, appointments, services, clients } = useSettings();
  const today = getTodayString();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [viewingReport, setViewingReport] = useState<ReportType | null>(null);

  const setDateRange = (preset: 'today' | '7days' | '30days' | 'month') => {
    const end = new Date();
    let start = new Date();
    if (preset === 'today') {
        start.setDate(end.getDate());
    } else if (preset === '7days') {
        start.setDate(end.getDate() - 6);
    } else if (preset === '30days') {
        start.setDate(end.getDate() - 29);
    } else if (preset === 'month') {
        start = new Date(end.getFullYear(), end.getMonth(), 1);
    }
    setStartDate(formatDateForStorage(start));
    setEndDate(formatDateForStorage(end));
  };

  const filteredData = useMemo(() => {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);

    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= start && saleDate <= end;
    });

    const filteredAppointments = appointments.filter(app => {
        const appDate = new Date(app.date);
        return appDate >= start && appDate <= end;
    });

    return { sales: filteredSales, appointments: filteredAppointments, clients, services };
  }, [startDate, endDate, sales, appointments, clients, services]);
  
  const reportCards = [
      {
          id: 'salesSummary',
          title: "Sales Summary",
          description: "Detailed breakdown of revenue, tips, taxes, and payment methods.",
          icon: DollarSignIcon,
      },
      {
          id: 'servicePerformance',
          title: "Service Performance",
          description: "Analyze popularity and revenue generated by each service.",
          icon: ClipboardListIcon,
      },
       {
          id: 'dailyCloseout',
          title: "Daily Closeout",
          description: "End-of-day summary for sales and payments. Select a single day.",
          icon: BarChartIcon,
      },
       {
          id: 'clientList',
          title: "Full Client List",
          description: "A complete, printable list of all clients and their contact details.",
          icon: UsersIcon,
      },
  ];

  return (
    <div className="space-y-6">
      <Card className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
              <div className="flex-grow">
                  <label htmlFor="start-date" className="text-sm font-medium">Start Date</label>
                  <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"/>
              </div>
              <div className="flex-grow">
                  <label htmlFor="end-date" className="text-sm font-medium">End Date</label>
                  <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"/>
              </div>
              <div className="flex gap-2 pt-5">
                  <button onClick={() => setDateRange('today')} className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg">Today</button>
                  <button onClick={() => setDateRange('7days')} className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg">Last 7 Days</button>
                  <button onClick={() => setDateRange('month')} className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg">This Month</button>
              </div>
          </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCards.map(report => (
             <Card key={report.id}>
                <div className="flex flex-col h-full">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <report.icon className="w-6 h-6 text-accent"/>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">{report.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{report.description}</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t dark:border-gray-700 flex-grow flex items-end">
                        <Button onClick={() => setViewingReport(report.id as ReportType)} className="w-full">
                            Generate Report
                        </Button>
                    </div>
                </div>
            </Card>
        ))}
      </div>
      
      {viewingReport && (
          <ReportModal 
            reportType={viewingReport} 
            data={filteredData}
            dateRange={{start: startDate, end: endDate}}
            onClose={() => setViewingReport(null)} 
          />
      )}
    </div>
  );
};

const AnalyticsPage: React.FC = () => {
    const { t } = useSettings();
    const [activeTab, setActiveTab] = useState<'metrics' | 'sales' | 'reports'>('metrics');
  
    const tabClasses = (tabName: 'metrics' | 'sales' | 'reports') => 
      `py-3 px-4 font-semibold text-sm transition-colors border-b-2 ${
        activeTab === tabName
          ? 'border-accent text-accent'
          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
      }`;
  
    return (
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-3xl font-bold">{t('analytics.title')}</h2>
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
              <button onClick={() => setActiveTab('metrics')} className={tabClasses('metrics')}>
                {t('analytics.tabs.metrics')}
              </button>
              <button onClick={() => setActiveTab('sales')} className={tabClasses('sales')}>
                {t('analytics.tabs.sales')}
              </button>
              <button onClick={() => setActiveTab('reports')} className={tabClasses('reports')}>
                {t('sidebar.report')}
              </button>
            </nav>
          </div>
        </div>
        
        <div className={`flex-grow overflow-y-auto animate-fade-in ${activeTab === 'metrics' ? 'block' : 'hidden'}`}>
            <MetricsView />
        </div>
        <div className={`flex-grow overflow-y-auto animate-fade-in ${activeTab === 'sales' ? 'block' : 'hidden'}`}>
            <SalesView />
        </div>
        <div className={`flex-grow overflow-y-auto animate-fade-in ${activeTab === 'reports' ? 'block' : 'hidden'}`}>
            <ReportView />
        </div>
        <style>{`
            @keyframes bar-rise {
                from { height: 0; }
            }
            .animate-bar-rise { animation: bar-rise 0.5s ease-out forwards; }
            @keyframes fade-in { 
                from { opacity: 0; }
                to { opacity: 1; } 
            }
            .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        `}</style>
      </div>
    );
  };

export default AnalyticsPage;