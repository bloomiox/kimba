import React, { useState, useMemo } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { PlusIcon, UserIcon } from '../common/Icons';
import Input from '../common/Input';
import Button from '../common/Button';

interface ClientSelectorProps {
  onClientSelected: (clientId: string) => void;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ onClientSelected }) => {
  const { clients, addClient, t } = useSettings();
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // FIX: This function needs to be async to await the creation of a new client.
  const handleAddNewClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    if (name && email) {
      // FIX: Await the promise from addClient to get the new client's ID.
      const newClient = await addClient({ name, email });
      onClientSelected(newClient.id);
    }
  };

  const filteredClients = useMemo(
    () => clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [clients, searchTerm]
  );

  return (
    <div className="p-8 flex flex-col items-center justify-center h-full">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
        {t('studio.clientSelector.title')}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-md">
        {t('studio.clientSelector.subtitle')}
      </p>

      <div className="w-full max-w-lg">
        {!showNewClientForm ? (
          <>
            <Input
              type="search"
              placeholder={t('studio.clientSelector.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full mb-4"
            />
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {filteredClients.map(client => (
                <button
                  key={client.id}
                  onClick={() => onClientSelected(client.id)}
                  className="w-full flex items-center gap-4 p-4 text-left bg-gray-100/50 dark:bg-gray-700/50 hover:bg-accent/10 rounded-lg transition-colors"
                >
                  <UserIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  <span className="font-semibold">{client.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowNewClientForm(true)}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-accent/20 text-accent rounded-lg font-semibold hover:bg-accent/30 transition-colors"
              >
                <PlusIcon className="w-5 h-5" /> {t('studio.clientSelector.addNew')}
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleAddNewClient} className="space-y-4">
            <h3 className="font-bold text-lg text-center">
              {t('studio.clientSelector.newClientDetails')}
            </h3>
            <Input
              type="text"
              name="name"
              placeholder={t('studio.clientSelector.fullName')}
              required
            />
            <Input
              type="email"
              name="email"
              placeholder={t('studio.clientSelector.email')}
              required
            />
            <div className="flex justify-end gap-3">
              <Button type="button" onClick={() => setShowNewClientForm(false)} variant="secondary">
                {t('common.cancel')}
              </Button>
              <Button type="submit">{t('studio.clientSelector.saveAndContinue')}</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ClientSelector;
