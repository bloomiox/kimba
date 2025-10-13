import React, { useState, useMemo, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { mapToAccentColor } from '../../utils/colorUtils';
import { ChevronLeftIcon, ChevronRightIcon, FilterIcon } from '../common/Icons';
import type { Appointment, AppointmentStatus } from '../../types';
import TimeGrid from './TimeGrid';
import MonthView from './MonthView';
import AppointmentModal from './AppointmentModal';
import AppointmentDetailsModal from './AppointmentDetailsModal';

type CalendarView = 'month' | 'week' | 'day';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('week');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    date: Date;
    time: string;
    hairstylistId: string;
    duration?: number;
  } | null>(null);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [visibleHairstylistIds, setVisibleHairstylistIds] = useState<string[]>([]);

  // FIX: Added missing properties (updateAppointmentStatus, getClientById) to the context to resolve type errors.
  const { appointments, services, hairstylists, updateAppointmentStatus, getClientById, t } =
    useSettings();

  useEffect(() => {
    setVisibleHairstylistIds(hairstylists.map(h => h.id));
  }, [hairstylists]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFilterPanelOpen && !(event.target as HTMLElement).closest('.filter-panel-container')) {
        setIsFilterPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterPanelOpen]);

  const visibleHairstylists = useMemo(
    () => hairstylists.filter(h => visibleHairstylistIds.includes(h.id)),
    [hairstylists, visibleHairstylistIds]
  );

  const appointmentsByDate = useMemo(() => {
    return appointments.reduce(
      (acc, app) => {
        (acc[app.date] = acc[app.date] || []).push(app);
        return acc;
      },
      {} as Record<string, Appointment[]>
    );
  }, [appointments]);

  const servicesById = useMemo(
    () =>
      services.reduce(
        (acc, s) => ({ ...acc, [s.id]: s }),
        {} as Record<string, (typeof services)[0]>
      ),
    [services]
  );

  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') return setCurrentDate(new Date());
    const newDate = new Date(currentDate);
    const increment = direction === 'prev' ? -1 : 1;
    if (view === 'month') newDate.setMonth(newDate.getMonth() + increment);
    if (view === 'week') newDate.setDate(newDate.getDate() + 7 * increment);
    if (view === 'day') newDate.setDate(newDate.getDate() + increment);
    setCurrentDate(newDate);
  };

  const getHeaderTitle = () => {
    const langCode = t('language.code');
    if (view === 'month')
      return currentDate.toLocaleString(langCode, { month: 'long', year: 'numeric' });
    if (view === 'day')
      return currentDate.toLocaleString(langCode, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    if (view === 'week') {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.toLocaleString(langCode, { month: 'short', day: 'numeric' })} - ${end.toLocaleString(langCode, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  };

  const openAppointmentModal = (
    date: Date,
    time: string,
    hairstylistId: string,
    duration?: number
  ) => {
    setModalData({ date, time, hairstylistId, duration });
    setIsModalOpen(true);
  };

  const renderFilterPanel = () => {
    const handleToggleHairstylist = (id: string) => {
      setVisibleHairstylistIds(prev =>
        prev.includes(id) ? prev.filter(hId => hId !== id) : [...prev, id]
      );
    };

    const handleSelectAll = () => setVisibleHairstylistIds(hairstylists.map(h => h.id));
    const handleSelectNone = () => setVisibleHairstylistIds([]);

    return (
      <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-30 p-4">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {t('calendar.filterResources')}
        </h4>
        <div className="flex justify-between mb-2">
          <button
            onClick={handleSelectAll}
            className={`text-xs ${mapToAccentColor('text-accent-600 dark:text-accent-400')} font-semibold hover:underline`}
          >
            {t('calendar.selectAll')}
          </button>
          <button
            onClick={handleSelectNone}
            className={`text-xs ${mapToAccentColor('text-accent-600 dark:text-accent-400')} font-semibold hover:underline`}
          >
            {t('calendar.selectNone')}
          </button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {hairstylists.map(stylist => (
            <label
              key={stylist.id}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={visibleHairstylistIds.includes(stylist.id)}
                onChange={() => handleToggleHairstylist(stylist.id)}
                className={`w-4 h-4 rounded ${mapToAccentColor('text-accent-500 focus:ring-accent-500 border-gray-300 dark:border-gray-600')} transition-colors`}
              />
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">{stylist.name}</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {stylist.type}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderMultiDayView = (numDays: number) => {
    const startDay = new Date(currentDate);
    if (numDays === 7) startDay.setDate(startDay.getDate() - startDay.getDay());
    const viewDays = Array.from({ length: numDays }).map(
      (_, i) => new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate() + i)
    );

    if (hairstylists.length === 0)
      return <div className="text-center p-8 text-gray-500">{t('calendar.noStylist')}</div>;
    if (visibleHairstylists.length === 0)
      return <div className="text-center p-8 text-gray-500">{t('calendar.noResources')}</div>;

    return (
      <TimeGrid
        days={viewDays}
        hairstylists={visibleHairstylists}
        appointmentsByDate={appointmentsByDate}
        servicesById={servicesById}
        getClientById={getClientById}
        onGridClick={openAppointmentModal}
        onAppointmentClick={setViewingAppointment}
        onStatusChange={(id: string, status: AppointmentStatus) =>
          updateAppointmentStatus(id, status)
        }
      />
    );
  };

  return (
    <div className="flex flex-col h-full max-h-full gap-6 animate-fade-in">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="relative filter-panel-container">
            <button
              onClick={() => setIsFilterPanelOpen(prev => !prev)}
              className={`flex items-center gap-2 p-2 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 ${mapToAccentColor('hover:bg-accent-50 dark:hover:bg-accent-900/20 hover:border-accent-400 dark:hover:border-accent-500')} transition-all`}
            >
              <FilterIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            {isFilterPanelOpen && renderFilterPanel()}
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{getHeaderTitle()}</h2>
        </div>
        <div className="flex items-center bg-gray-200 dark:bg-gray-900 p-1 rounded-lg shadow-sm">
          {(['month', 'week', 'day'] as CalendarView[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${view === v ? `bg-white dark:bg-gray-700 ${mapToAccentColor('text-accent-600 dark:text-accent-400')} shadow-sm` : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'}`}
            >
              {t(`calendar.view.${v}`)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavigate('prev')}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleNavigate('today')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg ${mapToAccentColor('hover:bg-accent-50 dark:hover:bg-accent-900/20 hover:text-accent-600 dark:hover:text-accent-400')} transition-all`}
          >
            {t('common.today')}
          </button>
          <button
            onClick={() => handleNavigate('next')}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </header>
      <div className="flex-grow overflow-auto">
        {view === 'month' && (
          <MonthView
            currentDate={currentDate}
            appointmentsByDate={appointmentsByDate}
            getClientById={getClientById}
            onDayClick={date => {
              setView('day');
              setCurrentDate(date);
            }}
          />
        )}
        {view === 'week' && renderMultiDayView(7)}
        {view === 'day' && renderMultiDayView(1)}
      </div>

      {isModalOpen && modalData && (
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          modalData={modalData}
        />
      )}
      {viewingAppointment && (
        <AppointmentDetailsModal
          appointment={viewingAppointment}
          onClose={() => setViewingAppointment(null)}
        />
      )}
    </div>
  );
};

export default CalendarPage;
