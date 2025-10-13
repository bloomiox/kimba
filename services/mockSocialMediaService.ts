import { SocialMediaConnection, SocialPost, SocialPlatform, EngagementMetrics } from '../types';

/**
 * Mock Social Media Service for development and testing
 * This service simulates real social media platform APIs
 */

export interface PublishResult {
  success: boolean;
  platformResults: Array<{
    platform: string;
    success: boolean;
    postId?: string;
    url?: string;
    error?: string;
  }>;
}

export interface OAuthResult {
  success: boolean;
  connection?: SocialMediaConnection;
  error?: string;
}

class MockSocialMediaService {
  private mockConnections: Map<string, SocialMediaConnection> = new Map();
  private mockPosts: Map<string, SocialPost> = new Map();

  /**
   * Simulate OAuth authentication flow
   */
  async authenticateWithPlatform(
    platform: 'instagram' | 'facebook' | 'tiktok',
    redirectUri: string
  ): Promise<OAuthResult> {
    // Simulate OAuth redirect delay
    await this.delay(1500);

    const mockConnection: SocialMediaConnection = {
      id: `${platform}_${Date.now()}`,
      platform,
      accessToken: `mock_token_${platform}_${Date.now()}`,
      refreshToken: `mock_refresh_${platform}_${Date.now()}`,
      userId: `user_${platform}_${Math.random().toString(36).substr(2, 9)}`,
      username: `demo_${platform}_account`,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mockConnections.set(platform, mockConnection);

    return {
      success: true,
      connection: mockConnection,
    };
  }

  /**
   * Refresh expired access token
   */
  async refreshAccessToken(platform: string, refreshToken: string): Promise<OAuthResult> {
    await this.delay(800);

    const existingConnection = this.mockConnections.get(platform);
    if (!existingConnection) {
      return {
        success: false,
        error: 'Connection not found',
      };
    }

    const refreshedConnection: SocialMediaConnection = {
      ...existingConnection,
      accessToken: `refreshed_token_${platform}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      updatedAt: new Date(),
    };

    this.mockConnections.set(platform, refreshedConnection);

    return {
      success: true,
      connection: refreshedConnection,
    };
  }

  /**
   * Disconnect from a platform
   */
  async disconnectPlatform(platform: string): Promise<{ success: boolean }> {
    await this.delay(500);

    this.mockConnections.delete(platform);
    return { success: true };
  }

  /**
   * Get connection status for a platform
   */
  getConnection(platform: string): SocialMediaConnection | null {
    return this.mockConnections.get(platform) || null;
  }

  /**
   * Publish post to multiple platforms
   */
  async publishPost(
    post: Omit<SocialPost, 'id' | 'createdAt' | 'status' | 'publishedAt' | 'externalIds'>,
    imageUrls: string[]
  ): Promise<PublishResult> {
    // Simulate publishing delay
    await this.delay(2000);

    const platformResults = [];
    const externalIds: Record<string, string> = {};

    for (const platform of post.platforms) {
      const connection = this.mockConnections.get(platform.platform);

      if (!connection || !connection.isActive) {
        platformResults.push({
          platform: platform.platform,
          success: false,
          error: 'Platform not connected or inactive',
        });
        continue;
      }

      // Simulate platform-specific publishing
      const result = await this.publishToPlatform(
        platform.platform,
        post.caption,
        post.hashtags,
        imageUrls,
        connection
      );

      platformResults.push(result);

      if (result.success && result.postId) {
        externalIds[platform.platform] = result.postId;
      }
    }

    // Create the full post record
    const fullPost: SocialPost = {
      id: `post_${Date.now()}`,
      ...post,
      status: platformResults.every(r => r.success) ? 'published' : 'failed',
      publishedAt: new Date(),
      externalIds,
      createdAt: new Date(),
    };

    // Store post for history
    this.mockPosts.set(fullPost.id, fullPost);

    // Simulate initial engagement after a delay
    setTimeout(() => {
      this.simulateEngagement(fullPost.id);
    }, 5000);

    return {
      success: platformResults.some(r => r.success),
      platformResults,
    };
  }

  /**
   * Simulate publishing to individual platform
   */
  private async publishToPlatform(
    platform: string,
    caption: string,
    hashtags: string[],
    imageUrls: string[],
    connection: SocialMediaConnection
  ): Promise<{
    platform: string;
    success: boolean;
    postId?: string;
    url?: string;
    error?: string;
  }> {
    await this.delay(500);

    // Simulate random success/failure (90% success rate)
    const success = Math.random() > 0.1;

    if (!success) {
      return {
        platform,
        success: false,
        error: 'Simulated platform error',
      };
    }

    const postId = `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const url = this.generatePlatformUrl(platform, postId);

    return {
      platform,
      success: true,
      postId,
      url,
    };
  }

  /**
   * Generate platform-specific URLs
   */
  private generatePlatformUrl(platform: string, postId: string): string {
    switch (platform) {
      case 'instagram':
        return `https://instagram.com/p/${postId}`;
      case 'facebook':
        return `https://facebook.com/posts/${postId}`;
      case 'tiktok':
        return `https://tiktok.com/@username/video/${postId}`;
      default:
        return `https://${platform}.com/post/${postId}`;
    }
  }

  /**
   * Simulate engagement metrics for a post
   */
  private simulateEngagement(postId: string): void {
    const post = this.mockPosts.get(postId);
    if (!post) return;

    const baseEngagement = {
      likes: Math.floor(Math.random() * 200) + 10,
      comments: Math.floor(Math.random() * 50) + 2,
      shares: Math.floor(Math.random() * 20) + 1,
      views: Math.floor(Math.random() * 1000) + 100,
      lastUpdated: new Date(),
    };

    const updatedPost: SocialPost = {
      ...post,
      engagementMetrics: baseEngagement,
    };

    this.mockPosts.set(postId, updatedPost);

    // Continue to simulate engagement growth
    setTimeout(() => {
      this.growEngagement(postId);
    }, 30000); // Update again in 30 seconds
  }

  /**
   * Simulate engagement growth over time
   */
  private growEngagement(postId: string): void {
    const post = this.mockPosts.get(postId);
    if (!post || !post.engagementMetrics) return;

    const growth = {
      likes: Math.floor(Math.random() * 50),
      comments: Math.floor(Math.random() * 10),
      shares: Math.floor(Math.random() * 5),
      views: Math.floor(Math.random() * 200),
    };

    const updatedMetrics: EngagementMetrics = {
      likes: post.engagementMetrics.likes + growth.likes,
      comments: post.engagementMetrics.comments + growth.comments,
      shares: post.engagementMetrics.shares + growth.shares,
      views: (post.engagementMetrics.views || 0) + growth.views,
      lastUpdated: new Date(),
    };

    const updatedPost: SocialPost = {
      ...post,
      engagementMetrics: updatedMetrics,
    };

    this.mockPosts.set(postId, updatedPost);
  }

  /**
   * Get post history
   */
  getPostHistory(): SocialPost[] {
    return Array.from(this.mockPosts.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Get post by ID
   */
  getPost(postId: string): SocialPost | null {
    return this.mockPosts.get(postId) || null;
  }

  /**
   * Check platform rate limits
   */
  async checkRateLimit(platform: string): Promise<{
    canPost: boolean;
    resetTime?: Date;
    remaining?: number;
  }> {
    await this.delay(200);

    // Simulate rate limits (always allow for demo)
    return {
      canPost: true,
      remaining: 100,
      resetTime: new Date(Date.now() + 3600000), // 1 hour from now
    };
  }

  /**
   * Get platform-specific posting guidelines
   */
  getPlatformGuidelines(platform: string): {
    maxCaptionLength: number;
    maxHashtags: number;
    supportedImageFormats: string[];
    supportedVideoFormats: string[];
  } {
    switch (platform) {
      case 'instagram':
        return {
          maxCaptionLength: 2200,
          maxHashtags: 30,
          supportedImageFormats: ['jpg', 'jpeg', 'png'],
          supportedVideoFormats: ['mp4', 'mov'],
        };
      case 'facebook':
        return {
          maxCaptionLength: 63206,
          maxHashtags: 20,
          supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif'],
          supportedVideoFormats: ['mp4', 'mov', 'avi'],
        };
      case 'tiktok':
        return {
          maxCaptionLength: 300,
          maxHashtags: 100,
          supportedImageFormats: ['jpg', 'jpeg', 'png'],
          supportedVideoFormats: ['mp4', 'mov', 'webm'],
        };
      default:
        return {
          maxCaptionLength: 1000,
          maxHashtags: 10,
          supportedImageFormats: ['jpg', 'jpeg', 'png'],
          supportedVideoFormats: ['mp4'],
        };
    }
  }

  /**
   * Utility method to add delay for realistic simulation
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear all mock data (useful for testing)
   */
  clearAllData(): void {
    this.mockConnections.clear();
    this.mockPosts.clear();
  }
}

// Export singleton instance
export const mockSocialMediaService = new MockSocialMediaService();
export default mockSocialMediaService;
