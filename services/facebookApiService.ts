import { SocialMediaConnection, PostContent, EngagementMetrics } from '../types';

/**
 * Facebook Pages API Integration
 * Handles Facebook Page-specific API operations
 */
export class FacebookApiService {
  private baseUrl = 'https://graph.facebook.com/v18.0';

  /**
   * Validate Facebook Page connection
   */
  async validateConnection(connection: SocialMediaConnection): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${connection.userId}?fields=name&access_token=${connection.accessToken}`
      );
      return response.ok;
    } catch (error) {
      console.error('Facebook connection validation failed:', error);
      return false;
    }
  }

  /**
   * Get Facebook Page info
   */
  async getPageInfo(connection: SocialMediaConnection): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${connection.userId}?fields=name,category,fan_count,talking_about_count,checkins,website,about&access_token=${connection.accessToken}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get page info');
      }

      return data;
    } catch (error) {
      console.error('Failed to get Facebook page info:', error);
      throw error;
    }
  }

  /**
   * Upload images to Facebook and return media IDs
   */
  async uploadImages(
    connection: SocialMediaConnection,
    imageUrls: string[]
  ): Promise<Array<{ media_fbid: string }>> {
    const attachedMedia = [];

    for (const imageUrl of imageUrls) {
      try {
        const response = await fetch(`${this.baseUrl}/${connection.userId}/photos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: imageUrl,
            published: false,
            access_token: connection.accessToken,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          attachedMedia.push({ media_fbid: data.id });
        } else {
          console.error('Failed to upload image:', data.error);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    return attachedMedia;
  }

  /**
   * Publish post to Facebook Page
   */
  async publishPost(
    connection: SocialMediaConnection,
    content: PostContent
  ): Promise<{ success: boolean; postId?: string; url?: string; error?: string }> {
    try {
      const message = this.formatCaption(content.caption, content.hashtags);

      let postData: any = {
        message,
        access_token: connection.accessToken,
      };

      // Add media if provided
      if (content.imageUrls.length > 0) {
        if (content.imageUrls.length === 1) {
          // Single image post
          postData.url = content.imageUrls[0];
        } else {
          // Multiple images - upload and attach
          const attachedMedia = await this.uploadImages(connection, content.imageUrls);
          if (attachedMedia.length > 0) {
            postData.attached_media = attachedMedia;
          }
        }
      }

      const response = await fetch(`${this.baseUrl}/${connection.userId}/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Failed to publish Facebook post',
        };
      }

      return {
        success: true,
        postId: data.id,
        url: `https://www.facebook.com/${data.id}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Facebook publish failed',
      };
    }
  }

  /**
   * Schedule Facebook post for later publishing
   */
  async schedulePost(
    connection: SocialMediaConnection,
    content: PostContent,
    scheduledTime: Date
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      const message = this.formatCaption(content.caption, content.hashtags);
      const scheduledTimestamp = Math.floor(scheduledTime.getTime() / 1000);

      // Check if scheduled time is at least 10 minutes in the future
      const minScheduleTime = Math.floor((Date.now() + 10 * 60 * 1000) / 1000);
      if (scheduledTimestamp < minScheduleTime) {
        throw new Error('Scheduled time must be at least 10 minutes in the future');
      }

      let postData: any = {
        message,
        scheduled_publish_time: scheduledTimestamp,
        published: false,
        access_token: connection.accessToken,
      };

      // Add media if provided
      if (content.imageUrls.length > 0) {
        if (content.imageUrls.length === 1) {
          postData.url = content.imageUrls[0];
        } else {
          const attachedMedia = await this.uploadImages(connection, content.imageUrls);
          if (attachedMedia.length > 0) {
            postData.attached_media = attachedMedia;
          }
        }
      }

      const response = await fetch(`${this.baseUrl}/${connection.userId}/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Failed to schedule Facebook post',
        };
      }

      return {
        success: true,
        postId: data.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Facebook schedule failed',
      };
    }
  }

  /**
   * Get engagement metrics for a Facebook post
   */
  async getPostMetrics(
    connection: SocialMediaConnection,
    postId: string
  ): Promise<EngagementMetrics | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${postId}?fields=likes.summary(true),comments.summary(true),shares&access_token=${connection.accessToken}`
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
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Failed to get Facebook metrics:', error);
      return null;
    }
  }

  /**
   * Get Facebook Page insights
   */
  async getPageInsights(
    connection: SocialMediaConnection,
    metrics: string[] = ['page_fans', 'page_engaged_users', 'page_impressions'],
    period: 'day' | 'week' | 'days_28' = 'day'
  ): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${connection.userId}/insights?metric=${metrics.join(',')}&period=${period}&access_token=${connection.accessToken}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get page insights');
      }

      return data.data || [];
    } catch (error) {
      console.error('Failed to get Facebook page insights:', error);
      return [];
    }
  }

  /**
   * Get recent Facebook posts
   */
  async getRecentPosts(connection: SocialMediaConnection, limit: number = 10): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${connection.userId}/posts?fields=id,message,created_time,likes.summary(true),comments.summary(true),shares&limit=${limit}&access_token=${connection.accessToken}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get Facebook posts');
      }

      return data.data || [];
    } catch (error) {
      console.error('Failed to get Facebook recent posts:', error);
      return [];
    }
  }

  /**
   * Delete a Facebook post
   */
  async deletePost(
    connection: SocialMediaConnection,
    postId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${postId}?access_token=${connection.accessToken}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Failed to delete Facebook post',
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  }

  /**
   * Get scheduled Facebook posts
   */
  async getScheduledPosts(connection: SocialMediaConnection): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${connection.userId}/scheduled_posts?fields=id,message,scheduled_publish_time,created_time&access_token=${connection.accessToken}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get scheduled posts');
      }

      return data.data || [];
    } catch (error) {
      console.error('Failed to get Facebook scheduled posts:', error);
      return [];
    }
  }

  /**
   * Check Facebook API rate limits
   */
  async checkRateLimits(connection: SocialMediaConnection): Promise<{
    canPost: boolean;
    resetTime?: Date;
    remaining?: number;
  }> {
    try {
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
          resetTime: new Date(Date.now() + 3600000), // Reset hourly
        };
      }

      return { canPost: true };
    } catch (error) {
      console.error('Failed to check Facebook rate limits:', error);
      return { canPost: true }; // Assume we can post if check fails
    }
  }

  /**
   * Format caption with hashtags for Facebook
   */
  private formatCaption(caption: string, hashtags: string[]): string {
    let formatted = caption;

    if (hashtags.length > 0) {
      const hashtagString =
        '\n\n' +
        hashtags
          .slice(0, 20) // Recommended limit for Facebook
          .map(tag => (tag.startsWith('#') ? tag : `#${tag}`))
          .join(' ');
      formatted += hashtagString;
    }

    // Facebook caption limit is 63,206 characters (very high)
    if (formatted.length > 60000) {
      formatted = formatted.substring(0, 59997) + '...';
    }

    return formatted;
  }

  /**
   * Validate image URL for Facebook requirements
   */
  validateImageUrl(imageUrl: string): { valid: boolean; error?: string } {
    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch {
      return { valid: false, error: 'Invalid image URL' };
    }

    // Check file extension
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const hasValidExtension = validExtensions.some(ext => imageUrl.toLowerCase().includes(ext));

    if (!hasValidExtension) {
      return {
        valid: false,
        error: 'Facebook supports JPG, PNG, and GIF images',
      };
    }

    return { valid: true };
  }

  /**
   * Get Facebook posting guidelines
   */
  getPostingGuidelines(): {
    imageRequirements: any;
    captionLimits: any;
    hashtagLimits: any;
    schedulingLimits: any;
  } {
    return {
      imageRequirements: {
        formats: ['JPG', 'PNG', 'GIF'],
        minSize: { width: 600, height: 315 },
        maxSize: { width: 1200, height: 630 },
        aspectRatios: ['16:9', '1:1', '4:5'],
        maxFileSize: '10MB',
      },
      captionLimits: {
        maxLength: 63206,
        recommendedLength: 400,
      },
      hashtagLimits: {
        maxHashtags: 20,
        recommendedHashtags: 5,
      },
      schedulingLimits: {
        minAdvanceTime: '10 minutes',
        maxAdvanceTime: '6 months',
      },
    };
  }

  /**
   * Create Facebook photo album
   */
  async createPhotoAlbum(
    connection: SocialMediaConnection,
    name: string,
    description?: string
  ): Promise<{ success: boolean; albumId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${connection.userId}/albums`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: description || '',
          access_token: connection.accessToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Failed to create photo album',
        };
      }

      return {
        success: true,
        albumId: data.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Album creation failed',
      };
    }
  }

  /**
   * Add photos to existing album
   */
  async addPhotosToAlbum(
    connection: SocialMediaConnection,
    albumId: string,
    imageUrls: string[],
    caption?: string
  ): Promise<{ success: boolean; photoIds?: string[]; error?: string }> {
    try {
      const photoIds = [];

      for (const imageUrl of imageUrls) {
        const response = await fetch(`${this.baseUrl}/${albumId}/photos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: imageUrl,
            message: caption || '',
            access_token: connection.accessToken,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          photoIds.push(data.id);
        }
      }

      return {
        success: photoIds.length > 0,
        photoIds,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add photos to album',
      };
    }
  }
}

// Export singleton instance
export const facebookApiService = new FacebookApiService();
export default facebookApiService;
