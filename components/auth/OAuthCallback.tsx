import React, { useEffect, useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { socialMediaOAuthService } from '../../services/socialMediaOAuthService';
import { socialMediaApiService } from '../../services/socialMediaApiService';
import LoadingSpinner from '../common/LoadingSpinner';

interface OAuthCallbackProps {
  platform: 'instagram' | 'facebook' | 'tiktok';
}

const OAuthCallback: React.FC<OAuthCallbackProps> = ({ platform }) => {
  const { updateSettings, t } = useSettings();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get code and state from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const errorParam = urlParams.get('error');

        // Check for OAuth errors
        if (errorParam) {
          throw new Error(`OAuth error: ${errorParam}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        // Exchange code for access token
        const result = await socialMediaOAuthService.exchangeCodeForToken(platform, code, state);

        if (!result.success || !result.connection) {
          throw new Error(result.error || 'Failed to exchange authorization code');
        }

        // Add connection to API service
        socialMediaApiService.addConnection(result.connection);

        // Update settings with new connection
        await updateSettings({
          socialMedia: {
            [platform]: result.connection,
          },
        });

        setStatus('success');

        // Redirect back to social media settings after a short delay
        setTimeout(() => {
          window.close(); // Close popup if opened in popup
          // Or redirect to main app
          window.location.href = '/marketing?tab=social';
        }, 2000);
      } catch (error) {
        console.error(`OAuth callback error for ${platform}:`, error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        setStatus('error');
      }
    };

    handleOAuthCallback();
  }, [platform, updateSettings]);

  const renderStatus = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">
              {t('social.oauth.connecting', {
                platform: platform.charAt(0).toUpperCase() + platform.slice(1),
              })}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">{t('social.oauth.processing')}</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('social.oauth.success')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {t('social.oauth.successDesc', {
                platform: platform.charAt(0).toUpperCase() + platform.slice(1),
              })}
            </p>
            <p className="text-sm text-gray-400 mt-4">{t('social.oauth.redirecting')}</p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('social.oauth.error')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {error || t('social.oauth.errorDesc')}
            </p>
            <button
              onClick={() => window.close()}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {renderStatus()}
      </div>
    </div>
  );
};

export default OAuthCallback;
