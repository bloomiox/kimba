import React, { useState, useMemo } from 'react';
import { CloseIcon } from '../common/Icons';
import { useSettings } from '../../contexts/SettingsContext';

const ImageEditor: React.FC<{
  imageToEdit: string;
  initialPrompt: string;
  onFinalize: (newPrompt: string) => void;
  onBack: () => void;
}> = ({ imageToEdit, initialPrompt, onFinalize, onBack }) => {
  const { t } = useSettings();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const COLORS = useMemo(() => [
    { name: t('studio.imageEditor.colors.blonde'), prompt: 'in a platinum blonde color', color: '#F2E5BF' },
    { name: t('studio.imageEditor.colors.brunette'), prompt: 'in a rich brunette color', color: '#5C3A21' },
    { name: t('studio.imageEditor.colors.black'), prompt: 'in a jet black color', color: '#222222' },
    { name: t('studio.imageEditor.colors.red'), prompt: 'in a vibrant red color', color: '#C93C3C' },
    { name: t('studio.imageEditor.colors.pastelPink'), prompt: 'in a pastel pink color', color: '#F4C2C2' },
    { name: t('studio.imageEditor.colors.silver'), prompt: 'in a metallic silver color', color: '#C0C0C0' },
  ], [t]);

  const STYLES = useMemo(() => [
    { name: t('studio.imageEditor.styles.wavier'), prompt: 'with more defined waves' },
    { name: t('studio.imageEditor.styles.curlier'), prompt: 'with tighter, more defined curls' },
    { name: t('studio.imageEditor.styles.straighter'), prompt: 'but make it perfectly straight and sleek' },
    { name: t('studio.imageEditor.styles.addBangs'), prompt: 'with sharp, blunt-cut bangs' },
    { name: t('studio.imageEditor.styles.moreVolume'), prompt: 'with significantly more volume and texture' },
    { name: t('studio.imageEditor.styles.highlights'), prompt: 'with subtle highlights' },
  ], [t]);

  const addPromptText = (text: string) => {
    // Avoid adding duplicate prompts
    if (prompt.includes(text)) return;
    setPrompt(prev => `${prev.trim()}, ${text}`);
  };

  const handleFinalizeClick = () => {
    onFinalize(prompt);
  };
  
  const handleResetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  const imageStyle = useMemo(() => ({
    filter: `brightness(${brightness / 100}) contrast(${contrast / 100}) saturate(${saturation / 100})`,
  }), [brightness, contrast, saturation]);

  return (
    <div className="fixed inset-0 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-4 animate-fade-in">
        <button onClick={onBack} className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="Close Editor">
            <CloseIcon className="w-8 h-8"/>
        </button>

      <div className="w-full max-w-6xl h-full flex flex-col lg:flex-row items-center gap-8 p-4">
        {/* Image Preview */}
        <div className="w-full lg:w-1/2 h-1/2 lg:h-full flex items-center justify-center">
          <img src={imageToEdit} alt="Hairstyle to edit" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-all duration-200" style={imageStyle}/>
        </div>

        {/* Editing Controls */}
        <div className="w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col bg-white/50 dark:bg-gray-800/50 p-6 rounded-lg overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('studio.imageEditor.title')}</h2>
          
          {/* Image Adjustments */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
                 <h3 className="text-lg font-semibold text-accent">{t('studio.imageEditor.adjustments')}</h3>
                 <button onClick={handleResetFilters} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">{t('studio.imageEditor.reset')}</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-4 items-center gap-2">
                <label htmlFor="brightness" className="text-sm font-medium col-span-1">{t('studio.imageEditor.brightness')}</label>
                <input id="brightness" type="range" min="0" max="200" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer col-span-2 accent-accent" />
                <span className="text-sm text-center font-mono">{brightness}%</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <label htmlFor="contrast" className="text-sm font-medium col-span-1">{t('studio.imageEditor.contrast')}</label>
                <input id="contrast" type="range" min="0" max="200" value={contrast} onChange={(e) => setContrast(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer col-span-2 accent-accent" />
                <span className="text-sm text-center font-mono">{contrast}%</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <label htmlFor="saturation" className="text-sm font-medium col-span-1">{t('studio.imageEditor.saturation')}</label>
                <input id="saturation" type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer col-span-2 accent-accent" />
                <span className="text-sm text-center font-mono">{saturation}%</span>
              </div>
            </div>
          </div>
          
          <hr className="border-gray-300 dark:border-gray-600 my-4" />

          {/* Prompt-based Refinements */}
          <div>
            <h3 className="text-lg font-semibold text-accent mb-3">{t('studio.imageEditor.refinements')}</h3>
            <div className="flex flex-wrap gap-3">
              {COLORS.map(color => (
                <button key={color.name} onClick={() => addPromptText(color.prompt)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full text-sm font-medium text-gray-900 dark:text-white transition-colors">
                  <span className="w-4 h-4 rounded-full border border-black/20 dark:border-white/50" style={{ backgroundColor: color.color }}></span>
                  {color.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex flex-wrap gap-3">
              {STYLES.map(style => (
                <button key={style.name} onClick={() => addPromptText(style.prompt)} className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full text-sm font-medium text-gray-900 dark:text-white transition-colors">
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex-grow flex flex-col">
            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('studio.imageEditor.customDetails')}</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full flex-grow p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent transition resize-none"
              placeholder={t('studio.imageEditor.customPlaceholder')}
            />
          </div>

          <div className="mt-6">
            <button
              onClick={handleFinalizeClick}
              className="w-full px-8 py-4 bg-accent hover:opacity-90 rounded-lg text-lg font-bold text-white transition-all shadow-lg"
            >
              {t('studio.imageEditor.finalize')}
            </button>
          </div>
        </div>
      </div>
       <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
          }
        `}</style>
    </div>
  );
};

export default ImageEditor;
