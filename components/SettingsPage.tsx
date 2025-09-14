import React, { useRef, useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { LogoIcon, PlusIcon, CloseIcon, EditIcon, TrashIcon, PhoneIcon, UserIcon, SettingsIcon, SparklesIcon, ClipboardListIcon, UsersIcon, DesignStudioIcon, CreditCardIcon } from './common/Icons';
import type { Service, Hairstylist, HairstylistType, Currency, ServiceGroup, CustomHairstyle, UserImage } from '../types';

const ACCENT_COLORS = [
    { name: 'purple', label: 'Purple', className: 'bg-[#8b5cf6]' },
    { name: 'blue', label: 'Blue', className: 'bg-[#3b82f6]' },
    { name: 'green', label: 'Green', className: 'bg-[#22c55e]' },
    { name: 'pink', label: 'Pink', className: 'bg-[#ec4899]' },
];

const LANGUAGES = [
    { id: 'de', label: 'Deutsch' },
    { id: 'en', label: 'English' },
    { id: 'fr', label: 'Français' },
    { id: 'it', label: 'Italiano' },
];

const CURRENCIES: {id: Currency, label: string}[] = [
    { id: 'CHF', label: 'CHF (Swiss Franc)' },
    { id: 'EUR', label: 'EUR (Euro)' },
    { id: 'USD', label: 'USD (US Dollar)' },
];


const SettingsPage: React.FC = () => {
  const settings = useSettings();
  const { t, currency, setCurrency, setLanguage, language } = settings;
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [modalState, setModalState] = useState<{
      type: 'service' | 'group' | null;
      data?: Service | ServiceGroup;
      parentId?: string | null;
  }>({ type: null });

  const [isHairstylistModalOpen, setIsHairstylistModalOpen] = useState(false);
  const [editingHairstylist, setEditingHairstylist] = useState<Hairstylist | null>(null);
  
  const [smsFormState, setSmsFormState] = useState(settings.sms);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    setSmsFormState(settings.sms);
  }, [settings.sms]);


  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              const base64 = e.target?.result as string;
              settings.setSalonLogo(base64);
          };
          reader.readAsDataURL(file);
      }
  };
  
  const handleDeleteService = (serviceId: string) => {
    if (window.confirm(t('settings.services.deleteConfirm'))) {
        settings.deleteService(serviceId);
    }
  }

  const handleDeleteServiceGroup = (groupId: string) => {
    if (window.confirm(t('settings.services.deleteGroupConfirm'))) {
      settings.deleteServiceGroup(groupId);
    }
  }

  const handleDeleteHairstylist = (hairstylistId: string) => {
    if (window.confirm(t('settings.hairstylists.deleteConfirm'))) {
        settings.deleteHairstylist(hairstylistId);
    }
  }
  
  const handleSmsSave = () => {
      settings.setSmsSettings(smsFormState);
      alert(t('settings.sms.saved'));
  };

  const ServiceTree: React.FC<{ parentId: string | null; level: number }> = ({ parentId, level }) => {
    const childGroups = settings.serviceGroups.filter(g => g.parentId === parentId).sort((a,b) => a.name.localeCompare(b.name));
    const childServices = settings.services.filter(s => s.parentId === parentId).sort((a,b) => a.name.localeCompare(b.name));

    return (
      <div className={`${level > 0 ? 'ml-4' : ''}`}>
        {childGroups.map(group => (
          <div key={group.id} className="my-2">
            <div className="flex justify-between items-center p-2 bg-gray-200 dark:bg-gray-700/50 rounded-lg">
                <p className="font-bold">{group.name}</p>
                <div className="flex items-center gap-1">
                    <button onClick={() => setModalState({ type: 'service', parentId: group.id })} className="p-1 text-gray-500 hover:text-accent" aria-label="Add Service"><PlusIcon className="w-4 h-4"/></button>
                    <button onClick={() => setModalState({ type: 'group', parentId: group.id })} className="p-1 text-gray-500 hover:text-accent" aria-label="Add Subgroup"><PlusIcon className="w-4 h-4"/></button>
                    <button onClick={() => setModalState({ type: 'group', data: group, parentId: group.parentId })} className="p-1 text-gray-500 hover:text-accent" aria-label="Edit Group"><EditIcon className="w-4 h-4"/></button>
                    <button onClick={() => handleDeleteServiceGroup(group.id)} className="p-1 text-gray-500 hover:text-red-500" aria-label="Delete Group"><TrashIcon className="w-4 h-4"/></button>
                </div>
            </div>
            <ServiceTree parentId={group.id} level={level + 1} />
          </div>
        ))}
        {childServices.map(service => (
          <div key={service.id} className="flex justify-between items-center my-2 p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
              <div>
                  <p className="font-semibold">{service.name}</p>
                  <p className="text-sm text-gray-500">{service.duration} {t('settings.modal.service.minutes')} - {service.price.toLocaleString(t('language.code'), { style: 'currency', currency: currency })}</p>
              </div>
              <div className="flex items-center gap-2">
                  <button onClick={() => setModalState({ type: 'service', data: service, parentId: service.parentId })} className="text-gray-500 hover:text-accent"><EditIcon className="w-5 h-5"/></button>
                  <button onClick={() => handleDeleteService(service.id)} className="text-gray-500 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
              </div>
          </div>
        ))}
      </div>
    );
  };

  const tabs = [
    { id: 'general', label: t('settings.tabs.general'), icon: SettingsIcon },
    { id: 'appearance', label: t('settings.tabs.appearance'), icon: SparklesIcon },
    { id: 'services', label: t('settings.tabs.services'), icon: ClipboardListIcon },
    { id: 'team', label: t('settings.tabs.team'), icon: UsersIcon },
    { id: 'studio', label: t('settings.tabs.studio'), icon: DesignStudioIcon },
    { id: 'pos', label: t('settings.tabs.pos'), icon: CreditCardIcon },
    { id: 'account', label: t('settings.tabs.account'), icon: UserIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
                <h3 className="text-xl font-semibold mb-4 text-accent">{t('settings.branding.title')}</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="salonName" className="block text-sm font-medium mb-1">{t('settings.branding.salonName')}</label>
                        <input id="salonName" type="text" value={settings.salonName} onChange={(e) => settings.setSalonName(e.target.value)} className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" />
                    </div>
                    <div>
                        <p className="block text-sm font-medium mb-1">{t('settings.branding.salonLogo')}</p>
                        <div className="flex items-center gap-4">
                            {settings.salonLogo ? <img src={settings.salonLogo} alt="Logo Preview" className="w-16 h-16 rounded-lg object-cover"/> : <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center"><LogoIcon className="w-8 h-8 text-gray-400"/></div>}
                            <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/png, image/jpeg" className="hidden"/>
                            <button onClick={() => logoInputRef.current?.click()} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold">{t('settings.branding.upload')}</button>
                            {settings.salonLogo && <button onClick={() => settings.setSalonLogo(null)} className="text-sm text-red-500 hover:underline">{t('settings.branding.remove')}</button>}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="welcomeMessage" className="block text-sm font-medium mb-1">{t('settings.branding.welcomeMessage')}</label>
                        <textarea id="welcomeMessage" value={settings.welcomeMessage} onChange={(e) => settings.setWelcomeMessage(e.target.value)} rows={3} className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg resize-none" />
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
                <h3 className="text-xl font-semibold mb-4 text-accent">{t('settings.regional.title')}</h3>
                <div className="space-y-5">
                     <div>
                        <p className="mb-2 font-medium">{t('settings.language.title')}</p>
                        <div className="flex flex-wrap gap-2">
                            {LANGUAGES.map(lang => (
                                <button key={lang.id} onClick={() => setLanguage(lang.id as any)} className={`px-4 py-2 rounded-lg font-semibold ${language === lang.id ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="mb-2 font-medium">{t('settings.regional.currency')}</p>
                        <div className="flex flex-wrap gap-2">
                            {CURRENCIES.map(curr => (
                                <button key={curr.id} onClick={() => setCurrency(curr.id)} className={`px-4 py-2 rounded-lg font-semibold ${currency === curr.id ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                                    {curr.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
                <h3 className="text-xl font-semibold mb-4 text-accent">{t('settings.appearance.title')}</h3>
                <div className="space-y-5">
                    <div>
                        <p className="mb-2 font-medium">{t('settings.appearance.theme')}</p>
                        <div className="flex gap-3">
                            <button onClick={() => settings.setTheme('light')} className={`px-4 py-2 rounded-lg font-semibold w-24 ${settings.theme === 'light' ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>{t('settings.appearance.light')}</button>
                            <button onClick={() => settings.setTheme('dark')} className={`px-4 py-2 rounded-lg font-semibold w-24 ${settings.theme === 'dark' ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>{t('settings.appearance.dark')}</button>
                        </div>
                    </div>
                    <div>
                        <p className="mb-2 font-medium">{t('settings.appearance.accentColor')}</p>
                        <div className="flex gap-3">
                            {ACCENT_COLORS.map(color => (<button key={color.name} onClick={() => settings.setAccentColor(color.name as any)} aria-label={color.label} className={`w-8 h-8 rounded-full ${color.className} ${settings.accentColor === color.name ? 'ring-2 ring-offset-2 ring-white dark:ring-offset-gray-800/50 ring-current' : ''}`}></button>))}
                        </div>
                    </div>
                    <div>
                        <p className="mb-2 font-medium">{t('settings.appearance.typography')}</p>
                        <div className="flex gap-3">
                            <button onClick={() => settings.setTypography('sans')} className={`px-4 py-2 rounded-lg font-semibold w-28 ${settings.typography === 'sans' ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>{t('settings.appearance.sansSerif')}</button>
                            <button onClick={() => settings.setTypography('serif')} className={`px-4 py-2 rounded-lg font-semibold w-28 font-serif ${settings.typography === 'serif' ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>{t('settings.appearance.serif')}</button>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        );
      case 'services':
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-accent">{t('settings.services.title')}</h3>
                        <div className="flex gap-2">
                        <button onClick={() => setModalState({ type: 'service', parentId: null })} className="flex items-center gap-2 px-3 py-1.5 bg-accent/20 text-accent rounded-lg font-semibold text-sm hover:bg-accent/30"><PlusIcon className="w-4 h-4"/> {t('settings.services.add')}</button>
                        <button onClick={() => setModalState({ type: 'group', parentId: null })} className="flex items-center gap-2 px-3 py-1.5 bg-accent/20 text-accent rounded-lg font-semibold text-sm hover:bg-accent/30"><PlusIcon className="w-4 h-4"/> {t('settings.services.addGroup')}</button>
                        </div>
                    </div>
                    <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                    <ServiceTree parentId={null} level={0} />
                    </div>
                </div>
            </div>
        );
      case 'team':
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-accent">{t('settings.hairstylists.title')}</h3>
                        <button onClick={() => { setEditingHairstylist(null); setIsHairstylistModalOpen(true); }} className="flex items-center gap-2 px-3 py-1.5 bg-accent/20 text-accent rounded-lg font-semibold text-sm hover:bg-accent/30"><PlusIcon className="w-4 h-4"/> {t('settings.hairstylists.add')}</button>
                    </div>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {settings.hairstylists.map(h => (
                            <div key={h.id} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                                    {h.photoUrl ? <img src={h.photoUrl} alt={h.name} className="w-full h-full object-cover" /> : <UserIcon className="w-6 h-6 text-gray-400 m-2"/>}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{h.name}</p>
                                        <p className="text-sm text-gray-500 capitalize">{h.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => { setEditingHairstylist(h); setIsHairstylistModalOpen(true); }} className="text-gray-500 hover:text-accent"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDeleteHairstylist(h.id)} className="text-gray-500 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
      case 'studio':
        return <StudioTab />;
      case 'pos':
        return <POSTab />;
      case 'account':
        return (
            <div className="space-y-6 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
                        <h3 className="text-xl font-semibold mb-4 text-accent">{t('settings.plan.title')}</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center"><span className="font-medium">{t('settings.plan.current')}</span><span className="font-bold bg-accent/20 text-accent px-3 py-1 rounded-full text-sm">{t('settings.plan.professional')}</span></div>
                            <div className="flex justify-between items-center"><span className="font-medium">{t('settings.plan.generationsUsed')}</span><span className="font-bold">{settings.imageCount}</span></div>
                            <div className="flex justify-between items-center"><span className="font-medium">{t('settings.plan.totalGenerations')}</span><span className="font-bold">250</span></div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
                        <h3 className="text-xl font-semibold mb-4 text-accent flex items-center gap-2"><PhoneIcon className="w-5 h-5" /> {t('settings.sms.title')}</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label htmlFor="smsEnabled" className="font-medium">{t('settings.sms.enable')}</label>
                                <button
                                    type="button"
                                    onClick={() => setSmsFormState(s => ({...s, enabled: !s.enabled}))}
                                    className={`${smsFormState.enabled ? 'bg-accent' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
                                    role="switch"
                                    aria-checked={smsFormState.enabled}
                                >
                                    <span className={`${smsFormState.enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}/>
                                </button>
                            </div>

                            {smsFormState.enabled && (
                                <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="pt-2">
                                        <button onClick={handleSmsSave} className="w-full px-4 py-2 bg-accent text-white rounded-lg font-semibold">{t('settings.sms.save')}</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
                    <h3 className="text-xl font-semibold mb-2 text-accent">{t('settings.demo.title')}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings.demo.subtitle')}</p>
                    <div className="flex items-center justify-between">
                        <label htmlFor="demoDataEnabled" className="font-medium">{t('settings.demo.enable')}</label>
                        <button
                            type="button"
                            onClick={() => settings.setDemoDataEnabled(!settings.isDemoDataEnabled)}
                            className={`${settings.isDemoDataEnabled ? 'bg-accent' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
                            role="switch"
                            aria-checked={settings.isDemoDataEnabled}
                        >
                            <span className={`${settings.isDemoDataEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}/>
                        </button>
                    </div>
                </div>
            </div>
        );
      default:
        return null;
    }
  }


  return (
    <div className="p-4 sm:p-2 text-gray-900 dark:text-white animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{t('settings.title')}</h2>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {renderContent()}
      </div>
       
      {modalState.type === 'service' && <ServiceModal service={modalState.data as Service | undefined} parentId={modalState.parentId ?? null} onClose={() => setModalState({ type: null })} />}
      {modalState.type === 'group' && <ServiceGroupModal group={modalState.data as ServiceGroup | undefined} parentId={modalState.parentId ?? null} onClose={() => setModalState({ type: null })} />}
      {isHairstylistModalOpen && <HairstylistModal hairstylist={editingHairstylist} onClose={() => setIsHairstylistModalOpen(false)} />}
       
       <style>{`
          @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        `}</style>
    </div>
  );
};

const StudioTab: React.FC = () => {
    const { studioInitialGenerations, setStudioInitialGenerations, customHairstyles, deleteCustomHairstyle, t } = useSettings();
    const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
    const [editingStyle, setEditingStyle] = useState<CustomHairstyle | null>(null);

    const handleEdit = (style: CustomHairstyle) => {
        setEditingStyle(style);
        setIsStyleModalOpen(true);
    };

    const handleAdd = () => {
        setEditingStyle(null);
        setIsStyleModalOpen(true);
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm(t('settings.studio.deleteConfirm'))) {
            deleteCustomHairstyle(id);
        }
    }

    return (
        <>
            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
                    <h3 className="text-xl font-semibold mb-4 text-accent">{t('settings.studio.generation.title')}</h3>
                    <div>
                        <label htmlFor="generationCount" className="block text-sm font-medium mb-1">{t('settings.studio.generation.label')}</label>
                        <input 
                            type="number" 
                            id="generationCount" 
                            value={studioInitialGenerations} 
                            onChange={e => setStudioInitialGenerations(parseInt(e.target.value, 10))}
                            min="1"
                            max="8"
                            className="w-24 p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">{t('settings.studio.generation.description')}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-accent">{t('settings.studio.library.title')}</h3>
                        <button onClick={handleAdd} className="flex items-center gap-2 px-3 py-1.5 bg-accent/20 text-accent rounded-lg font-semibold text-sm hover:bg-accent/30"><PlusIcon className="w-4 h-4"/> {t('settings.studio.library.add')}</button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings.studio.library.description')}</p>
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                        {customHairstyles.length > 0 ? customHairstyles.map(style => (
                            <div key={style.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <img src={style.frontView.base64} alt={style.name} className="w-16 h-16 rounded-md object-cover bg-gray-300" />
                                    <span className="font-semibold">{style.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEdit(style)} className="text-gray-500 hover:text-accent"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDelete(style.id)} className="text-gray-500 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-gray-500 py-6">{t('settings.studio.library.empty')}</p>
                        )}
                    </div>
                </div>
            </div>
            {isStyleModalOpen && <CustomStyleModal style={editingStyle} onClose={() => setIsStyleModalOpen(false)} />}
        </>
    );
};

const POSTab: React.FC = () => {
    const { vatRate, setVatRate, t } = useSettings();

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
                <h3 className="text-xl font-semibold mb-4 text-accent">{t('settings.pos.title')}</h3>
                <div>
                    <label htmlFor="vatRate" className="block text-sm font-medium mb-1">{t('settings.pos.vatRateLabel')}</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            id="vatRate" 
                            value={vatRate} 
                            onChange={e => setVatRate(parseFloat(e.target.value))}
                            step="0.1"
                            min="0"
                            max="100"
                            className="w-24 p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                        />
                        <span>%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t('settings.pos.vatRateDescription')}</p>
                </div>
            </div>
        </div>
    );
}

const CustomStyleModal: React.FC<{style: CustomHairstyle | null, onClose: () => void}> = ({ style, onClose }) => {
    const { addCustomHairstyle, updateCustomHairstyle, t } = useSettings();
    const [name, setName] = useState(style?.name || '');
    const [images, setImages] = useState({
        frontView: style?.frontView,
        backView: style?.backView,
        leftView: style?.leftView,
        rightView: style?.rightView,
        topView: style?.topView,
    });

    const handleImageChange = (view: keyof typeof images, file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            setImages(prev => ({ ...prev, [view]: { base64, mimeType: file.type } }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !images.frontView) {
            alert(t('settings.studio.modal.error'));
            return;
        }

        const styleData: Omit<CustomHairstyle, 'id'> = { name, ...images };
        
        if (style) {
            updateCustomHairstyle({ ...style, ...styleData });
        } else {
            addCustomHairstyle(styleData);
        }
        onClose();
    };

    const ImageField: React.FC<{label: string, view: keyof typeof images}> = ({ label, view }) => {
        const inputRef = useRef<HTMLInputElement>(null);
        return (
            <div>
                <label className="block text-sm font-medium">{label}</label>
                <div className="mt-1 flex items-center gap-3">
                    {images[view] ? (
                        <img src={images[view]?.base64} alt={`${label} preview`} className="w-16 h-16 rounded-md object-cover bg-gray-300"/>
                    ) : (
                        <div className="w-16 h-16 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-xs text-center">{label}</div>
                    )}
                    <input type="file" accept="image/*" ref={inputRef} onChange={e => e.target.files && handleImageChange(view, e.target.files[0])} className="hidden"/>
                    <button type="button" onClick={() => inputRef.current?.click()} className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-600 rounded-md font-semibold">{t('settings.branding.upload')}</button>
                    {images[view] && <button type="button" onClick={() => setImages(p => ({...p, [view]: undefined}))} className="text-xs text-red-500 hover:underline">{t('settings.branding.remove')}</button>}
                </div>
            </div>
        )
    };
    
    return (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4"><CloseIcon className="w-6 h-6" /></button>
                <h2 className="text-xl font-bold mb-4 flex-shrink-0">{style ? t('settings.studio.modal.editTitle') : t('settings.studio.modal.addTitle')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-grow">
                    <div>
                        <label htmlFor="styleName" className="block text-sm font-medium">{t('settings.studio.modal.name')}</label>
                        <input type="text" id="styleName" value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ImageField label={t('settings.studio.modal.frontView')} view="frontView" />
                        <ImageField label={t('settings.studio.modal.backView')} view="backView" />
                        <ImageField label={t('settings.studio.modal.leftView')} view="leftView" />
                        <ImageField label={t('settings.studio.modal.rightView')} view="rightView" />
                        <ImageField label={t('settings.studio.modal.topView')} view="topView" />
                    </div>
                    <div className="pt-2 flex justify-end gap-3 flex-shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg font-semibold">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-accent text-white rounded-lg font-semibold">{t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ServiceModal: React.FC<{service?: Service, parentId: string | null, onClose: () => void}> = ({ service, parentId, onClose }) => {
    const { addService, updateService, t, currency } = useSettings();
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const duration = parseInt(formData.get('duration') as string, 10);
        const price = parseFloat(formData.get('price') as string);
        const parentIdValue = formData.get('parentId') as string;

        if (service) {
            updateService({ ...service, name, duration, price, parentId: parentIdValue || null });
        } else {
            addService({ name, duration, price, parentId: parentIdValue || null });
        }
        onClose();
    }
    return (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4"><CloseIcon className="w-6 h-6" /></button>
                <h2 className="text-xl font-bold mb-4">{service ? t('settings.modal.service.edit') : t('settings.modal.service.add')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="hidden" name="parentId" defaultValue={parentId ?? ''} />
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium">{t('settings.modal.service.name')}</label>
                        <input type="text" name="name" id="name" defaultValue={service?.name} required className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium">{t('settings.modal.service.duration')}</label>
                            <input type="number" name="duration" id="duration" defaultValue={service?.duration} required min="0" step="5" className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"/>
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium">{t('settings.modal.service.price', { currency })}</label>
                            <input type="number" name="price" id="price" defaultValue={service?.price} required min="0" step="0.01" className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"/>
                        </div>
                    </div>
                    <div className="pt-2 flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg font-semibold">{t('common.cancel')}</button><button type="submit" className="px-4 py-2 bg-accent text-white rounded-lg font-semibold">{t('common.save')}</button></div>
                </form>
            </div>
        </div>
    );
};

const ServiceGroupModal: React.FC<{group?: ServiceGroup, parentId: string | null, onClose: () => void}> = ({ group, parentId, onClose }) => {
    const { addServiceGroup, updateServiceGroup, t } = useSettings();
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const parentIdValue = formData.get('parentId') as string;

        if (group) {
            updateServiceGroup({ ...group, name, parentId: parentIdValue || null });
        } else {
            addServiceGroup({ name, parentId: parentIdValue || null });
        }
        onClose();
    }
    return (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4"><CloseIcon className="w-6 h-6" /></button>
                <h2 className="text-xl font-bold mb-4">{group ? t('settings.modal.group.edit') : t('settings.modal.group.add')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="hidden" name="parentId" defaultValue={parentId ?? ''} />
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium">{t('settings.modal.group.name')}</label>
                        <input type="text" name="name" id="name" defaultValue={group?.name} required className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"/>
                    </div>
                    <div className="pt-2 flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg font-semibold">{t('common.cancel')}</button><button type="submit" className="px-4 py-2 bg-accent text-white rounded-lg font-semibold">{t('common.save')}</button></div>
                </form>
            </div>
        </div>
    );
};

const HairstylistModal: React.FC<{hairstylist: Hairstylist | null, onClose: () => void}> = ({ hairstylist, onClose }) => {
    const { addHairstylist, updateHairstylist, t } = useSettings();
    const [photo, setPhoto] = useState<string | null>(hairstylist?.photoUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const ILLUSTRATIONS = [
      'https://api.dicebear.com/8.x/adventurer/svg?seed=Mittens',
      'https://api.dicebear.com/8.x/adventurer/svg?seed=Sassy',
      'https://api.dicebear.com/8.x/adventurer/svg?seed=Leo',
      'https://api.dicebear.com/8.x/adventurer/svg?seed=Precious',
      'https://api.dicebear.com/8.x/adventurer/svg?seed=Loki'
    ];

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const type = formData.get('type') as HairstylistType;
        const photoUrl = photo || undefined;

        if (hairstylist) {
            updateHairstylist({ ...hairstylist, name, type, photoUrl });
        } else {
            addHairstylist({ name, type, photoUrl });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4"><CloseIcon className="w-6 h-6" /></button>
                <h2 className="text-xl font-bold mb-4">{hairstylist ? t('settings.modal.hairstylist.edit') : t('settings.modal.hairstylist.add')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium">{t('settings.modal.hairstylist.photo')}</label>
                        <div className="mt-1 flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                                {photo ? <img src={photo} alt="Preview" className="w-full h-full object-cover" /> : <UserIcon className="w-8 h-8 text-gray-400" />}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-600 rounded-md font-semibold">{t('settings.branding.upload')}</button>
                            {photo && <button type="button" onClick={() => setPhoto(null)} className="text-sm text-red-500 hover:underline">{t('settings.branding.remove')}</button>}
                        </div>
                        <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">{t('settings.modal.hairstylist.orSelect')}</p>
                            <div className="flex gap-2">
                                {ILLUSTRATIONS.map(url => (
                                    <button key={url} type="button" onClick={() => setPhoto(url)} className={`w-10 h-10 rounded-full overflow-hidden ring-2 ${photo === url ? 'ring-accent' : 'ring-transparent'}`}>
                                        <img src={url} alt="Illustration" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium">{t('settings.modal.hairstylist.name')}</label>
                        <input type="text" name="name" id="name" defaultValue={hairstylist?.name} required className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"/>
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium">{t('settings.modal.hairstylist.type')}</label>
                        <select name="type" id="type" defaultValue={hairstylist?.type || 'expert'} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg">
                            <option value="expert">{t('settings.modal.hairstylist.type.expert')}</option>
                            <option value="station">{t('settings.modal.hairstylist.type.station')}</option>
                        </select>
                    </div>
                    <div className="pt-2 flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg font-semibold">{t('common.cancel')}</button><button type="submit" className="px-4 py-2 bg-accent text-white rounded-lg font-semibold">{t('common.save')}</button></div>
                </form>
            </div>
        </div>
    );
};


export default SettingsPage;