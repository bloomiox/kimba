import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import type { Client } from '../types';
// FIX: Updated import path to use the common Icons component.
import {
  ChevronLeftIcon,
  UserIcon,
  CalendarIcon,
  DesignStudioIcon,
  MapPinIcon,
} from './common/Icons';

interface ClientDetailPageProps {
  client: Client;
  onBack: () => void;
}

const ClientDetailPage: React.FC<ClientDetailPageProps> = ({ client, onBack }) => {
  const { appointments, services, hairstylists, getCurrentUserLookbooks, t } = useSettings();

  const clientAppointments = appointments
    .filter(app => app.clientId === client.id)
    .sort(
      (a, b) =>
        new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()
    );

  const clientLookbooks = getCurrentUserLookbooks().filter(lb => lb.clientId === client.id);

  const servicesById = React.useMemo(
    () =>
      services.reduce(
        (acc, s) => ({ ...acc, [s.id]: s }),
        {} as Record<string, (typeof services)[0]>
      ),
    [services]
  );
  const hairstylistsById = React.useMemo(
    () =>
      hairstylists.reduce(
        (acc, h) => ({ ...acc, [h.id]: h }),
        {} as Record<string, (typeof hairstylists)[0]>
      ),
    [hairstylists]
  );

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="flex-shrink-0 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-accent"
        >
          <ChevronLeftIcon className="w-5 h-5" /> {t('clients.detail.back')}
        </button>
      </div>

      <div className="flex-grow overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                  {client.photoUrl ? (
                    <img
                      src={client.photoUrl}
                      alt={client.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-12 h-12 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
                <h2 className="text-2xl font-bold">{client.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">{client.email}</p>
                {client.phone && (
                  <p className="text-gray-500 dark:text-gray-400 mt-1">{client.phone}</p>
                )}
                {client.address && (
                  <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                    <MapPinIcon className="w-4 h-4" /> {client.address}
                  </p>
                )}
              </div>
              <hr className="my-6 border-gray-200 dark:border-gray-700" />
              <div>
                <h3 className="font-semibold text-accent mb-2">{t('clients.detail.notes')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {client.notes || t('clients.detail.noNotes')}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-3 mb-4">
                <CalendarIcon className="w-6 h-6 text-accent" />{' '}
                {t('clients.detail.appointmentHistory')}
              </h3>
              <div className="bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 space-y-4 max-h-80 overflow-y-auto">
                {clientAppointments.length > 0 ? (
                  clientAppointments.map(app => (
                    <div key={app.id} className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                      <p className="font-semibold">
                        {servicesById[app.serviceId]?.name || t('clients.detail.unknownService')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(`${app.date}T${app.time}`).toLocaleString(t('language.code'), {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}{' '}
                        {t('clients.detail.with')}{' '}
                        {hairstylistsById[app.hairstylistId]?.name ||
                          t('clients.detail.unknownStylist')}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    {t('clients.detail.noAppointments')}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold flex items-center gap-3 mb-4">
                <DesignStudioIcon className="w-6 h-6 text-accent" />{' '}
                {t('clients.detail.lookbookGallery')}
              </h3>
              <div className="bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
                {clientLookbooks.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {clientLookbooks.map(lb => (
                      <button
                        key={lb.id}
                        className="group relative aspect-square rounded-lg overflow-hidden shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                      >
                        <img
                          src={lb.finalImage.src}
                          alt={lb.finalImage.hairstyleName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                          <p className="text-white text-xs text-center">
                            {lb.finalImage.hairstyleName}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    {t('clients.detail.noLookbooks')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailPage;
