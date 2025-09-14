import React from 'react';
import CreateAppointmentModal from '../booking/CreateAppointmentModal';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    modalData: { date: Date; time: string; hairstylistId: string; duration?: number };
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, modalData }) => {
    // Convert the modalData to match the expected format
    const convertedModalData = modalData ? {
        date: modalData.date,
        time: modalData.time,
        hairstylistId: modalData.hairstylistId
    } : null;

    return (
        <CreateAppointmentModal
            isOpen={isOpen}
            onClose={onClose}
            modalData={convertedModalData}
        />
    );
};

export default AppointmentModal;
