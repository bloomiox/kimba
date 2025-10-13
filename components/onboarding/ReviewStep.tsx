import React from 'react';
import { LogoIcon, ClipboardListIcon, UserIcon, CalendarIcon } from '../common/Icons';
import { mapToAccentColor } from '../../utils/colorUtils';
import type { ReviewStepProps } from './types';

const resolveAccentColor = (
  accentColors: ReviewStepProps['accentColors'],
  accent: string,
  customAccent?: string
) => {
  if (accent === 'custom') {
    return customAccent || '#3b82f6';
  }

  const match = accentColors.find(option => option.name === accent);
  if (!match) {
    return '#3b82f6';
  }

  if (match.className.startsWith('bg-[')) {
    return match.className.replace('bg-[', '').replace(']', '');
  }

  return '#3b82f6';
};

const ReviewStep: React.FC<ReviewStepProps> = ({
  data,
  t,
  languages,
  accentColors,
  onComplete,
  onSkip,
  isCompleting,
  isSkipping,
}) => {
  const accentValue = resolveAccentColor(accentColors, data.accentColor, data.customAccentColor);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Review your setup</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Everything looks good? Let's get started!
        </p>
      </div>

      <div className="space-y-6">
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
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Workspace Style</h3>
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
              <span className="ml-2">
                {languages.find(language => language.id === data.language)?.label}
              </span>
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
                style={{ backgroundColor: accentValue }}
              />
              <span className="capitalize">{data.accentColor}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <ClipboardListIcon className="w-5 h-5" />
            Services ({data.selectedServices.length + data.customServices.length})
          </h3>
          <div className="space-y-1">
            {data.selectedServices.map(service => (
              <div key={service} className="text-sm text-gray-600 dark:text-gray-400">
                • {service}
              </div>
            ))}
            {data.customServices.map((service, index) => (
              <div
                key={`${service.name}-${index}`}
                className="text-sm text-gray-600 dark:text-gray-400"
              >
                • {service.name} ({service.duration} min,{' '}
                {service.price.toLocaleString('en-US', {
                  style: 'currency',
                  currency: data.currency,
                })}
                )
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Team Members ({data.teamMembers.length})
          </h3>
          <div className="space-y-1">
            {data.teamMembers.map((member, index) => (
              <div
                key={`${member.name}-${index}`}
                className="text-sm text-gray-600 dark:text-gray-400"
              >
                • {member.name} ({member.type === 'expert' ? 'Expert' : 'Station'} Hairstylist)
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onComplete}
            disabled={isCompleting}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isCompleting ? 'animate-pulse' : ''}`}
          >
            <CalendarIcon className="w-5 h-5" />
            {isCompleting ? t('onboarding.step5.settingUp') : t('onboarding.step5.bookAppointment')}
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={isSkipping}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isSkipping ? 'animate-pulse' : ''}`}
          >
            {isSkipping ? t('onboarding.step5.goingToDashboard') : t('onboarding.step5.skipForNow')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
