import React, { useState, useEffect } from 'react';
// FIX: Updated import path to use the common Icons component.
import { EditIcon } from './common/Icons';
import type { GeneratedImage } from '../types';

interface ResultDisplayProps {
  originalImage: string;
  generatedImages: GeneratedImage[];
  onReset: () => void;
  onEdit: (image: GeneratedImage) => void;
  onTryAnotherStyle: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalImage, generatedImages, onReset, onEdit, onTryAnotherStyle }) => {
  const [activeImage, setActiveImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    // Set the latest generated image as the active one initially or when the list updates
    if (generatedImages.length > 0) {
      setActiveImage(generatedImages[generatedImages.length - 1]);
    } else {
        setActiveImage(null);
    }
  }, [generatedImages]);

  if (!activeImage) {
    return null; // Should not happen if generatedImages has items, but good for safety
  }

  return (
    <div className="p-4 sm:p-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Your New Look is Ready!</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-3">Original</h3>
          <img src={originalImage} alt="Original" className="w-full rounded-lg shadow-lg aspect-square object-cover" />
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold text-accent dark:text-accent mb-3">New Hairstyle</h3>
          <div className="relative group w-full">
            <img src={activeImage.src} alt="Generated Hairstyle" className="w-full rounded-lg shadow-lg aspect-square object-cover" />
            <button 
              onClick={() => onEdit(activeImage)}
              className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
              aria-label="Edit Hairstyle"
            >
              <EditIcon className="w-12 h-12 text-white" />
              <span className="mt-2 text-white font-semibold">Edit Look</span>
            </button>
          </div>
        </div>
      </div>
      
      {generatedImages.length > 1 && (
        <div className="mt-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 text-center mb-4">History</h3>
            <div className="flex justify-center gap-3 p-2 -mx-2 overflow-x-auto">
                {generatedImages.map((image, index) => (
                    <button 
                        key={index} 
                        onClick={() => setActiveImage(image)} 
                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 ${activeImage.src === image.src ? 'ring-4 ring-offset-2 ring-offset-white/50 dark:ring-offset-gray-800/50 ring-accent' : 'ring-2 ring-transparent hover:ring-accent'}`}
                        aria-label={`View generated style ${index + 1}`}
                    >
                        <img src={image.src} alt={`Generated style ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
      )}

      <div className="text-center mt-8 flex flex-wrap justify-center items-center gap-4">
        <button
          onClick={onTryAnotherStyle}
          className="px-8 py-3 bg-accent hover:opacity-90 rounded-lg font-semibold text-white transition-all shadow-md"
        >
          Try Another Style
        </button>
        <button
          onClick={onReset}
          className="px-6 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;