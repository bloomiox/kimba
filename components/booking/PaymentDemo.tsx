import React, { useState } from 'react';
import AppointmentPaymentModal from './AppointmentPaymentModal';
import type { Appointment, Client, Service, Hairstylist } from '../../types';

// Demo component to test the payment modal
const PaymentDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data for testing
  const mockAppointment: Appointment = {
    id: 'demo-appointment',
    clientId: 'demo-client',
    date: '2025-02-15',
    time: '14:30',
    serviceId: 'demo-service',
    hairstylistId: 'demo-hairstylist',
    status: 'confirmed'
  };

  const mockClient: Client = {
    id: 'demo-client',
    name: 'Stephanie Collins',
    email: 'stephanie@example.com',
    phone: '+1 224-484-9544',
    createdAt: '2024-01-01T00:00:00Z'
  };

  const mockService: Service = {
    id: 'demo-service',
    name: 'Cut & Finish',
    duration: 45,
    price: 35,
    parentId: null
  };

  const mockHairstylist: Hairstylist = {
    id: 'demo-hairstylist',
    name: 'Ben Adams',
    type: 'expert',
    serviceIds: ['demo-service'],
    skills: [],
    availability: [],
    commissions: [],
    performance: [],
    isActive: true
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Payment Modal Demo</h2>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90"
      >
        Open Payment Modal
      </button>

      {isModalOpen && (
        <AppointmentPaymentModal
          appointment={mockAppointment}
          client={mockClient}
          service={mockService}
          hairstylist={mockHairstylist}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onPaymentComplete={() => {
            console.log('Payment completed!');
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default PaymentDemo;