import React, { useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';
// FIX: Updated import path to use the common Icons component.
import { UploadIcon, ArrowRightIcon, DesignStudioIcon, UserPlusIcon, StarIcon, ClockIcon, SettingsIcon, DollarSignIcon } from './common/Icons';
import type { Lookbook, Service } from '../types';
import type { View } from './MainApp';
import RecentBookings from './dashboard/RecentBookings';
import StickyNotes from './dashboard/StickyNotes';
import { getTodayString, formatDateForStorage } from '../utils/dateUtils';

interface KPICardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle: string;
  colorClass?: string;
}

const KPICard: React.FC<KPICardProps> = ({ icon: Icon, title, value, subtitle, colorClass = 'accent' }) => (
  <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 flex items-start gap-4">
    <div className={`w-12 h-12 bg-${colorClass}/10 dark:bg-${colorClass}/20 rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-6 h-6 text-${colorClass}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
    </div>
  </div>
);

const RevenueChart: React.FC<{data: {label: string, value: number}[]}> = ({ data }) => {
    const { t } = useSettings();
    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
    return (
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 h-full flex flex-col">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Revenue Last 7 Days</h4>
            <div className="flex-grow flex items-end gap-3 sm:gap-4">
                {data.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                         <div className="text-xs font-bold text-gray-600 dark:text-gray-300">{item.value.toLocaleString(langCode, { style: 'currency', currency: currencyCode, minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
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
        </div>
    );
};


const Dashboard: React.FC<{ onQuickAction: (view: View); savedLookbooks: Lookbook[] }> = ({ onQuickAction, savedLookbooks }) => {
  const { salonName, imageCount, appointments, services, sales, t } = useSettings();
  
  const servicesById = useMemo(() => services.reduce((acc, s) => ({ ...acc, [s.id]: s }), {} as Record<string, Service>), [services]);
  
  const langCode = t('language.code');
  const currencyCode = t('currency.code');

  const revenueData = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayString = getTodayString();
    
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let todayRevenue = 0;
    let monthRevenue = 0;

    const last7DaysData = Array.from({length: 7}, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        return {
            label: d.toLocaleDateString(langCode, {weekday: 'short'}),
            dateString: formatDateForStorage(d),
            value: 0
        };
    });

    // Use actual sales data instead of appointments for revenue calculation
    for (const sale of sales) {
        const saleDate = new Date(sale.createdAt);
        const saleDateString = formatDateForStorage(saleDate);
        
        if (saleDateString === todayString) {
            todayRevenue += sale.total;
        }
        
        if(saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
            monthRevenue += sale.total;
        }

        const dayData = last7DaysData.find(d => d.dateString === saleDateString);
        if (dayData) {
            dayData.value += sale.total;
        }
    }
    
    // Debug: Log sales data for troubleshooting
    console.log('Dashboard Revenue Data:', {
        salesCount: sales.length,
        appointmentsCount: appointments.length,
        todayRevenue,
        monthRevenue,
        chartData: last7DaysData,
        todayAppointments: appointments.filter(app => app.date === getTodayString()).length
    });
    
    return { todayRevenue, monthRevenue, chartData: last7DaysData };
  }, [sales, langCode]);


  return (
    <div className="animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Welcome to {salonName}</h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">Here's your salon overview for today</p>
        
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard icon={DollarSignIcon} title="Today's Revenue" value={revenueData.todayRevenue.toLocaleString(langCode, { style: 'currency', currency: currencyCode })} subtitle="From completed sales" colorClass="green-500"/>
          <KPICard icon={DollarSignIcon} title="Monthly Revenue" value={revenueData.monthRevenue.toLocaleString(langCode, { style: 'currency', currency: currencyCode })} subtitle="This month's sales" colorClass="green-500"/>
          <KPICard icon={ClockIcon} title="Today's Appointments" value={appointments.filter(app => app.date === getTodayString()).length.toString()} subtitle="Scheduled for today" />
          <KPICard icon={UploadIcon} title="Generations Used" value={`${imageCount}/250`} subtitle="AI image generations" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
              <RevenueChart data={revenueData.chartData} />
          </div>

          <div className="lg:col-span-1 space-y-6">
             <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
                <h3 className="text-xl font-semibold mb-4 text-accent">Quick Actions</h3>
                 <div className="space-y-4">
                    <button 
                        onClick={() => onQuickAction('studio')}
                        className="group w-full p-4 bg-accent/10 dark:bg-accent/20 hover:bg-accent/20 dark:hover:bg-accent/30 rounded-xl flex items-center justify-between transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <DesignStudioIcon className="w-6 h-6 text-accent" />
                            <h4 className="font-bold text-left text-gray-900 dark:text-white">New Session</h4>
                        </div>
                        <ArrowRightIcon className="w-5 h-5 text-accent transform transition-transform group-hover:translate-x-1" />
                    </button>
                    <button 
                        onClick={() => onQuickAction('calendar')}
                        className="group w-full p-4 bg-gray-100 dark:bg-gray-800/60 hover:bg-gray-200 dark:hover:bg-gray-700/80 rounded-xl flex items-center justify-between transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <UserPlusIcon className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                            <h4 className="font-bold text-left text-gray-900 dark:text-white">Book Appointment</h4>
                        </div>
                        <ArrowRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-400 transform transition-transform group-hover:translate-x-1" />
                    </button>
                 </div>
            </div>
            
            <RecentBookings />
          </div>
        </div>

        {/* Second row with sticky notes and lookbooks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-1">
            <StickyNotes />
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recent Lookbooks</h3>
              {savedLookbooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {savedLookbooks.slice(0, 10).map((lookbook) => (
                    <div key={lookbook.id} className="group relative aspect-square rounded-lg overflow-hidden shadow-md">
                      <img src={lookbook.finalImage.src} alt={lookbook.finalImage.prompt} className="w-full h-full object-cover"/>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                        <p className="text-white text-xs text-center">{lookbook.finalImage.hairstyleName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-100 dark:bg-gray-800/50 rounded-2xl">
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No lookbooks yet</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Create your first lookbook in the Design Studio</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
       <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.4s ease-out forwards;
          }
        `}</style>
    </div>
  );
};

export default Dashboard;