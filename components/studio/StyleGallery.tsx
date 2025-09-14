import React, { useState } from 'react';
import type { GeneratedImage } from '../../types';
import { CloseIcon, ArrowRightIcon } from '../common/Icons';
import { useSettings } from '../../contexts/SettingsContext';

interface StyleGalleryProps {
  styles: GeneratedImage[];
  onSelect: (image: GeneratedImage) => void;
  onStartOver: () => void;
}

const StyleGallery: React.FC<StyleGalleryProps> = ({ styles, onSelect, onStartOver }) => {
  const [fullscreenImage, setFullscreenImage] = useState<GeneratedImage | null>(null);
  const { t } = useSettings();

  const handleSelectAndClose = () => {
    if (fullscreenImage) {
      onSelect(fullscreenImage);
      setFullscreenImage(null);
    }
  };

  return (
    <div className="p-4 sm:p-8 h-full flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('studio.styleGallery.title')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">
          {t('studio.styleGallery.subtitle')}
        </p>
      </div>
      <div className="flex-grow overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {styles.map((style, index) => (
            <button
              key={index}
              onClick={() => setFullscreenImage(style)}
              className="group relative aspect-square w-full rounded-lg overflow-hidden transition-all duration-300 ring-2 ring-transparent shadow-lg hover:ring-accent focus:ring-4 focus:ring-accent hover:shadow-2xl transform hover:-translate-y-1"
            >
              <img
                src={style.src}
                alt={style.hairstyleName}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <p className="absolute bottom-0 left-0 right-0 p-3 text-white text-sm font-semibold text-center truncate">
                {style.hairstyleName}
              </p>
            </button>
          ))}
        </div>
      </div>
      <div className="text-center mt-6">
         <button
          onClick={onStartOver}
          className="px-6 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
        >
          {t('studio.styleGallery.useDifferentPhoto')}
        </button>
      </div>

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl">
            <img src={fullscreenImage.src} alt={fullscreenImage.hairstyleName} className="w-full h-auto object-contain rounded-xl shadow-2xl" />
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute -top-2 -right-2 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:scale-110 transition-all shadow-lg"
              aria-label="Close"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/10 p-4 rounded-b-xl">
                <div>
                    <h3 className="text-xl font-bold text-white">{fullscreenImage.hairstyleName}</h3>
                    <p className="text-gray-300 text-sm max-w-md">{fullscreenImage.prompt}</p>
                </div>
                <button
                    onClick={handleSelectAndClose}
                    className="flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:opacity-90 rounded-lg text-lg font-bold text-white transition-colors shadow-lg"
                >
                    {t('studio.styleGallery.selectAndRefine')}
                    <ArrowRightIcon className="w-6 h-6" />
                </button>
            </div>
          </div>
        </div>
      )}
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

export default StyleGallery;
