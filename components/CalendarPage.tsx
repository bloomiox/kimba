import React, { useState, useMemo, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
// FIX: Updated import path to use the common Icons component.
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  MoreVerticalIcon,
  CheckIcon,
} from './common/Icons';
import AppointmentDetailsModal from './booking/AppointmentDetailsModal';
import CreateAppointmentModal from './booking/CreateAppointmentModal';
import type { Appointment, Service, Hairstylist, AppointmentStatus } from '../types';

type CalendarView = 'month' | 'week' | 'day';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('week');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    date: Date;
    time: string;
    hairstylistId: string;
  } | null>(null);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [visibleHairstylistIds, setVisibleHairstylistIds] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const {
    appointments,
    services,
    hairstylists,
    updateAppointmentStatus,
    updateAppointmentDetails,
    getClientById,
  } = useSettings();

  useEffect(() => {
    setVisibleHairstylistIds(hairstylists.map(h => h.id));
  }, [hairstylists]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeDropdown &&
        !(event.target as HTMLElement).closest('.appointment-dropdown-container')
      ) {
        setActiveDropdown(null);
      }
      if (isFilterPanelOpen && !(event.target as HTMLElement).closest('.filter-panel-container')) {
        setIsFilterPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown, isFilterPanelOpen]);

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
    () => services.reduce((acc, s) => ({ ...acc, [s.id]: s }), {} as Record<string, Service>),
    [services]
  );

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
  const getDayString = (date: Date) => date.toISOString().split('T')[0];

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
    if (view === 'month')
      return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (view === 'day')
      return currentDate.toLocaleString('default', {
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
      return `${start.toLocaleString('default', { month: 'short', day: 'numeric' })} - ${end.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  };

  const openAppointmentModal = (date: Date, time: string, hairstylistId: string) => {
    setModalData({ date, time, hairstylistId });
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
        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Filter Resources</h4>
        <div className="flex justify-between mb-2">
          <button onClick={handleSelectAll} className="text-xs text-accent font-semibold">
            Select All
          </button>
          <button onClick={handleSelectNone} className="text-xs text-accent font-semibold">
            Select None
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
                className="w-4 h-4 rounded text-accent focus:ring-accent"
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

  const renderMonthView = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const calendarGrid = Array.from(
      { length: lastDay.getDate() },
      (_, i) => new Date(firstDay.getFullYear(), firstDay.getMonth(), i + 1)
    );
    const paddingDays = Array.from({ length: firstDay.getDay() }).map(
      (_, i) => new Date(firstDay.getFullYear(), firstDay.getMonth(), i - firstDay.getDay() + 1)
    );

    return (
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800"
          >
            {day}
          </div>
        ))}
        {[...paddingDays, ...calendarGrid].map((day, index) => {
          const dateString = getDayString(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          return (
            <button
              key={index}
              onClick={() => {
                setView('day');
                setCurrentDate(day);
              }}
              className={`relative min-h-[120px] p-2 text-left transition-colors flex flex-col ${isCurrentMonth ? 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50 text-gray-400'}`}
            >
              <span
                className={`text-sm font-semibold ${isSameDay(day, new Date()) ? 'bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}
              >
                {day.getDate()}
              </span>
              {appointmentsByDate[dateString] && (
                <div className="mt-1 flex-grow overflow-hidden space-y-1">
                  {appointmentsByDate[dateString].slice(0, 3).map(app => (
                    <div
                      key={app.id}
                      className="w-full text-xs p-1 bg-accent/20 text-accent-800 dark:text-accent-200 rounded truncate"
                    >
                      {getClientById(app.clientId)?.name}
                    </div>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const TimeGrid: React.FC<{ days: Date[]; hairstylists: Hairstylist[] }> = ({
    days,
    hairstylists,
  }) => {
    const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8am to 8pm
    const STATUS_STYLES: Record<
      AppointmentStatus,
      { bg: string; border: string; text: string; lateStripe?: string }
    > = {
      unconfirmed: { bg: 'bg-blue-500', border: 'border-blue-300', text: 'text-white' },
      confirmed: { bg: 'bg-green-500', border: 'border-green-300', text: 'text-white' },
      late: {
        bg: 'bg-orange-500',
        border: 'border-orange-300',
        text: 'text-white',
        lateStripe: `bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.1),rgba(0,0,0,0.1)_10px,transparent_10px,transparent_20px)]`,
      },
      cancelled: { bg: 'bg-gray-500', border: 'border-gray-300', text: 'text-white' },
    };

    const handleGridClick = (
      e: React.MouseEvent<HTMLDivElement>,
      day: Date,
      hairstylistId: string
    ) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const totalMinutesFrom8AM = (clickY / rect.height) * (13 * 60);
      const hour = Math.floor(totalMinutesFrom8AM / 60) + 8;
      const minute = (Math.round((totalMinutesFrom8AM % 60) / 15) * 15) % 60;
      openAppointmentModal(
        day,
        `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        hairstylistId
      );
    };

    return (
      <div className="flex-grow flex bg-white dark:bg-gray-900">
        <div className="w-16 flex-shrink-0 text-right pr-2 text-xs text-gray-400">
          {hours.map(hour => (
            <div
              key={hour}
              className="h-24 -mt-3 pt-3"
            >{`${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 ? 'AM' : 'PM'}`}</div>
          ))}
        </div>
        <div
          className="flex-grow grid grid-cols-1"
          style={{
            gridTemplateColumns: `repeat(${days.length * hairstylists.length}, minmax(140px, 1fr))`,
          }}
        >
          {days.map(day =>
            hairstylists.map(stylist => {
              const dayString = getDayString(day);
              const dayAppointments = (appointmentsByDate[dayString] || []).filter(
                a => a.hairstylistId === stylist.id
              );
              return (
                <div
                  key={`${dayString}-${stylist.id}`}
                  className="relative border-l border-gray-200 dark:border-gray-700"
                  onClick={e => handleGridClick(e, day, stylist.id)}
                >
                  {hours.map(h => (
                    <div
                      key={h}
                      className="h-24 border-t border-gray-200 dark:border-gray-700"
                    ></div>
                  ))}
                  {dayAppointments.map(app => {
                    const service = servicesById[app.serviceId];
                    const client = getClientById(app.clientId);
                    if (!service || !client) return null;
                    const [hour, minute] = app.time.split(':').map(Number);
                    const top = ((hour - 8) * 60 + minute) * (96 / 60); // 96px (h-24) per hour
                    const height = service.duration * (96 / 60);
                    const style = STATUS_STYLES[app.status];
                    return (
                      <button
                        key={app.id}
                        onClick={e => {
                          e.stopPropagation();
                          setViewingAppointment(app);
                        }}
                        className={`absolute left-1 right-1 p-2 rounded-lg border-l-4 z-10 shadow-lg overflow-hidden text-xs text-left ${style.bg} ${style.border} ${style.text}`}
                        style={{ top: `${top}px`, height: `${height}px`, minHeight: '24px' }}
                      >
                        <div className={`absolute inset-0 ${style.lateStripe || ''}`}></div>
                        <div className="relative flex justify-between items-start">
                          <div>
                            <p className="font-bold flex items-center gap-1.5">
                              {app.status === 'confirmed' && (
                                <CheckIcon className="w-4 h-4 flex-shrink-0" />
                              )}
                              {client.name}
                            </p>
                            <p className="opacity-80">{service.name}</p>
                            <p className="opacity-80">{app.time}</p>
                          </div>
                          <div className="relative appointment-dropdown-container">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setActiveDropdown(app.id === activeDropdown ? null : app.id);
                              }}
                              className="p-1 -mr-1 -mt-1 rounded-full hover:bg-black/20 flex-shrink-0"
                            >
                              <MoreVerticalIcon className="w-4 h-4" />
                            </button>
                            {activeDropdown === app.id && (
                              <div className="absolute top-full right-0 mt-1 w-36 bg-white dark:bg-gray-700 rounded-md shadow-xl z-20 overflow-hidden">
                                {(
                                  [
                                    'unconfirmed',
                                    'confirmed',
                                    'late',
                                    'cancelled',
                                  ] as AppointmentStatus[]
                                ).map(status => (
                                  <button
                                    key={status}
                                    onClick={e => {
                                      e.stopPropagation();
                                      updateAppointmentStatus(app.id, status);
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 capitalize"
                                  >
                                    Mark as {status}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
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
      return (
        <div className="text-center p-8 text-gray-500">
          Please add a hairstylist in Settings to begin.
        </div>
      );
    if (visibleHairstylists.length === 0)
      return (
        <div className="text-center p-8 text-gray-500">
          No resources selected. Use the filter to select hairstylists.
        </div>
      );

    return (
      <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-800/50 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="flex sticky top-0 bg-gray-100 dark:bg-gray-800/80 backdrop-blur-sm z-20">
          <div className="w-16 flex-shrink-0"></div>
          <div
            className="flex-grow grid"
            style={{ gridTemplateColumns: `repeat(${numDays * visibleHairstylists.length}, 1fr)` }}
          >
            {viewDays.map(day =>
              visibleHairstylists.map(stylist => (
                <div
                  key={`${getDayString(day)}-${stylist.id}`}
                  className="py-2 text-center border-l border-gray-200 dark:border-gray-700"
                >
                  {numDays > 1 && (
                    <div
                      className={`font-semibold ${isSameDay(day, new Date()) ? 'text-accent' : ''}`}
                    >
                      {day.toLocaleString('default', { weekday: 'short' })} {day.getDate()}
                    </div>
                  )}
                  <div className="text-sm text-gray-500">{stylist.name}</div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex-grow overflow-auto">
          <TimeGrid days={viewDays} hairstylists={visibleHairstylists} />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-h-full gap-6 animate-fade-in">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="relative filter-panel-container">
            <button
              onClick={() => setIsFilterPanelOpen(prev => !prev)}
              className="flex items-center gap-2 p-2 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FilterIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            {isFilterPanelOpen && renderFilterPanel()}
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{getHeaderTitle()}</h2>
        </div>
        <div className="flex items-center bg-gray-200 dark:bg-gray-900 p-1 rounded-lg">
          {(['month', 'week', 'day'] as CalendarView[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${view === v ? 'bg-white dark:bg-gray-700 text-accent shadow' : 'text-gray-600 dark:text-gray-300'}`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavigate('prev')}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleNavigate('today')}
            className="px-4 py-1.5 text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Today
          </button>
          <button
            onClick={() => handleNavigate('next')}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </header>
      <div className="flex-grow overflow-auto">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderMultiDayView(7)}
        {view === 'day' && renderMultiDayView(1)}
      </div>

      <CreateAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalData={modalData}
      />
      {viewingAppointment &&
        (() => {
          const client = getClientById(viewingAppointment.clientId);
          const service = services.find(s => s.id === viewingAppointment.serviceId);
          const hairstylist = hairstylists.find(h => h.id === viewingAppointment.hairstylistId);

          if (!client || !service || !hairstylist) return null;

          return (
            <AppointmentDetailsModal
              appointment={viewingAppointment}
              client={client}
              services={[service]} // Convert single service to array
              hairstylist={hairstylist}
              isOpen={true}
              onClose={() => setViewingAppointment(null)}
              onClientClick={clientId => {
                // The client details are now shown within the modal
                console.log('Client details shown in modal for:', clientId);
              }}
              onPayNow={() => {
                // Payment modal is now handled within the appointment details modal
                console.log('Payment initiated for appointment:', viewingAppointment.id);
              }}
              onCheckout={() => {
                // Navigate to POS checkout - you can implement this
                console.log('Navigate to POS checkout for appointment:', viewingAppointment.id);
              }}
              onStatusChange={status => {
                updateAppointmentStatus(viewingAppointment.id, status);
                setViewingAppointment(null);
              }}
              onAppointmentUpdate={(updatedServices, updatedTotal) => {
                // Update the appointment with new services (in a real app, you'd update the services field)
                console.log(
                  'Updating appointment with services:',
                  updatedServices,
                  'Total:',
                  updatedTotal
                );
                // For now, we'll just update the local state to reflect the changes
                setViewingAppointment(prev =>
                  prev ? { ...prev, serviceId: updatedServices[0]?.id || prev.serviceId } : null
                );
              }}
              updateAppointmentDetails={updateAppointmentDetails}
            />
          );
        })()}
    </div>
  );
};

export default CalendarPage;
