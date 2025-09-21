import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import Stepper from './Stepper';
import Confetti from './Confetti';
import { 
  LogoIcon, 
  PlusIcon, 
  CloseIcon, 
  CheckIcon, 
  CalendarIcon,
  UserIcon,
  ClipboardListIcon,
  EditIcon,
  TrashIcon,
  UploadIcon
} from './common/Icons';
import type { Service, Hairstylist, HairstylistAvailability } from '../types';
import { mapToAccentColor } from '../utils/colorUtils';

interface OnboardingFlowProps {
  onComplete: () => void;
}

interface OnboardingData {
  salonName: string;
  salonLogo: string | null;
  designStyle: 'modern' | 'classic' | 'minimalist' | 'vibrant';
  // Workspace Customization
  theme: 'light' | 'dark';
  accentColor: 'purple' | 'blue' | 'green' | 'pink' | 'orange' | 'red' | 'teal' | 'indigo' | 'yellow' | 'amber' | 'lime' | 'cyan' | 'sky' | 'violet' | 'fuchsia' | 'rose' | 'custom';
  customAccentColor?: string;
  typography: 'sans' | 'serif';
  language: 'de' | 'en' | 'fr' | 'it';
  currency: 'CHF' | 'EUR' | 'USD';
  layout: 'standard' | 'compact';
  // Services & Team
  selectedServices: string[];
  customServices: Array<{ name: string; duration: number; price: number }>;
  teamMembers: Array<{ name: string; type: 'expert' | 'station'; email?: string; phone?: string }>;
}

const ACCENT_COLORS = [
  { name: 'purple', label: 'Purple', className: 'bg-[#8b5cf6]' },
  { name: 'blue', label: 'Blue', className: 'bg-[#3b82f6]' },
  { name: 'green', label: 'Green', className: 'bg-[#22c55e]' },
  { name: 'pink', label: 'Pink', className: 'bg-[#ec4899]' },
  { name: 'orange', label: 'Orange', className: 'bg-[#f97316]' },
  { name: 'red', label: 'Red', className: 'bg-[#ef4444]' },
  { name: 'teal', label: 'Teal', className: 'bg-[#14b8a6]' },
  { name: 'indigo', label: 'Indigo', className: 'bg-[#6366f1]' },
  { name: 'yellow', label: 'Yellow', className: 'bg-[#eab308]' },
  { name: 'amber', label: 'Amber', className: 'bg-[#f59e0b]' },
  { name: 'lime', label: 'Lime', className: 'bg-[#84cc16]' },
  { name: 'cyan', label: 'Cyan', className: 'bg-[#06b6d4]' },
  { name: 'sky', label: 'Sky', className: 'bg-[#0ea5e9]' },
  { name: 'violet', label: 'Violet', className: 'bg-[#8b5cf6]' },
  { name: 'fuchsia', label: 'Fuchsia', className: 'bg-[#d946ef]' },
  { name: 'rose', label: 'Rose', className: 'bg-[#f43f5e]' }
];

const LANGUAGES = [
  { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { id: 'en', label: 'English', flag: '🇺🇸' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'it', label: 'Italiano', flag: '🇮🇹' }
];

const CURRENCIES = [
  { id: 'CHF', label: 'CHF (Swiss Franc)', symbol: 'CHF' },
  { id: 'EUR', label: 'EUR (Euro)', symbol: '€' },
  { id: 'USD', label: 'USD (US Dollar)', symbol: '$' }
];

const DESIGN_STYLES = [
  { id: 'modern', name: 'Modern', description: 'Clean and contemporary', color: 'bg-blue-500' },
  { id: 'classic', name: 'Classic', description: 'Timeless elegance', color: 'bg-gray-600' },
  { id: 'minimalist', name: 'Minimalist', description: 'Simple and refined', color: 'bg-green-500' },
  { id: 'vibrant', name: 'Vibrant', description: 'Bold and colorful', color: 'bg-orange-500' }
];

const COMMON_SERVICES = [
  { name: 'Haircut & Styling', duration: 60, price: 50 },
  { name: 'Hair Coloring', duration: 120, price: 80 },
  { name: 'Highlights', duration: 90, price: 70 },
  { name: 'Blowout', duration: 30, price: 35 },
  { name: 'Hair Treatment', duration: 45, price: 40 },
  { name: 'Beard Trim', duration: 20, price: 25 },
  { name: 'Eyebrow Shaping', duration: 15, price: 20 },
  { name: 'Hair Wash', duration: 15, price: 15 }
];

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { 
    t, setSalonName, setSalonLogo, setAccentColor, setCustomAccentColor, setTheme, setTypography, setLanguage, setCurrency, setLayout, 
    currency: currentCurrency, theme: currentTheme, accentColor: currentAccentColor, customAccentColor: currentCustomAccentColor,
    completeOnboarding, updateSettings, addService, addHairstylist 
  } = useSettings();
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    salonName: '',
    salonLogo: null,
    designStyle: 'modern',
    // Workspace defaults
    theme: currentTheme || 'light',
    accentColor: currentAccentColor || 'blue',
    customAccentColor: currentCustomAccentColor || undefined,
    typography: 'sans',
    language: 'en',
    currency: currentCurrency || 'USD',
    layout: 'standard',
    // Services & Team
    selectedServices: [],
    customServices: [],
    teamMembers: []
  });

  const steps = [
    'Salon Setup',
    'Workspace Style',
    'Services Selection', 
    'Team Members',
    'Review & Complete'
  ];

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    
    try {
      // Apply all settings
      setSalonName(data.salonName);
      if (data.salonLogo) {
        setSalonLogo(data.salonLogo);
      }
      
      // Apply workspace customization
      setTheme(data.theme);
      setAccentColor(data.accentColor);
      if (data.accentColor === 'custom' && data.customAccentColor) {
        setCustomAccentColor(data.customAccentColor);
      }
      setTypography(data.typography);
      setLanguage(data.language as any);
      setCurrency(data.currency as any);
      setLayout(data.layout);
      
      // Update additional settings
      await updateSettings({
        theme: data.theme,
        accentColor: data.accentColor,
        customAccentColor: data.customAccentColor,
        typography: data.typography,
        language: data.language as any,
        currency: data.currency as any,
        layout: data.layout
      });

      // Prepare services data
      const newServices = [];
      [...data.selectedServices, ...data.customServices].forEach(service => {
        if (typeof service === 'string') {
          const commonService = COMMON_SERVICES.find(s => s.name === service);
          if (commonService) {
            newServices.push({
              id: `service_${Date.now()}_${Math.random()}`,
              name: commonService.name,
              duration: commonService.duration,
              price: commonService.price,
              parentId: null
            });
          }
        } else {
          newServices.push({
            id: `service_${Date.now()}_${Math.random()}`,
            name: service.name,
            duration: service.duration,
            price: service.price,
            parentId: null
          });
        }
      });

      // Prepare team members data
      const newHairstylists = data.teamMembers.map(member => ({
        id: `hs_${Date.now()}_${Math.random()}`,
        name: member.name,
        type: member.type,
        email: member.email,
        phone: member.phone,
        serviceIds: [],
        skills: [],
        availability: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isAvailable: false },
          { dayOfWeek: 0, startTime: '10:00', endTime: '16:00', isAvailable: false },
        ],
        commissions: [],
        performance: [],
        isActive: true
      }));

      // Add services to database
      for (const service of newServices) {
        await addService({
          name: service.name,
          duration: service.duration,
          price: service.price,
          parentId: service.parentId
        });
      }

      // Add hairstylists to database
      for (const hairstylist of newHairstylists) {
        await addHairstylist({
          name: hairstylist.name,
          type: hairstylist.type,
          email: hairstylist.email,
          phone: hairstylist.phone,
          serviceIds: hairstylist.serviceIds,
          skills: hairstylist.skills,
          availability: hairstylist.availability,
          commissions: hairstylist.commissions,
          performance: hairstylist.performance,
          isActive: hairstylist.isActive,
          timeOff: []
        });
      }

      // Mark onboarding as complete
      await updateSettings({ hasCompletedOnboarding: true });
      
      // Show confetti and complete
      setShowConfetti(true);
      setTimeout(() => {
        onComplete();
      }, 3000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setIsCompleting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome! Let's set up your salon
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Tell us about your salon and choose your style
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Salon Name *
          </label>
          <input
            type="text"
            value={data.salonName}
            onChange={(e) => updateData({ salonName: e.target.value })}
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="Enter your salon name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Salon Logo (Optional)
          </label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
              {data.salonLogo ? (
                <img src={data.salonLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <UploadIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <input
              type="url"
              value={data.salonLogo || ''}
              onChange={(e) => updateData({ salonLogo: e.target.value || null })}
              className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Design Style
          </label>
          <div className="grid grid-cols-2 gap-3">
            {DESIGN_STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => updateData({ designStyle: style.id as 'modern' | 'classic' | 'minimalist' | 'vibrant' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  data.designStyle === style.id
                    ? mapToAccentColor('border-accent-500 bg-accent-50 dark:bg-accent-900/20')
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className={`w-8 h-8 ${style.color} rounded-full mx-auto mb-2`} />
                <h3 className="font-semibold text-gray-900 dark:text-white">{style.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{style.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Customize Your Workspace
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose your preferred theme, colors, and language settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Theme
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => updateData({ theme: 'light' })}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                data.theme === 'light'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-white border border-gray-200 rounded mx-auto mb-2" />
              <div className="font-medium text-gray-900 dark:text-white">Light</div>
            </button>
            <button
              onClick={() => updateData({ theme: 'dark' })}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                data.theme === 'dark'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded mx-auto mb-2" />
              <div className="font-medium text-gray-900 dark:text-white">Dark</div>
            </button>
          </div>
        </div>

        {/* Typography Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Typography
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => updateData({ typography: 'sans' })}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                data.typography === 'sans'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="font-sans font-medium text-gray-900 dark:text-white">Sans-Serif</div>
              <div className="font-sans text-sm text-gray-600 dark:text-gray-400">Modern & Clean</div>
            </button>
            <button
              onClick={() => updateData({ typography: 'serif' })}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                data.typography === 'serif'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="font-serif font-medium text-gray-900 dark:text-white">Serif</div>
              <div className="font-serif text-sm text-gray-600 dark:text-gray-400">Classic & Elegant</div>
            </button>
          </div>
        </div>
      </div>

      {/* Accent Color Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Accent Color
        </label>
        <div className="flex flex-wrap gap-3 mb-3">
          {ACCENT_COLORS.map(color => (
            <button
              key={color.name}
              onClick={() => updateData({ accentColor: color.name as any })}
              className={`w-10 h-10 rounded-full ${color.className} ${
                data.accentColor === color.name
                  ? 'ring-2 ring-offset-2 ring-white dark:ring-offset-gray-800 ring-current scale-110'
                  : 'hover:scale-105'
              } transition-all`}
              title={color.label}
            />
          ))}
          <button
            onClick={() => {
              updateData({ accentColor: 'custom' });
              setShowCustomColorPicker(true);
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-dashed ${
              data.accentColor === 'custom'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            } transition-all`}
            style={data.accentColor === 'custom' && data.customAccentColor ? { backgroundColor: data.customAccentColor, borderStyle: 'solid' } : {}}
            title="Custom Color"
          >
            {data.accentColor !== 'custom' && (
              <PlusIcon className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
        
        {/* Custom Color Picker */}
        {showCustomColorPicker && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: data.customAccentColor || '#3b82f6' }} />
              <input
                type="color"
                value={data.customAccentColor || '#3b82f6'}
                onChange={(e) => updateData({ customAccentColor: e.target.value })}
                className="w-16 h-8 cursor-pointer rounded border-none"
              />
              <input
                type="text"
                value={data.customAccentColor || '#3b82f6'}
                onChange={(e) => updateData({ customAccentColor: e.target.value })}
                placeholder="#3b82f6"
                className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCustomColorPicker(false)}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Language & Currency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Language
          </label>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.id}
                onClick={() => updateData({ language: lang.id as any })}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  data.language === lang.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{lang.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Currency
          </label>
          <div className="space-y-2">
            {CURRENCIES.map(curr => (
              <button
                key={curr.id}
                onClick={() => updateData({ currency: curr.id as any })}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  data.currency === curr.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">{curr.label}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{curr.symbol}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Layout Style (Optional) */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Layout Style
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => updateData({ layout: 'standard' })}
            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
              data.layout === 'standard'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-white">Standard</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Comfortable spacing</div>
          </button>
          <button
            onClick={() => updateData({ layout: 'compact' })}
            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
              data.layout === 'compact'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-white">Compact</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Dense information</div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          What services do you offer?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select from common services or add your own
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Common Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {COMMON_SERVICES.map(service => (
              <button
                key={service.name}
                onClick={() => {
                  const isSelected = data.selectedServices.includes(service.name);
                  updateData({
                    selectedServices: isSelected
                      ? data.selectedServices.filter(s => s !== service.name)
                      : [...data.selectedServices, service.name]
                  });
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  data.selectedServices.includes(service.name)
                    ? mapToAccentColor('border-accent-500 bg-accent-50 dark:bg-accent-900/20')
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{service.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {service.duration} min • {service.price.toLocaleString('en-US', { style: 'currency', currency: data.currency })}
                    </p>
                  </div>
                  {data.selectedServices.includes(service.name) && (
                    <CheckIcon className={`w-5 h-5 ${mapToAccentColor('text-accent-500')}`} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Custom Services</h3>
            <button
              onClick={() => {
                updateData({
                  customServices: [...data.customServices, { name: '', duration: 30, price: 0 }]
                });
              }}
              className={`flex items-center gap-2 px-3 py-1 ${mapToAccentColor('bg-accent-500')} text-white rounded-lg text-sm hover:opacity-90`}
            >
              <PlusIcon className="w-4 h-4" />
              Add Service
            </button>
          </div>
          
          {data.customServices.map((service, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2">
              <input
                type="text"
                value={service.name}
                onChange={(e) => {
                  const updated = [...data.customServices];
                  updated[index].name = e.target.value;
                  updateData({ customServices: updated });
                }}
                placeholder="Service name"
                className="flex-1 p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
              />
              <input
                type="number"
                value={service.duration}
                onChange={(e) => {
                  const updated = [...data.customServices];
                  updated[index].duration = parseInt(e.target.value) || 0;
                  updateData({ customServices: updated });
                }}
                placeholder="Duration"
                className="w-20 p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
              />
              <span className="text-sm text-gray-500">min</span>
              <input
                type="number"
                value={service.price}
                onChange={(e) => {
                  const updated = [...data.customServices];
                  updated[index].price = parseFloat(e.target.value) || 0;
                  updateData({ customServices: updated });
                }}
                placeholder="Price"
                className="w-20 p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
              />
              <span className="text-sm text-gray-500">{data.currency}</span>
              <button
                onClick={() => {
                  updateData({
                    customServices: data.customServices.filter((_, i) => i !== index)
                  });
                }}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Add your team members
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Add hairstylists and staff who will be using the system
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Team Members</h3>
          <button
            onClick={() => {
              updateData({
                teamMembers: [...data.teamMembers, { name: '', type: 'expert' }]
              });
            }}
            className={`flex items-center gap-2 px-3 py-1 ${mapToAccentColor('bg-accent-500')} text-white rounded-lg text-sm hover:opacity-90`}
          >
            <PlusIcon className="w-4 h-4" />
            Add Member
          </button>
        </div>

        {data.teamMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <UserIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No team members added yet</p>
            <p className="text-sm">Click "Add Member" to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.teamMembers.map((member, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => {
                      const updated = [...data.teamMembers];
                      updated[index].name = e.target.value;
                      updateData({ teamMembers: updated });
                    }}
                    placeholder="Full name"
                    className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                  />
                  <select
                    value={member.type}
                    onChange={(e) => {
                      const updated = [...data.teamMembers];
                      updated[index].type = e.target.value as 'expert' | 'station';
                      updateData({ teamMembers: updated });
                    }}
                    className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                  >
                    <option value="expert">Expert Hairstylist</option>
                    <option value="station">Station Hairstylist</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="email"
                    value={member.email || ''}
                    onChange={(e) => {
                      const updated = [...data.teamMembers];
                      updated[index].email = e.target.value;
                      updateData({ teamMembers: updated });
                    }}
                    placeholder="Email (optional)"
                    className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="tel"
                      value={member.phone || ''}
                      onChange={(e) => {
                        const updated = [...data.teamMembers];
                        updated[index].phone = e.target.value;
                        updateData({ teamMembers: updated });
                      }}
                      placeholder="Phone (optional)"
                      className="flex-1 p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                    />
                    <button
                      onClick={() => {
                        updateData({
                          teamMembers: data.teamMembers.filter((_, i) => i !== index)
                        });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Review your setup
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Everything looks good? Let's get started!
        </p>
      </div>

      <div className="space-y-6">
        {/* Salon Info */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <LogoIcon className="w-5 h-5" />
            Salon Information
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {data.salonLogo && (
                <img src={data.salonLogo} alt="Logo" className="w-8 h-8 rounded object-cover" />
              )}
              <span className="font-medium">{data.salonName}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Style: {DESIGN_STYLES.find(s => s.id === data.designStyle)?.name}
            </p>
          </div>
        </div>

        {/* Workspace Customization */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Workspace Style
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Theme:</span>
              <span className="ml-2 capitalize">{data.theme}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Typography:</span>
              <span className="ml-2 capitalize">{data.typography}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Language:</span>
              <span className="ml-2">{LANGUAGES.find(l => l.id === data.language)?.label}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Currency:</span>
              <span className="ml-2">{data.currency}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Layout:</span>
              <span className="ml-2 capitalize">{data.layout}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">Accent:</span>
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ 
                  backgroundColor: data.accentColor === 'custom' 
                    ? data.customAccentColor 
                    : ACCENT_COLORS.find(c => c.name === data.accentColor)?.className.replace('bg-[', '').replace(']', '') 
                }}
              />
              <span className="capitalize">{data.accentColor}</span>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <ClipboardListIcon className="w-5 h-5" />
            Services ({data.selectedServices.length + data.customServices.length})
          </h3>
          <div className="space-y-1">
            {data.selectedServices.map(serviceName => (
              <div key={serviceName} className="text-sm text-gray-600 dark:text-gray-400">
                • {serviceName}
              </div>
            ))}
            {data.customServices.map((service, index) => (
              <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                • {service.name} ({service.duration} min, {service.price.toLocaleString('en-US', { style: 'currency', currency: data.currency })})
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Team Members ({data.teamMembers.length})
          </h3>
          <div className="space-y-1">
            {data.teamMembers.map((member, index) => (
              <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                • {member.name} ({member.type === 'expert' ? 'Expert' : 'Station'} Hairstylist)
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 ${mapToAccentColor('bg-accent-500 hover:bg-accent-600')} text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isCompleting ? 'animate-pulse' : ''}`}
          >
            <CheckIcon className="w-5 h-5" />
            {isCompleting ? 'Setting up your salon...' : 'Complete Setup'}
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.salonName.trim().length > 0;
      case 2:
        return true; // Workspace customization is optional
      case 3:
        return data.selectedServices.length > 0 || data.customServices.length > 0;
      case 4:
        return true; // Team members are optional
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      {showConfetti && <Confetti />}
      
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <LogoIcon className={`w-12 h-12 ${mapToAccentColor('text-accent-500')}`} />
          </div>
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        {/* Content */}
        <div className="mb-8 min-h-[500px]">
          <div className="animate-fade-in">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </div>
        </div>

        {/* Navigation */}
        {currentStep < 5 && (
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-6 py-2 ${mapToAccentColor('bg-accent-500')} text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90`}
            >
              Next
            </button>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OnboardingFlow;