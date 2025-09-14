import React from 'react';
import type { GeneratedImage, AngleView } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';

interface FinalLookProps {
  mainImage: GeneratedImage;
  angleViews: AngleView[];
  onStartOver: () => void;
}

const FinalLook: React.FC<FinalLookProps> = ({ mainImage, angleViews, onStartOver }) => {
  const { t } = useSettings();
  const allViews = [{ view: 'Front', src: mainImage.src }, ...angleViews];

  return (
    <div className="p-4 sm:p-8 h-full flex flex-col animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('studio.finalLook.title')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">
          {t('studio.finalLook.subtitle')}
        </p>
      </div>
      
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Main Image */}
        <div className="w-full aspect-square flex items-center justify-center">
             <img src={mainImage.src} alt="Final refined hairstyle" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"/>
        </div>

        {/* Angle Views */}
        <div className="w-full">
            <h3 className="text-xl font-semibold text-center lg:text-left mb-4 text-gray-800 dark:text-gray-200">{t('studio.finalLook.angles')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {allViews.map(view => (
                    <div key={view.view} className="flex flex-col items-center gap-2">
                         <img src={view.src} alt={`Angle view: ${view.view}`} className="w-full aspect-square object-cover rounded-lg shadow-lg" />
                         <p className="font-semibold text-gray-600 dark:text-gray-300">{t('studio.finalLook.view', { view: view.view })}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="text-center mt-8 flex flex-wrap justify-center items-center gap-4">
        <button
          onClick={onStartOver}
          className="px-8 py-3 bg-accent hover:opacity-90 rounded-lg font-semibold text-white transition-all shadow-md"
        >
          {t('studio.finalLook.createAnother')}
        </button>
         <button
          className="px-6 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
        >
          {t('studio.finalLook.download')}
        </button>
      </div>
    </div>
  );
};

export default FinalLook;
