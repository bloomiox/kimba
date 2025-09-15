import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { 
  XMarkIcon, 
  UserIcon, 
  ClockIcon, 
  CalendarIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  CreditCardIcon,
  ChevronLeftIcon,
  PhoneIcon
} from '../common/Icons';
import AppointmentPaymentModal from './AppointmentPaymentModal';
import type { Appointment, Client, Service, Hairstylist, AppointmentStatus, Product } from '../../types';
import { mapToAccentColor } from '../../utils/colorUtils';

type ModalView = 'appointment' | 'client' | 'addService' | 'payment' | 'photoCapture';

interface AppointmentDetailsModalProps {
  appointment: Appointment;
  client: Client;
  services: Service[]; // Array of services for this appointment
  hairstylist: Hairstylist;
  isOpen: boolean;
  onClose: () => void;
  onClientClick: (clientId: string) => void;
  onPayNow: () => void;
  onCheckout: () => void;
  onStatusChange: (status: AppointmentStatus | 'cancelled') => void;
  onAppointmentUpdate?: (updatedServices: Service[], updatedTotal: number) => void;
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  client,
  services,
  hairstylist,
  isOpen,
  onClose,
  onClientClick,
  onPayNow,
  onCheckout,
  onStatusChange,
  onAppointmentUpdate
}) => {
  const { t, currency, services: allServices, products } = useSettings();
  const [currentView, setCurrentView] = useState<ModalView>('appointment');
  const [currentStatus, setCurrentStatus] = useState<AppointmentStatus | 'cancelled'>(
    appointment.status === 'unconfirmed' ? 'unconfirmed' : 
    appointment.status === 'confirmed' ? 'confirmed' : 
    appointment.status === 'late' ? 'late' : 'confirmed'
  );
  const [appointmentServices, setAppointmentServices] = useState<Service[]>(services);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [beforeAfterPhotos, setBeforeAfterPhotos] = useState<{before?: string, after?: string}>({});
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  if (!isOpen) return null;

  const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
  const langCode = t('language.code');
  
  // Calculate totals including selected items
  const currentServices = [...appointmentServices, ...selectedServices];
  const currentProducts = selectedProducts.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    duration: 0,
    price: product.price,
    parentId: null
  }));
  
  const allCurrentItems = [...currentServices, ...currentProducts];
  const subtotal = allCurrentItems.reduce((sum, item) => sum + item.price, 0);
  const totalDuration = currentServices.reduce((sum, service) => sum + service.duration, 0);
  
  const handleStatusChange = (newStatus: AppointmentStatus | 'cancelled') => {
    setCurrentStatus(newStatus);
    onStatusChange(newStatus);
    setHasUnsavedChanges(true);
  };

  const getStatusColor = (status: AppointmentStatus | 'cancelled') => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500 text-white';
      case 'unconfirmed': return 'bg-yellow-500 text-white';
      case 'late': return 'bg-red-500 text-white';
      case 'cancelled': return 'bg-gray-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getStatusLabel = (status: AppointmentStatus | 'cancelled') => {
    switch (status) {
      case 'confirmed': return t('booking.status.confirmed');
      case 'unconfirmed': return t('booking.status.notConfirmed');
      case 'late': return t('booking.status.late');
      case 'cancelled': return t('booking.status.cancelled');
      default: return t('booking.status.confirmed');
    }
  };

  const handleAddService = (service: Service) => {
    if (currentView === 'addService') {
      // When in add service view, add to selected list instead of directly to appointment
      setSelectedServices(prev => {
        if (prev.find(s => s.id === service.id)) {
          return prev.filter(s => s.id !== service.id); // Remove if already selected
        }
        return [...prev, service]; // Add if not selected
      });
    } else {
      setAppointmentServices(prev => [...prev, service]);
      setCurrentView('appointment');
    }
  };

  const handleAddProduct = (product: Product) => {
    if (currentView === 'addService') {
      setSelectedProducts(prev => {
        if (prev.find(p => p.id === product.id)) {
          return prev.filter(p => p.id !== product.id); // Remove if already selected
        }
        return [...prev, product]; // Add if not selected
      });
    }
  };

  const handleSaveSelectedItems = () => {
    const newServices = [...appointmentServices, ...selectedServices];
    
    const productsAsServices: Service[] = selectedProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      duration: 0,
      price: product.price,
      parentId: null
    }));
    
    const finalServices = [...newServices, ...productsAsServices];
    setAppointmentServices(finalServices);
    
    setSelectedServices([]);
    setSelectedProducts([]);
    setHasUnsavedChanges(true);
    setCurrentView('appointment');
  };

  const handlePayNowClick = () => {
    setShowPaymentModal(true);
  };

  const handleRemoveService = (serviceId: string) => {
    setAppointmentServices(prev => prev.filter(service => service.id !== serviceId));
    setHasUnsavedChanges(true);
  };

  const handleSaveAppointmentChanges = () => {
    // Update the parent component with the new services and total
    if (onAppointmentUpdate) {
      const finalTotal = appointmentServices.reduce((sum, service) => sum + service.price, 0);
      onAppointmentUpdate(appointmentServices, finalTotal);
    }
    
    // In real implementation, this would call an API to update the appointment
    console.log('Saving appointment changes:', {
      appointmentId: appointment.id,
      services: appointmentServices,
      totalPrice: appointmentServices.reduce((sum, service) => sum + service.price, 0)
    });
    
    setHasUnsavedChanges(false);
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    successMessage.textContent = 'Appointment changes saved successfully!';
    document.body.appendChild(successMessage);
    setTimeout(() => {
      document.body.removeChild(successMessage);
    }, 3000);
  };

  const handlePhotoCapture = async (type: 'before' | 'after', file: File) => {
    // In a real implementation, you would upload the file to your storage service
    // For now, we'll convert to base64 for demonstration
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setBeforeAfterPhotos(prev => ({
        ...prev,
        [type]: base64String
      }));
      
      // Update client profile with photos
      // This would typically call an API to update the client record
      console.log(`${type} photo captured for client ${client.id}`);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (type: 'before' | 'after') => {
    setBeforeAfterPhotos(prev => {
      const updated = { ...prev };
      delete updated[type];
      return updated;
    });
  };

  const handleClientDetailsClick = () => {
    setCurrentView('client');
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
        
        <div className="flex items-center justify-between">
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
                  {currentView === 'client' ? client.name :
                   currentView === 'addService' ? t('booking.addService') :
                   currentView === 'photoCapture' ? 'Before & After Photos' :
                   appointmentDateTime.toLocaleDateString(langCode, { 
                     weekday: 'short',
                     day: 'numeric',
                     month: 'short'
                   })}
                </h2>
              </div>
              {currentView === 'appointment' && (
                <div className="flex items-center gap-2 text-white/90">
                  <ClockIcon className="w-4 h-4" />
                  <span>
                    {appointmentDateTime.toLocaleTimeString(langCode, { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} • {t('booking.doesntRepeat')}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Status Dropdown - only show on appointment view */}
          {currentView === 'appointment' && (
            <div className="relative">
              <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value as AppointmentStatus | 'cancelled')}
                className={`px-4 py-2 rounded-full font-medium text-sm cursor-pointer border-0 focus:ring-2 focus:ring-white/30 ${getStatusColor(currentStatus)}`}
              >
                <option value="unconfirmed">{getStatusLabel('unconfirmed')}</option>
                <option value="confirmed">{getStatusLabel('confirmed')}</option>
                <option value="late">{getStatusLabel('late')}</option>
                <option value="cancelled">{getStatusLabel('cancelled')}</option>
              </select>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAppointmentView = () => (
    <div className="flex flex-col lg:flex-row">
      {/* Left Side - Client Details */}
      <div className="lg:w-1/2 p-6 border-r border-gray-200 dark:border-gray-700">
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            {client.photoUrl ? (
              <img src={client.photoUrl} alt={client.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-10 h-10 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          
          <button
            onClick={handleClientDetailsClick}
            className="group text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2 transition-colors"
          >
            <h3 className={`text-xl font-bold text-gray-900 dark:text-white ${mapToAccentColor('group-hover:text-accent-600 dark:group-hover:text-accent-400')}`}>
              {client.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {client.email}
            </p>
            {client.phone && (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {client.phone}
              </p>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-sm">♀</span>
            </div>
            <span className="text-gray-700 dark:text-gray-300">{t('client.addPronouns')}</span>
          </button>
          
          <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <span className="text-gray-700 dark:text-gray-300">{t('client.addDateOfBirth')}</span>
          </button>
          
          <div className="flex items-center gap-3 p-3">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4" />
            </div>
            <span className="text-gray-700 dark:text-gray-300">
              {t('client.created')} {new Date(client.createdAt).toLocaleDateString(langCode, {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
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
            {appointmentServices.map((service) => (
              <div key={service.id} className={`border-l-4 ${mapToAccentColor('border-accent-500')} pl-4 py-2 relative group`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white pr-8">
                      {service.name}
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span>
                        {appointmentDateTime.toLocaleTimeString(langCode, { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} • {service.duration}{t('common.minutes')} • {hairstylist.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {service.price.toLocaleString(langCode, { style: 'currency', currency })}
                    </span>
                    <button
                      onClick={() => handleRemoveService(service.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                      title="Remove service"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add Service Button */}
            <button 
              onClick={() => setCurrentView('addService')}
              className={`w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg ${mapToAccentColor('hover:border-accent-500 hover:bg-accent-50 dark:hover:bg-accent-900/20')} transition-colors text-gray-600 dark:text-gray-400 ${mapToAccentColor('hover:text-accent-600 dark:hover:text-accent-400')}`}
            >
              <PlusIcon className="w-4 h-4" />
              <span>{t('booking.addService')}</span>
            </button>
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('pos.summary.total')}
              </span>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {totalDuration}{t('common.minutes')}
              </div>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {subtotal.toLocaleString(langCode, { style: 'currency', currency })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => setCurrentView('photoCapture')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Take Before/After Photos"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </button>
          
          <button
            onClick={handlePayNowClick}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <CreditCardIcon className="w-4 h-4" />
            <span>{t('booking.payment.payNow')}</span>
          </button>
          
          <button
            onClick={handleSaveAppointmentChanges}
            disabled={!hasUnsavedChanges}
            className={`flex-1 px-4 py-3 rounded-lg transition-all font-medium ${
              hasUnsavedChanges 
                ? `${mapToAccentColor('bg-accent-600 hover:bg-accent-700')} text-white shadow-sm hover:shadow-md` 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {hasUnsavedChanges ? 'Save Changes' : 'No Changes'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderClientView = () => (
    <div className="p-6 max-h-[70vh] overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        {/* Client Profile */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            {client.photoUrl ? (
              <img src={client.photoUrl} alt={client.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-16 h-16 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {client.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-1">{client.email}</p>
          {client.phone && (
            <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
              <PhoneIcon className="w-4 h-4" />
              {client.phone}
            </p>
          )}
        </div>

        {/* Client Details */}
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('clients.detail.notes')}
            </h3>
            {client.notes ? (
              <p className="text-gray-700 dark:text-gray-300">{client.notes}</p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">{t('clients.detail.noNotes')}</p>
            )}
          </div>

          {client.address && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Address
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{client.address}</p>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Account Information
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Client since:</span> {new Date(client.createdAt).toLocaleDateString(langCode, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              {client.consentToShare !== undefined && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Consent to share:</span> {client.consentToShare ? 'Yes' : 'No'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAddServiceView = () => {
    const hasSelections = selectedServices.length > 0 || selectedProducts.length > 0;
    
    return (
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('booking.addService')}
              </h3>
              {hasSelections && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedServices([]);
                      setSelectedProducts([]);
                    }}
                    className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all font-medium"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleSaveSelectedItems}
                    className={`px-6 py-2 ${mapToAccentColor('bg-accent-600 hover:bg-accent-700')} text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={selectedServices.length === 0 && selectedProducts.length === 0}
                  >
                    Save ({selectedServices.length + selectedProducts.length} items)
                  </button>
                </div>
              )}
            </div>
            
            {/* Services Section */}
            <div className="mb-8">
              <h4 className="text-md font-medium mb-4 text-gray-900 dark:text-white">
                Services
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allServices.filter(service => !appointmentServices.find(s => s.id === service.id)).map((service) => {
                  const isSelected = selectedServices.find(s => s.id === service.id);
                  return (
                    <button
                      key={service.id}
                      onClick={() => handleAddService(service)}
                      className={`p-4 border-2 rounded-lg transition-all duration-200 text-left hover:shadow-md ${
                        isSelected 
                          ? `${mapToAccentColor('border-accent-500 bg-accent-100 dark:bg-accent-900/50 text-accent-900 dark:text-accent-100')} shadow-sm`
                          : `border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 ${mapToAccentColor('hover:border-accent-400 dark:hover:border-accent-500 hover:bg-accent-50 dark:hover:bg-accent-900/20 text-gray-900 dark:text-gray-100')}`
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {service.name}
                        </h4>
                        {isSelected && (
                          <div className={`w-6 h-6 ${mapToAccentColor('bg-accent-500')} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                            ✓
                          </div>
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

            {/* Products Section */}
            {products && products.length > 0 && (
              <div>
                <h4 className="text-md font-medium mb-4 text-gray-900 dark:text-white">
                  Products
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.filter(product => product.isActive && product.inStock > 0).map((product) => {
                    const isSelected = selectedProducts.find(p => p.id === product.id);
                    return (
                      <button
                        key={product.id}
                        onClick={() => handleAddProduct(product)}
                        className={`p-4 border-2 rounded-lg transition-all duration-200 text-left hover:shadow-md ${
                          isSelected 
                            ? `${mapToAccentColor('border-accent-500 bg-accent-100 dark:bg-accent-900/50 text-accent-900 dark:text-accent-100')} shadow-sm`
                            : `border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 ${mapToAccentColor('hover:border-accent-400 dark:hover:border-accent-500 hover:bg-accent-50 dark:hover:bg-accent-900/20 text-gray-900 dark:text-gray-100')}`
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </h4>
                          {isSelected && (
                            <div className={`w-6 h-6 ${mapToAccentColor('bg-accent-500')} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                              ✓
                            </div>
                          )}
                        </div>
                        {product.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {product.description}
                          </p>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {product.inStock} in stock
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {product.price.toLocaleString(langCode, { style: 'currency', currency })}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPhotoCapture = () => (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
          Before & After Photos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before Photo */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Before</h4>
            <div className="relative">
              {beforeAfterPhotos.before ? (
                <div className="relative">
                  <img 
                    src={beforeAfterPhotos.before} 
                    alt="Before" 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleRemovePhoto('before')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> before photo
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or JPEG</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoCapture('before', file);
                    }}
                  />
                </label>
              )}
            </div>
          </div>
          
          {/* After Photo */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">After</h4>
            <div className="relative">
              {beforeAfterPhotos.after ? (
                <div className="relative">
                  <img 
                    src={beforeAfterPhotos.after} 
                    alt="After" 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleRemovePhoto('after')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> after photo
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or JPEG</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoCapture('after', file);
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
        
        {/* Save Photos Button */}
        {(beforeAfterPhotos.before || beforeAfterPhotos.after) && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                // Save photos to client profile
                console.log('Saving photos to client profile:', beforeAfterPhotos);
                // In real implementation, this would call an API to update the client
                setCurrentView('appointment');
                // Show success message
                alert('Photos saved to client profile!');
              }}
              className={`px-6 py-3 ${mapToAccentColor('bg-accent-600 hover:bg-accent-700')} text-white rounded-lg font-medium transition-colors`}
            >
              Save Photos to Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fade-in">
          {renderHeader()}
          
          {currentView === 'appointment' && renderAppointmentView()}
          {currentView === 'client' && renderClientView()}
          {currentView === 'addService' && renderAddServiceView()}
          {currentView === 'photoCapture' && renderPhotoCapture()}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && appointmentServices.length > 0 && (
        <AppointmentPaymentModal
          appointment={appointment}
          client={client}
          service={appointmentServices[0]} // Use first service for payment modal
          hairstylist={hairstylist}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={() => {
            setShowPaymentModal(false);
            onPayNow(); // Call the original callback
          }}
        />
      )}
    </>
  );
};

export default AppointmentDetailsModal;