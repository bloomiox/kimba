import React, { useState, useRef, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { mapToAccentColor } from '../../utils/colorUtils';
import { CloseIcon, UserIcon } from '../common/Icons';
import type { Client } from '../../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
}

const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, client }) => {
  // FIX: The 'updateClient' method was missing from the SettingsContextType.
  // It has been added to the context to resolve this error.
  const { addClient, updateClient, t } = useSettings();
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset photo state when modal opens for a specific client or for a new one
    setPhoto(client?.photoUrl || null);
  }, [client, isOpen]);

  if (!isOpen) return null;

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
    const clientData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      notes: formData.get('notes') as string,
      photoUrl: photo || undefined,
    };

    if (client) {
      updateClient({ ...client, ...clientData });
    } else {
      addClient(clientData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {client ? t('clients.modal.editTitle') : t('clients.modal.addTitle')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">{t('clients.modal.photo')}</label>
            <div className="mt-1 flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                {photo ? (
                  <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`px-3 py-1.5 text-sm ${mapToAccentColor('bg-accent-500 hover:bg-accent-600')} text-white rounded-md font-semibold transition-colors`}
              >
                {t('settings.branding.upload')}
              </button>
              {photo && (
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors hover:underline"
                >
                  {t('settings.branding.remove')}
                </button>
              )}
            </div>
          </div>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('clients.modal.fullName')}
            </label>
            <input
              type="text"
              name="name"
              id="name"
              defaultValue={client?.name}
              required
              className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('clients.modal.email')}
            </label>
            <input
              type="email"
              name="email"
              id="email"
              defaultValue={client?.email}
              required
              className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('clients.modal.phone')}
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              defaultValue={client?.phone}
              className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('clients.modal.address')}
            </label>
            <input
              type="text"
              name="address"
              id="address"
              defaultValue={client?.address}
              className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('clients.modal.notes')}
            </label>
            <textarea
              name="notes"
              id="notes"
              defaultValue={client?.notes}
              rows={3}
              className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all"
            ></textarea>
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold text-gray-800 dark:text-gray-200"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className={`px-6 py-2 ${mapToAccentColor('bg-accent-500 hover:bg-accent-600')} rounded-lg font-semibold text-white transition-colors`}
            >
              {t('clients.modal.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
