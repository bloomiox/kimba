import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { SocialMediaConnection } from '../../types';
import { socialMediaOAuthService } from '../../services/socialMediaOAuthService';
import { socialMediaApiService } from '../../services/socialMediaApiService';
import { socialMediaConfigService } from '../../services/socialMediaConfigService';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import {
  LinkIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  SettingsIcon,
} from '../common/Icons';

interface PlatformInfo {
  id: 'instagram' | 'facebook' | 'tiktok';
  name: string;
  description: string;
  color: string;
  icon: string;
}

const PLATFORMS: PlatformInfo[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Share photos and stories to your Instagram Business account',
    color: 'from-pink-500 to-purple-600',
    icon: '📷',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Post to your Facebook Business Page',
    color: 'from-blue-500 to-blue-700',
    icon: '👥',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Share videos to your TikTok Business account',
    color: 'from-gray-800 to-gray-900',
    icon: '🎵',
  },
];

const ConnectionManager: React.FC = () => {
  const { socialMedia, updateSettings, t } = useSettings();
  const [showDisconnectModal, setShowDisconnectModal] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [showSetupModal, setShowSetupModal] = useState<string | null>(null);

  const handleConnect = async (platform: PlatformInfo) => {
    setIsConnecting(platform.id);

    try {
      // Check if platform is configured
      if (!socialMediaConfigService.isPlatformConfigured(platform.id)) {
        setShowSetupModal(platform.id);
        setIsConnecting(null);
        return;
      }

      // Get OAuth authorization URL
      const authUrl = socialMediaOAuthService.getAuthorizationUrl(platform.id);

      // Open OAuth flow in popup or redirect
      const popup = window.open(
        authUrl,
        `oauth_${platform.id}`,
        'width=600,height=600,scrollbars=yes,resizable=yes'
      );

      // Monitor popup for completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setIsConnecting(null);
          // Refresh page to get updated connection status
          window.location.reload();
        }
      }, 1000);
    } catch (error) {
      console.error(`Failed to connect to ${platform.name}:`, error);
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    try {
      const connection = getConnection(platformId);
      if (connection) {
        // Revoke token
        await socialMediaOAuthService.revokeToken(platformId as any, connection.accessToken);
        // Remove from API service
        socialMediaApiService.removeConnection(platformId);
      }

      // Update settings to remove connection
      await updateSettings({
        socialMedia: {
          ...socialMedia,
          [platformId]: null,
        },
      });

      setShowDisconnectModal(null);
    } catch (error) {
      console.error(`Failed to disconnect from ${platformId}:`, error);
    }
  };

  const getConnection = (platformId: string): SocialMediaConnection | null => {
    return socialMedia?.[platformId as keyof typeof socialMedia] || null;
  };

  const isConnected = (platformId: string) => {
    return Boolean(getConnection(platformId));
  };

  const getConnectionStatus = (platformId: string) => {
    const connection = getConnection(platformId);
    if (connection) {
      return {
        status: 'connected' as const,
        username: connection.username,
      };
    }
    return { status: 'disconnected' as const };
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('social.connectPlatforms')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t('social.connectPlatformsDesc')}
          </p>

          <div className="space-y-4">
            {PLATFORMS.map(platform => {
              const connectionStatus = getConnectionStatus(platform.id);
              const connecting = isConnecting === platform.id;
              const configured = socialMediaConfigService.isPlatformConfigured(platform.id);

              return (
                <div
                  key={platform.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${platform.color} flex items-center justify-center text-2xl`}
                    >
                      {platform.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{platform.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {platform.description}
                      </p>
                      {connectionStatus.status === 'connected' && (
                        <div className="flex items-center space-x-1 mt-1">
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600 dark:text-green-400">
                            {t('social.connectedAs', { username: connectionStatus.username })}
                          </span>
                        </div>
                      )}
                      {!configured && (
                        <div className="flex items-center space-x-1 mt-1">
                          <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
                          <span className="text-sm text-amber-600 dark:text-amber-400">
                            {t('social.notConfigured')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {connectionStatus.status === 'connected' ? (
                      <>
                        <Button
                          onClick={() => setShowDisconnectModal(platform.id)}
                          variant="secondary"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => handleConnect(platform)} variant="secondary">
                          {t('social.refresh')}
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleConnect(platform)}
                        disabled={connecting}
                        className="flex items-center space-x-2 bg-accent-600 hover:bg-accent-700"
                      >
                        {connecting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{t('common.connecting')}</span>
                          </>
                        ) : (
                          <>
                            <LinkIcon className="h-4 w-4" />
                            <span>{configured ? t('social.connect') : t('social.setup')}</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* OAuth Information */}
      <Card>
        <div className="p-6">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {t('social.oauthInfo')}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {t('social.oauthInfoDesc')}
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1 ml-4">
                <li>• {t('social.permissionPost')}</li>
                <li>• {t('social.permissionRead')}</li>
                <li>• {t('social.permissionAnalytics')}</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Disconnect Confirmation Modal */}
      {showDisconnectModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowDisconnectModal(null)}
          title={t('social.disconnectPlatform')}
        >
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-amber-500" />
              <p className="text-gray-600 dark:text-gray-300">
                {t('social.disconnectWarning', {
                  platform: PLATFORMS.find(p => p.id === showDisconnectModal)?.name,
                })}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button onClick={() => setShowDisconnectModal(null)} variant="secondary">
                {t('common.cancel')}
              </Button>
              <Button
                onClick={() => handleDisconnect(showDisconnectModal)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {t('social.disconnect')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Setup Instructions Modal */}
      {showSetupModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowSetupModal(null)}
          title={`${PLATFORMS.find(p => p.id === showSetupModal)?.name} Setup Required`}
        >
          <div className="p-6">
            {(() => {
              const platform = PLATFORMS.find(p => p.id === showSetupModal);
              const instructions = socialMediaConfigService.getSetupInstructions(
                showSetupModal as any
              );

              return (
                <div>
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {instructions.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      You need to configure API credentials to connect {platform?.name}.
                    </p>
                  </div>

                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Setup Steps:</h5>
                    <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      {instructions.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Redirect URI:
                    </p>
                    <code className="text-xs text-gray-600 dark:text-gray-300 break-all">
                      {instructions.redirectUri}
                    </code>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={() => window.open(instructions.documentsUrl, '_blank')}
                      variant="secondary"
                      className="flex items-center space-x-2"
                    >
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      <span>View Documentation</span>
                    </Button>

                    <Button onClick={() => setShowSetupModal(null)} variant="primary">
                      Got it
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ConnectionManager;
