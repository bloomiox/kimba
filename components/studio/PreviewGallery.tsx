import React from 'react';
import type { GeneratedImage } from '../../types';

interface PreviewGalleryProps {
  previews: GeneratedImage[];
  onSelect: (preview: GeneratedImage) => void;
  isComplete: boolean;
}

const PreviewGallery: React.FC<PreviewGalleryProps> = ({ previews, onSelect, isComplete }) => {
  return (
    <div className="p-4 sm:p-8">
      {isComplete && (
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Your Personalized Lookbook</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">
            Hover to see the transformation. Click your favorite hairstyle to refine it with variations, colors, and more.
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {previews.map((preview, index) => (
            <button
              key={preview.hairstyleId || index}
              onClick={() => isComplete && onSelect(preview)}
              disabled={!isComplete}
              className={`group relative aspect-square w-full rounded-lg overflow-hidden transition-all duration-300 ring-2 ring-transparent shadow-lg ${isComplete ? 'hover:ring-accent focus:ring-4 focus:ring-accent hover:shadow-2xl transform hover:-translate-y-1' : 'cursor-wait'}`}
            >
              <img 
                src={preview.src} 
                alt={`Generated style: ${preview.hairstyleName}`} 
                className="absolute inset-0 w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-sm font-semibold text-center truncate transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                  {preview.hairstyleName}
                </p>
              </div>
            </button>
        ))}
      </div>
    </div>
  );
};

export default PreviewGallery;
