import React from 'react';
import type { Appointment, Client } from '../../types';

interface MonthViewProps {
  currentDate: Date;
  appointmentsByDate: Record<string, Appointment[]>;
  getClientById: (clientId: string) => Client | undefined;
  onDayClick: (date: Date) => void;
}

const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();
const getDayString = (date: Date) => date.toISOString().split('T')[0];

const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  appointmentsByDate,
  getClientById,
  onDayClick,
}) => {
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const calendarGrid = Array.from(
    { length: lastDay.getDate() },
    (_, i) => new Date(firstDay.getFullYear(), firstDay.getMonth(), i + 1)
  );

  const startDayOfWeek = firstDay.getDay();
  const paddingDays = Array.from({ length: startDayOfWeek }).map((_, i) => {
    const d = new Date(firstDay);
    d.setDate(d.getDate() - (startDayOfWeek - i));
    return d;
  });

  const totalSlots = paddingDays.length + calendarGrid.length;
  const remainingSlots = totalSlots % 7 === 0 ? 0 : 7 - (totalSlots % 7);
  const followingPaddingDays = Array.from({ length: remainingSlots }).map((_, i) => {
    const d = new Date(lastDay);
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  const allDays = [...paddingDays, ...calendarGrid, ...followingPaddingDays];

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
      {allDays.map((day, index) => {
        const dateString = getDayString(day);
        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
        return (
          <button
            key={index}
            onClick={() => onDayClick(day)}
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
                {appointmentsByDate[dateString].length > 3 && (
                  <div className="text-xs text-gray-500">... and more</div>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default MonthView;
