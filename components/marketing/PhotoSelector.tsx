import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Client, Lookbook, ClientSocialConsent } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import {
  MagnifyingGlassIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ArrowRightIcon,
} from '../common/Icons';

interface PhotoSelectorProps {
  onNext: (selectedPhotos: Lookbook[], client: Client) => void;
}

const PhotoSelector: React.FC<PhotoSelectorProps> = ({ onNext }) => {
  const { settings, t } = useSettings();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<Lookbook[]>([]);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [clientLookbooks, setClientLookbooks] = useState<Lookbook[]>([]);

  // Mock clients data - in real app this would come from context/API
  const mockClients: Client[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1234567890',
      photoUrl:
        'https://images.unsplash.com/photo-1494790108755-2616b612b1fd?w=64&h=64&fit=crop&crop=face',
      createdAt: '2024-01-15T10:00:00Z',
      socialMediaConsent: {
        hasConsented: true,
        consentDate: new Date('2024-01-15'),
        allowedPlatforms: ['instagram', 'facebook'],
        consentType: 'general',
      },
    },
    {
      id: '2',
      name: 'Emily Davis',
      email: 'emily@example.com',
      phone: '+1234567891',
      photoUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
      createdAt: '2024-01-10T14:30:00Z',
      socialMediaConsent: {
        hasConsented: false,
        allowedPlatforms: [],
        consentType: 'per_post',
      },
    },
    {
      id: '3',
      name: 'Jessica Chen',
      email: 'jessica@example.com',
      phone: '+1234567892',
      photoUrl:
        'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=64&h=64&fit=crop&crop=face',
      createdAt: '2024-01-05T09:15:00Z',
      socialMediaConsent: {
        hasConsented: true,
        consentDate: new Date('2024-01-05'),
        allowedPlatforms: ['instagram', 'facebook', 'tiktok'],
        consentType: 'general',
      },
    },
  ];

  // Mock lookbooks data
  const mockLookbooks: Lookbook[] = [
    {
      id: '1',
      clientId: '1',
      userImage: { base64: '', mimeType: 'image/jpeg' },
      baseStyle: {
        src: 'https://images.unsplash.com/photo-1560869713-4d5d1c84ce5e?w=300&h=400&fit=crop',
        prompt: 'Elegant bob cut',
        hairstyleId: 'bob1',
        hairstyleName: 'Classic Bob',
      },
      finalImage: {
        src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop',
        prompt: 'Refined bob with highlights',
        hairstyleId: 'bob1',
        hairstyleName: 'Classic Bob with Highlights',
      },
      angleViews: [],
      createdAt: '2024-01-15T11:00:00Z',
    },
    {
      id: '2',
      clientId: '1',
      userImage: { base64: '', mimeType: 'image/jpeg' },
      baseStyle: {
        src: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=400&fit=crop',
        prompt: 'Curly updo',
        hairstyleId: 'updo1',
        hairstyleName: 'Elegant Updo',
      },
      finalImage: {
        src: 'https://images.unsplash.com/photo-1503951458645-643d53bfd90f?w=300&h=400&fit=crop',
        prompt: 'Sophisticated curly updo',
        hairstyleId: 'updo1',
        hairstyleName: 'Sophisticated Updo',
      },
      angleViews: [],
      createdAt: '2024-01-10T15:30:00Z',
    },
    {
      id: '3',
      clientId: '3',
      userImage: { base64: '', mimeType: 'image/jpeg' },
      baseStyle: {
        src: 'https://images.unsplash.com/photo-1605497787845-f03b031b72ee?w=300&h=400&fit=crop',
        prompt: 'Layered cut',
        hairstyleId: 'layers1',
        hairstyleName: 'Layered Style',
      },
      finalImage: {
        src: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=300&h=400&fit=crop',
        prompt: 'Modern layered cut with color',
        hairstyleId: 'layers1',
        hairstyleName: 'Modern Layers',
      },
      angleViews: [],
      createdAt: '2024-01-05T16:45:00Z',
    },
  ];

  useEffect(() => {
    // Filter clients based on search query
    const filtered = mockClients.filter(
      client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [searchQuery]);

  useEffect(() => {
    if (selectedClient) {
      // Get lookbooks for selected client
      const lookbooks = mockLookbooks.filter(lb => lb.clientId === selectedClient.id);
      setClientLookbooks(lookbooks);
    } else {
      setClientLookbooks([]);
    }
  }, [selectedClient]);

  const handleClientSelect = (client: Client) => {
    // Check if client has consented
    if (!client.socialMediaConsent?.hasConsented) {
      setSelectedClient(client);
      setShowConsentModal(true);
      return;
    }

    setSelectedClient(client);
    setSelectedPhotos([]);
  };

  const handleConsentGrant = () => {
    if (selectedClient) {
      // In real app, this would update the client's consent in the database
      const updatedClient: Client = {
        ...selectedClient,
        socialMediaConsent: {
          hasConsented: true,
          consentDate: new Date(),
          allowedPlatforms: ['instagram', 'facebook', 'tiktok'],
          consentType: 'general',
        },
      };
      setSelectedClient(updatedClient);
    }
    setShowConsentModal(false);
  };

  const handlePhotoToggle = (lookbook: Lookbook) => {
    setSelectedPhotos(prev => {
      const isSelected = prev.some(p => p.id === lookbook.id);
      if (isSelected) {
        return prev.filter(p => p.id !== lookbook.id);
      } else {
        return [...prev, lookbook];
      }
    });
  };

  const handleNext = () => {
    if (selectedClient && selectedPhotos.length > 0) {
      onNext(selectedPhotos, selectedClient);
    }
  };

  const isPhotoSelected = (lookbook: Lookbook) => {
    return selectedPhotos.some(p => p.id === lookbook.id);
  };

  return (
    <div className="space-y-6">
      {/* Client Selection */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('social.selectClient')}
          </h3>

          {/* Search */}
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t('social.searchClients')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Client List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map(client => (
              <div
                key={client.id}
                onClick={() => handleClientSelect(client)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedClient?.id === client.id
                    ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-accent-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {client.photoUrl ? (
                    <img
                      src={client.photoUrl}
                      alt={client.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {client.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {client.email}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {client.socialMediaConsent?.hasConsented ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Photo Selection */}
      {selectedClient && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('social.selectPhotos', { clientName: selectedClient.name })}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedPhotos.length} {t('common.selected')}
              </span>
            </div>

            {clientLookbooks.length === 0 ? (
              <div className="text-center py-8">
                <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('social.noPhotosAvailable')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {clientLookbooks.map(lookbook => (
                  <div
                    key={lookbook.id}
                    onClick={() => handlePhotoToggle(lookbook)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden transition-all ${
                      isPhotoSelected(lookbook)
                        ? 'ring-4 ring-accent-500 ring-opacity-50'
                        : 'hover:ring-2 hover:ring-accent-300'
                    }`}
                  >
                    <img
                      src={lookbook.finalImage.src}
                      alt={lookbook.finalImage.hairstyleName}
                      className="w-full h-40 object-cover"
                    />

                    {/* Selection overlay */}
                    {isPhotoSelected(lookbook) && (
                      <div className="absolute inset-0 bg-accent-600 bg-opacity-20 flex items-center justify-center">
                        <CheckCircleIcon className="h-8 w-8 text-white" />
                      </div>
                    )}

                    {/* Photo info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                      <p className="text-white text-sm font-medium truncate">
                        {lookbook.finalImage.hairstyleName}
                      </p>
                      <p className="text-white text-xs opacity-80">
                        {new Date(lookbook.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Continue Button */}
            {selectedPhotos.length > 0 && (
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleNext}
                  className="flex items-center space-x-2 bg-accent-600 hover:bg-accent-700"
                >
                  <span>{t('social.continueToCompose')}</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Consent Modal */}
      {showConsentModal && selectedClient && (
        <Modal
          isOpen={true}
          onClose={() => setShowConsentModal(false)}
          title={t('social.consentRequired')}
        >
          <div className="p-6">
            <div className="flex items-start space-x-3 mb-6">
              <ExclamationTriangleIcon className="h-6 w-6 text-amber-500 mt-1" />
              <div>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  {t('social.consentMessage', { clientName: selectedClient.name })}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('social.consentDetails')}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button onClick={() => setShowConsentModal(false)} variant="outline">
                {t('common.cancel')}
              </Button>
              <Button onClick={handleConsentGrant} className="bg-accent-600 hover:bg-accent-700">
                {t('social.grantConsent')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PhotoSelector;
