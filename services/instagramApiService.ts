import { SocialMediaConnection, PostContent, EngagementMetrics } from '../types';

/**
 * Instagram Business API Integration
 * Handles Instagram-specific API operations using Facebook Graph API
 */
export class InstagramApiService {
  private baseUrl = 'https://graph.facebook.com/v18.0';

  /**
   * Validate Instagram Business connection
   */
  async validateConnection(connection: SocialMediaConnection): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${connection.userId}?fields=username&access_token=${connection.accessToken}`
      );
      return response.ok;
    } catch (error) {
      console.error('Instagram connection validation failed:', error);
      return false;
    }
  }

  /**
   * Get Instagram Business account info
   */
  async getAccountInfo(connection: SocialMediaConnection): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${connection.userId}?fields=username,account_type,media_count,followers_count&access_token=${connection.accessToken}`
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get account info');
      }
      
      return data;
    } catch (error) {
      console.error('Failed to get Instagram account info:', error);
      throw error;
    }
  }

  /**
   * Create Instagram media container for single image
   */
  async createImageContainer(
    connection: SocialMediaConnection,
    imageUrl: string,
    caption: string
  ): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${connection.userId}/media`,
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
        throw new Error(data.error?.message || 'Failed to create image container');
      }

      return data.id;
    } catch (error) {
      console.error('Failed to create Instagram image container:', error);
      throw error;
    }
  }

  /**
   * Create Instagram carousel container for multiple images
   */
  async createCarouselContainer(
    connection: SocialMediaConnection,
    imageUrls: string[],
    caption: string
  ): Promise<string> {
    try {
      // First create individual image containers
      const childContainers = [];
      
      for (const imageUrl of imageUrls.slice(0, 10)) { // Instagram supports max 10 images
        const response = await fetch(
          `${this.baseUrl}/${connection.userId}/media`,
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
        `${this.baseUrl}/${connection.userId}/media`,
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
    } catch (error) {
      console.error('Failed to create Instagram carousel container:', error);
      throw error;
    }
  }

  /**
   * Publish Instagram media container
   */
  async publishContainer(
    connection: SocialMediaConnection,
    containerId: string
  ): Promise<{ success: boolean; postId?: string; url?: string; error?: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${connection.userId}/media_publish`,
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

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Failed to publish Instagram post'
        };
      }

      return {
        success: true,
        postId: data.id,
        url: `https://www.instagram.com/p/${data.id}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Complete Instagram post publishing flow
   */
  async publishPost(
    connection: SocialMediaConnection,
    content: PostContent
  ): Promise<{ success: boolean; postId?: string; url?: string; error?: string }> {
    try {
      if (content.imageUrls.length === 0) {
        throw new Error('Instagram requires at least one image');
      }

      const caption = this.formatCaption(content.caption, content.hashtags);
      let containerId: string;

      if (content.imageUrls.length === 1) {
        // Single image post
        containerId = await this.createImageContainer(
          connection,
          content.imageUrls[0],
          caption
        );
      } else {
        // Carousel post
        containerId = await this.createCarouselContainer(
          connection,
          content.imageUrls,
          caption
        );
      }

      // Publish the container
      return await this.publishContainer(connection, containerId);

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Instagram publish failed'
      };
    }
  }

  /**
   * Get engagement metrics for an Instagram post
   */
  async getPostMetrics(
    connection: SocialMediaConnection,
    postId: string
  ): Promise<EngagementMetrics | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${postId}/insights?metric=impressions,reach,likes,comments,shares&access_token=${connection.accessToken}`
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
    } catch (error) {
      console.error('Failed to get Instagram metrics:', error);
      return null;
    }
  }

  /**
   * Get recent Instagram posts
   */
  async getRecentPosts(
    connection: SocialMediaConnection,
    limit: number = 10
  ): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${connection.userId}/media?fields=id,caption,media_url,thumbnail_url,permalink,timestamp,media_type,like_count,comments_count&limit=${limit}&access_token=${connection.accessToken}`
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get Instagram posts');
      }

      return data.data || [];
    } catch (error) {
      console.error('Failed to get Instagram recent posts:', error);
      return [];
    }
  }

  /**
   * Check Instagram API rate limits
   */
  async checkRateLimits(connection: SocialMediaConnection): Promise<{
    canPost: boolean;
    resetTime?: Date;
    remaining?: number;
  }> {
    try {
      // Instagram uses the same rate limits as Facebook Graph API
      const response = await fetch(
        `${this.baseUrl}/${connection.userId}?fields=id&access_token=${connection.accessToken}`
      );

      const rateLimitUsage = response.headers.get('X-Business-Use-Case-Usage');
      
      if (rateLimitUsage) {
        const usage = JSON.parse(rateLimitUsage);
        const businessUsage = usage[Object.keys(usage)[0]];
        
        // If usage is above 75%, suggest waiting
        const canPost = businessUsage.call_count < 75;
        
        return {
          canPost,
          remaining: 100 - businessUsage.call_count,
          resetTime: new Date(Date.now() + 3600000) // Reset hourly
        };
      }

      return { canPost: true };
    } catch (error) {
      console.error('Failed to check Instagram rate limits:', error);
      return { canPost: true }; // Assume we can post if check fails
    }
  }

  /**
   * Format caption with hashtags
   */
  private formatCaption(caption: string, hashtags: string[]): string {
    let formatted = caption;
    
    if (hashtags.length > 0) {
      const hashtagString = '\n\n' + hashtags
        .slice(0, 30) // Instagram limit
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
        .join(' ');
      formatted += hashtagString;
    }

    // Instagram caption limit is 2200 characters
    if (formatted.length > 2200) {
      formatted = formatted.substring(0, 2197) + '...';
    }

    return formatted;
  }

  /**
   * Validate image URL for Instagram requirements
   */
  validateImageUrl(imageUrl: string): { valid: boolean; error?: string } {
    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch {
      return { valid: false, error: 'Invalid image URL' };
    }

    // Check file extension
    const validExtensions = ['.jpg', '.jpeg', '.png'];
    const hasValidExtension = validExtensions.some(ext => 
      imageUrl.toLowerCase().includes(ext)
    );

    if (!hasValidExtension) {
      return { 
        valid: false, 
        error: 'Instagram only supports JPG and PNG images' 
      };
    }

    return { valid: true };
  }

  /**
   * Get Instagram posting guidelines
   */
  getPostingGuidelines(): {
    imageRequirements: any;
    captionLimits: any;
    hashtagLimits: any;
  } {
    return {
      imageRequirements: {
        formats: ['JPG', 'PNG'],
        minSize: { width: 320, height: 320 },
        maxSize: { width: 1080, height: 1080 },
        aspectRatios: ['1:1', '4:5', '16:9'],
        maxFileSize: '30MB'
      },
      captionLimits: {
        maxLength: 2200,
        recommendedLength: 125
      },
      hashtagLimits: {
        maxHashtags: 30,
        recommendedHashtags: 11
      }
    };
  }
}

// Export singleton instance
export const instagramApiService = new InstagramApiService();
export default instagramApiService;