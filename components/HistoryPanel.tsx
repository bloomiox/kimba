import React, { useState } from 'react';
import type { GeneratedImage, AngleView } from '../types';
// FIX: Updated import path to use the common Icons component.
import { CloseIcon, DownloadIcon } from './common/Icons';

type HistoryImage = GeneratedImage | AngleView;

interface HistoryPanelProps {
  images: HistoryImage[];
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ images }) => {
  const [fullscreenImage, setFullscreenImage] = useState<HistoryImage | null>(null);

  const handleDownload = (image: HistoryImage) => {
    const link = document.createElement('a');
    link.href = image.src;
    const name = 'hairstyleName' in image ? image.hairstyleName : image.view;
    link.download = `ai-hairstyle-${name.toLowerCase().replace(/\s/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <aside className="w-56 flex-shrink-0 bg-gray-100/50 dark:bg-gray-900/50 p-4 rounded-2xl flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
          Session History
        </h3>
        <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-3">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setFullscreenImage(image)}
              className="group relative block w-full aspect-square rounded-lg overflow-hidden ring-2 ring-transparent hover:ring-accent focus:ring-accent transition-all duration-200"
            >
              <img
                src={image.src}
                alt={'hairstyleName' in image ? image.hairstyleName : image.view}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                <p className="text-white text-xs font-semibold text-center">
                  {'hairstyleName' in image ? image.hairstyleName : `${image.view} View`}
                </p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-gray-900/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <img
              src={fullscreenImage.src}
              alt={
                'hairstyleName' in fullscreenImage
                  ? fullscreenImage.hairstyleName
                  : fullscreenImage.view
              }
              className="w-full h-auto object-contain rounded-xl shadow-2xl"
            />
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute -top-3 -right-3 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:scale-110 transition-all shadow-lg"
              aria-label="Close"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleDownload(fullscreenImage)}
              className="absolute -bottom-3 -right-3 w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white hover:opacity-90 hover:scale-110 transition-all shadow-lg"
              aria-label="Download Image"
            >
              <DownloadIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
      <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in {
            animation: fade-in 0.2s ease-out forwards;
          }
        `}</style>
    </>
  );
};

export default HistoryPanel;
