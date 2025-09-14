import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import Card from '../common/Card';
import { mapToAccentColor } from '../../utils/colorUtils';

const ACCENT_COLORS = [
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

const AppearanceSettings: React.FC = () => {
    const { theme, setTheme, accentColor, setAccentColor, customAccentColor, setCustomAccentColor, typography, setTypography } = useSettings();
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [customColor, setCustomColor] = useState(customAccentColor || '#8b5cf6');

    const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        setCustomColor(newColor);
    };

    const applyCustomColor = () => {
        setCustomAccentColor(customColor);
        setShowColorPicker(false);
    };

    return (
        <Card title="Appearance">
            <div className="space-y-5">
                <div>
                    <p className="mb-2 font-medium">Theme</p>
                    <div className="flex gap-3">
                        <button onClick={() => setTheme('light')} className={`px-4 py-2 rounded-lg font-semibold w-24 ${theme === 'light' ? `${mapToAccentColor('bg-blue-500')} text-white` : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Light</button>
                        <button onClick={() => setTheme('dark')} className={`px-4 py-2 rounded-lg font-semibold w-24 ${theme === 'dark' ? `${mapToAccentColor('bg-blue-500')} text-white` : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Dark</button>
                    </div>
                </div>
                <div>
                    <p className="mb-2 font-medium">Accent Color</p>
                    <div className="flex flex-wrap gap-3 mb-3">
                        {ACCENT_COLORS.map(color => (
                            <button 
                                key={color.name} 
                                onClick={() => setAccentColor(color.name as any)} 
                                aria-label={color.label} 
                                className={`w-8 h-8 rounded-full ${color.className} ${accentColor === color.name ? 'ring-2 ring-offset-2 ring-white dark:ring-offset-gray-800/50 ring-current' : ''}`}
                                title={color.label}
                            ></button>
                        ))}
                        <button 
                            onClick={() => setShowColorPicker(!showColorPicker)} 
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${accentColor === 'custom' ? '' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'} ${accentColor === 'custom' ? 'ring-2 ring-offset-2 ring-white dark:ring-offset-gray-800/50 ring-current' : ''}`}
                            style={accentColor === 'custom' ? { backgroundColor: customAccentColor || '#8b5cf6' } : {}}
                            title="Custom Color"
                        >
                            {accentColor !== 'custom' && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {showColorPicker && (
                        <div className="mt-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
                            <h3 className="text-sm font-medium mb-3">Custom Accent Color</h3>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full shadow-inner" style={{ backgroundColor: customColor }}></div>
                                <div className="flex-1">
                                    <input 
                                        type="text" 
                                        value={customColor} 
                                        onChange={handleCustomColorChange}
                                        className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm mb-1"
                                        placeholder="Enter hex color code"
                                    />
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Example: #3b82f6</div>
                                </div>
                                <input 
                                    type="color" 
                                    value={customColor} 
                                    onChange={handleCustomColorChange}
                                    className="w-10 h-10 cursor-pointer rounded"
                                    title="Select color"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => setShowColorPicker(false)} 
                                    className="px-3 py-1 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={applyCustomColor} 
                                    className={`px-3 py-1 text-sm rounded-lg ${mapToAccentColor('bg-blue-500')} text-white`}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div>
                    <p className="mb-2 font-medium">Typography</p>
                    <div className="flex gap-3">
                        <button onClick={() => setTypography('sans')} className={`px-4 py-2 rounded-lg font-semibold w-28 ${typography === 'sans' ? `${mapToAccentColor('bg-blue-500')} text-white` : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Sans-Serif</button>
                        <button onClick={() => setTypography('serif')} className={`px-4 py-2 rounded-lg font-semibold w-28 font-serif ${typography === 'serif' ? `${mapToAccentColor('bg-blue-500')} text-white` : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Serif</button>
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default AppearanceSettings;
