import React, { useState, useMemo } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { mapToAccentColor } from '../../utils/colorUtils';
import { UserIcon, PlusIcon, ChevronRightIcon } from '../common/Icons';
import type { Client } from '../../types';
import ClientDetailPage from './ClientDetailPage';
import ClientModal from './ClientModal';

const ClientsPage: React.FC = () => {
  const { clients, deleteClient, t } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = useMemo(() => {
    return clients
      .filter(client => client.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [clients, searchTerm]);

  const handleOpenModal = (client: Client | null = null) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = (clientId: string) => {
      const clientName = clients.find(c => c.id === clientId)?.name || 'this client';
      if (window.confirm(t('clients.deleteConfirm', { clientName }))) {
          deleteClient(clientId);
          setSelectedClient(null);
      }
  };
  
  if (selectedClient) {
    return <ClientDetailPage 
      client={selectedClient} 
      onBack={() => setSelectedClient(null)} 
      onEdit={(clientToEdit) => {
        // Go back to the list view and then open the edit modal
        setSelectedClient(null);
        setTimeout(() => handleOpenModal(clientToEdit), 50);
      }}
      onDelete={handleDeleteClient}
    />;
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
            className={`w-full sm:w-64 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg ${mapToAccentColor('focus:ring-2 focus:ring-accent-500 focus:border-accent-500')} transition-all`}
          />
          <button
            onClick={() => handleOpenModal(null)}
            className={`flex items-center gap-2 px-4 py-2 ${mapToAccentColor('bg-accent-500 hover:bg-accent-600')} rounded-lg font-semibold text-white transition-colors shadow-sm hover:shadow-md`}
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
                className={`w-full flex items-center justify-between p-4 bg-gray-100/50 dark:bg-gray-900/40 ${mapToAccentColor('hover:bg-accent-50 dark:hover:bg-accent-900/20')} rounded-lg transition-all text-left group hover:shadow-sm`}
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
                <ChevronRightIcon className={`w-5 h-5 text-gray-400 dark:text-gray-500 ${mapToAccentColor('group-hover:text-accent-500')} transition-colors`}/>
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

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        client={editingClient}
      />
    </div>
  );
};

export default ClientsPage;