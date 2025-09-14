import React, { useState, useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';
// FIX: Updated import path to use the common Icons component.
import { UserIcon, PlusIcon, CloseIcon, ChevronRightIcon, MapPinIcon } from './common/Icons';
import type { Client } from '../types';
import ClientDetailPage from './ClientDetailPage';

const ClientsPage: React.FC = () => {
  const { clients, addClient, t } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = useMemo(() => {
    return clients
      .filter(client => client.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [clients, searchTerm]);
  
  const handleAddClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const notes = formData.get('notes') as string;
    if (name && email) {
      addClient({ name, email, phone, address, notes });
      setIsModalOpen(false);
    }
  };
  
  if (selectedClient) {
    return <ClientDetailPage client={selectedClient} onBack={() => setSelectedClient(null)} />;
  }

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="flex-shrink-0 flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-3xl font-bold">{t('clients.title')}</h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder={t('clients.searchPlaceholder')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">{t('clients.newClient')}</span>
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
        {filteredClients.length > 0 ? (
          <div className="space-y-3">
            {filteredClients.map(client => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className="w-full flex items-center justify-between p-4 bg-gray-100/50 dark:bg-gray-900/40 hover:bg-gray-100 dark:hover:bg-gray-900/80 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {client.photoUrl ? (
                        <img src={client.photoUrl} alt={client.name} className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{client.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{client.email}</p>
                  </div>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500"/>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{t('clients.empty.title')}</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {searchTerm ? t('clients.empty.searchSubtitle') : t('clients.empty.subtitle')}
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 relative animate-fade-in">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white"><CloseIcon className="w-6 h-6" /></button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('clients.modal.addTitle')}</h2>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('clients.modal.fullName')}</label>
                <input type="text" name="name" id="name" required className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('clients.modal.email')}</label>
                <input type="email" name="email" id="email" required className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('clients.modal.phone')}</label>
                <input type="tel" name="phone" id="phone" className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('clients.modal.address')}</label>
                <input type="text" name="address" id="address" className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('clients.modal.notes')}</label>
                <textarea name="notes" id="notes" rows={3} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"></textarea>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold text-gray-800 dark:text-gray-200">{t('common.cancel')}</button>
                <button type="submit" className="px-6 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white">{t('clients.modal.save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;