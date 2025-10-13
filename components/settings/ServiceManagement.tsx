import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import Card from '../common/Card';
import Button from '../common/Button';
import { PlusIcon, EditIcon, TrashIcon } from '../common/Icons';
import type { Service } from '../../types';
import ServiceModal from './ServiceModal';
import { mapToAccentColor } from '../../utils/colorUtils';

const ServiceManagement: React.FC = () => {
  const { services, deleteService } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const handleOpenModal = (service: Service | null = null) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDelete = (serviceId: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this service? This may affect existing appointments.'
      )
    ) {
      deleteService(serviceId);
    }
  };

  return (
    <>
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-semibold ${mapToAccentColor('text-blue-500')}`}>
            Manage Services
          </h3>
          <Button onClick={() => handleOpenModal()} variant="secondary" className="text-sm">
            <PlusIcon className="w-4 h-4" /> Add Service
          </Button>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {services.map(service => (
            <div
              key={service.id}
              className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg"
            >
              <div>
                <p className="font-semibold">{service.name}</p>
                <p className="text-sm text-gray-500">
                  {service.duration} minutes -{' '}
                  {service.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleOpenModal(service)}
                  className={`text-gray-500 hover:${mapToAccentColor('text-blue-500')}`}
                >
                  <EditIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {isModalOpen && (
        <ServiceModal service={editingService} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default ServiceManagement;
