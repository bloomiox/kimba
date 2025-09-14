import React, { useState, useMemo } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import Card from '../common/Card';
import Button from '../common/Button';
import { Lookbook, Client, SocialMediaConnections } from '../../types';
import { InstagramIcon, FacebookIcon, TikTokIcon, CheckCircleIcon } from '../common/Icons';

const SocialMediaPage: React.FC = () => {
    const { t, socialMedia, connectSocialMedia, disconnectSocialMedia, clients, getCurrentUserLookbooks, salonName } = useSettings();
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [selectedLookbook, setSelectedLookbook] = useState<Lookbook | null>(null);
    const [caption, setCaption] = useState('');
    const [platforms, setPlatforms] = useState({ instagram: false, facebook: false, tiktok: false });

    const lookbooks = getCurrentUserLookbooks();

    const clientsWithConsentAndLookbooks = useMemo(() => {
        const lookbookClientIds = new Set(lookbooks.map(lb => lb.clientId));
        return clients.filter(c => c.consentToShare && lookbookClientIds.has(c.id));
    }, [clients, lookbooks]);

    const clientLookbooks = useMemo(() => {
        if (!selectedClientId) return [];
        return lookbooks.filter(lb => lb.clientId === selectedClientId);
    }, [lookbooks, selectedClientId]);

    const handleConnect = (platform: keyof SocialMediaConnections) => {
        const username = prompt(`Enter your ${platform} username:`);
        if (username) {
            connectSocialMedia(platform, username);
        }
    };
    
    const handleSelectLookbook = (lookbook: Lookbook) => {
        setSelectedLookbook(lookbook);
        const client = clients.find(c => c.id === lookbook.clientId);
        const clientFirstName = client ? client.name.split(' ')[0] : 'our amazing client';
        setCaption(`Another amazing transformation at ${salonName}! ✨ Swipe to see the before. What do you think of this new look for ${clientFirstName}?\n\n#hairstyles #hairtransformation #${salonName.replace(/\s/g, '').toLowerCase()}`);
    };
    
    const handlePost = () => {
        if(!selectedLookbook || !caption || (!platforms.instagram && !platforms.facebook && !platforms.tiktok)) {
            alert("Please select a lookbook, write a caption, and choose a platform to post to.");
            return;
        }
        alert(t('social.creator.postSuccess'));
        setSelectedLookbook(null);
        setCaption('');
        setPlatforms({ instagram: false, facebook: false, tiktok: false });
    };

    const socialPlatforms = [
        { id: 'instagram', name: 'Instagram', icon: InstagramIcon, handle: socialMedia.instagram },
        { id: 'facebook', name: 'Facebook', icon: FacebookIcon, handle: socialMedia.facebook },
        { id: 'tiktok', name: 'TikTok', icon: TikTokIcon, handle: socialMedia.tiktok },
    ] as const;

    return (
        <div className="animate-fade-in space-y-8">
            <h2 className="text-3xl font-bold">{t('social.title')}</h2>

            <Card title={t('social.connections.title')}>
                <div className="space-y-4">
                    {socialPlatforms.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                            <div className="flex items-center gap-4">
                                <p.icon className="w-8 h-8"/>
                                <div>
                                    <p className="font-bold text-lg">{p.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {p.handle ? t('social.connections.connectedAs', {username: p.handle}) : t('social.connections.notConnected')}
                                    </p>
                                </div>
                            </div>
                            {p.handle ? (
                                <Button onClick={() => disconnectSocialMedia(p.id)} variant="secondary">{t('social.connections.disconnect')}</Button>
                            ) : (
                                <Button onClick={() => handleConnect(p.id)}>{t('social.connections.connect')}</Button>
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            <Card title={t('social.creator.title')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Selection */}
                    <div>
                        <label htmlFor="client-select" className="block text-sm font-medium mb-1">{t('social.creator.selectClient')}</label>
                        <select
                            id="client-select"
                            value={selectedClientId}
                            onChange={e => {setSelectedClientId(e.target.value); setSelectedLookbook(null);}}
                            className="w-full p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                        >
                            <option value="">-- Select --</option>
                            {/* FIX: Mapped the array of clients to option elements to be rendered correctly. */}
                            {clientsWithConsentAndLookbooks.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                        
                        {selectedClientId && (
                            <div className="mt-4">
                                <h4 className="font-semibold mb-2">{t('social.creator.selectLookbook')}</h4>
                                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                                    {clientLookbooks.map(lb => (
                                        <button key={lb.id} onClick={() => handleSelectLookbook(lb)} className={`relative aspect-square rounded-lg overflow-hidden ring-2 ${selectedLookbook?.id === lb.id ? 'ring-accent' : 'ring-transparent'}`}>
                                            <img src={lb.finalImage.src} alt={lb.finalImage.hairstyleName} className="w-full h-full object-cover"/>
                                            {selectedLookbook?.id === lb.id && (
                                                <div className="absolute inset-0 bg-accent/70 flex items-center justify-center">
                                                    <CheckCircleIcon className="w-8 h-8 text-white"/>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Preview & Post */}
                    <div>
                        {selectedLookbook ? (
                            <div>
                                <img src={selectedLookbook.finalImage.src} alt="Selected lookbook" className="w-full aspect-square object-cover rounded-lg mb-4"/>
                                <textarea
                                    value={caption}
                                    onChange={e => setCaption(e.target.value)}
                                    rows={5}
                                    placeholder={t('social.creator.captionPlaceholder')}
                                    className="w-full p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
                                />
                                <div className="mt-4">
                                    <p className="font-semibold mb-2">{t('social.creator.postTo')}</p>
                                    <div className="flex gap-4">
                                        {socialPlatforms.map(p => p.handle && (
                                            <label key={p.id} className="flex items-center gap-2">
                                                <input type="checkbox" checked={platforms[p.id]} onChange={e => setPlatforms(prev => ({...prev, [p.id]: e.target.checked}))} className="w-4 h-4 rounded text-accent focus:ring-accent" />
                                                <p.icon className="w-5 h-5"/>
                                                {p.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <Button onClick={handlePost} className="w-full mt-4">{t('social.creator.postNow')}</Button>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-center p-8 bg-gray-100/50 dark:bg-gray-900/50 rounded-lg text-gray-500">
                                {t('social.creator.selectPrompt')}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SocialMediaPage;
