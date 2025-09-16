import { SocialMediaConnection, PostContent, EngagementMetrics } from '../types';

/**
 * TikTok Business API Integration
 * Handles TikTok-specific API operations for business accounts
 */
export class TikTokApiService {
  private baseUrl = 'https://open-api.tiktok.com';

  /**
   * Validate TikTok Business connection
   */
  async validateConnection(connection: SocialMediaConnection): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/user/info/`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${connection.accessToken}`
          }
        }
      );
      
      return response.ok;
    } catch (error) {
      console.error('TikTok connection validation failed:', error);
      return false;
    }
  }

  /**
   * Get TikTok user info
   */
  async getUserInfo(connection: SocialMediaConnection): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/user/info/`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${connection.accessToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || data.message || 'Failed to get user info');
      }

      return data.data?.user || {};
    } catch (error) {
      console.error('Failed to get TikTok user info:', error);
      throw error;
    }
  }

  /**
   * Upload video to TikTok
   */
  async uploadVideo(
    connection: SocialMediaConnection,
    videoUrl: string,
    title: string,
    description?: string,
    privacyLevel: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY' = 'PUBLIC_TO_EVERYONE'
  ): Promise<{ success: boolean; videoId?: string; error?: string }> {
    try {
      // First, initiate the upload
      const initResponse = await fetch(
        `${this.baseUrl}/share/video/upload/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${connection.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            post_info: {
              title: this.formatTitle(title, description),
              privacy_level: privacyLevel,
              disable_duet: false,
              disable_comment: false,
              disable_stitch: false,
              video_cover_timestamp_ms: 1000
            },
            source_info: {
              source: 'FILE_UPLOAD',
              video_url: videoUrl
            }
          })
        }
      );

      const data = await response.json();

      if (!initResponse.ok || data.error) {
        return {
          success: false,
          error: data.error?.message || data.message || 'Failed to upload TikTok video'
        };
      }

      return {
        success: true,
        videoId: data.data?.video_id
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'TikTok upload failed'
      };
    }
  }

  /**
   * Publish content to TikTok (video only)
   */
  async publishPost(
    connection: SocialMediaConnection,
    content: PostContent
  ): Promise<{ success: boolean; postId?: string; url?: string; error?: string }> {
    try {
      // TikTok requires video content
      if (!content.videoUrl) {
        throw new Error('TikTok requires video content');
      }

      const title = this.formatCaption(content.caption, content.hashtags);
      
      const uploadResult = await this.uploadVideo(
        connection,
        content.videoUrl,
        title
      );

      if (!uploadResult.success || !uploadResult.videoId) {
        return {
          success: false,
          error: uploadResult.error || 'Failed to upload video'
        };
      }

      return {
        success: true,
        postId: uploadResult.videoId,
        url: `https://www.tiktok.com/@${connection.username}/video/${uploadResult.videoId}`
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'TikTok publish failed'
      };
    }
  }

  /**
   * Get video upload status
   */
  async getUploadStatus(
    connection: SocialMediaConnection, 
    videoId: string
  ): Promise<{
    status: 'processing' | 'success' | 'failed';
    details?: any;
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/video/query/?fields=status&video_ids=${videoId}`,
        {
          headers: {
            'Authorization': `Bearer ${connection.accessToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        return { status: 'failed', details: data.error };
      }

      const video = data.data?.videos?.[0];
      return {
        status: video?.status || 'processing',
        details: video
      };

    } catch (error) {
      console.error('Failed to get TikTok upload status:', error);
      return { status: 'failed', details: error };
    }
  }

  /**
   * Get engagement metrics for a TikTok video
   */
  async getVideoMetrics(
    connection: SocialMediaConnection,
    videoId: string
  ): Promise<EngagementMetrics | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/video/query/?fields=like_count,comment_count,share_count,view_count&video_ids=${videoId}`,
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

      const video = data.data?.videos?.[0];

      if (!video) {
        return null;
      }

      return {
        likes: video.like_count || 0,
        comments: video.comment_count || 0,
        shares: video.share_count || 0,
        views: video.view_count || 0,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Failed to get TikTok metrics:', error);
      return null;
    }
  }

  /**
   * Get user's video list
   */
  async getUserVideos(
    connection: SocialMediaConnection,
    limit: number = 10,
    cursor?: string
  ): Promise<{ videos: any[]; nextCursor?: string }> {
    try {
      let url = `${this.baseUrl}/video/list/?fields=id,title,create_time,cover_image_url,view_count,like_count,comment_count,share_count&max_count=${limit}`;
      
      if (cursor) {
        url += `&cursor=${cursor}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${connection.accessToken}`
        }
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Failed to get TikTok videos');
      }

      return {
        videos: data.data?.videos || [],
        nextCursor: data.data?.cursor
      };
    } catch (error) {
      console.error('Failed to get TikTok user videos:', error);
      return { videos: [] };
    }
  }

  /**
   * Get video analytics for business accounts
   */
  async getVideoAnalytics(
    connection: SocialMediaConnection,
    videoIds: string[]
  ): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/video/query/?fields=id,view_count,like_count,comment_count,share_count,reach,profile_view,video_duration&video_ids=${videoIds.join(',')}`,
        {
          headers: {
            'Authorization': `Bearer ${connection.accessToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Failed to get video analytics');
      }

      return data.data?.videos || [];
    } catch (error) {
      console.error('Failed to get TikTok video analytics:', error);
      return [];
    }
  }

  /**
   * Delete a TikTok video
   */
  async deleteVideo(
    connection: SocialMediaConnection,
    videoId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Note: TikTok API doesn't currently support video deletion via API
      // This would need to be done manually through the TikTok app
      return {
        success: false,
        error: 'Video deletion must be done manually through the TikTok app'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete operation failed'
      };
    }
  }

  /**
   * Check TikTok API rate limits
   */
  async checkRateLimits(connection: SocialMediaConnection): Promise<{
    canPost: boolean;
    resetTime?: Date;
    remaining?: number;
  }> {
    try {
      // TikTok has different rate limits for different endpoints
      // For video upload: 10 uploads per day for most users
      
      // Make a simple API call to check if we're rate limited
      const response = await fetch(
        `${this.baseUrl}/user/info/`,
        {
          headers: {
            'Authorization': `Bearer ${connection.accessToken}`
          }
        }
      );

      // Check rate limit headers if available
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
      const rateLimitReset = response.headers.get('X-RateLimit-Reset');

      if (rateLimitRemaining && rateLimitReset) {
        return {
          canPost: parseInt(rateLimitRemaining) > 0,
          remaining: parseInt(rateLimitRemaining),
          resetTime: new Date(parseInt(rateLimitReset) * 1000)
        };
      }

      // If no rate limit headers, assume we can post
      return { canPost: response.ok };
    } catch (error) {
      console.error('Failed to check TikTok rate limits:', error);
      return { canPost: true }; // Assume we can post if check fails
    }
  }

  /**
   * Format title with hashtags for TikTok
   */
  private formatTitle(title: string, description?: string): string {
    let formatted = title;
    
    if (description) {
      formatted += `\n\n${description}`;
    }

    // TikTok title limit is 300 characters
    if (formatted.length > 300) {
      formatted = formatted.substring(0, 297) + '...';
    }

    return formatted;
  }

  /**
   * Format caption with hashtags for TikTok
   */
  private formatCaption(caption: string, hashtags: string[]): string {
    let formatted = caption;
    
    if (hashtags.length > 0) {
      const hashtagString = '\n\n' + hashtags
        .slice(0, 100) // TikTok supports up to 100 hashtags
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
        .join(' ');
      formatted += hashtagString;
    }

    // TikTok caption limit is 300 characters
    if (formatted.length > 300) {
      formatted = formatted.substring(0, 297) + '...';
    }

    return formatted;
  }

  /**
   * Validate video URL for TikTok requirements
   */
  validateVideoUrl(videoUrl: string): { valid: boolean; error?: string } {
    // Basic URL validation
    try {
      new URL(videoUrl);
    } catch {
      return { valid: false, error: 'Invalid video URL' };
    }

    // Check file extension
    const validExtensions = ['.mp4', '.mov', '.webm'];
    const hasValidExtension = validExtensions.some(ext => 
      videoUrl.toLowerCase().includes(ext)
    );

    if (!hasValidExtension) {
      return { 
        valid: false, 
        error: 'TikTok supports MP4, MOV, and WebM videos' 
      };
    }

    return { valid: true };
  }

  /**
   * Get TikTok posting guidelines
   */
  getPostingGuidelines(): {
    videoRequirements: any;
    captionLimits: any;
    hashtagLimits: any;
    uploadLimits: any;
  } {
    return {
      videoRequirements: {
        formats: ['MP4', 'MOV', 'WebM'],
        minDuration: 3, // seconds
        maxDuration: 60, // seconds for most users
        minSize: { width: 540, height: 960 },
        maxSize: { width: 1080, height: 1920 },
        aspectRatio: '9:16', // Vertical only
        maxFileSize: '500MB'
      },
      captionLimits: {
        maxLength: 300,
        recommendedLength: 100
      },
      hashtagLimits: {
        maxHashtags: 100,
        recommendedHashtags: 10
      },
      uploadLimits: {
        dailyLimit: 10,
        resetTime: '24 hours'
      }
    };
  }

  /**
   * Get trending hashtags for TikTok
   */
  async getTrendingHashtags(
    connection: SocialMediaConnection,
    limit: number = 10
  ): Promise<string[]> {
    try {
      // Note: TikTok API doesn't provide trending hashtags endpoint
      // This would typically be implemented with third-party services
      // or scraped from TikTok's discover page (not recommended)
      
      // Return some popular general hashtags as fallback
      return [
        'fyp',
        'viral',
        'trending',
        'hairstyle',
        'beauty',
        'transformation',
        'haircut',
        'style',
        'fashion',
        'makeover'
      ].slice(0, limit);
    } catch (error) {
      console.error('Failed to get trending hashtags:', error);
      return [];
    }
  }

  /**
   * Get optimal posting times
   */
  getOptimalPostingTimes(): {
    weekday: string[];
    weekend: string[];
    timezone: string;
  } {
    return {
      weekday: ['6:00 AM', '10:00 AM', '7:00 PM', '9:00 PM'],
      weekend: ['9:00 AM', '11:00 AM', '5:00 PM', '8:00 PM'],
      timezone: 'Local time based on audience location'
    };
  }

  /**
   * Estimate video performance
   */
  estimatePerformance(
    videoData: {
      duration: number;
      hashtags: string[];
      description: string;
      postTime: Date;
    }
  ): {
    score: number;
    factors: string[];
    suggestions: string[];
  } {
    let score = 50; // Base score
    const factors = [];
    const suggestions = [];

    // Duration scoring
    if (videoData.duration >= 15 && videoData.duration <= 30) {
      score += 10;
      factors.push('Optimal video duration');
    } else if (videoData.duration < 15) {
      score -= 5;
      suggestions.push('Consider longer videos (15-30 seconds) for better engagement');
    }

    // Hashtag scoring
    if (videoData.hashtags.length >= 5 && videoData.hashtags.length <= 15) {
      score += 5;
      factors.push('Good hashtag usage');
    } else if (videoData.hashtags.length < 5) {
      suggestions.push('Add more relevant hashtags (5-15 recommended)');
    }

    // Description scoring
    if (videoData.description.length > 50) {
      score += 5;
      factors.push('Descriptive caption');
    } else {
      suggestions.push('Add more descriptive text to your caption');
    }

    // Posting time scoring (simplified)
    const hour = videoData.postTime.getHours();
    if ((hour >= 6 && hour <= 10) || (hour >= 19 && hour <= 21)) {
      score += 10;
      factors.push('Posted during optimal hours');
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      factors,
      suggestions
    };
  }
}

// Export singleton instance
export const tiktokApiService = new TikTokApiService();
export default tiktokApiService;