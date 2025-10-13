import { SocialMediaSettings, OAuthCredentials } from '../types';

/**
 * Social Media Configuration Service
 * Manages API keys, OAuth credentials, and platform settings
 */
class SocialMediaConfigService {
  private config: SocialMediaSettings;

  constructor() {
    this.config = this.loadConfiguration();
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfiguration(): SocialMediaSettings {
    return {
      instagram: {
        clientId: import.meta.env.VITE_FACEBOOK_APP_ID || '',
        clientSecret: import.meta.env.VITE_FACEBOOK_APP_SECRET || '',
        redirectUri: `${window.location.origin}/auth/instagram/callback`,
      },
      facebook: {
        clientId: import.meta.env.VITE_FACEBOOK_APP_ID || '',
        clientSecret: import.meta.env.VITE_FACEBOOK_APP_SECRET || '',
        redirectUri: `${window.location.origin}/auth/facebook/callback`,
      },
      tiktok: {
        clientId: import.meta.env.VITE_TIKTOK_CLIENT_KEY || '',
        clientSecret: import.meta.env.VITE_TIKTOK_CLIENT_SECRET || '',
        redirectUri: `${window.location.origin}/auth/tiktok/callback`,
      },
      webhookSecret: import.meta.env.VITE_SOCIAL_WEBHOOK_SECRET,
    };
  }

  /**
   * Get OAuth credentials for a platform
   */
  getOAuthCredentials(platform: 'instagram' | 'facebook' | 'tiktok'): OAuthCredentials {
    return this.config[platform];
  }

  /**
   * Check if a platform is properly configured
   */
  isPlatformConfigured(platform: 'instagram' | 'facebook' | 'tiktok'): boolean {
    const credentials = this.config[platform];
    return !!(credentials.clientId && credentials.clientSecret);
  }

  /**
   * Get all configured platforms
   */
  getConfiguredPlatforms(): string[] {
    return (['instagram', 'facebook', 'tiktok'] as const).filter(platform =>
      this.isPlatformConfigured(platform)
    );
  }

  /**
   * Get platform-specific API endpoints
   */
  getApiEndpoints(platform: 'instagram' | 'facebook' | 'tiktok') {
    switch (platform) {
      case 'instagram':
        return {
          auth: 'https://www.facebook.com/v18.0/dialog/oauth',
          token: 'https://graph.facebook.com/v18.0/oauth/access_token',
          api: 'https://graph.facebook.com/v18.0',
          revoke: 'https://graph.facebook.com/v18.0/me/permissions',
        };
      case 'facebook':
        return {
          auth: 'https://www.facebook.com/v18.0/dialog/oauth',
          token: 'https://graph.facebook.com/v18.0/oauth/access_token',
          api: 'https://graph.facebook.com/v18.0',
          revoke: 'https://graph.facebook.com/v18.0/me/permissions',
        };
      case 'tiktok':
        return {
          auth: 'https://www.tiktok.com/v2/auth/authorize/',
          token: 'https://open-api.tiktok.com/oauth/access_token/',
          api: 'https://open-api.tiktok.com',
          revoke: null, // TikTok doesn't have a revoke endpoint
        };
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Get platform-specific scopes required for full functionality
   */
  getRequiredScopes(platform: 'instagram' | 'facebook' | 'tiktok'): string[] {
    switch (platform) {
      case 'instagram':
        return [
          'instagram_basic',
          'instagram_content_publish',
          'pages_show_list',
          'pages_read_engagement',
        ];
      case 'facebook':
        return [
          'pages_manage_posts',
          'pages_read_engagement',
          'pages_show_list',
          'publish_to_groups',
        ];
      case 'tiktok':
        return ['video.list', 'video.upload', 'user.info.basic'];
      default:
        return [];
    }
  }

  /**
   * Get platform-specific content requirements and limits
   */
  getPlatformRequirements(platform: 'instagram' | 'facebook' | 'tiktok') {
    switch (platform) {
      case 'instagram':
        return {
          supportedFormats: {
            images: ['jpg', 'jpeg', 'png'],
            videos: ['mp4', 'mov'],
          },
          limits: {
            captionLength: 2200,
            hashtags: 30,
            imagesPerPost: 10,
            videoLength: 60, // seconds
            fileSize: 100, // MB
          },
          requirements: {
            minImageSize: { width: 320, height: 320 },
            maxImageSize: { width: 1080, height: 1080 },
            aspectRatios: ['1:1', '4:5', '16:9'],
          },
        };
      case 'facebook':
        return {
          supportedFormats: {
            images: ['jpg', 'jpeg', 'png', 'gif'],
            videos: ['mp4', 'mov', 'avi'],
          },
          limits: {
            captionLength: 63206,
            hashtags: 20,
            imagesPerPost: 10,
            videoLength: 240, // seconds
            fileSize: 4000, // MB
          },
          requirements: {
            minImageSize: { width: 600, height: 315 },
            maxImageSize: { width: 1200, height: 630 },
            aspectRatios: ['16:9', '1:1', '4:5'],
          },
        };
      case 'tiktok':
        return {
          supportedFormats: {
            images: [], // TikTok is video-only
            videos: ['mp4', 'mov', 'webm'],
          },
          limits: {
            captionLength: 300,
            hashtags: 100,
            imagesPerPost: 0,
            videoLength: 60, // seconds
            fileSize: 500, // MB
          },
          requirements: {
            minVideoSize: { width: 540, height: 960 },
            maxVideoSize: { width: 1080, height: 1920 },
            aspectRatios: ['9:16'], // Vertical only
          },
        };
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Validate environment configuration
   */
  validateConfiguration(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if at least one platform is configured
    const configuredPlatforms = this.getConfiguredPlatforms();
    if (configuredPlatforms.length === 0) {
      errors.push(
        'No social media platforms are configured. Please add API credentials to your environment variables.'
      );
    }

    // Check individual platform configurations
    if (!this.isPlatformConfigured('instagram')) {
      warnings.push(
        'Instagram not configured: Missing VITE_FACEBOOK_APP_ID or VITE_FACEBOOK_APP_SECRET'
      );
    }

    if (!this.isPlatformConfigured('facebook')) {
      warnings.push(
        'Facebook not configured: Missing VITE_FACEBOOK_APP_ID or VITE_FACEBOOK_APP_SECRET'
      );
    }

    if (!this.isPlatformConfigured('tiktok')) {
      warnings.push(
        'TikTok not configured: Missing VITE_TIKTOK_CLIENT_KEY or VITE_TIKTOK_CLIENT_SECRET'
      );
    }

    // Check redirect URIs
    const currentOrigin = window.location.origin;
    if (currentOrigin.includes('localhost') && import.meta.env.PROD) {
      warnings.push(
        'Production build detected but using localhost URLs. Update redirect URIs for production.'
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get setup instructions for each platform
   */
  getSetupInstructions(platform: 'instagram' | 'facebook' | 'tiktok'): {
    title: string;
    steps: string[];
    documentsUrl: string;
    redirectUri: string;
  } {
    const credentials = this.config[platform];

    switch (platform) {
      case 'instagram':
        return {
          title: 'Instagram Business API Setup',
          steps: [
            '1. Go to Facebook for Developers (developers.facebook.com)',
            '2. Create a new app or use existing app',
            '3. Add Instagram Basic Display and Instagram API products',
            '4. Configure redirect URI in app settings',
            '5. Get App ID and App Secret from app dashboard',
            '6. Add credentials to your .env file',
          ],
          documentsUrl: 'https://developers.facebook.com/docs/instagram-api',
          redirectUri: credentials.redirectUri,
        };
      case 'facebook':
        return {
          title: 'Facebook Pages API Setup',
          steps: [
            '1. Go to Facebook for Developers (developers.facebook.com)',
            '2. Create a new app or use existing app',
            '3. Add Facebook Login and Pages API products',
            '4. Configure redirect URI in app settings',
            '5. Get App ID and App Secret from app dashboard',
            '6. Add credentials to your .env file',
          ],
          documentsUrl: 'https://developers.facebook.com/docs/pages-api',
          redirectUri: credentials.redirectUri,
        };
      case 'tiktok':
        return {
          title: 'TikTok for Business API Setup',
          steps: [
            '1. Go to TikTok for Developers (developers.tiktok.com)',
            '2. Create a developer account and new app',
            '3. Apply for Content Posting API access',
            '4. Configure redirect URI in app settings',
            '5. Get Client Key and Client Secret from app dashboard',
            '6. Add credentials to your .env file',
          ],
          documentsUrl: 'https://developers.tiktok.com/doc/content-posting-api-get-started',
          redirectUri: credentials.redirectUri,
        };
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Get webhook configuration if supported
   */
  getWebhookConfig() {
    return {
      secret: this.config.webhookSecret,
      endpoints: {
        instagram: `${window.location.origin}/api/webhooks/instagram`,
        facebook: `${window.location.origin}/api/webhooks/facebook`,
        tiktok: `${window.location.origin}/api/webhooks/tiktok`,
      },
    };
  }

  /**
   * Update configuration (useful for testing or dynamic updates)
   */
  updateConfiguration(updates: Partial<SocialMediaSettings>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current configuration (for debugging)
   */
  getCurrentConfiguration(): SocialMediaSettings {
    return { ...this.config };
  }
}

// Export singleton instance
export const socialMediaConfigService = new SocialMediaConfigService();
export default socialMediaConfigService;
