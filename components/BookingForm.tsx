import React, { useState, useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { mapToAccentColor } from '../utils/colorUtils';
import { 
  CheckCircleIcon, 
  ChevronLeftIcon, 
  UserIcon, 
  CalendarIcon, 
  ClockIcon,
  XMarkIcon,
  PhoneIcon
} from './common/Icons';
import type { Service, Hairstylist, Appointment } from '../types';
import { formatDateForInput, formatDateForStorage } from '../utils/dateUtils';

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

const BookingForm: React.FC = () => {
    const { salonName, services, hairstylists, appointments, addAppointment, findOrCreateClient } = useSettings();
    const [step, setStep] = useState(1);
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
        if (!selectedService || !selectedHairstylist || !selectedTime || !clientDetails.name || !clientDetails.email || !clientDetails.phone) return;
        
        const client = await findOrCreateClient(clientDetails.name, clientDetails.email, clientDetails.phone);

        await addAppointment({
            clientId: client.id,
            serviceId: selectedService.id,
            hairstylistId: selectedHairstylist.id,
            date: formatDateForStorage(selectedDate),
            time: selectedTime,
        });
        setIsConfirmed(true);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [year, month, day] = e.target.value.split('-').map(Number);
        const newDate = new Date(year, month - 1, day);
        setSelectedDate(newDate);
        setSelectedTime(null);
    };
    
    if (isConfirmed) {
        return (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8 text-center animate-fade-in">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                    <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Appointment Confirmed!</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">Your appointment at {salonName} has been successfully booked.</p>
                    
                    <div className={`bg-gradient-to-r ${mapToAccentColor('from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20')} p-6 rounded-lg text-left space-y-3 mb-6`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 ${mapToAccentColor('bg-accent-500')} rounded-full flex items-center justify-center`}>
                                <span className="text-white text-sm font-bold">✓</span>
                            </div>
                            <div>
                                <p className={`font-semibold ${mapToAccentColor('text-accent-900 dark:text-accent-100')}`}>{selectedService?.name}</p>
                                <p className={`text-sm ${mapToAccentColor('text-accent-700 dark:text-accent-300')}`}>{selectedService?.duration} minutes</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <UserIcon className={`w-8 h-8 p-1.5 ${mapToAccentColor('bg-accent-500')} text-white rounded-full`}/>
                            <div>
                                <p className={`font-semibold ${mapToAccentColor('text-accent-900 dark:text-accent-100')}`}>{selectedHairstylist?.name}</p>
                                <p className={`text-sm ${mapToAccentColor('text-accent-700 dark:text-accent-300')}`}>With</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <CalendarIcon className={`w-8 h-8 p-1.5 ${mapToAccentColor('bg-accent-500')} text-white rounded-full`}/>
                            <div>
                                <p className={`font-semibold ${mapToAccentColor('text-accent-900 dark:text-accent-100')}`}>
                                    {new Date(formatDateForStorage(selectedDate) + 'T' + selectedTime).toLocaleDateString('en-US', { 
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
                        onClick={() => window.location.reload()} 
                        className={`w-full px-6 py-3 ${mapToAccentColor('bg-accent-600 hover:bg-accent-700')} rounded-lg font-semibold text-white transition-colors`}
                    >
                        Done
                    </button>
                </div>
            </div>
        );
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
                                <h1 className="text-xl font-bold">Book an Appointment at {salonName}</h1>
                            </div>
                            <div className="flex items-center gap-2 text-white/90">
                                <span className="text-sm">Step {step} of 4</span>
                                <div className="flex gap-1 ml-2">
                                    {[1, 2, 3, 4].map(stepNum => (
                                        <div 
                                            key={stepNum} 
                                            className={`w-2 h-2 rounded-full ${stepNum <= step ? 'bg-white' : 'bg-white/30'}`} 
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select a Service</h2>
                                <p className="text-gray-600 dark:text-gray-400">Choose the service you'd like to book</p>
                            </div>
                            
                            <div className="grid gap-4">
                                {services.map(service => (
                                    <button
                                        key={service.id}
                                        onClick={() => {
                                            setSelectedService(service);
                                            handleNextStep();
                                        }}
                                        className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                                            selectedService?.id === service.id 
                                                ? mapToAccentColor('border-accent-500 bg-accent-50 dark:bg-accent-900/20')
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{service.name}</h3>
                                                {service.description && (
                                                    <p className="text-gray-600 dark:text-gray-400 mt-1">{service.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 mt-3">
                                                    <div className="flex items-center gap-1">
                                                        <ClockIcon className="w-4 h-4 text-gray-500" />
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">{service.duration} min</span>
                                                    </div>
                                                    <div className={`font-bold text-lg ${mapToAccentColor('text-accent-600')}`}>
                                                        ${service.price}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choose Your Stylist</h2>
                                <p className="text-gray-600 dark:text-gray-400">Select who you'd like to provide your service</p>
                            </div>
                            
                            <div className="grid gap-4">
                                {hairstylists.map(hairstylist => (
                                    <button
                                        key={hairstylist.id}
                                        onClick={() => {
                                            setSelectedHairstylist(hairstylist);
                                            handleNextStep();
                                        }}
                                        className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                                            selectedHairstylist?.id === hairstylist.id 
                                                ? mapToAccentColor('border-accent-500 bg-accent-50 dark:bg-accent-900/20')
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                                                {hairstylist.photoUrl ? (
                                                    <img src={hairstylist.photoUrl} alt={hairstylist.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon className="w-8 h-8 text-gray-500" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{hairstylist.name}</h3>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`text-sm font-medium ${mapToAccentColor('text-accent-600')}`}>
                                                        {hairstylist.type === 'expert' ? 'Expert Stylist' : 
                                                         hairstylist.type === 'station' ? 'Station Stylist' : 
                                                         'Stylist'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pick Date & Time</h2>
                                <p className="text-gray-600 dark:text-gray-400">Choose when you'd like your appointment</p>
                            </div>
                            
                            <div className="grid lg:grid-cols-2 gap-8">
                                <div>
                                    <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Select Date
                                    </label>
                                    <input 
                                        type="date" 
                                        id="appointmentDate" 
                                        value={formatDateForInput(selectedDate)} 
                                        min={formatDateForInput(new Date())} 
                                        onChange={handleDateChange} 
                                        className={`w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${mapToAccentColor('focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20')} transition-colors dark:[color-scheme:dark]`}
                                    />
                                    
                                    <div className={`mt-4 p-4 ${mapToAccentColor('bg-accent-50 dark:bg-accent-900/20')} rounded-lg`}>
                                        <p className={`text-sm ${mapToAccentColor('text-accent-700 dark:text-accent-300')} font-medium`}>
                                            Selected Date
                                        </p>
                                        <p className={`text-lg font-semibold ${mapToAccentColor('text-accent-900 dark:text-accent-100')}`}>
                                            {selectedDate.toLocaleDateString('en-US', { 
                                                weekday: 'long',
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Available Times
                                    </label>
                                    <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                                        {availableSlots.map(slot => (
                                            <button
                                                key={slot.time}
                                                onClick={() => {
                                                    setSelectedTime(slot.time);
                                                    handleNextStep();
                                                }}
                                                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                                                    selectedTime === slot.time 
                                                        ? mapToAccentColor('border-accent-500 bg-accent-500 text-white')
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-white'
                                                }`}
                                            >
                                                {new Date('1970-01-01T' + slot.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {availableSlots.length === 0 && (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500 dark:text-gray-400">No available times for this date</p>
                                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Please select a different date</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Details</h2>
                                <p className="text-gray-600 dark:text-gray-400">Tell us about yourself to complete the booking</p>
                            </div>
                            
                            <div className="grid lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Full Name *
                                        </label>
                                        <input 
                                            type="text" 
                                            id="clientName" 
                                            value={clientDetails.name} 
                                            onChange={e => setClientDetails(p => ({...p, name: e.target.value}))} 
                                            placeholder="Enter your full name"
                                            className={`w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${mapToAccentColor('focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20')} transition-colors`}
                                            required 
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email *
                                        </label>
                                        <input 
                                            type="email" 
                                            id="clientEmail" 
                                            value={clientDetails.email} 
                                            onChange={e => setClientDetails(p => ({...p, email: e.target.value}))} 
                                            placeholder="Enter your email address"
                                            className={`w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${mapToAccentColor('focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20')} transition-colors`}
                                            required 
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Phone Number *
                                        </label>
                                        <input 
                                            type="tel" 
                                            id="clientPhone" 
                                            value={clientDetails.phone} 
                                            onChange={e => setClientDetails(p => ({...p, phone: e.target.value}))} 
                                            placeholder="Enter your phone number"
                                            className={`w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${mapToAccentColor('focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20')} transition-colors`}
                                            required 
                                        />
                                    </div>
                                </div>
                                
                                <div className={`p-6 ${mapToAccentColor('bg-accent-50 dark:bg-accent-900/20')} rounded-xl`}>
                                    <h3 className={`text-lg font-semibold ${mapToAccentColor('text-accent-900 dark:text-accent-100')} mb-4`}>
                                        Appointment Summary
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 ${mapToAccentColor('bg-accent-500')} rounded-full flex items-center justify-center`}>
                                                <span className="text-white text-sm font-bold">✓</span>
                                            </div>
                                            <div>
                                                <p className={`font-semibold ${mapToAccentColor('text-accent-900 dark:text-accent-100')}`}>{selectedService?.name}</p>
                                                <p className={`text-sm ${mapToAccentColor('text-accent-700 dark:text-accent-300')}`}>{selectedService?.duration} minutes • ${selectedService?.price}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <UserIcon className={`w-8 h-8 p-1.5 ${mapToAccentColor('bg-accent-500')} text-white rounded-full`}/>
                                            <div>
                                                <p className={`font-semibold ${mapToAccentColor('text-accent-900 dark:text-accent-100')}`}>{selectedHairstylist?.name}</p>
                                                <p className={`text-sm ${mapToAccentColor('text-accent-700 dark:text-accent-300')}`}>Stylist</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <CalendarIcon className={`w-8 h-8 p-1.5 ${mapToAccentColor('bg-accent-500')} text-white rounded-full`}/>
                                            <div>
                                                <p className={`font-semibold ${mapToAccentColor('text-accent-900 dark:text-accent-100')}`}>
                                                    {selectedDate.toLocaleDateString('en-US', { 
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
                                        className={`w-full mt-6 px-6 py-3 ${mapToAccentColor('bg-accent-600 hover:bg-accent-700')} disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-colors`}
                                    >
                                        Confirm Booking
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                <style>{`
                  @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                  .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                `}</style>
            </div>
        </div>
    );
};

export default BookingForm;