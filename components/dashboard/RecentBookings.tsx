import React, { useMemo, useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { ClockIcon, UserIcon, CalendarIcon } from '../common/Icons';
import type { Appointment, Client, Service } from '../../types';
import { getTodayString, getTomorrowString, isToday } from '../../utils/dateUtils';
import AppointmentDetailsModal from '../booking/AppointmentDetailsModal';

const RecentBookings: React.FC = () => {
    const { appointments, clients, services, hairstylists, getClientById, updateAppointmentStatus, updateAppointmentDetails } = useSettings();
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const recentBookings = useMemo(() => {
        const today = getTodayString();
        const tomorrow = getTomorrowString();

        // Get appointments for today and tomorrow, sorted by time
        const upcomingAppointments = appointments
            .filter(app => app.date === today || app.date === tomorrow)
            .sort((a, b) => {
                // Sort by date first, then by time
                if (a.date !== b.date) {
                    return a.date.localeCompare(b.date);
                }
                return a.time.localeCompare(b.time);
            })
            .slice(0, 5); // Show only next 5 appointments

        const clientsById = clients.reduce((acc, client) => ({ ...acc, [client.id]: client }), {} as Record<string, Client>);
        const servicesById = services.reduce((acc, service) => ({ ...acc, [service.id]: service }), {} as Record<string, Service>);

        const result = upcomingAppointments.map(appointment => ({
            ...appointment,
            client: clientsById[appointment.clientId],
            service: servicesById[appointment.serviceId],
        }));

        // Debug: Log booking data
        console.log('RecentBookings Debug:', {
            totalAppointments: appointments.length,
            upcomingAppointments: upcomingAppointments.length,
            today,
            tomorrow,
            clientsCount: clients.length,
            servicesCount: services.length,
            result: result.length
        });

        return result;
    }, [appointments, clients, services]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'text-green-600 bg-green-100';
            case 'unconfirmed': return 'text-yellow-600 bg-yellow-100';
            case 'late': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    // isToday function is now imported from dateUtils

    return (
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Bookings</h3>
                <CalendarIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => (
                        <div
                            key={booking.id}
                            onClick={() => setSelectedAppointment(booking)}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                        <UserIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {booking.client?.name || 'Unknown Client'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {booking.service?.name || 'Unknown Service'}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <ClockIcon className="w-3 h-3 text-gray-400" />
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {isToday(booking.date) ? 'Today' : 'Tomorrow'} at {formatTime(booking.time)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                    {booking.status}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm">No upcoming bookings</p>
                        <p className="text-xs mt-1">New appointments will appear here</p>
                    </div>
                )}
            </div>

            {recentBookings.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Showing next {recentBookings.length} appointments
                    </p>
                </div>
            )}

            {/* Appointment Details Modal */}
            {selectedAppointment && (() => {
                const client = getClientById(selectedAppointment.clientId);
                const service = services.find(s => s.id === selectedAppointment.serviceId);
                const hairstylist = hairstylists.find(h => h.id === selectedAppointment.hairstylistId);
                
                if (!client || !service || !hairstylist) return null;
                
                return (
                    <AppointmentDetailsModal
                        appointment={selectedAppointment}
                        client={client}
                        services={[service]}
                        hairstylist={hairstylist}
                        isOpen={true}
                        onClose={() => setSelectedAppointment(null)}
                        onClientClick={(clientId) => {
                            console.log('Client details shown in modal for:', clientId);
                        }}
                        onPayNow={() => {
                            console.log('Payment initiated for appointment:', selectedAppointment.id);
                        }}
                        onCheckout={() => {
                            console.log('Navigate to POS checkout for appointment:', selectedAppointment.id);
                        }}
                        onStatusChange={(status) => {
                            updateAppointmentStatus(selectedAppointment.id, status);
                            setSelectedAppointment(null);
                        }}
                        onAppointmentUpdate={(updatedServices, updatedTotal) => {
                            console.log('Updating appointment with services:', updatedServices, 'Total:', updatedTotal);
                        }}
                        updateAppointmentDetails={updateAppointmentDetails}
                    />
                );
            })()}
        </div>
    );
};

export default RecentBookings;