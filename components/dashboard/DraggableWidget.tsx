import React, { useState, useMemo } from 'react';
import { DollarSignIcon, ClockIcon, UploadIcon, UserPlusIcon, ChartIcon, UsersIcon, CalendarIcon, DesignStudioIcon } from '../common/Icons';
import type { DashboardWidget, Service, Lookbook } from '../../types';
import type { View } from '../MainApp';
import { useSettings } from '../../contexts/SettingsContext';
import KPICard from './KPICard';
import RevenueChart from './RevenueChart';
import RecentBookings from './RecentBookings';
import StickyNotes from './StickyNotes';
import { getTodayString, formatDateForStorage } from '../../utils/dateUtils';

interface DraggableWidgetProps {
  widget: DashboardWidget;
  onRemove: (widgetId: string) => void;
  onResize?: (widgetId: string, newSize: { width: number; height: number }) => void;
  onQuickAction?: (view: View) => void;
  savedLookbooks?: Lookbook[];
  isDragging?: boolean;
  isCustomizing?: boolean;
}

const DraggableWidget: React.FC<DraggableWidgetProps> = ({ 
  widget, 
  onRemove, 
  onResize, 
  onQuickAction, 
  savedLookbooks = [], 
  isDragging = false,
  isCustomizing = false
}) => {
  const { salonName, imageCount, appointments, services, sales, clients, hairstylists, t, currency } = useSettings();
  const [showConfig, setShowConfig] = useState(false);
  const [resizePreview, setResizePreview] = useState<{ width: number; height: number } | null>(null);

  const servicesById = useMemo(() => services.reduce((acc, s) => ({ ...acc, [s.id]: s }), {} as Record<string, Service>), [services]);
  const langCode = t('language.code');

  // Calculate widget data based on type
  const widgetData = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayString = getTodayString();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let todayRevenue = 0;
    let monthRevenue = 0;
    let weekRevenue = 0;
    let totalRevenue = 0;
    let saleCount = 0;

    // Calculate week start (Monday)
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    for (const sale of sales) {
      const saleDate = new Date(sale.createdAt);
      const saleDateString = formatDateForStorage(saleDate);
      
      totalRevenue += sale.total;
      saleCount++;
      
      if (saleDateString === todayString) {
        todayRevenue += sale.total;
      }
      
      if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
        monthRevenue += sale.total;
      }

      if (saleDate >= weekStart && saleDate <= today) {
        weekRevenue += sale.total;
      }
    }

    const todayAppointments = appointments.filter(app => app.date === todayString);
    const pendingAppointments = appointments.filter(app => app.status === 'unconfirmed');
    const activeHairstylists = hairstylists.filter(h => h.isActive);

    // Revenue chart data
    const last7DaysData = Array.from({length: 7}, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return {
        label: d.toLocaleDateString(langCode, {weekday: 'short'}),
        dateString: formatDateForStorage(d),
        value: 0,
        salesCount: 0
      };
    });

    for (const sale of sales) {
      const saleDateString = formatDateForStorage(new Date(sale.createdAt));
      const dayData = last7DaysData.find(d => d.dateString === saleDateString);
      if (dayData) {
        dayData.value += sale.total;
        dayData.salesCount += 1;
      }
    }

    return {
      todayRevenue,
      monthRevenue,
      weekRevenue,
      averageSale: saleCount > 0 ? totalRevenue / saleCount : 0,
      todayAppointments: todayAppointments.length,
      pendingAppointments: pendingAppointments.length,
      totalClients: clients.length,
      activeHairstylists: activeHairstylists.length,
      chartData: last7DaysData
    };
  }, [sales, appointments, clients, hairstylists, langCode]);

  const renderWidgetContent = () => {
    const colorClass = widget.config?.colorClass || 'accent';

    switch (widget.type) {
      case 'today-revenue':
        return (
          <KPICard 
            icon={DollarSignIcon} 
            title="Today's Revenue" 
            value={widgetData.todayRevenue.toLocaleString(langCode, { style: 'currency', currency: currency })} 
            subtitle="From completed sales" 
            colorClass="green-500"
          />
        );

      case 'monthly-revenue':
        return (
          <KPICard 
            icon={DollarSignIcon} 
            title="Monthly Revenue" 
            value={widgetData.monthRevenue.toLocaleString(langCode, { style: 'currency', currency: currency })} 
            subtitle="This month's sales" 
            colorClass="green-500"
          />
        );

      case 'weekly-revenue':
        return (
          <KPICard 
            icon={ChartIcon} 
            title="Weekly Revenue" 
            value={widgetData.weekRevenue.toLocaleString(langCode, { style: 'currency', currency: currency })} 
            subtitle="This week's sales" 
            colorClass="blue-500"
          />
        );

      case 'average-sale':
        return (
          <KPICard 
            icon={DollarSignIcon} 
            title="Average Sale" 
            value={widgetData.averageSale.toLocaleString(langCode, { style: 'currency', currency: currency })} 
            subtitle="Per completed sale" 
            colorClass="purple-500"
          />
        );

      case 'average-price-trend':
        return (
          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Average Price Trend</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Daily average sale values</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-500">
                  {widgetData.averageSale.toLocaleString(langCode, { style: 'currency', currency: currency })}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Current Avg</div>
              </div>
            </div>
            <div className="h-32">
              <div className="flex items-end justify-between h-full gap-2">
                {widgetData.chartData.map((day, index) => {
                  const avgSale = day.salesCount > 0 ? day.value / day.salesCount : 0;
                  const maxAvg = Math.max(...widgetData.chartData.map(d => d.salesCount > 0 ? d.value / d.salesCount : 0));
                  const height = maxAvg > 0 ? Math.max(4, (avgSale / maxAvg) * 100) : 4;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-sm transition-all duration-300 hover:from-purple-600 hover:to-purple-500 min-h-1"
                        style={{ height: `${height}%` }}
                        title={`${day.label}: ${avgSale.toLocaleString(langCode, { style: 'currency', currency: currency })}`}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{day.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'today-appointments':
        return (
          <KPICard 
            icon={ClockIcon} 
            title="Today's Appointments" 
            value={widgetData.todayAppointments.toString()} 
            subtitle="Scheduled for today" 
          />
        );

      case 'pending-appointments':
        return (
          <KPICard 
            icon={CalendarIcon} 
            title="Pending Appointments" 
            value={widgetData.pendingAppointments.toString()} 
            subtitle="Require confirmation" 
            colorClass="orange-500"
          />
        );

      case 'total-clients':
        return (
          <KPICard 
            icon={UsersIcon} 
            title="Total Clients" 
            value={widgetData.totalClients.toString()} 
            subtitle="In your database" 
            colorClass="blue-500"
          />
        );

      case 'active-hairstylists':
        return (
          <KPICard 
            icon={UserPlusIcon} 
            title="Active Hairstylists" 
            value={widgetData.activeHairstylists.toString()} 
            subtitle="Team members" 
            colorClass="green-500"
          />
        );

      case 'ai-generations':
        return (
          <KPICard 
            icon={UploadIcon} 
            title="Generations Used" 
            value={`${imageCount}/250`} 
            subtitle="AI image generations" 
          />
        );

      case 'revenue-chart':
        return (
          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Daily revenue over the last 7 days</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-500">
                  {widgetData.todayRevenue.toLocaleString(langCode, { style: 'currency', currency: currency })}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Today</div>
              </div>
            </div>
            <div className="h-48">
              <div className="flex items-end justify-between h-full gap-2">
                {widgetData.chartData.map((day, index) => {
                  const maxRevenue = Math.max(...widgetData.chartData.map(d => d.value));
                  const height = maxRevenue > 0 ? Math.max(4, (day.value / maxRevenue) * 100) : 4;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="bg-gradient-to-t from-green-500 to-green-400 rounded-t-sm transition-all duration-300 hover:from-green-600 hover:to-green-500 min-h-1"
                        style={{ height: `${height}%` }}
                        title={`${day.label}: ${day.value.toLocaleString(langCode, { style: 'currency', currency: currency })}`}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{day.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'recent-bookings':
        return <RecentBookings />;

      case 'sticky-notes':
        return <StickyNotes />;

      case 'quick-actions':
        return (
          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 h-full">
            <h3 className="text-xl font-semibold mb-4 text-accent">Quick Actions</h3>
            <div className="space-y-4">
              <button 
                onClick={() => onQuickAction?.('studio')}
                className="group w-full p-4 bg-accent/10 dark:bg-accent/20 hover:bg-accent/20 dark:hover:bg-accent/30 rounded-xl flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <DesignStudioIcon className="w-6 h-6 text-accent" />
                  <h4 className="font-bold text-left text-gray-900 dark:text-white">New Session</h4>
                </div>
              </button>
              <button 
                onClick={() => onQuickAction?.('calendar')}
                className="group w-full p-4 bg-gray-100 dark:bg-gray-800/60 hover:bg-gray-200 dark:hover:bg-gray-700/80 rounded-xl flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <UserPlusIcon className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                  <h4 className="font-bold text-left text-gray-900 dark:text-white">Book Appointment</h4>
                </div>
              </button>
            </div>
          </div>
        );

      case 'recent-lookbooks':
        return (
          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 h-full">
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
        );

      default:
        return (
          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Widget not implemented</p>
          </div>
        );
    }
  };

  return (
    <div 
      className={`relative group h-full ${
        isDragging ? 'pointer-events-none' : ''
      } ${
        isCustomizing ? 'ring-2 ring-accent/30 ring-offset-2' : ''
      } ${
        resizePreview ? 'ring-4 ring-blue-400/50' : ''
      }`}
      style={{
        transition: 'all 0.2s ease-in-out'
      }}
    >
      {/* Widget Content */}
      <div className="h-full">
        {renderWidgetContent()}
      </div>

      {/* Resize Preview Indicator */}
      {resizePreview && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md shadow-lg z-10">
          {resizePreview.width}×{resizePreview.height}
        </div>
      )}

      {/* Customization Controls */}
      {isCustomizing && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 dark:hover:bg-gray-700"
            title="Configure widget"
          >
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={() => onRemove(widget.id)}
            className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            title="Remove widget"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Drag Handle */}
      {isCustomizing && (
        <div className="absolute top-2 left-2">
          <div className="w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-move drag-handle">
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
        </div>
      )}

      {/* Resize Handles */}
      {isCustomizing && onResize && (
        <>
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 bg-accent opacity-0 group-hover:opacity-100 transition-opacity cursor-se-resize resize-handle"
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = widget.size.width;
              const startHeight = widget.size.height;
              let currentWidth = startWidth;
              let currentHeight = startHeight;

              const handleMouseMove = (e: MouseEvent) => {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                currentWidth = Math.max(1, Math.min(12, startWidth + Math.round(deltaX / 100)));
                currentHeight = Math.max(1, Math.min(6, startHeight + Math.round(deltaY / 100)));
                
                // Show resize preview
                setResizePreview({ width: currentWidth, height: currentHeight });
                
                // Visual feedback during resize
                document.body.style.cursor = 'se-resize';
              };

              const handleMouseUp = () => {
                document.body.style.cursor = 'default';
                setResizePreview(null);
                
                // Only update the widget size when resize is complete
                if (currentWidth !== widget.size.width || currentHeight !== widget.size.height) {
                  onResize(widget.id, { width: currentWidth, height: currentHeight });
                }
                
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        </>
      )}
    </div>
  );
};

export default DraggableWidget;