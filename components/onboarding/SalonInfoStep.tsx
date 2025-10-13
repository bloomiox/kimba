import React from 'react';
import { LogoIcon, PlusIcon, UploadIcon } from '../common/Icons';
import type { SalonInfoStepProps } from './types';

const SalonInfoStep: React.FC<SalonInfoStepProps> = ({
  data,
  t,
  accentColors,
  languages,
  currencies,
  updateData,
  onThemeChange,
  onTypographyChange,
  onAccentColorChange,
  onCustomAccentColorChange,
  onLanguageChange,
  onCurrencyChange,
  showCustomColorPicker,
  setShowCustomColorPicker,
}) => {
  const handleSalonNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ salonName: event.target.value });
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ salonLogo: event.target.value || null });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {data.salonName
            ? t('onboarding.step1.titleWithName', { salonName: data.salonName })
            : t('onboarding.step1.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {data.salonName ? t('onboarding.step1.subtitleWithName') : t('onboarding.step1.subtitle')}
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <LogoIcon className="w-5 h-5" />
          {t('onboarding.step5.salonInformation')}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('onboarding.step1.salonNameLabel')}
            </label>
            <input
              type="text"
              value={data.salonName}
              onChange={handleSalonNameChange}
              className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
              placeholder={t('onboarding.step1.salonNamePlaceholder')}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('onboarding.step1.salonLogoLabel')}
            </label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {data.salonLogo ? (
                  <img src={data.salonLogo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <UploadIcon className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <input
                type="url"
                value={data.salonLogo || ''}
                onChange={handleLogoChange}
                className="flex-1 p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                placeholder={t('onboarding.step1.salonLogoPlaceholder')}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('onboarding.step2.title')}
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('onboarding.step2.theme')}
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onThemeChange('light')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    data.theme === 'light'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-gray-100 to-white border border-gray-200 rounded mx-auto mb-1" />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {t('onboarding.step2.themeLight')}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onThemeChange('dark')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    data.theme === 'dark'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded mx-auto mb-1" />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {t('onboarding.step2.themeDark')}
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('onboarding.step2.typography')}
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onTypographyChange('sans')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    data.typography === 'sans'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-sm font-sans font-medium text-gray-900 dark:text-white">
                    {t('onboarding.step2.typographySans')}
                  </div>
                  <div className="text-xs font-sans text-gray-600 dark:text-gray-400">
                    {t('onboarding.step2.typographySansDesc')}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onTypographyChange('serif')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    data.typography === 'serif'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-sm font-serif font-medium text-gray-900 dark:text-white">
                    {t('onboarding.step2.typographySerif')}
                  </div>
                  <div className="text-xs font-serif text-gray-600 dark:text-gray-400">
                    {t('onboarding.step2.typographySerifDesc')}
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('onboarding.step2.accentColor')}
            </label>
            <div className="flex flex-wrap gap-2">
              {accentColors.slice(0, 8).map(color => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => onAccentColorChange(color.name)}
                  className={`w-8 h-8 rounded-full ${color.className} ${
                    data.accentColor === color.name
                      ? 'ring-2 ring-offset-2 ring-white dark:ring-offset-gray-800 ring-current scale-110'
                      : 'hover:scale-105'
                  } transition-all`}
                  title={color.label}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  onAccentColorChange('custom');
                  setShowCustomColorPicker(true);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-dashed ${
                  data.accentColor === 'custom'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                } transition-all`}
                style={
                  data.accentColor === 'custom' && data.customAccentColor
                    ? { backgroundColor: data.customAccentColor, borderStyle: 'solid' }
                    : undefined
                }
                title={t('onboarding.step2.customColor')}
              >
                {data.accentColor !== 'custom' && <PlusIcon className="w-3 h-3 text-gray-400" />}
              </button>
            </div>

            {showCustomColorPicker && (
              <div className="p-3 bg-white dark:bg-gray-700 rounded-lg border">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: data.customAccentColor || '#3b82f6' }}
                  />
                  <input
                    type="color"
                    value={data.customAccentColor || '#3b82f6'}
                    onChange={event => onCustomAccentColorChange(event.target.value)}
                    className="w-12 h-6 cursor-pointer rounded border-none"
                  />
                  <input
                    type="text"
                    value={data.customAccentColor || '#3b82f6'}
                    onChange={event => onCustomAccentColorChange(event.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomColorPicker(false)}
                  className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  {t('onboarding.step2.customColorDone')}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('onboarding.step2.language')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {languages.map(lang => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => onLanguageChange(lang.id)}
                    className={`p-2 rounded-lg border-2 transition-all text-left ${
                      data.language === lang.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{lang.flag}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {lang.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('onboarding.step2.currency')}
              </label>
              <div className="space-y-2">
                {currencies.map(curr => (
                  <button
                    key={curr.id}
                    type="button"
                    onClick={() => onCurrencyChange(curr.id)}
                    className={`w-full p-2 rounded-lg border-2 transition-all text-left ${
                      data.currency === curr.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {curr.label}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {curr.symbol}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('onboarding.step1.workspaceLayout')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => updateData({ layout: 'standard' })}
                className={`p-4 border-2 rounded-xl transition-all text-left ${
                  data.layout === 'standard'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('onboarding.step1.layoutStandard')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('onboarding.step1.layoutStandardDesc')}
                </p>
              </button>
              <button
                type="button"
                onClick={() => updateData({ layout: 'compact' })}
                className={`p-4 border-2 rounded-xl transition-all text-left ${
                  data.layout === 'compact'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('onboarding.step1.layoutCompact')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('onboarding.step1.layoutCompactDesc')}
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonInfoStep;
