import React, { useState, useEffect, useRef } from 'react';
import React, { useState, useRef, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import type { Appointment, Service, Hairstylist, AppointmentStatus, Client } from '../../types';
import {
  MoreVerticalIcon,
  CheckIcon,
  UserIcon,
  ClockIcon,
  GripVerticalIcon,
} from '../common/Icons';

interface TimeGridProps {
  days: Date[];
  hairstylists: Hairstylist[];
  appointmentsByDate: Record<string, Appointment[]>;
  servicesById: Record<string, Service>;
  getClientById: (clientId: string) => Client | undefined;
  onGridClick: (date: Date, time: string, hairstylistId: string, duration?: number) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onStatusChange: (appointmentId: string, status: AppointmentStatus) => void;
}

const getDayString = (date: Date) => date.toISOString().split('T')[0];
const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();
const PIXELS_PER_HOUR = 96;
const SLOT_INTERVAL_MINUTES = 15;
const START_HOUR = 8;
const TOTAL_HOURS = 13;

const TimeGrid: React.FC<TimeGridProps> = ({
  days,
  hairstylists,
  appointmentsByDate,
  servicesById,
  getClientById,
  onGridClick,
  onAppointmentClick,
  onStatusChange,
}) => {
  const { updateAppointmentDetails } = useSettings();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const resizeRef = useRef<{
    appointment: Appointment;
    startY: number;
    startDuration: number;
  } | null>(null);
  const [resizingAppointment, setResizingAppointment] = useState<{
    id: string;
    duration: number;
  } | null>(null);

  // Drag-to-create state
  const dragCreateRef = useRef<{
    startY: number;
    day: Date;
    hairstylistId: string;
    gridCell: HTMLDivElement;
  } | null>(null);
  const [dragSelection, setDragSelection] = useState<{
    top: number;
    height: number;
    day: Date;
    hairstylistId: string;
  } | null>(null);

  // Close dropdown on any click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeDropdown &&
        !(event.target as HTMLElement).closest('.appointment-dropdown-container')
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  // Effect for handling resize mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const { appointment, startY, startDuration } = resizeRef.current;

      const deltaY = e.clientY - startY;
      const minutesPerPixel = 60 / PIXELS_PER_HOUR;
      const deltaMinutes = deltaY * minutesPerPixel;

      let newDuration = startDuration + deltaMinutes;
      newDuration = Math.max(
        SLOT_INTERVAL_MINUTES,
        Math.round(newDuration / SLOT_INTERVAL_MINUTES) * SLOT_INTERVAL_MINUTES
      );

      setResizingAppointment({ id: appointment.id, duration: newDuration });
    };

    const handleMouseUp = () => {
      if (resizingAppointment) {
        updateAppointmentDetails(resizingAppointment.id, {
          durationOverride: resizingAppointment.duration,
        });
      }
      resizeRef.current = null;
      setResizingAppointment(null);
    };

    if (resizeRef.current) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp, { once: true });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [updateAppointmentDetails, resizingAppointment]);

  // Effect for drag-to-create
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragCreateRef.current) return;

      const { startY, gridCell } = dragCreateRef.current;
      const rect = gridCell.getBoundingClientRect();
      const currentY = e.clientY - rect.top;

      const top = Math.min(startY, currentY);
      const height = Math.abs(currentY - startY);

      setDragSelection({ ...dragCreateRef.current, top, height });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (dragSelection && dragSelection.height > 10) {
        // Min drag height
        const totalMinutesPerCell = TOTAL_HOURS * 60;
        const minutesPerPixel = totalMinutesPerCell / dragSelection.day.valueOf(); // Hacky way to pass cell height
        const startMinutes = dragSelection.top * minutesPerPixel + START_HOUR * 60;
        const durationMinutes = dragSelection.height * minutesPerPixel;

        const snappedStartMinutes =
          Math.round(startMinutes / SLOT_INTERVAL_MINUTES) * SLOT_INTERVAL_MINUTES;
        const snappedDuration = Math.max(
          SLOT_INTERVAL_MINUTES,
          Math.round(durationMinutes / SLOT_INTERVAL_MINUTES) * SLOT_INTERVAL_MINUTES
        );

        const hour = Math.floor(snappedStartMinutes / 60);
        const minute = snappedStartMinutes % 60;
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

        onGridClick(dragSelection.day, time, dragSelection.hairstylistId, snappedDuration);
      } else if (dragCreateRef.current) {
        // Handle as a normal click
        const rect = dragCreateRef.current.gridCell.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const totalMinutesFrom8AM = (clickY / rect.height) * (TOTAL_HOURS * 60);
        const snappedTotalMinutes =
          Math.round(totalMinutesFrom8AM / SLOT_INTERVAL_MINUTES) * SLOT_INTERVAL_MINUTES;
        const hour = Math.floor(snappedTotalMinutes / 60) + START_HOUR;
        const minute = snappedTotalMinutes % 60;
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        onGridClick(dragCreateRef.current.day, time, dragCreateRef.current.hairstylistId);
      }
      dragCreateRef.current = null;
      setDragSelection(null);
    };

    if (dragCreateRef.current) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp, { once: true });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragSelection, onGridClick]);

  const STATUS_STYLES: Record<
    AppointmentStatus,
    { bg: string; border: string; text: string; lateStripe?: string }
  > = {
    unconfirmed: {
      bg: 'bg-blue-500/80 hover:bg-blue-500',
      border: 'border-blue-300',
      text: 'text-white',
    },
    confirmed: {
      bg: 'bg-green-500/80 hover:bg-green-500',
      border: 'border-green-300',
      text: 'text-white',
    },
    late: {
      bg: 'bg-orange-500/80 hover:bg-orange-500',
      border: 'border-orange-300',
      text: 'text-white',
      lateStripe: `bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.1),rgba(0,0,0,0.1)_10px,transparent_10px,transparent_20px)]`,
    },
    cancelled: {
      bg: 'bg-gray-500/80 hover:bg-gray-500',
      border: 'border-gray-300',
      text: 'text-white',
    },
  };

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, app: Appointment) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({ appointmentId: app.id }));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-accent/10', 'dark:bg-accent/20');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-accent/10', 'dark:bg-accent/20');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, day: Date, hairstylistId: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-accent/10', 'dark:bg-accent/20');

    const { appointmentId } = JSON.parse(e.dataTransfer.getData('application/json'));
    if (!appointmentId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const dropY = e.clientY - rect.top;
    const totalMinutesFrom8AM = (dropY / rect.height) * (TOTAL_HOURS * 60);
    const snappedTotalMinutes =
      Math.round(totalMinutesFrom8AM / SLOT_INTERVAL_MINUTES) * SLOT_INTERVAL_MINUTES;
    const hour = Math.floor(snappedTotalMinutes / 60) + START_HOUR;
    const minute = snappedTotalMinutes % 60;

    updateAppointmentDetails(appointmentId, {
      date: getDayString(day),
      time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      hairstylistId: hairstylistId,
    });
  };

  const handleResizeStart = (e: React.MouseEvent, app: Appointment) => {
    e.preventDefault();
    e.stopPropagation();
    const service = servicesById[app.serviceId];
    if (!service) return;
    const startDuration = app.durationOverride || service.duration;
    resizeRef.current = { appointment: app, startY: e.clientY, startDuration };
  };

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i + START_HOUR);

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-800/50 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="flex sticky top-0 bg-gray-100 dark:bg-gray-800/80 backdrop-blur-sm z-20 border-b border-gray-200 dark:border-gray-700">
        <div className="w-16 flex-shrink-0 flex items-center justify-center">
          <ClockIcon className="w-6 h-6 text-accent" />
        </div>
        <div
          className="flex-grow grid"
          style={{ gridTemplateColumns: `repeat(${days.length * hairstylists.length}, 1fr)` }}
        >
          {days.map(day =>
            hairstylists.map(stylist => (
              <div
                key={`${getDayString(day)}-${stylist.id}`}
                className="py-3 text-center border-l border-gray-200 dark:border-gray-700 flex flex-col items-center gap-2 justify-end"
              >
                {days.length > 1 && (
                  <div
                    className={`text-sm font-semibold ${isSameDay(day, new Date()) ? 'text-accent' : ''}`}
                  >
                    {day.toLocaleString('default', { weekday: 'short' })} {day.getDate()}
                  </div>
                )}
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                  {stylist.photoUrl ? (
                    <img
                      src={stylist.photoUrl}
                      alt={stylist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-6 h-6 text-gray-400 m-2" />
                  )}
                </div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {stylist.name}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <div className="flex bg-white dark:bg-gray-900">
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
                    className="relative border-l border-gray-200 dark:border-gray-700 transition-colors"
                    onMouseDown={e => {
                      if ((e.target as HTMLElement).closest('button')) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      dragCreateRef.current = {
                        startY: e.clientY - rect.top,
                        day,
                        hairstylistId: stylist.id,
                        gridCell: e.currentTarget,
                      };
                      // A hacky way to pass the cell height to the mouseUp handler
                      setDragSelection({
                        top: e.clientY - rect.top,
                        height: 0,
                        day: new Date(rect.height),
                        hairstylistId: stylist.id,
                      });
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={e => handleDrop(e, day, stylist.id)}
                  >
                    {hours.map(h => (
                      <div
                        key={h}
                        className="h-24 border-t border-gray-200 dark:border-gray-700"
                      ></div>
                    ))}
                    {dragSelection?.hairstylistId === stylist.id &&
                      getDayString(dragSelection.day) === dayString && (
                        <div
                          className="absolute left-1 right-1 bg-accent/20 border-2 border-dashed border-accent rounded-lg opacity-70 pointer-events-none"
                          style={{ top: dragSelection.top, height: dragSelection.height }}
                        ></div>
                      )}
                    {dayAppointments.map(app => {
                      const service = servicesById[app.serviceId];
                      const client = getClientById(app.clientId);
                      if (!service || !client) return null;
                      const [hour, minute] = app.time.split(':').map(Number);
                      const top = ((hour - START_HOUR) * 60 + minute) * (PIXELS_PER_HOUR / 60);

                      const isResizing = resizingAppointment?.id === app.id;
                      const duration = isResizing
                        ? resizingAppointment.duration
                        : app.durationOverride || service.duration;
                      const height = duration * (PIXELS_PER_HOUR / 60);

                      const style = STATUS_STYLES[app.status] || STATUS_STYLES.unconfirmed;
                      return (
                        <button
                          key={app.id}
                          draggable="true"
                          onDragStart={e => handleDragStart(e, app)}
                          onClick={e => {
                            e.stopPropagation();
                            onAppointmentClick(app);
                          }}
                          className={`absolute left-1 right-1 p-2 rounded-lg border-l-4 z-10 shadow-lg overflow-hidden text-xs text-left transition-all duration-100 cursor-grab ${style.bg} ${style.border} ${style.text} ${isResizing ? 'shadow-2xl' : ''}`}
                          style={{ top: `${top}px`, height: `${height}px`, minHeight: '24px' }}
                        >
                          <div className={`absolute inset-0 ${style.lateStripe || ''}`}></div>
                          <div className="relative flex justify-between items-start h-full flex-col">
                            <div className="flex justify-between items-start w-full">
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
                                      ['unconfirmed', 'confirmed', 'late'] as AppointmentStatus[]
                                    ).map(status => (
                                      <button
                                        key={status}
                                        onClick={e => {
                                          e.stopPropagation();
                                          onStatusChange(app.id, status);
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
                            <div
                              className="absolute bottom-0 left-0 right-0 h-4 flex items-center justify-center cursor-ns-resize group"
                              onMouseDown={e => handleResizeStart(e, app)}
                              onClick={e => e.stopPropagation()}
                            >
                              <GripVerticalIcon className="w-4 h-4 text-white/50 group-hover:text-white/80 transition-colors" />
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
      </div>
    </div>
  );
};
export default TimeGrid;
