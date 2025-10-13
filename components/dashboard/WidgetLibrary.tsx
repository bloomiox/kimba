import React, { useState } from 'react';
import React, { useState } from 'react';
import {
  DollarSignIcon,
  ClockIcon,
  UploadIcon,
  UserPlusIcon,
  ChartIcon,
  UsersIcon,
  CalendarIcon,
  DesignStudioIcon,
  PlusIcon,
} from '../common/Icons';
import type { WidgetLibraryItem, WidgetType } from '../../types';

const WIDGET_LIBRARY: WidgetLibraryItem[] = [
  {
    type: 'today-revenue',
    name: "Today's Revenue",
    description: 'Revenue generated from completed sales today',
    icon: DollarSignIcon,
    category: 'revenue',
    defaultSize: { width: 3, height: 1 },
    configurable: true,
  },
  {
    type: 'monthly-revenue',
    name: 'Monthly Revenue',
    description: 'Total revenue for the current month',
    icon: DollarSignIcon,
    category: 'revenue',
    defaultSize: { width: 3, height: 1 },
    configurable: true,
  },
  {
    type: 'weekly-revenue',
    name: 'Weekly Revenue',
    description: 'Revenue for the current week',
    icon: ChartIcon,
    category: 'revenue',
    defaultSize: { width: 3, height: 1 },
    configurable: true,
  },
  {
    type: 'average-sale',
    name: 'Average Sale Value',
    description: 'Average value per completed sale',
    icon: DollarSignIcon,
    category: 'revenue',
    defaultSize: { width: 3, height: 1 },
    configurable: true,
  },
  {
    type: 'average-price-trend',
    name: 'Average Price Trend',
    description: 'Visual chart showing average sale value trends',
    icon: ChartIcon,
    category: 'analytics',
    defaultSize: { width: 6, height: 2 },
    configurable: true,
  },
  {
    type: 'today-appointments',
    name: "Today's Appointments",
    description: 'Number of appointments scheduled for today',
    icon: CalendarIcon,
    category: 'appointments',
    defaultSize: { width: 3, height: 1 },
    configurable: false,
  },
  {
    type: 'pending-appointments',
    name: 'Pending Appointments',
    description: 'Unconfirmed appointments requiring attention',
    icon: ClockIcon,
    category: 'appointments',
    defaultSize: { width: 3, height: 1 },
    configurable: false,
  },
  {
    type: 'total-clients',
    name: 'Total Clients',
    description: 'Total number of clients in your database',
    icon: UsersIcon,
    category: 'clients',
    defaultSize: { width: 3, height: 1 },
    configurable: false,
  },
  {
    type: 'active-hairstylists',
    name: 'Active Hairstylists',
    description: 'Number of active team members',
    icon: UserPlusIcon,
    category: 'clients',
    defaultSize: { width: 3, height: 1 },
    configurable: false,
  },
  {
    type: 'ai-generations',
    name: 'AI Generations',
    description: 'AI image generations used this month',
    icon: UploadIcon,
    category: 'analytics',
    defaultSize: { width: 3, height: 1 },
    configurable: true,
  },
  {
    type: 'revenue-chart',
    name: 'Revenue Chart',
    description: 'Visual chart showing revenue trends',
    icon: ChartIcon,
    category: 'analytics',
    defaultSize: { width: 8, height: 3 },
    configurable: true,
  },
  {
    type: 'recent-bookings',
    name: 'Recent Bookings',
    description: 'List of recent appointment bookings',
    icon: CalendarIcon,
    category: 'appointments',
    defaultSize: { width: 4, height: 3 },
    configurable: true,
  },
  {
    type: 'sticky-notes',
    name: 'Sticky Notes',
    description: 'Personal notes and reminders',
    icon: ClockIcon,
    category: 'tools',
    defaultSize: { width: 4, height: 3 },
    configurable: false,
  },
  {
    type: 'quick-actions',
    name: 'Quick Actions',
    description: 'Fast access to common tasks',
    icon: DesignStudioIcon,
    category: 'tools',
    defaultSize: { width: 4, height: 2 },
    configurable: false,
  },
  {
    type: 'recent-lookbooks',
    name: 'Recent Lookbooks',
    description: 'Gallery of recently created lookbooks',
    icon: DesignStudioIcon,
    category: 'analytics',
    defaultSize: { width: 8, height: 3 },
    configurable: true,
  },
];

interface WidgetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widgetType: WidgetType) => void;
  usedWidgets: WidgetType[];
}

const WidgetLibrary: React.FC<WidgetLibraryProps> = ({
  isOpen,
  onClose,
  onAddWidget,
  usedWidgets,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const categories = ['all', 'revenue', 'appointments', 'clients', 'analytics', 'tools'];

  const filteredWidgets = WIDGET_LIBRARY.filter(widget => {
    const matchesCategory = selectedCategory === 'all' || widget.category === selectedCategory;
    const matchesSearch =
      widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      widget.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddWidget = (widgetType: WidgetType) => {
    onAddWidget(widgetType);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Widget Library</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Choose widgets to add to your dashboard
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search widgets..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-accent text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Widget Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWidgets.map(widget => {
              const Icon = widget.icon;
              const isUsed = usedWidgets.includes(widget.type);

              return (
                <div
                  key={widget.type}
                  className={`p-4 border rounded-xl transition-all ${
                    isUsed
                      ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 opacity-60'
                      : 'border-gray-200 dark:border-gray-600 hover:border-accent hover:shadow-md cursor-pointer'
                  }`}
                  onClick={() => !isUsed && handleAddWidget(widget.type)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isUsed ? 'bg-gray-200 dark:bg-gray-600' : 'bg-accent/10 dark:bg-accent/20'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isUsed ? 'text-gray-400' : 'text-accent'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`font-semibold ${isUsed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}
                      >
                        {widget.name}
                      </h4>
                      <p
                        className={`text-sm mt-1 ${isUsed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        {widget.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            isUsed
                              ? 'bg-gray-200 dark:bg-gray-600 text-gray-500'
                              : 'bg-accent/10 text-accent'
                          }`}
                        >
                          {widget.category}
                        </span>
                        <span className={`text-xs ${isUsed ? 'text-gray-400' : 'text-gray-500'}`}>
                          {widget.defaultSize.width}×{widget.defaultSize.height}
                        </span>
                      </div>
                    </div>
                    {!isUsed && (
                      <PlusIcon className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    {isUsed && <span className="text-xs text-gray-400 font-medium">Added</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredWidgets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No widgets found matching your criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WidgetLibrary;
