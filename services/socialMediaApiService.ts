import { SocialMediaConnection, SocialPost, SocialPlatform, EngagementMetrics } from '../types';
import { socialMediaOAuthService } from './socialMediaOAuthService';

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

export interface PostContent {
  caption: string;
  hashtags: string[];
  imageUrls: string[];
  videoUrl?: string;
}

export interface PlatformLimits {
  maxCaptionLength: number;
  maxHashtags: number;
  supportedImageFormats: string[];
  supportedVideoFormats: string[];
  maxImagesPerPost: number;
  maxVideoSizeMB: number;
}

/**
 * Real Social Media API Service
 * Handles posting content to Instagram, Facebook, and TikTok
 */
class SocialMediaApiService {
  private connections: Map<string, SocialMediaConnection> = new Map();

  /**
   * Add or update a social media connection
   */
  addConnection(connection: SocialMediaConnection): void {
    this.connections.set(connection.platform, connection);
  }

  /**
   * Remove a social media connection
   */
  removeConnection(platform: string): void {
    this.connections.delete(platform);
  }

  /**
   * Get connection for a platform
   */
  getConnection(platform: string): SocialMediaConnection | null {
    return this.connections.get(platform) || null;
  }

  /**
   * Check if access token is valid and refresh if needed
   */
  private async ensureValidToken(connection: SocialMediaConnection): Promise<SocialMediaConnection> {
    const now = new Date();
    const expiresIn = connection.expiresAt.getTime() - now.getTime();
    
    // Refresh if expiring within 10 minutes
    if (expiresIn < 600000 && connection.refreshToken) {
      const refreshResult = await socialMediaOAuthService.refreshAccessToken(
        connection.platform,
        connection.refreshToken
      );

      if (refreshResult.success) {
        const updatedConnection = {
          ...connection,
          accessToken: refreshResult.accessToken!,
          expiresAt: refreshResult.expiresAt!,
          updatedAt: new Date()
        };
        
        this.connections.set(connection.platform, updatedConnection);
        return updatedConnection;
      }
    }

    return connection;
  }

  /**
   * Publish post to multiple platforms
   */
  async publishPost(
    post: Omit<SocialPost, 'id' | 'createdAt' | 'status' | 'publishedAt' | 'externalIds'>,
    content: PostContent
  ): Promise<PublishResult> {
    const platformResults = [];
    const errors: string[] = [];

    for (const platform of post.platforms) {
      const connection = this.getConnection(platform.platform);
      
      if (!connection || !connection.isActive) {
        platformResults.push({
          platform: platform.platform,
          success: false,
          error: 'Platform not connected or inactive'
        });
        continue;
      }

      try {
        // Ensure token is valid
        const validConnection = await this.ensureValidToken(connection);
        
        // Validate content for platform
        const validationError = this.validateContent(platform.platform, content);
        if (validationError) {
          platformResults.push({
            platform: platform.platform,
            success: false,
            error: validationError
          });
          continue;
        }

        // Publish to platform
        const result = await this.publishToPlatform(
          platform.platform,
          validConnection,
          content
        );

        platformResults.push(result);

      } catch (error) {
        console.error(`Error publishing to ${platform.platform}:`, error);
        platformResults.push({
          platform: platform.platform,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      success: platformResults.some(r => r.success),
      platformResults
    };
  }

  /**
   * Publish content to a specific platform
   */
  private async publishToPlatform(
    platform: string,
    connection: SocialMediaConnection,
    content: PostContent
  ): Promise<{
    platform: string;
    success: boolean;
    postId?: string;
    url?: string;
    error?: string;
  }> {
    switch (platform) {
      case 'instagram':
        return await this.publishToInstagram(connection, content);
      case 'facebook':
        return await this.publishToFacebook(connection, content);
      case 'tiktok':
        return await this.publishToTikTok(connection, content);
      default:
        return {
          platform,
          success: false,
          error: `Unsupported platform: ${platform}`
        };
    }
  }

  /**
   * Publish to Instagram Business API
   */
  private async publishToInstagram(
    connection: SocialMediaConnection,
    content: PostContent
  ): Promise<any> {
    try {
      const caption = this.formatCaption(content.caption, content.hashtags);
      
      // For Instagram, we need to create media objects first, then publish
      let containerId: string;

      if (content.imageUrls.length === 1) {
        // Single image post
        containerId = await this.createInstagramImageContainer(
          connection,
          content.imageUrls[0],
          caption
        );
      } else if (content.imageUrls.length > 1) {
        // Carousel post
        containerId = await this.createInstagramCarouselContainer(
          connection,
          content.imageUrls,
          caption
        );
      } else {
        throw new Error('No media provided for Instagram post');
      }

      // Publish the container
      const publishResponse = await fetch(
        `https://graph.facebook.com/v18.0/${connection.userId}/media_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            creation_id: containerId,
            access_token: connection.accessToken
          })
        }
      );

      const publishData = await publishResponse.json();

      if (!publishResponse.ok) {
        throw new Error(publishData.error?.message || 'Failed to publish Instagram post');
      }

      return {
        platform: 'instagram',
        success: true,
        postId: publishData.id,
        url: `https://www.instagram.com/p/${publishData.id}`
      };

    } catch (error) {
      return {
        platform: 'instagram',
        success: false,
        error: error instanceof Error ? error.message : 'Instagram publish failed'
      };
    }
  }

  /**
   * Create Instagram image container
   */
  private async createInstagramImageContainer(
    connection: SocialMediaConnection,
    imageUrl: string,
    caption: string
  ): Promise<string> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${connection.userId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_url: imageUrl,
          caption,
          access_token: connection.accessToken
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to create Instagram image container');
    }

    return data.id;
  }

  /**
   * Create Instagram carousel container
   */
  private async createInstagramCarouselContainer(
    connection: SocialMediaConnection,
    imageUrls: string[],
    caption: string
  ): Promise<string> {
    // First create individual image containers
    const childContainers = [];
    
    for (const imageUrl of imageUrls.slice(0, 10)) { // Instagram supports max 10 images
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${connection.userId}/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image_url: imageUrl,
            is_carousel_item: true,
            access_token: connection.accessToken
          })
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create carousel item');
      }
      
      childContainers.push(data.id);
    }

    // Create carousel container
    const carouselResponse = await fetch(
      `https://graph.facebook.com/v18.0/${connection.userId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          media_type: 'CAROUSEL',
          children: childContainers.join(','),
          caption,
          access_token: connection.accessToken
        })
      }
    );

    const carouselData = await carouselResponse.json();
    
    if (!carouselResponse.ok) {
      throw new Error(carouselData.error?.message || 'Failed to create carousel container');
    }

    return carouselData.id;
  }

  /**
   * Publish to Facebook Pages API
   */
  private async publishToFacebook(
    connection: SocialMediaConnection,
    content: PostContent
  ): Promise<any> {
    try {
      const message = this.formatCaption(content.caption, content.hashtags);
      
      let postData: any = {
        message,
        access_token: connection.accessToken
      };

      // Add media if provided
      if (content.imageUrls.length > 0) {
        if (content.imageUrls.length === 1) {
          postData.url = content.imageUrls[0];
        } else {
          // For multiple images, we need to upload them first and create an album
          postData.attached_media = await this.uploadFacebookImages(connection, content.imageUrls);
        }
      }

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${connection.userId}/feed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to publish Facebook post');
      }

      return {
        platform: 'facebook',
        success: true,
        postId: data.id,
        url: `https://www.facebook.com/${data.id}`
      };

    } catch (error) {
      return {
        platform: 'facebook',
        success: false,
        error: error instanceof Error ? error.message : 'Facebook publish failed'
      };
    }
  }

  /**
   * Upload images to Facebook and return media IDs
   */
  private async uploadFacebookImages(
    connection: SocialMediaConnection,
    imageUrls: string[]
  ): Promise<Array<{ media_fbid: string }>> {
    const attachedMedia = [];

    for (const imageUrl of imageUrls) {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${connection.userId}/photos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: imageUrl,
            published: false,
            access_token: connection.accessToken
          })
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        attachedMedia.push({ media_fbid: data.id });
      }
    }

    return attachedMedia;
  }

  /**
   * Publish to TikTok Business API
   */
  private async publishToTikTok(
    connection: SocialMediaConnection,
    content: PostContent
  ): Promise<any> {
    try {
      // TikTok requires video content
      if (!content.videoUrl) {
        throw new Error('TikTok requires video content');
      }

      const postData = {
        post_info: {
          title: this.formatCaption(content.caption, content.hashtags, 300), // TikTok has shorter limit
          privacy_level: 'MUTUAL_FOLLOW_FRIENDS', // or 'PUBLIC_TO_EVERYONE'
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_url: content.videoUrl
        }
      };

      const response = await fetch(
        'https://open-api.tiktok.com/share/video/upload/',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${connection.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || data.message || 'Failed to publish TikTok video');
      }

      return {
        platform: 'tiktok',
        success: true,
        postId: data.data.video_id,
        url: `https://www.tiktok.com/@${connection.username}/video/${data.data.video_id}`
      };

    } catch (error) {
      return {
        platform: 'tiktok',
        success: false,
        error: error instanceof Error ? error.message : 'TikTok publish failed'  
      };
    }
  }

  /**
   * Get engagement metrics for a post
   */
  async getEngagementMetrics(
    platform: string,
    postId: string
  ): Promise<EngagementMetrics | null> {
    const connection = this.getConnection(platform);
    if (!connection) return null;

    try {
      const validConnection = await this.ensureValidToken(connection);

      switch (platform) {
        case 'instagram':
          return await this.getInstagramMetrics(validConnection, postId);
        case 'facebook':
          return await this.getFacebookMetrics(validConnection, postId);
        case 'tiktok':
          return await this.getTikTokMetrics(validConnection, postId);
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error getting metrics from ${platform}:`, error);
      return null;
    }
  }

  /**
   * Get Instagram post metrics
   */
  private async getInstagramMetrics(
    connection: SocialMediaConnection,
    postId: string
  ): Promise<EngagementMetrics> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${postId}/insights?metric=impressions,reach,likes,comments,shares&access_token=${connection.accessToken}`
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get Instagram metrics');
    }

    const metrics = data.data.reduce((acc: any, metric: any) => {
      acc[metric.name] = metric.values[0]?.value || 0;
      return acc;
    }, {});

    return {
      likes: metrics.likes || 0,
      comments: metrics.comments || 0,
      shares: metrics.shares || 0,
      views: metrics.impressions || 0,
      lastUpdated: new Date()
    };
  }

  /**
   * Get Facebook post metrics
   */
  private async getFacebookMetrics(
    connection: SocialMediaConnection,
    postId: string
  ): Promise<EngagementMetrics> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${postId}?fields=likes.summary(true),comments.summary(true),shares&access_token=${connection.accessToken}`
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get Facebook metrics');
    }

    return {
      likes: data.likes?.summary?.total_count || 0,
      comments: data.comments?.summary?.total_count || 0,
      shares: data.shares?.count || 0,
      views: 0, // Facebook doesn't provide view counts for regular posts
      lastUpdated: new Date()
    };
  }

  /**
   * Get TikTok video metrics
   */
  private async getTikTokMetrics(
    connection: SocialMediaConnection,
    postId: string
  ): Promise<EngagementMetrics> {
    const response = await fetch(
      `https://open-api.tiktok.com/video/query/?fields=like_count,comment_count,share_count,view_count&video_ids=${postId}`,
      {
        headers: {
          'Authorization': `Bearer ${connection.accessToken}`
        }
      }
    );

    const data = await response.json();
    
    if (!response.ok || data.error) {
      throw new Error(data.error?.message || 'Failed to get TikTok metrics');
    }

    const video = data.data.videos[0];
    
    return {
      likes: video.like_count || 0,
      comments: video.comment_count || 0,
      shares: video.share_count || 0,
      views: video.view_count || 0,
      lastUpdated: new Date()
    };
  }

  /**
   * Validate content for platform-specific requirements
   */
  private validateContent(platform: string, content: PostContent): string | null {
    const limits = this.getPlatformLimits(platform);
    
    // Check caption length
    const fullCaption = this.formatCaption(content.caption, content.hashtags);
    if (fullCaption.length > limits.maxCaptionLength) {
      return `Caption too long. Maximum ${limits.maxCaptionLength} characters allowed for ${platform}`;
    }

    // Check hashtag count
    if (content.hashtags.length > limits.maxHashtags) {
      return `Too many hashtags. Maximum ${limits.maxHashtags} allowed for ${platform}`;
    }

    // Check media requirements
    if (platform === 'tiktok' && !content.videoUrl) {
      return 'TikTok requires video content';
    }

    if (content.imageUrls.length > limits.maxImagesPerPost) {
      return `Too many images. Maximum ${limits.maxImagesPerPost} allowed for ${platform}`;
    }

    return null;
  }

  /**
   * Get platform-specific limits and requirements
   */
  getPlatformLimits(platform: string): PlatformLimits {
    switch (platform) {
      case 'instagram':
        return {
          maxCaptionLength: 2200,
          maxHashtags: 30,
          supportedImageFormats: ['jpg', 'jpeg', 'png'],
          supportedVideoFormats: ['mp4', 'mov'],
          maxImagesPerPost: 10,
          maxVideoSizeMB: 100
        };
      case 'facebook':
        return {
          maxCaptionLength: 63206,
          maxHashtags: 20,
          supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif'],
          supportedVideoFormats: ['mp4', 'mov', 'avi'],
          maxImagesPerPost: 10,
          maxVideoSizeMB: 4000
        };
      case 'tiktok':
        return {
          maxCaptionLength: 300,
          maxHashtags: 100,
          supportedImageFormats: [],
          supportedVideoFormats: ['mp4', 'mov', 'webm'],
          maxImagesPerPost: 0,
          maxVideoSizeMB: 500
        };
      default:
        return {
          maxCaptionLength: 1000,
          maxHashtags: 10,
          supportedImageFormats: ['jpg', 'jpeg', 'png'],
          supportedVideoFormats: ['mp4'],
          maxImagesPerPost: 1,
          maxVideoSizeMB: 50
        };
    }
  }

  /**
   * Format caption with hashtags for posting
   */
  private formatCaption(caption: string, hashtags: string[], maxLength?: number): string {
    let formatted = caption;
    
    if (hashtags.length > 0) {
      const hashtagString = '\n\n' + hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ');
      formatted += hashtagString;
    }

    if (maxLength && formatted.length > maxLength) {
      formatted = formatted.substring(0, maxLength - 3) + '...';
    }

    return formatted;
  }

  /**
   * Check rate limits for a platform
   */
  async checkRateLimit(platform: string): Promise<{
    canPost: boolean;
    resetTime?: Date;
    remaining?: number;
  }> {
    const connection = this.getConnection(platform);
    if (!connection) {
      return { canPost: false };
    }

    try {
      // Platform-specific rate limit checks would go here
      // For now, we'll return a permissive response
      return {
        canPost: true,
        remaining: 100,
        resetTime: new Date(Date.now() + 3600000) // 1 hour from now
      };
    } catch (error) {
      console.error(`Rate limit check failed for ${platform}:`, error);
      return { canPost: false };
    }
  }

  /**
   * Clear all connections (useful for logout)
   */
  clearAllConnections(): void {
    this.connections.clear();
  }
}

// Export singleton instance
export const socialMediaApiService = new SocialMediaApiService();
export default socialMediaApiService;