import React, { useRef } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import { LogoIcon } from '../common/Icons';

const BrandingSettings: React.FC = () => {
    const { salonName, setSalonName, salonLogo, setSalonLogo, welcomeMessage, setWelcomeMessage } = useSettings();
    const logoInputRef = useRef<HTMLInputElement>(null);
    
    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target?.result as string;
                setSalonLogo(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Card title="Salon Branding">
            <div className="space-y-4">
                <div>
                    <label htmlFor="salonName" className="block text-sm font-medium mb-1">Salon Name</label>
                    <Input id="salonName" type="text" value={salonName} onChange={(e) => setSalonName(e.target.value)} />
                </div>
                <div>
                    <p className="block text-sm font-medium mb-1">Salon Logo</p>
                    <div className="flex items-center gap-4">
                        {salonLogo ? <img src={salonLogo} alt="Logo Preview" className="w-16 h-16 rounded-lg object-cover"/> : <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center"><LogoIcon className="w-8 h-8 text-gray-400"/></div>}
                        <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/png, image/jpeg" className="hidden"/>
                        <Button onClick={() => logoInputRef.current?.click()} variant="secondary">Upload</Button>
                        {salonLogo && <button onClick={() => setSalonLogo(null)} className="text-sm text-red-500 hover:underline">Remove</button>}
                    </div>
                </div>
                <div>
                    <label htmlFor="welcomeMessage" className="block text-sm font-medium mb-1">Welcome Message</label>
                    <textarea id="welcomeMessage" value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} rows={3} className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg resize-none" />
                </div>
            </div>
        </Card>
    );
}

export default BrandingSettings;
