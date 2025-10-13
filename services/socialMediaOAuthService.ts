import { SocialMediaConnection } from '../types';

// Platform-specific OAuth configuration
export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

export interface OAuthResult {
  success: boolean;
  connection?: SocialMediaConnection;
  error?: string;
  authUrl?: string;
}

export interface TokenRefreshResult {
  success: boolean;
  accessToken?: string;
  expiresAt?: Date;
  error?: string;
}

/**
 * OAuth Service for Social Media Platform Authentication
 * Handles OAuth flows for Instagram, Facebook, and TikTok
 */
class SocialMediaOAuthService {
  private configs: Record<string, OAuthConfig> = {};

  constructor() {
    this.initializeConfigs();
  }

  /**
   * Initialize OAuth configurations from environment variables
   */
  private initializeConfigs(): void {
    // Instagram (via Facebook Graph API)
    this.configs.instagram = {
      clientId: import.meta.env.VITE_FACEBOOK_APP_ID || '',
      clientSecret: import.meta.env.VITE_FACEBOOK_APP_SECRET || '',
      redirectUri: `${window.location.origin}/auth/instagram/callback`,
      scope: [
        'instagram_basic',
        'instagram_content_publish',
        'pages_show_list',
        'pages_read_engagement',
      ],
    };

    // Facebook Pages
    this.configs.facebook = {
      clientId: import.meta.env.VITE_FACEBOOK_APP_ID || '',
      clientSecret: import.meta.env.VITE_FACEBOOK_APP_SECRET || '',
      redirectUri: `${window.location.origin}/auth/facebook/callback`,
      scope: [
        'pages_manage_posts',
        'pages_read_engagement',
        'pages_show_list',
        'publish_to_groups',
      ],
    };

    // TikTok Business
    this.configs.tiktok = {
      clientId: import.meta.env.VITE_TIKTOK_CLIENT_KEY || '',
      clientSecret: import.meta.env.VITE_TIKTOK_CLIENT_SECRET || '',
      redirectUri: `${window.location.origin}/auth/tiktok/callback`,
      scope: ['video.list', 'video.upload', 'user.info.basic'],
    };
  }

  /**
   * Generate OAuth authorization URL for a platform
   */
  getAuthorizationUrl(platform: 'instagram' | 'facebook' | 'tiktok'): string {
    const config = this.configs[platform];
    if (!config || !config.clientId) {
      throw new Error(`OAuth configuration missing for ${platform}`);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope.join(','),
      response_type: 'code',
      state: this.generateState(platform),
    });

    switch (platform) {
      case 'instagram':
      case 'facebook':
        return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
      case 'tiktok':
        return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(
    platform: 'instagram' | 'facebook' | 'tiktok',
    code: string,
    state: string
  ): Promise<OAuthResult> {
    try {
      // Verify state parameter
      if (!this.verifyState(platform, state)) {
        return {
          success: false,
          error: 'Invalid state parameter. Possible CSRF attack.',
        };
      }

      const config = this.configs[platform];
      let tokenData;

      switch (platform) {
        case 'instagram':
        case 'facebook':
          tokenData = await this.exchangeFacebookToken(code, config);
          break;
        case 'tiktok':
          tokenData = await this.exchangeTikTokToken(code, config);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      if (!tokenData.success) {
        return tokenData;
      }

      // Get user info and create connection
      const userInfo = await this.getUserInfo(platform, tokenData.accessToken!);
      if (!userInfo.success) {
        return {
          success: false,
          error: 'Failed to fetch user information',
        };
      }

      const connection: SocialMediaConnection = {
        id: `${platform}_${Date.now()}`,
        platform,
        accessToken: tokenData.accessToken!,
        refreshToken: tokenData.refreshToken,
        userId: userInfo.userId!,
        username: userInfo.username!,
        expiresAt: tokenData.expiresAt || new Date(Date.now() + 3600000), // 1 hour default
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return {
        success: true,
        connection,
      };
    } catch (error) {
      console.error(`OAuth error for ${platform}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown OAuth error',
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(
    platform: 'instagram' | 'facebook' | 'tiktok',
    refreshToken: string
  ): Promise<TokenRefreshResult> {
    try {
      const config = this.configs[platform];
      let result;

      switch (platform) {
        case 'instagram':
        case 'facebook':
          result = await this.refreshFacebookToken(refreshToken, config);
          break;
        case 'tiktok':
          result = await this.refreshTikTokToken(refreshToken, config);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      return result;
    } catch (error) {
      console.error(`Token refresh error for ${platform}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed',
      };
    }
  }

  /**
   * Revoke access token and disconnect
   */
  async revokeToken(
    platform: 'instagram' | 'facebook' | 'tiktok',
    accessToken: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      switch (platform) {
        case 'instagram':
        case 'facebook':
          await this.revokeFacebookToken(accessToken);
          break;
        case 'tiktok':
          await this.revokeTikTokToken(accessToken);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      return { success: true };
    } catch (error) {
      console.error(`Token revocation error for ${platform}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token revocation failed',
      };
    }
  }

  // Platform-specific token exchange methods

  private async exchangeFacebookToken(code: string, config: OAuthConfig): Promise<any> {
    const params = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      code,
    });

    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`,
      {
        method: 'GET',
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || 'Token exchange failed',
      };
    }

    return {
      success: true,
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  private async exchangeTikTokToken(code: string, config: OAuthConfig): Promise<any> {
    const body = {
      client_key: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
    };

    const response = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error_description || data.message || 'Token exchange failed',
      };
    }

    return {
      success: true,
      accessToken: data.data.access_token,
      refreshToken: data.data.refresh_token,
      expiresAt: new Date(Date.now() + data.data.expires_in * 1000),
    };
  }

  // Token refresh methods

  private async refreshFacebookToken(
    refreshToken: string,
    config: OAuthConfig
  ): Promise<TokenRefreshResult> {
    // Facebook long-lived tokens don't typically need refresh, but we can extend them
    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      fb_exchange_token: refreshToken,
    });

    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`
    );
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || 'Token refresh failed',
      };
    }

    return {
      success: true,
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  private async refreshTikTokToken(
    refreshToken: string,
    config: OAuthConfig
  ): Promise<TokenRefreshResult> {
    const body = {
      client_key: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };

    const response = await fetch('https://open-api.tiktok.com/oauth/refresh_token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error_description || data.message || 'Token refresh failed',
      };
    }

    return {
      success: true,
      accessToken: data.data.access_token,
      expiresAt: new Date(Date.now() + data.data.expires_in * 1000),
    };
  }

  // Token revocation methods

  private async revokeFacebookToken(accessToken: string): Promise<void> {
    await fetch(`https://graph.facebook.com/v18.0/me/permissions?access_token=${accessToken}`, {
      method: 'DELETE',
    });
  }

  private async revokeTikTokToken(accessToken: string): Promise<void> {
    // TikTok doesn't have a specific revoke endpoint, tokens expire automatically
    // We could make a call to invalidate the token on our end
    console.log('TikTok token marked for revocation:', accessToken);
  }

  // User info methods

  private async getUserInfo(platform: string, accessToken: string): Promise<any> {
    try {
      switch (platform) {
        case 'instagram':
          return await this.getInstagramUserInfo(accessToken);
        case 'facebook':
          return await this.getFacebookUserInfo(accessToken);
        case 'tiktok':
          return await this.getTikTokUserInfo(accessToken);
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user info',
      };
    }
  }

  private async getInstagramUserInfo(accessToken: string): Promise<any> {
    // First get Facebook user pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
    );
    const pagesData = await pagesResponse.json();

    if (!pagesResponse.ok) {
      throw new Error(pagesData.error?.message || 'Failed to get Facebook pages');
    }

    // Find Instagram business account
    for (const page of pagesData.data) {
      const instagramResponse = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${accessToken}`
      );
      const instagramData = await instagramResponse.json();

      if (instagramData.instagram_business_account) {
        const userId = instagramData.instagram_business_account.id;
        const userInfoResponse = await fetch(
          `https://graph.facebook.com/v18.0/${userId}?fields=username&access_token=${accessToken}`
        );
        const userInfo = await userInfoResponse.json();

        return {
          success: true,
          userId,
          username: userInfo.username,
        };
      }
    }

    throw new Error('No Instagram business account found');
  }

  private async getFacebookUserInfo(accessToken: string): Promise<any> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get Facebook pages');
    }

    if (data.data.length === 0) {
      throw new Error('No Facebook pages found');
    }

    // Use the first page
    const page = data.data[0];
    return {
      success: true,
      userId: page.id,
      username: page.name,
    };
  }

  private async getTikTokUserInfo(accessToken: string): Promise<any> {
    const response = await fetch('https://open-api.tiktok.com/user/info/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error_description || data.message || 'Failed to get TikTok user info');
    }

    return {
      success: true,
      userId: data.data.user.open_id,
      username: data.data.user.display_name,
    };
  }

  // Utility methods

  private generateState(platform: string): string {
    const state = {
      platform,
      timestamp: Date.now(),
      random: Math.random().toString(36).substring(2),
    };
    return btoa(JSON.stringify(state));
  }

  private verifyState(platform: string, state: string): boolean {
    try {
      const decoded = JSON.parse(atob(state));
      return decoded.platform === platform && Date.now() - decoded.timestamp < 600000; // 10 minutes
    } catch {
      return false;
    }
  }

  /**
   * Check if platform is configured
   */
  isPlatformConfigured(platform: 'instagram' | 'facebook' | 'tiktok'): boolean {
    const config = this.configs[platform];
    return !!(config && config.clientId && config.clientSecret);
  }

  /**
   * Get OAuth configuration for a platform
   */
  getConfig(platform: 'instagram' | 'facebook' | 'tiktok'): OAuthConfig | null {
    return this.configs[platform] || null;
  }
}

// Export singleton instance
export const socialMediaOAuthService = new SocialMediaOAuthService();
export default socialMediaOAuthService;
