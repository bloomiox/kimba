import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { mapToAccentColor } from '../../utils/colorUtils';
import type { Client, Appointment } from '../../types';
import { ChevronLeftIcon, UserIcon, CalendarIcon, DesignStudioIcon, MapPinIcon, EditIcon, TrashIcon, CreditCardIcon, PhotoIcon } from '../common/Icons';
import AppointmentPaymentModal from '../booking/AppointmentPaymentModal';

interface ClientDetailPageProps {
  client: Client;
  onBack: () => void;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

const ClientDetailPage: React.FC<ClientDetailPageProps> = ({ client, onBack, onEdit, onDelete }) => {
  const { appointments, services, hairstylists, getCurrentUserLookbooks, t, currency } = useSettings();
  const [paymentModalAppointment, setPaymentModalAppointment] = useState<Appointment | null>(null);

  const clientAppointments = appointments
    .filter(app => app.clientId === client.id)
    .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

  const clientLookbooks = getCurrentUserLookbooks().filter(lb => lb.clientId === client.id);

  const servicesById = React.useMemo(() => services.reduce((acc, s) => ({ ...acc, [s.id]: s }), {} as Record<string, typeof services[0]>), [services]);
  const hairstylistsById = React.useMemo(() => hairstylists.reduce((acc, h) => ({ ...acc, [h.id]: h }), {} as Record<string, typeof hairstylists[0]>), [hairstylists]);

  const getStatusLabel = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed': return t('booking.status.confirmed');
      case 'unconfirmed': return t('booking.status.notConfirmed');
      case 'late': return t('booking.status.late');
      case 'cancelled': return t('booking.status.cancelled');
      default: return t('booking.status.confirmed');
    }
  };

  // Function to handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlBob3RvIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
  };

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="flex-shrink-0 mb-6 flex justify-between items-center">
        <button onClick={onBack} className={`flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 ${mapToAccentColor('hover:text-accent-600 dark:hover:text-accent-400')} transition-colors`}>
          <ChevronLeftIcon className="w-5 h-5" /> {t('clients.detail.back')}
        </button>
         <div className="flex gap-2">
            <button onClick={() => onEdit(client)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                <EditIcon className="w-4 h-4" /> {t('common.edit')}
            </button>
            <button onClick={() => onDelete(client.id)} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 text-sm font-semibold rounded-lg hover:bg-red-500/20 transition-colors">
                <TrashIcon className="w-4 h-4" /> {t('common.delete')}
            </button>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
              <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                      {client.photoUrl ? (
                          <img src={client.photoUrl} alt={client.name} className="w-full h-full object-cover" />
                      ) : (
                          <UserIcon className="w-12 h-12 text-gray-500 dark:text-gray-400" />
                      )}
                  </div>
                  <h2 className="text-2xl font-bold">{client.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400">{client.email}</p>
                  {client.phone && <p className="text-gray-500 dark:text-gray-400 mt-1">{client.phone}</p>}
                  {client.address && <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5"><MapPinIcon className="w-4 h-4" /> {client.address}</p>}
              </div>
              <hr className="my-6 border-gray-200 dark:border-gray-700"/>
              <div>
                <h3 className={`font-semibold ${mapToAccentColor('text-accent-600 dark:text-accent-400')} mb-2`}>{t('clients.detail.notes')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{client.notes || t('clients.detail.noNotes')}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {/* Before and After Photos from Appointments */}
            {clientAppointments.some(app => app.beforePhotoUrl || app.afterPhotoUrl) && (
              <div>
                <h3 className={`text-2xl font-bold flex items-center gap-3 mb-4`}>
                  <PhotoIcon className={`w-6 h-6 ${mapToAccentColor('text-accent-500')}`}/> 
                  {t('clients.detail.appointmentPhotos')}
                </h3>
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {clientAppointments
                      .filter(app => app.beforePhotoUrl || app.afterPhotoUrl)
                      .map(app => {
                        const service = servicesById[app.serviceId];
                        const hairstylist = hairstylistsById[app.hairstylistId];
                        const appointmentDate = new Date(`${app.date}T${app.time}`);
                        
                        return (
                          <div key={app.id} className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">{service?.name || t('clients.detail.unknownService')}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {appointmentDate.toLocaleString(t('language.code'), { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                app.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                app.status === 'unconfirmed' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                app.status === 'late' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              }`}>
                                {getStatusLabel(app.status)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              {app.beforePhotoUrl && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Before</p>
                                  <div className="aspect-square rounded-lg overflow-hidden">
                                    <img 
                                      src={app.beforePhotoUrl} 
                                      alt="Before" 
                                      className="w-full h-full object-cover"
                                      onError={handleImageError}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {app.afterPhotoUrl && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">After</p>
                                  <div className="aspect-square rounded-lg overflow-hidden">
                                    <img 
                                      src={app.afterPhotoUrl} 
                                      alt="After" 
                                      className="w-full h-full object-cover"
                                      onError={handleImageError}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className={`text-2xl font-bold flex items-center gap-3 mb-4`}><CalendarIcon className={`w-6 h-6 ${mapToAccentColor('text-accent-500')}`}/> {t('clients.detail.appointmentHistory')}</h3>
              <div className="bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 space-y-4 max-h-80 overflow-y-auto">
                {clientAppointments.length > 0 ? clientAppointments.map(app => {
                  const service = servicesById[app.serviceId];
                  const hairstylist = hairstylistsById[app.hairstylistId];
                  const appointmentDate = new Date(`${app.date}T${app.time}`);
                  const isUpcoming = appointmentDate > new Date();
                  
                  return (
                    <div key={app.id} className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-grow">
                          <p className="font-semibold">{service?.name || t('clients.detail.unknownService')}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {appointmentDate.toLocaleString(t('language.code'), { dateStyle: 'medium', timeStyle: 'short' })}
                            {' '}{t('clients.detail.with')}{' '}{hairstylist?.name || t('clients.detail.unknownStylist')}
                          </p>
                          {service && (
                            <p className={`text-sm font-medium ${mapToAccentColor('text-accent-600 dark:text-accent-400')} mt-1`}>
                              {service.price.toLocaleString(t('language.code'), { style: 'currency', currency: currency })}
                            </p>
                          )}
                        </div>
                        {service && hairstylist && (
                          <button
                            onClick={() => setPaymentModalAppointment(app)}
                            className={`ml-3 flex items-center gap-2 px-3 py-1.5 ${mapToAccentColor('bg-accent-500 hover:bg-accent-600')} text-white text-sm font-semibold rounded-lg transition-colors`}
                          >
                            <CreditCardIcon className="w-4 h-4" />
                            {t('booking.payment.payNow')}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }) : <p className="text-center text-gray-500 py-4">{t('clients.detail.noAppointments')}</p>}
              </div>
            </div>

            <div>
              <h3 className={`text-2xl font-bold flex items-center gap-3 mb-4`}><DesignStudioIcon className={`w-6 h-6 ${mapToAccentColor('text-accent-500')}`}/> {t('clients.detail.lookbookGallery')}</h3>
              <div className="bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
                {clientLookbooks.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {clientLookbooks.map(lb => (
                      <button key={lb.id} className={`group relative aspect-square rounded-lg overflow-hidden shadow-md ${mapToAccentColor('focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2')} dark:focus:ring-offset-gray-800 transition-all hover:shadow-lg`}>
                        <img src={lb.finalImage.src} alt={lb.finalImage.hairstyleName} className="w-full h-full object-cover"/>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                           <p className="text-white text-xs text-center">{lb.finalImage.hairstyleName}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : <p className="text-center text-gray-500 py-8">{t('clients.detail.noLookbooks')}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModalAppointment && (
        <AppointmentPaymentModal
          appointment={paymentModalAppointment}
          client={client}
          service={servicesById[paymentModalAppointment.serviceId]}
          hairstylist={hairstylistsById[paymentModalAppointment.hairstylistId]}
          isOpen={!!paymentModalAppointment}
          onClose={() => setPaymentModalAppointment(null)}
          onPaymentComplete={() => {
            // Optionally refresh data or show success message
            console.log('Payment completed for appointment:', paymentModalAppointment.id);
          }}
        />
      )}
    </div>
  );
};

export default ClientDetailPage;