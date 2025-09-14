import React from 'react';
import type { Hairstyle } from '../types';
import { useSettings } from '../contexts/SettingsContext';
// FIX: Updated import path to use the common Icons component.
import { CameraIcon } from './common/Icons';

interface HairstyleSelectorProps {
  userImagePreview: string;
  hairstyles: Hairstyle[];
  selectedStyle: Hairstyle | null;
  onSelectStyle: (style: Hairstyle) => void;
  additionalPrompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  onEnterMagicTryOn: () => void;
}

const HairstyleSelector: React.FC<HairstyleSelectorProps> = ({
  userImagePreview,
  hairstyles,
  selectedStyle,
  onSelectStyle,
  additionalPrompt,
  onPromptChange,
  onGenerate,
  onEnterMagicTryOn,
}) => {
  // FIX: The 'layout' property was missing from the SettingsContextType. 
  // It has been added to the context to resolve this error.
  const { layout } = useSettings();
  
  const activeBaseStyle = React.useMemo(() => 
    hairstyles.find(h => selectedStyle?.id.startsWith(h.id)),
    [hairstyles, selectedStyle]
  );
  
  const mainContent = (
    <>
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">1. Choose a Base Style</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">Select a hairstyle to get started.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {hairstyles.map((style) => (
            <button
              key={style.id}
              onClick={() => onSelectStyle(style)}
              className={`group relative aspect-square rounded-lg overflow-hidden transition-all duration-200 ${
                activeBaseStyle?.id === style.id ? 'ring-4 ring-accent' : 'ring-2 ring-transparent hover:ring-accent'
              }`}
            >
              <img src={style.previewUrl} alt={style.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
              <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-xs sm:text-sm font-semibold text-center truncate">{style.name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {activeBaseStyle?.variations && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Variations for {activeBaseStyle.name}</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            <button
              onClick={() => onSelectStyle(activeBaseStyle)}
              className={`group relative aspect-square rounded-lg overflow-hidden transition-all duration-200 ${
                selectedStyle?.id === activeBaseStyle.id ? 'ring-4 ring-accent' : 'ring-2 ring-transparent hover:ring-accent'
              }`}
            >
              <img src={activeBaseStyle.previewUrl} alt={activeBaseStyle.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ease-in-out" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300 ease-in-out"></div>
              <div className="absolute bottom-0 left-0 w-full p-1.5 bg-gradient-to-t from-black/80 to-transparent group-hover:bg-black/70 transition-colors duration-300">
                <p className="text-white text-xs font-semibold text-center truncate">Default</p>
              </div>
            </button>
            {activeBaseStyle.variations.map(variation => (
              <button 
                key={variation.id}
                onClick={() => {
                  const newStyle: Hairstyle = {
                    ...activeBaseStyle,
                    id: variation.id,
                    prompt: `${activeBaseStyle.prompt}, ${variation.promptModifier}`,
                  };
                  onSelectStyle(newStyle);
                }}
                className={`group relative aspect-square rounded-lg overflow-hidden transition-all duration-200 ${
                  selectedStyle?.id === variation.id ? 'ring-4 ring-accent' : 'ring-2 ring-transparent hover:ring-accent'
                }`}
              >
                <img src={variation.previewUrl} alt={variation.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ease-in-out" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300 ease-in-out"></div>
                <div className="absolute bottom-0 left-0 w-full p-1.5 bg-gradient-to-t from-black/80 to-transparent group-hover:bg-black/70 transition-colors duration-300">
                  <p className="text-white text-xs font-semibold text-center truncate">{variation.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">2. Refine Your Style (Optional)</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">Add more details like color, length, or other specifics.</p>
        <textarea
          value={additionalPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="e.g., 'make it vibrant red', 'add blonde highlights', 'shorter on the sides'"
          className="w-full h-24 p-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent transition"
        />
      </div>
      
      <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
          <button
              onClick={onEnterMagicTryOn}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-600 hover:bg-gray-700 rounded-lg text-lg font-bold text-white transition-colors shadow-lg"
          >
              <CameraIcon className="w-6 h-6" />
              Magic Try-On
          </button>
          <button
              onClick={onGenerate}
              className="px-8 py-4 bg-accent hover:opacity-90 rounded-lg text-lg font-bold text-white transition-all shadow-lg"
          >
              Generate My New Look
          </button>
      </div>
    </>
  );

  return (
    <div className="p-4 sm:p-8">
      {layout === 'standard' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Photo</h3>
            <img
              src={userImagePreview}
              alt="User"
              className="w-full max-w-xs rounded-lg shadow-lg object-cover aspect-square"
            />
          </div>
          <div className="lg:col-span-2">{mainContent}</div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-8">
            <div className="w-full max-w-sm flex flex-col items-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Photo</h3>
                <img
                    src={userImagePreview}
                    alt="User"
                    className="w-48 h-48 rounded-lg shadow-lg object-cover"
                />
            </div>
            <div className="w-full max-w-4xl">{mainContent}</div>
        </div>
      )}
    </div>
  );
};

export default HairstyleSelector;
