import React, { useState, useMemo } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { mapToAccentColor } from '../../utils/colorUtils';
import { UserIcon, PlusIcon, ChevronRightIcon, MagnifyingGlassIcon, FilterIcon } from '../common/Icons';
import type { Client, Appointment } from '../../types';
import ClientDetailPage from './ClientDetailPage';
import ClientModal from './ClientModal';

const ClientsPage: React.FC = () => {
  const { clients, appointments, deleteClient, t } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [sortField, setSortField] = useState<'name' | 'email' | 'createdAt'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<'all' | 'withAppointments' | 'withoutAppointments'>('all');

  const filteredClients = useMemo(() => {
    let result = clients.filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Apply filter
    if (filterType === 'withAppointments') {
      result = result.filter(client => 
        appointments.some(app => app.clientId === client.id)
      );
    } else if (filterType === 'withoutAppointments') {
      result = result.filter(client => 
        !appointments.some(app => app.clientId === client.id)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'email') {
        comparison = (a.email || '').localeCompare(b.email || '');
      } else if (sortField === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [clients, appointments, searchTerm, sortField, sortDirection, filterType]);

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
  
  const handleSort = (field: 'name' | 'email' | 'createdAt') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('clients.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg ${mapToAccentColor('focus:ring-2 focus:ring-accent-500 focus:border-accent-500')} transition-all`}
            />
          </div>
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className={`px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg ${mapToAccentColor('focus:ring-2 focus:ring-accent-500 focus:border-accent-500')} transition-all appearance-none pr-8`}
            >
              <option value="all">{t('clients.filter.all')}</option>
              <option value="withAppointments">{t('clients.filter.withAppointments')}</option>
              <option value="withoutAppointments">{t('clients.filter.withoutAppointments')}</option>
            </select>
            <FilterIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
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
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-semibold text-gray-700 dark:text-gray-300">
              <div className="col-span-5 flex items-center cursor-pointer" onClick={() => handleSort('name')}>
                <span>{t('clients.table.name')}</span>
                {sortField === 'name' && (
                  <svg className={`w-4 h-4 ml-1 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </div>
              <div className="col-span-4 flex items-center cursor-pointer" onClick={() => handleSort('email')}>
                <span>{t('clients.table.email')}</span>
                {sortField === 'email' && (
                  <svg className={`w-4 h-4 ml-1 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </div>
              <div className="col-span-2 flex items-center cursor-pointer" onClick={() => handleSort('createdAt')}>
                <span>{t('clients.table.created')}</span>
                {sortField === 'createdAt' && (
                  <svg className={`w-4 h-4 ml-1 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </div>
              <div className="col-span-1"></div>
            </div>
            {filteredClients.map(client => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`w-full grid grid-cols-12 gap-4 items-center p-4 bg-gray-100/50 dark:bg-gray-900/40 ${mapToAccentColor('hover:bg-accent-50 dark:hover:bg-accent-900/20')} rounded-lg transition-all text-left group hover:shadow-sm`}
              >
                <div className="col-span-5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {client.photoUrl ? (
                        <img src={client.photoUrl} alt={client.name} className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white truncate">{client.name}</p>
                  </div>
                </div>
                <div className="col-span-4">
                  <p className="text-gray-600 dark:text-gray-400 truncate">{client.email || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="col-span-1 flex justify-end">
                  <ChevronRightIcon className={`w-5 h-5 text-gray-400 dark:text-gray-500 ${mapToAccentColor('group-hover:text-accent-500')} transition-colors`}/>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{t('clients.empty.title')}</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {searchTerm ? t('clients.empty.searchSubtitle') : t('clients.empty.subtitle')}
            </p>
            <button
              onClick={() => handleOpenModal(null)}
              className={`mt-4 flex items-center gap-2 px-4 py-2 ${mapToAccentColor('bg-accent-500 hover:bg-accent-600')} rounded-lg font-semibold text-white transition-colors shadow-sm hover:shadow-md mx-auto`}
            >
              <PlusIcon className="w-5 h-5" />
              <span>{t('clients.newClient')}</span>
            </button>
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