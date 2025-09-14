import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import type { Appointment, AppointmentStatus } from '../../types';
import AppointmentDetailsModal from '../booking/AppointmentDetailsModal';

interface AppointmentDetailsModalProps {
  appointment: Appointment;
  onClose: () => void;
}

const AppointmentDetailsModalWrapper: React.FC<AppointmentDetailsModalProps> = ({ appointment, onClose }) => {
    const { getClientById, services, hairstylists, updateAppointmentStatus, updateAppointmentDetails } = useSettings();
    const client = getClientById(appointment.clientId);
    const service = services.find(s => s.id === appointment.serviceId);
    const hairstylist = hairstylists.find(h => h.id === appointment.hairstylistId);

    if (!client || !service || !hairstylist) return null;

    return (
        <AppointmentDetailsModal
            appointment={appointment}
            client={client}
            services={[service]}
            hairstylist={hairstylist}
            isOpen={true}
            onClose={onClose}
            onClientClick={(clientId) => {
                // Client details are now shown within the modal
                console.log('Client details shown in modal for:', clientId);
            }}
            onPayNow={() => {
                // Payment modal is now handled within the appointment details modal
                console.log('Payment initiated for appointment:', appointment.id);
            }}
            onCheckout={() => {
                // Navigate to POS checkout
                console.log('Navigate to POS checkout for appointment:', appointment.id);
            }}
            onStatusChange={(status: AppointmentStatus | 'cancelled') => {
                updateAppointmentStatus(appointment.id, status);
                onClose();
            }}
            onAppointmentUpdate={(updatedServices, updatedTotal) => {
                // Update the appointment with new services (in a real app, you'd update the services field)
                console.log('Updating appointment with services:', updatedServices, 'Total:', updatedTotal);
                // For now, we'll just update the local state to reflect the changes
                // In a real implementation, you would call updateAppointmentDetails with the new services
            }}
        />
    );
};

export default AppointmentDetailsModalWrapper;
