import React, { useState, useMemo } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { mapToAccentColor } from '../../utils/colorUtils';
import { 
  XMarkIcon, 
  UserIcon, 
  ClockIcon, 
  CalendarIcon,
  PlusIcon,
  ChevronLeftIcon,
  PhoneIcon
} from '../common/Icons';
import type { Appointment, Client, Service, Hairstylist } from '../../types';

type ModalView = 'appointment' | 'client' | 'selectService';

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalData: { date: Date; time: string; hairstylistId: string } | null;
}

const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  isOpen,
  onClose,
  modalData
}) => {
  const { t, currency, services, hairstylists, clients, addClient, addAppointment } = useSettings();
  const [currentView, setCurrentView] = useState<ModalView>('appointment');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [selectedHairstylistId, setSelectedHairstylistId] = useState('');
  const [notes, setNotes] = useState('');

  // Initialize form data when modal opens
  React.useEffect(() => {
    if (modalData && isOpen) {
      setAppointmentDate(modalData.date.toISOString().split('T')[0]);
      setAppointmentTime(modalData.time);
      setSelectedHairstylistId(modalData.hairstylistId);
    }
  }, [modalData, isOpen]);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setCurrentView('appointment');
      setSelectedClientId(null);
      setSelectedServices([]);
      setClientSearch('');
      setShowNewClientForm(false);
      setNotes('');
    }
  }, [isOpen]);

  if (!isOpen || !modalData) return null;

  const langCode = t('language.code');
  const selectedClient = selectedClientId ? clients.find(c => c.id === selectedClientId) : null;
  const selectedHairstylist = hairstylists.find(h => h.id === selectedHairstylistId);
  
  const filteredClients = useMemo(() => 
    clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())),
    [clients, clientSearch]
  );

  // Calculate totals
  const subtotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

  const handleAddService = (service: Service) => {
    if (!selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(prev => [...prev, service]);
    }
    setCurrentView('appointment');
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const handleCreateAppointment = async () => {
    if (!selectedClientId || selectedServices.length === 0) {
      alert("Please select a client and at least one service.");
      return;
    }

    try {
      // For now, we'll create an appointment with the first service
      // In a real implementation, you might want to handle multiple services differently
      const newAppointment: Omit<Appointment, 'id' | 'status'> = {
        clientId: selectedClientId,
        notes,
        date: appointmentDate,
        time: appointmentTime,
        serviceId: selectedServices[0].id,
        hairstylistId: selectedHairstylistId,
      };

      await addAppointment(newAppointment);
      onClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to create appointment. Please try again.');
    }
  };

  const handleCreateClient = async () => {
    const nameInput = document.querySelector('input[name="newClientName"]') as HTMLInputElement;
    const emailInput = document.querySelector('input[name="newClientEmail"]') as HTMLInputElement;
    const phoneInput = document.querySelector('input[name="newClientPhone"]') as HTMLInputElement;

    if (!nameInput?.value || !emailInput?.value) {
      alert("Please fill in client name and email.");
      return;
    }

    try {
      const newClient = await addClient({
        name: nameInput.value,
        email: emailInput.value,
        phone: phoneInput?.value || undefined,
      });
      
      setSelectedClientId(newClient.id);
      setClientSearch(newClient.name);
      setShowNewClientForm(false);
      setCurrentView('appointment');
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Failed to create client. Please try again.');
    }
  };

  const renderHeader = () => {
    const showBackButton = currentView !== 'appointment';
    
    return (
      <div className={`bg-gradient-to-r ${mapToAccentColor('from-accent-500 to-accent-600')} text-white p-6 relative`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-4">
          {showBackButton && (
            <button
              onClick={() => setCurrentView('appointment')}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
          )}
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CalendarIcon className="w-5 h-5" />
              <h2 className="text-xl font-bold">
                {currentView === 'client' ? t('clients.modal.addTitle') :
                 currentView === 'selectService' ? t('booking.addService') :
                 t('booking.title')}
              </h2>
            </div>
            {currentView === 'appointment' && (
              <div className="flex items-center gap-2 text-white/90">
                <ClockIcon className="w-4 h-4" />
                <span>
                  {new Date(`${appointmentDate}T${appointmentTime}`).toLocaleDateString(langCode, { 
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                  })} • {appointmentTime}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAppointmentView = () => (
    <div className="flex flex-col lg:flex-row">
      {/* Left Side - Client Selection */}
      <div className="lg:w-1/2 p-6 border-r border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {t('pos.customer')}
        </h3>

        {selectedClient ? (
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
              {selectedClient.photoUrl ? (
                <img src={selectedClient.photoUrl} alt={selectedClient.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-10 h-10 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            
            <button
              onClick={() => setCurrentView('client')}
              className="group text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2 transition-colors"
            >
              <h4 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {selectedClient.name}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {selectedClient.email}
              </p>
              {selectedClient.phone && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {selectedClient.phone}
                </p>
              )}
            </button>

            <button
              onClick={() => {
                setSelectedClientId(null);
                setClientSearch('');
              }}
              className="mt-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Change Client
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="clientSearch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Client
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  id="clientSearch" 
                  value={clientSearch} 
                  onChange={e => setClientSearch(e.target.value)} 
                  placeholder="Search for a client..." 
                  className="w-full p-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
                {clientSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredClients.map(client => (
                      <button 
                        type="button" 
                        key={client.id} 
                        onClick={() => { 
                          setSelectedClientId(client.id); 
                          setClientSearch(client.name); 
                        }} 
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          {client.photoUrl ? (
                            <img src={client.photoUrl} alt={client.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-gray-500">{client.email}</div>
                        </div>
                      </button>
                    ))}
                    <button 
                      type="button" 
                      onClick={() => setShowNewClientForm(true)} 
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 ${mapToAccentColor('text-accent-600 dark:text-accent-400')} font-semibold hover:bg-gray-100 dark:hover:bg-gray-600 border-t border-gray-200 dark:border-gray-600 transition-colors`}
                    >
                      <PlusIcon className="w-4 h-4" /> 
                      {t('clients.modal.addTitle')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {showNewClientForm && (
              <div className={`p-4 border ${mapToAccentColor('border-accent-200 dark:border-accent-800 bg-accent-50 dark:bg-accent-900/20')} rounded-lg space-y-3`}>
                <h4 className={`font-semibold ${mapToAccentColor('text-accent-900 dark:text-accent-100')}`}>New Client Details</h4>
                  <input 
                    type="text" 
                    name="newClientName" 
                    placeholder={t('clients.modal.fullName')} 
                    required 
                    className={`w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg ${mapToAccentColor('focus:ring-2 focus:ring-accent-500 focus:border-accent-500')} transition-all`}
                  />
                  <input 
                    type="email" 
                    name="newClientEmail" 
                    placeholder={t('clients.modal.email')} 
                    required 
                    className={`w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg ${mapToAccentColor('focus:ring-2 focus:ring-accent-500 focus:border-accent-500')} transition-all`}
                  />
                  <input 
                    type="tel" 
                    name="newClientPhone" 
                    placeholder={t('clients.modal.phone')} 
                    className={`w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg ${mapToAccentColor('focus:ring-2 focus:ring-accent-500 focus:border-accent-500')} transition-all`}
                  />
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={handleCreateClient}
                    className={`flex-1 px-4 py-2 ${mapToAccentColor('bg-accent-600')} text-white rounded-lg ${mapToAccentColor('hover:bg-accent-700')} font-medium`}
                  >
                    {t('clients.modal.save')}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowNewClientForm(false)} 
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Appointment Details */}
        <div className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('pos.hairstylist')}
            </label>
            <select 
              value={selectedHairstylistId} 
              onChange={e => setSelectedHairstylistId(e.target.value)}
              className={`w-full p-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg ${mapToAccentColor('focus:ring-2 focus:ring-accent-500 focus:border-accent-500')} transition-all`}
            >
              {hairstylists.map(stylist => (
                <option key={stylist.id} value={stylist.id}>{stylist.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('booking.step4.title').split('.')[1].trim()}
              </label>
              <input 
                type="date" 
                value={appointmentDate} 
                onChange={e => setAppointmentDate(e.target.value)}
                className={`w-full p-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg ${mapToAccentColor('focus:ring-2 focus:ring-accent-500 focus:border-accent-500')} transition-all`}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time
              </label>
              <input 
                type="time" 
                value={appointmentTime} 
                onChange={e => setAppointmentTime(e.target.value)}
                className={`w-full p-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg ${mapToAccentColor('focus:ring-2 focus:ring-accent-500 focus:border-accent-500')} transition-all`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('clients.modal.notes')}
            </label>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              rows={3} 
              className={`w-full p-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg resize-none ${mapToAccentColor('focus:ring-2 focus:ring-accent-500 focus:border-accent-500')} transition-all`}
              placeholder="Optional notes..."
            />
          </div>
        </div>
      </div>

      {/* Right Side - Services */}
      <div className="lg:w-1/2 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {t('booking.services')}
          </h3>
          
          <div className="space-y-3">
            {selectedServices.map((service) => (
              <div key={service.id} className={`border-l-4 ${mapToAccentColor('border-accent-500')} pl-4 py-2 ${mapToAccentColor('bg-accent-50 dark:bg-accent-900/20')} rounded-r-lg transition-colors`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {service.name}
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span>{service.duration} {t('common.minutes')}</span>
                      {service.description && <span> • {service.description}</span>}
                    </div>
                  </div>
                  <div className="text-right ml-4 flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {service.price.toLocaleString(langCode, { style: 'currency', currency })}
                    </span>
                    <button
                      onClick={() => handleRemoveService(service.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add Service Button */}
              <button 
                onClick={() => setCurrentView('selectService')}
                className={`w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg ${mapToAccentColor('hover:border-accent-500 hover:bg-accent-50 dark:hover:bg-accent-900/20')} transition-colors text-gray-600 dark:text-gray-400 ${mapToAccentColor('hover:text-accent-600 dark:hover:text-accent-400')}`}
              >
              <PlusIcon className="w-4 h-4" />
              <span>{selectedServices.length === 0 ? 'Select Service' : t('booking.addService')}</span>
            </button>
          </div>
        </div>

        {/* Total */}
        {selectedServices.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('pos.summary.total')}
                </span>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {totalDuration} {t('common.minutes')}
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {subtotal.toLocaleString(langCode, { style: 'currency', currency })}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold text-gray-800 dark:text-gray-200"
          >
            {t('common.cancel')}
          </button>
          
          <button
            onClick={handleCreateAppointment}
            disabled={!selectedClientId || selectedServices.length === 0}
            className={`flex-1 px-4 py-3 ${mapToAccentColor('bg-accent-600 hover:bg-accent-700')} disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg font-semibold text-white`}
          >
            Create Appointment
          </button>
        </div>
      </div>
    </div>
  );

  const renderClientView = () => {
    if (!selectedClient) return null;

    return (
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {/* Client Profile */}
          <div className="text-center mb-8">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
              {selectedClient.photoUrl ? (
                <img src={selectedClient.photoUrl} alt={selectedClient.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-16 h-16 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {selectedClient.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-1">{selectedClient.email}</p>
            {selectedClient.phone && (
              <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                <PhoneIcon className="w-4 h-4" />
                {selectedClient.phone}
              </p>
            )}
          </div>

          {/* Client Details */}
          <div className="space-y-6">
            {selectedClient.notes && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  {t('clients.detail.notes')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{selectedClient.notes}</p>
              </div>
            )}

            {selectedClient.address && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Address
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{selectedClient.address}</p>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Account Information
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Client since:</span> {new Date(selectedClient.createdAt).toLocaleDateString(langCode, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSelectServiceView = () => (
    <div className="p-6 max-h-[70vh] overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Select Services
          </h3>
          
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => {
              const isSelected = selectedServices.find(s => s.id === service.id);
              return (
                <button
                  key={service.id}
                  onClick={() => handleAddService(service)}
                  disabled={!!isSelected}
                  className={`p-4 border rounded-lg transition-all duration-200 text-left hover:shadow-md ${
                    isSelected 
                      ? `${mapToAccentColor('border-accent-500 bg-accent-100 dark:bg-accent-900/50 text-accent-900 dark:text-accent-100')} cursor-not-allowed shadow-sm` 
                      : `border-gray-200 dark:border-gray-700 ${mapToAccentColor('hover:border-accent-500 hover:bg-accent-50 dark:hover:bg-accent-900/20')}`
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {service.name}
                    </h4>
                    {isSelected && (
                      <span className="text-green-600 text-sm font-medium">Selected</span>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {service.duration} {t('common.minutes')}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {service.price.toLocaleString(langCode, { style: 'currency', currency })}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fade-in">
        {renderHeader()}
        
        {currentView === 'appointment' && renderAppointmentView()}
        {currentView === 'client' && renderClientView()}
        {currentView === 'selectService' && renderSelectServiceView()}
      </div>
    </div>
  );
};

export default CreateAppointmentModal;