import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import Stepper from './Stepper';
import Confetti from './Confetti';
import { LogoIcon } from './common/Icons';
import type { Service, HairstylistAvailability } from '../types';
import { mapToAccentColor } from '../utils/colorUtils';
import { useToast } from './common/ToastContext';
import { persistOnboardingData } from '../services/onboardingService';
import { logger } from '../utils/logger';
import SalonInfoStep from './onboarding/SalonInfoStep';
import ServicesStep from './onboarding/ServicesStep';
import TeamStep from './onboarding/TeamStep';
import ReviewStep from './onboarding/ReviewStep';
import type {
  OnboardingData,
  AccentOption,
  LanguageOption,
  CurrencyOption,
} from './onboarding/types';

interface OnboardingFlowProps {
  onComplete: () => void;
  initialSalonName?: string;
}

const ACCENT_COLORS: AccentOption[] = [
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
  { name: 'rose', label: 'Rose', className: 'bg-[#f43f5e]' },
];

const LANGUAGES: LanguageOption[] = [
  { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { id: 'en', label: 'English', flag: '🇺🇸' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'it', label: 'Italiano', flag: '🇮🇹' },
];

const CURRENCIES: CurrencyOption[] = [
  { id: 'CHF', label: 'CHF (Swiss Franc)', symbol: 'CHF' },
  { id: 'EUR', label: 'EUR (Euro)', symbol: '€' },
  { id: 'USD', label: 'USD (US Dollar)', symbol: '$' },
];

const COMMON_SERVICES: Array<{ name: string; duration: number; price: number }> = [
  { name: 'Haircut & Styling', duration: 60, price: 50 },
  { name: 'Hair Coloring', duration: 120, price: 80 },
  { name: 'Highlights', duration: 90, price: 70 },
  { name: 'Blowout', duration: 30, price: 35 },
  { name: 'Hair Treatment', duration: 45, price: 40 },
  { name: 'Beard Trim', duration: 20, price: 25 },
  { name: 'Eyebrow Shaping', duration: 15, price: 20 },
  { name: 'Hair Wash', duration: 15, price: 15 },
];

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, initialSalonName = '' }) => {
  const {
    t,
    setSalonName,
    updateSettings,
    updatePreferences,
    salonName: contextSalonName,
    user,
  } = useSettings();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const salonNameSetRef = useRef(false);

  // Debounce settings updates to prevent rapid changes
  const settingsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSettingsUpdate = (updateFn: () => void) => {
    if (settingsTimeoutRef.current) {
      clearTimeout(settingsTimeoutRef.current);
    }
    settingsTimeoutRef.current = setTimeout(updateFn, 300); // 300ms delay
  };
  const [data, setData] = useState<OnboardingData>(() => ({
    salonName: initialSalonName,
    salonLogo: null,
    // Workspace defaults - Set to Light theme, Sans-Serif, Deutsch, CHF
    theme: 'light',
    accentColor: 'blue', // Use fixed default instead of currentAccentColor
    customAccentColor: undefined, // Use fixed default instead of currentCustomAccentColor
    typography: 'sans',
    language: 'de',
    currency: 'CHF',
    layout: 'standard',
    // Services & Team
    selectedServices: [],
    customServices: [],
    teamMembers: [],
  }));

  // Update salon name when initialSalonName changes or from context/user metadata
  useEffect(() => {
    // Only run this once to prevent infinite loops
    if (salonNameSetRef.current) return;

    let salonNameToUse = initialSalonName;

    // Try to get salon name from context first
    if (!salonNameToUse && contextSalonName && contextSalonName !== 'My Salon') {
      salonNameToUse = contextSalonName;
    }

    // Try to get salon name from user metadata as fallback
    if (!salonNameToUse && user?.user_metadata?.salon_name) {
      salonNameToUse = user.user_metadata.salon_name;
    }

    if (salonNameToUse && salonNameToUse !== data.salonName) {
      setData(prev => ({ ...prev, salonName: salonNameToUse }));
      salonNameSetRef.current = true;
    }
  }, [initialSalonName, contextSalonName, user]);

  // Show confetti when reaching final step
  useEffect(() => {
    if (currentStep === 4) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Cleanup debounced settings timeout on unmount
  useEffect(() => {
    return () => {
      if (settingsTimeoutRef.current) {
        clearTimeout(settingsTimeoutRef.current);
      }
    };
  }, []);

  const steps = [
    t('onboarding.steps.salonInfo'),
    t('onboarding.steps.servicesSelection'),
    t('onboarding.steps.teamMembers'),
    t('onboarding.steps.reviewComplete'),
  ];

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleThemeChange = useCallback(
    (theme: 'light' | 'dark') => {
      updateData({ theme });
      debouncedSettingsUpdate(() => updatePreferences({ theme }));
    },
    [updateData, updatePreferences]
  );

  const handleAccentChange = useCallback(
    (accent: OnboardingData['accentColor']) => {
      updateData({ accentColor: accent });
      if (accent !== 'custom') {
        setShowCustomColorPicker(false);
      }
      if (accent === 'custom') {
        debouncedSettingsUpdate(() => updatePreferences({ accentColor: 'custom' }));
      } else {
        debouncedSettingsUpdate(() => updatePreferences({ accentColor: accent }));
      }
    },
    [updateData, updatePreferences]
  );

  const handleTypographyChange = useCallback(
    (typography: OnboardingData['typography']) => {
      updateData({ typography });
    },
    [updateData]
  );

  const handleCustomAccentChange = useCallback(
    (color: string) => {
      updateData({ customAccentColor: color, accentColor: 'custom' });
      if (!showCustomColorPicker) {
        setShowCustomColorPicker(true);
      }
      debouncedSettingsUpdate(() =>
        updatePreferences({ accentColor: 'custom', customAccentColor: color })
      );
    },
    [updateData, updatePreferences, showCustomColorPicker]
  );

  const handleLanguageChange = useCallback(
    (language: OnboardingData['language']) => {
      updateData({ language });
      debouncedSettingsUpdate(() => updatePreferences({ language }));
    },
    [updateData, updatePreferences]
  );

  const handleCurrencyChange = useCallback(
    (currency: OnboardingData['currency']) => {
      updateData({ currency });
      debouncedSettingsUpdate(() => updatePreferences({ currency }));
    },
    [updateData, updatePreferences]
  );

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
      const customAccentColorValue =
        data.accentColor === 'custom' ? data.customAccentColor || '#3b82f6' : null;

      const trimmedSalonName = data.salonName?.trim();
      if (trimmedSalonName) {
        await setSalonName(trimmedSalonName);
      }

      const newServices =
        [...data.selectedServices, ...data.customServices].reduce <
        Array<
          Pick<
            Service,
            'name' | 'description' | 'duration' | 'price' | 'parentId' | 'serviceGroupId'
          >
        >((acc, service) => {
          if (typeof service === 'string') {
            const commonService = COMMON_SERVICES.find(s => s.name === service);
            if (commonService) {
              acc.push({
                name: commonService.name,
                duration: commonService.duration,
                price: commonService.price,
                description: undefined,
                parentId: null,
                serviceGroupId: undefined,
              });
            }
          } else if (service.name.trim()) {
            acc.push({
              name: service.name,
              duration: service.duration,
              price: service.price,
              description: undefined,
              parentId: null,
              serviceGroupId: undefined,
            });
          }
          return acc;
        }, []);

      const newHairstylists = data.teamMembers
        .filter(member => member.name.trim())
        .map(member => ({
          name: member.name,
          type: member.type,
          email: member.email,
          phone: member.phone,
          photoUrl: null,
          hireDate: null,
          isActive: true,
          availability: [
            { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isAvailable: false },
            { dayOfWeek: 0, startTime: '10:00', endTime: '16:00', isAvailable: false },
          ] as HairstylistAvailability[],
        }));

      if (!user) {
        throw new Error('User is not authenticated');
      }

      await persistOnboardingData({
        userId: user.id,
        services: newServices,
        hairstylists: newHairstylists,
      });

      // Persist final settings and mark onboarding as complete
      await updateSettings({
        theme: data.theme,
        accentColor: data.accentColor,
        customAccentColor: customAccentColorValue,
        typography: data.typography,
        language: data.language as any,
        currency: data.currency as any,
        layout: data.layout,
        salonLogo: data.salonLogo || null,
        hasCompletedOnboarding: true,
      });

      showToast({ type: 'success', message: 'Onboarding complete! Your workspace is ready.' });
      onComplete();
    } catch (error) {
      logger.error('Error completing onboarding:', error);
      showToast({ type: 'error', message: 'We could not finish onboarding. Please try again.' });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSkip = async () => {
    setIsSkipping(true);

    try {
      const customAccentColorValue =
        data.accentColor === 'custom' ? data.customAccentColor || '#3b82f6' : null;

      const trimmedSalonName = data.salonName?.trim();
      if (trimmedSalonName) {
        await setSalonName(trimmedSalonName);
      }

      await updateSettings({
        theme: data.theme,
        accentColor: data.accentColor,
        customAccentColor: customAccentColorValue,
        typography: data.typography,
        language: data.language as any,
        currency: data.currency as any,
        layout: data.layout,
        salonLogo: data.salonLogo || null,
        hasCompletedOnboarding: true,
      });

      showToast({
        type: 'info',
        message: 'Onboarding skipped. You can finish setup anytime from settings.',
      });
      onComplete();
    } catch (error) {
      logger.error('Error skipping onboarding:', error);
      showToast({
        type: 'error',
        message: 'Unable to skip onboarding right now. Please try again.',
      });
    } finally {
      setIsSkipping(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.salonName.trim().length > 0;
      case 2:
        return data.selectedServices.length > 0 || data.customServices.length > 0;
      case 3:
        return true; // Team members are optional
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      {showConfetti && currentStep === 4 && <Confetti />}

      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-8">
            <LogoIcon className={`w-12 h-12 ${mapToAccentColor('text-accent-500')}`} />
          </div>
          <div className="px-4">
            <Stepper steps={steps} currentStep={currentStep} />
          </div>
        </div>

        {/* Content */}
        <div className="mb-8 min-h-[500px]">
          <div className="animate-fade-in">
            {currentStep === 1 && (
              <SalonInfoStep
                data={data}
                t={t}
                accentColors={ACCENT_COLORS}
                languages={LANGUAGES}
                currencies={CURRENCIES}
                updateData={updateData}
                onThemeChange={handleThemeChange}
                onTypographyChange={handleTypographyChange}
                onAccentColorChange={handleAccentChange}
                onCustomAccentColorChange={handleCustomAccentChange}
                onLanguageChange={handleLanguageChange}
                onCurrencyChange={handleCurrencyChange}
                showCustomColorPicker={showCustomColorPicker}
                setShowCustomColorPicker={setShowCustomColorPicker}
              />
            )}
            {currentStep === 2 && (
              <ServicesStep data={data} updateData={updateData} commonServices={COMMON_SERVICES} />
            )}
            {currentStep === 3 && <TeamStep data={data} updateData={updateData} />}
            {currentStep === 4 && (
              <ReviewStep
                data={data}
                t={t}
                languages={LANGUAGES}
                accentColors={ACCENT_COLORS}
                onComplete={handleComplete}
                onSkip={handleSkip}
                isCompleting={isCompleting}
                isSkipping={isSkipping}
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        {currentStep < 4 && (
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {t('onboarding.navigation.previous')}
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-6 py-2 ${mapToAccentColor('bg-accent-500')} text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90`}
            >
              {t('onboarding.navigation.next')}
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
