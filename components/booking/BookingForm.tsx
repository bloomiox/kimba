import React, { useState, useMemo } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { 
  CheckCircleIcon, 
  ChevronLeftIcon, 
  UserIcon, 
  CalendarIcon, 
  ClockIcon,
  XMarkIcon,
  PhoneIcon
} from '../common/Icons';
import type { Service, Hairstylist, Appointment, ServiceGroup } from '../../types';
import { mapToAccentColor } from '../../utils/colorUtils';
import { formatDateForInput, formatDateForStorage } from '../../utils/dateUtils';

const WORKING_HOURS = { start: 8, end: 20 }; // 8 AM to 8 PM
const SLOT_INTERVAL = 30; // in minutes

const getAvailableSlots = (
  date: Date,
  service: Service,
  hairstylistAppointments: Appointment[],
  allServices: Service[]
): { time: string }[] => {
  if (!service) return [];
  const availableSlots: { time: string }[] = [];
  const serviceDuration = service.duration;

  const servicesById = allServices.reduce((acc, s) => ({...acc, [s.id]: s}), {} as Record<string, Service>);

  const appointmentIntervals = hairstylistAppointments.map(app => {
    const appStartTime = new Date(`${app.date}T${app.time}`);
    const appService = servicesById[app.serviceId];
    const appEndTime = new Date(appStartTime.getTime() + (appService?.duration || 60) * 60000);
    return { start: appStartTime, end: appEndTime };
  });

  for (let hour = WORKING_HOURS.start; hour < WORKING_HOURS.end; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_INTERVAL) {
      const slotStartTime = new Date(date);
      slotStartTime.setHours(hour, minute, 0, 0);

      // Prevent selecting slots in the past
      if (slotStartTime < new Date()) continue;

      const slotEndTime = new Date(slotStartTime.getTime() + serviceDuration * 60000);
      const endOfDay = new Date(date);
      endOfDay.setHours(WORKING_HOURS.end, 0, 0, 0);
      if (slotEndTime > endOfDay) continue;

      let isAvailable = true;
      for (const interval of appointmentIntervals) {
        if (slotStartTime < interval.end && slotEndTime > interval.start) {
          isAvailable = false;
          break;
        }
      }
      
      if (isAvailable) {
        availableSlots.push({ time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` });
      }
    }
  }
  return availableSlots;
};

const getServicesInGroup = (
  groupId: string,
  allServices: Service[],
  allGroups: ServiceGroup[]
): Service[] => {
  if (groupId === 'root_services') {
    return allServices.filter(s => s.parentId === null);
  }
  
  const services: Service[] = [];
  const queue: string[] = [groupId];
  const visitedGroups = new Set<string>();

  while (queue.length > 0) {
    const currentGroupId = queue.shift()!;
    if (visitedGroups.has(currentGroupId)) continue;
    visitedGroups.add(currentGroupId);

    services.push(...allServices.filter(s => s.parentId === currentGroupId));

    const childGroups = allGroups.filter(g => g.parentId === currentGroupId);
    queue.push(...childGroups.map(g => g.id));
  }
  return services.sort((a,b) => a.name.localeCompare(b.name));
};



const BookingForm: React.FC = () => {
    // FIX: The 'findOrCreateClient' method was missing from the SettingsContextType. 
    // It has been added to the context to resolve this error.
    const { salonName, services, serviceGroups, hairstylists, appointments, clients, addAppointment, findOrCreateClient, t } = useSettings();
    const [step, setStep] = useState(1);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedHairstylist, setSelectedHairstylist] = useState<Hairstylist | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    });
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [clientDetails, setClientDetails] = useState({ name: '', email: '', phone: '' });
    const [isConfirmed, setIsConfirmed] = useState(false);
    
    const topLevelGroups = useMemo(() => serviceGroups.filter(g => g.parentId === null), [serviceGroups]);
    const hasOrphanServices = useMemo(() => services.some(s => s.parentId === null), [services]);

    const allCategories = useMemo(() => {
        const categories: (ServiceGroup | { id: string; name: string; parentId: string | null })[] = [...topLevelGroups];
        if (hasOrphanServices) {
            categories.push({ id: 'root_services', name: t('booking.step1.generalServices'), parentId: null });
        }
        return categories.sort((a,b) => a.name.localeCompare(b.name));
    }, [topLevelGroups, hasOrphanServices, t]);

    const servicesForSelection = useMemo(() => {
        if (!selectedGroupId) return [];
        return getServicesInGroup(selectedGroupId, services, serviceGroups);
    }, [selectedGroupId, services, serviceGroups]);

    const hairstylistAppointments = useMemo(() => {
        if (!selectedHairstylist) return [];
        const dateString = formatDateForStorage(selectedDate);
        return appointments.filter(a => a.hairstylistId === selectedHairstylist.id && a.date === dateString);
    }, [appointments, selectedHairstylist, selectedDate]);
    
    const availableSlots = useMemo(() => {
        if (!selectedService || !selectedHairstylist) return [];
        return getAvailableSlots(selectedDate, selectedService, hairstylistAppointments, services);
    }, [selectedService, selectedHairstylist, selectedDate, hairstylistAppointments, services]);
    
    const handleNextStep = () => setStep(s => s + 1);
    const handlePrevStep = () => setStep(s => s - 1);
    
    const handleSubmit = async () => {
        if (!selectedService || !selectedHairstylist || !selectedTime || !clientDetails.name || !clientDetails.email || !clientDetails.phone) {
            console.error('Missing required fields for appointment booking');
            return;
        }
        
        try {
            console.log('Creating/finding client:', clientDetails);
            const client = await findOrCreateClient(clientDetails.name, clientDetails.email, clientDetails.phone);
            console.log('Client found/created:', client);

            console.log('Creating appointment with:', {
                clientId: client.id,
                serviceId: selectedService.id,
                hairstylistId: selectedHairstylist.id,
                date: selectedDate.toISOString().split('T')[0],
                time: selectedTime,
            });

            await addAppointment({
                clientId: client.id,
                serviceId: selectedService.id,
                hairstylistId: selectedHairstylist.id,
                date: formatDateForStorage(selectedDate),
                time: selectedTime,
            });
            
            console.log('Appointment created successfully');
            setIsConfirmed(true);
        } catch (error) {
            console.error('Error creating appointment:', error);
            alert('Failed to create appointment. Please try again.');
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [year, month, day] = e.target.value.split('-').map(Number);
        const newDate = new Date(year, month - 1, day);
        newDate.setHours(0, 0, 0, 0); // Ensure time is set to start of day
        setSelectedDate(newDate);
        setSelectedTime(null);
    };
    
    if (isConfirmed) {
        return (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8 text-center animate-fade-in">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                    <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{t('booking.confirmed.title')}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{t('booking.confirmed.subtitle', { salonName })}</p>
                    
                    <div className={`bg-gradient-to-r ${mapToAccentColor('from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20')} p-6 rounded-lg text-left space-y-3 mb-6`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 ${mapToAccentColor('bg-accent-500')} rounded-full flex items-center justify-center`}>
                                <span className="text-white text-sm font-bold">✓</span>
                            </div>
                            <div>
                                <p className={`font-semibold ${mapToAccentColor('text-accent-900 dark:text-accent-100')}`}>{selectedService?.name}</p>
                                <p className={`text-sm ${mapToAccentColor('text-accent-700 dark:text-accent-300')}`}>{selectedService?.duration} {t('common.minutes')}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <UserIcon className={`w-8 h-8 p-1.5 ${mapToAccentColor('bg-accent-500')} text-white rounded-full`}/>
                            <div>
                                <p className={`font-semibold ${mapToAccentColor('text-accent-900 dark:text-accent-100')}`}>{selectedHairstylist?.name}</p>
                                <p className={`text-sm ${mapToAccentColor('text-accent-700 dark:text-accent-300')}`}>{t('booking.confirmed.with')}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <CalendarIcon className={`w-8 h-8 p-1.5 ${mapToAccentColor('bg-accent-500')} text-white rounded-full`}/>
                            <div>
                                <p className={`font-semibold ${mapToAccentColor('text-accent-900 dark:text-accent-100')}`}>
                                    {new Date(formatDateForStorage(selectedDate) + 'T' + selectedTime).toLocaleDateString(t('language.code'), { 
                                        weekday: 'long',
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </p>
                                <p className={`text-sm ${mapToAccentColor('text-accent-700 dark:text-accent-300')}`}>
                                    {new Date('1970-01-01T' + selectedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => window.location.reload()} 
                        className={`w-full px-6 py-3 ${mapToAccentColor('bg-accent-600 hover:bg-accent-700')} text-white rounded-lg font-semibold transition-colors`}
                    >
                        {t('common.done')}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fade-in">
                {/* Header */}
                <div className={`bg-gradient-to-r ${mapToAccentColor('from-accent-500 to-accent-600')} text-white p-6 relative`}>
                    <button 
                        onClick={() => window.history.back()}
                        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-4">
                        {step > 1 && (
                            <button
                                onClick={handlePrevStep}
                                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                        )}
                        
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <CalendarIcon className="w-5 h-5" />
                                <h1 className="text-xl font-bold">{t('booking.title', { salonName })}</h1>
                            </div>
                            <div className="flex items-center gap-2 text-white/90">
                                <span className="text-sm">
                                    {t('common.step')} {step} {t('common.of')} 5
                                </span>
                                {/* Progress bar */}
                                <div className="w-32 h-2 bg-white/20 rounded-full ml-2">
                                    <div 
                                        className="h-full bg-white rounded-full transition-all duration-300"
                                        style={{ width: `${(step / 5) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
                
                {step === 1 && (
                    <div className="animate-fade-in">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('booking.step1.title')}</h2>
                            <p className="text-gray-600 dark:text-gray-400">Choose a service category to get started</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                            {allCategories.map(g => (
                                <button 
                                    key={g.id} 
                                    onClick={() => { setSelectedGroupId(g.id); handleNextStep(); }} 
                                    className={`group p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-left ${mapToAccentColor('hover:border-accent-500 hover:bg-accent-50 dark:hover:bg-accent-900/20')} transition-all duration-200 transform hover:scale-105`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 ${mapToAccentColor('bg-accent-100 dark:bg-accent-900/30')} rounded-lg flex items-center justify-center ${mapToAccentColor('group-hover:bg-accent-500')} transition-colors`}>
                                            <span className="text-2xl group-hover:text-white">✂️</span>
                                        </div>
                                        <div>
                                            <p className={`font-semibold text-lg text-gray-900 dark:text-white ${mapToAccentColor('group-hover:text-accent-600 dark:group-hover:text-accent-400')}`}>
                                                {g.name}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Select this category
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('booking.step2.title')}</h2>
                            <p className="text-gray-600 dark:text-gray-400">Choose the service you'd like to book</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                            {servicesForSelection.map(s => (
                                <button 
                                    key={s.id} 
                                    onClick={() => { setSelectedService(s); handleNextStep(); }} 
                                    className={`group p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-left ${mapToAccentColor('hover:border-accent-500 hover:bg-accent-50 dark:hover:bg-accent-900/20')} transition-all duration-200`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className={`font-semibold text-lg text-gray-900 dark:text-white ${mapToAccentColor('group-hover:text-accent-600 dark:group-hover:text-accent-400')}`}>
                                            {s.name}
                                        </h3>
                                        <div className="text-right">
                                            <div className={`text-xl font-bold ${mapToAccentColor('text-accent-600 dark:text-accent-400')}`}>
                                                {s.price.toLocaleString(t('language.code'), { style: 'currency', currency: 'USD' })}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {s.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            {s.description}
                                        </p>
                                    )}
                                    
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <ClockIcon className="w-4 h-4" />
                                        <span>{s.duration} {t('common.minutes')}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                {step === 3 && (
                    <div className="animate-fade-in">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('booking.step3.title')}</h2>
                            <p className="text-gray-600 dark:text-gray-400">Select your preferred hairstylist</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                            {hairstylists.map(h => (
                                <button 
                                    key={h.id} 
                                    onClick={() => { setSelectedHairstylist(h); handleNextStep(); }} 
                                    className={`group p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-left ${mapToAccentColor('hover:border-accent-500 hover:bg-accent-50 dark:hover:bg-accent-900/20')} transition-all duration-200 transform hover:scale-105`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {h.photoUrl ? (
                                                <img src={h.photoUrl} alt={h.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font-semibold text-lg text-gray-900 dark:text-white ${mapToAccentColor('group-hover:text-accent-600 dark:group-hover:text-accent-400')}`}>
                                                {h.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                                {h.type} • {h.serviceIds.length} services
                                            </p>
                                            {h.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {h.skills.slice(0, 2).map(skill => (
                                                        <span key={skill.id} className={`px-2 py-1 ${mapToAccentColor('bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300')} text-xs rounded-full`}>
                                                            {skill.name}
                                                        </span>
                                                    ))}
                                                    {h.skills.length > 2 && (
                                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                                            +{h.skills.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                {step === 4 && (
                    <div className="animate-fade-in">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('booking.step4.title')}</h2>
                            <p className="text-gray-600 dark:text-gray-400">Choose your preferred date and time</p>
                        </div>
                        
                        <div className="max-w-4xl mx-auto">
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Date Selection */}
                                <div className="lg:w-1/3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <CalendarIcon className="w-5 h-5" />
                                        Select Date
                                    </h3>
                                    <input 
                                        type="date" 
                                        value={formatDateForInput(selectedDate)} 
                                        min={formatDateForInput(new Date())} 
                                        onChange={handleDateChange} 
                                        className={`w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${mapToAccentColor('focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20')} transition-colors dark:[color-scheme:dark]`}
                                    />
                                    
                                    {/* Selected date display */}
                                    <div className={`mt-4 p-4 ${mapToAccentColor('bg-accent-50 dark:bg-accent-900/20')} rounded-lg`}>
                                        <p className={`text-sm ${mapToAccentColor('text-accent-700 dark:text-accent-300')} font-medium`}>
                                            Selected Date
                                        </p>
                                        <p className={`text-lg font-semibold ${mapToAccentColor('text-accent-900 dark:text-accent-100')}`}>
                                            {selectedDate.toLocaleDateString(t('language.code'), { 
                                                weekday: 'long',
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Time Selection */}
                                <div className="lg:w-2/3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <ClockIcon className="w-5 h-5" />
                                        Available Times
                                    </h3>
                                    
                                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 max-h-80 overflow-y-auto pr-2">
                                        {availableSlots.length > 0 ? availableSlots.map(slot => (
                                            <button 
                                                key={slot.time} 
                                                onClick={() => { setSelectedTime(slot.time); handleNextStep(); }} 
                                                className={`group p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl ${mapToAccentColor('hover:border-accent-500 hover:bg-accent-50 dark:hover:bg-accent-900/20')} transition-all duration-200 transform hover:scale-105`}
                                            >
                                                <div className="text-center">
                                                    <div className={`text-lg font-bold text-gray-900 dark:text-white ${mapToAccentColor('group-hover:text-accent-600 dark:group-hover:text-accent-400')}`}>
                                                        {new Date('1970-01-01T' + slot.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Available
                                                    </div>
                                                </div>
                                            </button>
                                        )) : (
                                            <div className="col-span-full text-center py-12">
                                                <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                                                    {t('booking.step4.noSlots')}
                                                </p>
                                                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                                                    Please try selecting a different date
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {step === 5 && (
                    <div className="animate-fade-in">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('booking.step5.title')}</h2>
                            <p className="text-gray-600 dark:text-gray-400">Enter your contact information to complete the booking</p>
                        </div>
                        
                        <div className="max-w-4xl mx-auto">
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Client Details Form */}
                                <div className="lg:w-1/2">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                        <UserIcon className="w-5 h-5" />
                                        Your Information
                                    </h3>
                                    
                                    <div className="space-y-6">
                                        {/* Client Selection/Creation */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {t('booking.step5.fullName')}
                                            </label>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    value={clientDetails.name} 
                                                    onChange={e => {
                                                        setClientDetails(p => ({...p, name: e.target.value}));
                                                        // Clear other fields when typing a new name
                                                        if (e.target.value !== clientDetails.name) {
                                                            setClientDetails(p => ({...p, email: '', phone: ''}));
                                                        }
                                                    }}
                                                    placeholder="Enter your full name"
                                                    className={`w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${mapToAccentColor('focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20')} transition-colors`}
                                                    required
                                                />
                                                {clientDetails.name && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                                        {clients
                                                            .filter(c => c.name.toLowerCase().includes(clientDetails.name.toLowerCase()))
                                                            .slice(0, 5)
                                                            .map(c => (
                                                                <button 
                                                                    key={c.id} 
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setClientDetails({
                                                                            name: c.name,
                                                                            email: c.email,
                                                                            phone: c.phone || ''
                                                                        });
                                                                    }}
                                                                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 border-b last:border-b-0 dark:border-gray-600 flex items-center gap-3"
                                                                >
                                                                    <UserIcon className="w-8 h-8 p-1.5 bg-gray-200 dark:bg-gray-600 rounded-full flex-shrink-0" />
                                                                    <div>
                                                                        <div className="font-medium text-gray-900 dark:text-white">{c.name}</div>
                                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{c.email}</div>
                                                                    </div>
                                                                </button>
                                                            ))
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {t('booking.step5.email')}
                                            </label>
                                            <input 
                                                type="email" 
                                                id="clientEmail" 
                                                value={clientDetails.email} 
                                                onChange={e => setClientDetails(p => ({...p, email: e.target.value}))} 
                                                placeholder="your.email@example.com"
                                                className={`w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${mapToAccentColor('focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20')} transition-colors`}
                                                required 
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {t('booking.step5.phone')}
                                            </label>
                                            <div className="relative">
                                                <PhoneIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input 
                                                    type="tel" 
                                                    id="clientPhone" 
                                                    value={clientDetails.phone} 
                                                    onChange={e => setClientDetails(p => ({...p, phone: e.target.value}))} 
                                                    placeholder="+1 (555) 123-4567"
                                                    className={`w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${mapToAccentColor('focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20')} transition-colors`}
                                                    required 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Booking Summary */}
                                <div className="lg:w-1/2">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                        <CalendarIcon className="w-5 h-5" />
                                        {t('booking.step5.summary')}
                                    </h3>
                                    
                                    <div className={`bg-gradient-to-r ${mapToAccentColor('from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20')} p-6 rounded-xl space-y-4`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 ${mapToAccentColor('bg-accent-500')} rounded-full flex items-center justify-center`}>
                                                <span className="text-white text-lg">✂️</span>
                                            </div>
                                            <div>
                                                <p className={`font-semibold ${mapToAccentColor('text-accent-900 dark:text-accent-100')} text-lg`}>
                                                    {selectedService?.name}
                                                </p>
                                                <p className={`text-sm ${mapToAccentColor('text-accent-700 dark:text-accent-300')}`}>
                                                    {selectedService?.duration} {t('common.minutes')} • {selectedService?.price.toLocaleString(t('language.code'), { style: 'currency', currency: 'USD' })}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <UserIcon className={`w-12 h-12 p-2 ${mapToAccentColor('bg-accent-500')} text-white rounded-full`}/>
                                            <div>
                                                <p className={`font-semibold ${mapToAccentColor('text-accent-900 dark:text-accent-100')}`}>
                                                    {selectedHairstylist?.name}
                                                </p>
                                                <p className={`text-sm ${mapToAccentColor('text-accent-700 dark:text-accent-300')} capitalize`}>
                                                    {selectedHairstylist?.type}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <CalendarIcon className={`w-12 h-12 p-2 ${mapToAccentColor('bg-accent-500')} text-white rounded-full`}/>
                                            <div>
                                                <p className={`font-semibold ${mapToAccentColor('text-accent-900 dark:text-accent-100')}`}>
                                                    {selectedDate.toLocaleDateString(t('language.code'), { 
                                                        weekday: 'long',
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric' 
                                                    })}
                                                </p>
                                                <p className={`text-sm ${mapToAccentColor('text-accent-700 dark:text-accent-300')}`}>
                                                    {selectedTime && new Date('1970-01-01T' + selectedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={handleSubmit} 
                                        disabled={!clientDetails.name || !clientDetails.email || !clientDetails.phone} 
                                        className={`w-full mt-8 px-6 py-4 ${mapToAccentColor('bg-accent-600 hover:bg-accent-700')} text-white disabled:bg-gray-400 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-colors transform hover:scale-105 disabled:hover:scale-100`}
                                    >
                                        {t('booking.step5.confirm')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                </div>
            </div>
            <style>{`
              @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
              .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
}

export default BookingForm;