import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Client, Lookbook, SocialPost } from '../../types';
import ConnectionManager from './ConnectionManager';
import PhotoSelector from './PhotoSelector';
import PostComposer from './PostComposer';
import PostHistory from './PostHistory';
import Card from '../common/Card';
import Button from '../common/Button';
import { LinkIcon, PhotoIcon, PencilSquareIcon, ClockIcon, CheckCircleIcon } from '../common/Icons';

type SocialMediaView = 'overview' | 'connect' | 'compose' | 'history';
type ComposeStep = 'select-photos' | 'compose-post';

const SocialMediaTab: React.FC = () => {
  const [activeView, setActiveView] = useState<SocialMediaView>('overview');
  const [composeStep, setComposeStep] = useState<ComposeStep>('select-photos');
  const [selectedPhotos, setSelectedPhotos] = useState<Lookbook[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { settings, t } = useSettings();

  const handlePhotosSelected = (photos: Lookbook[], client: Client) => {
    setSelectedPhotos(photos);
    setSelectedClient(client);
    setComposeStep('compose-post');
  };

  const handlePostPublished = (post: SocialPost) => {
    // Reset compose flow
    setSelectedPhotos([]);
    setSelectedClient(null);
    setComposeStep('select-photos');
    // Navigate to history to show the published post
    setActiveView('history');
  };

  const handleBackToPhotoSelection = () => {
    setComposeStep('select-photos');
  };

  const startCompose = () => {
    setActiveView('compose');
    setComposeStep('select-photos');
    setSelectedPhotos([]);
    setSelectedClient(null);
  };

  // Check if any social media platforms are connected
  const hasConnections = Boolean(
    settings?.socialMedia?.instagram ||
      settings?.socialMedia?.facebook ||
      settings?.socialMedia?.tiktok
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Connection Status Overview */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('social.connectionStatus')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Instagram Status */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div
                className={`w-3 h-3 rounded-full ${settings?.socialMedia?.instagram ? 'bg-green-500' : 'bg-gray-400'}`}
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Instagram</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {settings?.socialMedia?.instagram
                    ? t('social.connected')
                    : t('social.notConnected')}
                </p>
              </div>
            </div>

            {/* Facebook Status */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div
                className={`w-3 h-3 rounded-full ${settings?.socialMedia?.facebook ? 'bg-green-500' : 'bg-gray-400'}`}
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Facebook</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {settings?.socialMedia?.facebook
                    ? t('social.connected')
                    : t('social.notConnected')}
                </p>
              </div>
            </div>

            {/* TikTok Status */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div
                className={`w-3 h-3 rounded-full ${settings?.socialMedia?.tiktok ? 'bg-green-500' : 'bg-gray-400'}`}
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">TikTok</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {settings?.socialMedia?.tiktok ? t('social.connected') : t('social.notConnected')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setActiveView('connect')}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <LinkIcon className="h-4 w-4" />
              <span>{t('social.managePlatforms')}</span>
            </Button>

            {hasConnections && (
              <>
                <Button
                  onClick={startCompose}
                  className="flex items-center space-x-2 bg-accent-600 hover:bg-accent-700"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  <span>{t('social.createPost')}</span>
                </Button>

                <Button
                  onClick={() => setActiveView('history')}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <ClockIcon className="h-4 w-4" />
                  <span>{t('social.postHistory')}</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      {hasConnections && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('social.quickActions')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={startCompose}
                className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent-500 cursor-pointer transition-colors"
              >
                <PhotoIcon className="h-8 w-8 text-gray-400 mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {t('social.shareTransformation')}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('social.shareTransformationDesc')}
                </p>
              </div>

              <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg opacity-50">
                <ClockIcon className="h-8 w-8 text-gray-400 mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {t('social.schedulePost')}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('social.comingSoon')}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Getting Started */}
      {!hasConnections && (
        <Card>
          <div className="p-6 text-center">
            <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('social.getStarted')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{t('social.getStartedDesc')}</p>
            <Button
              onClick={() => setActiveView('connect')}
              className="bg-accent-600 hover:bg-accent-700"
            >
              {t('social.connectFirstPlatform')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* View Navigation */}
      {activeView !== 'overview' && (
        <div className="flex items-center space-x-4 mb-6">
          <Button onClick={() => setActiveView('overview')} variant="outline" size="sm">
            ← {t('common.back')}
          </Button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {activeView === 'connect' && t('social.managePlatforms')}
            {activeView === 'compose' && t('social.createPost')}
            {activeView === 'history' && t('social.postHistory')}
          </h2>
        </div>
      )}

      {/* View Content */}
      {activeView === 'overview' && renderOverview()}
      {activeView === 'connect' && <ConnectionManager />}
      {activeView === 'compose' && (
        <>
          {composeStep === 'select-photos' && <PhotoSelector onNext={handlePhotosSelected} />}
          {composeStep === 'compose-post' && selectedClient && selectedPhotos.length > 0 && (
            <PostComposer
              selectedPhotos={selectedPhotos}
              client={selectedClient}
              onBack={handleBackToPhotoSelection}
              onPost={handlePostPublished}
            />
          )}
        </>
      )}
      {activeView === 'history' && <PostHistory />}
    </div>
  );
};

export default SocialMediaTab;
