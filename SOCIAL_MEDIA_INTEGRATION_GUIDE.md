# Social Media API Integration Guide

This guide explains how to set up and use the social media API integrations for Instagram, Facebook, and TikTok in your Hairstylist CRM application.

## Overview

The social media integration allows users to:

- Connect their Instagram Business, Facebook Page, and TikTok Business accounts
- Post hairstyle transformations directly to their social media platforms
- Track engagement metrics and analytics
- Schedule posts for optimal timing
- Manage multiple platform connections

## Architecture

### Services

1. **`socialMediaOAuthService`** - Handles OAuth authentication flows
2. **`socialMediaApiService`** - Main service orchestrating all platforms
3. **`socialMediaConfigService`** - Configuration and environment management
4. **`instagramApiService`** - Instagram Business API integration
5. **`facebookApiService`** - Facebook Pages API integration
6. **`tiktokApiService`** - TikTok Business API integration

### Components

1. **`ConnectionManager`** - UI for connecting/disconnecting social media accounts
2. **`SocialMediaTab`** - Main social media interface in the marketing section
3. **`OAuthCallback`** - Handles OAuth callback processing
4. **`PostComposer`** - Interface for creating and publishing posts
5. **`PostHistory`** - View past posts and their performance

## Setup Instructions

### 1. Environment Configuration

Copy the `.env.example` file to `.env` and fill in your API credentials:

```bash
cp .env.example .env
```

### 2. Facebook/Instagram API Setup

1. Go to [Facebook for Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add the following products to your app:
   - Facebook Login
   - Instagram Basic Display (for Instagram)
   - Instagram API (for Instagram Business)
   - Pages API (for Facebook Pages)

4. Configure OAuth redirect URIs:
   - `http://localhost:5173/auth/facebook/callback` (development)
   - `http://localhost:5173/auth/instagram/callback` (development)
   - Update with your production URLs when deploying

5. Get your App ID and App Secret from the app dashboard

6. Add to `.env`:
```env
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### 3. TikTok Business API Setup

1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Create a developer account
3. Create a new app
4. Apply for Content Posting API access (requires approval)
5. Configure redirect URI: `http://localhost:5173/auth/tiktok/callback`

6. Add to `.env`:
```env
VITE_TIKTOK_CLIENT_KEY=your_tiktok_client_key
VITE_TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
```

### 4. Required Permissions

#### Instagram Business API
- `instagram_basic` - Access to basic profile information
- `instagram_content_publish` - Publish photos and videos
- `pages_show_list` - Access to Pages list
- `pages_read_engagement` - Read engagement metrics

#### Facebook Pages API
- `pages_manage_posts` - Create and manage posts
- `pages_read_engagement` - Read post metrics
- `pages_show_list` - Access to Pages list
- `publish_to_groups` - Publish to groups (optional)

#### TikTok Business API
- `video.list` - Access to video list
- `video.upload` - Upload videos
- `user.info.basic` - Basic user information

## Usage

### 1. Connecting Accounts

Users can connect their social media accounts through the Marketing > Social Media tab:

1. Click "Manage Platforms" in the Social Media overview
2. Select the platform to connect
3. Complete the OAuth flow in the popup window
4. Accounts will be saved and ready for posting

### 2. Publishing Posts

1. Navigate to Marketing > Social Media
2. Click "Create Post"
3. Select client photos (with consent)
4. Compose caption and add hashtags
5. Select target platforms
6. Publish immediately or schedule for later

### 3. Viewing Analytics

- View post performance in the Post History section
- Track likes, comments, shares, and views
- Monitor engagement trends over time

## API Integration Details

### Instagram Business API

- **Publishing**: Uses container creation -> publish flow
- **Media Types**: Images (single/carousel), Videos (Reels)
- **Limitations**: Requires Instagram Business Account connected to Facebook Page
- **Rate Limits**: Shared with Facebook Graph API limits

### Facebook Pages API

- **Publishing**: Direct post creation to Page feed
- **Media Types**: Images, Videos, Links, Text posts
- **Scheduling**: Supports scheduling up to 6 months in advance
- **Rate Limits**: Business Use Case limits apply

### TikTok Business API

- **Publishing**: Video upload with metadata
- **Media Types**: Videos only (MP4, MOV, WebM)
- **Limitations**: 10 uploads per day for most accounts
- **Requirements**: Vertical video format (9:16 aspect ratio)

## Content Guidelines

### Instagram
- **Images**: JPG, PNG formats
- **Size**: 320x320 to 1080x1080 pixels
- **Caption**: Max 2,200 characters
- **Hashtags**: Max 30 hashtags
- **Videos**: Max 60 seconds (Reels)

### Facebook
- **Images**: JPG, PNG, GIF formats
- **Size**: 600x315 to 1200x630 pixels (recommended)
- **Caption**: Max 63,206 characters
- **Hashtags**: Max 20 recommended
- **Scheduling**: 10 minutes to 6 months in advance

### TikTok
- **Videos**: MP4, MOV, WebM formats
- **Duration**: 3-60 seconds
- **Size**: 540x960 to 1080x1920 pixels
- **Caption**: Max 300 characters
- **Hashtags**: Up to 100 hashtags

## Error Handling

The system includes comprehensive error handling for:

- **OAuth failures**: Invalid credentials, expired tokens
- **API errors**: Rate limiting, content violations, server errors
- **Network issues**: Timeouts, connectivity problems
- **Content validation**: Invalid formats, size limits, policy violations

Errors are displayed to users with actionable messages and suggested solutions.

## Security Considerations

1. **Token Storage**: Access tokens are stored securely and refreshed automatically
2. **HTTPS Required**: OAuth flows require HTTPS in production
3. **Token Expiration**: Automatic token refresh prevents service interruptions
4. **Scope Limiting**: Only request necessary permissions
5. **Webhook Verification**: Secure webhook endpoints (if implemented)

## Rate Limiting

All services implement rate limiting awareness:

- **Instagram/Facebook**: Business Use Case limits (tracked via headers)
- **TikTok**: Daily upload limits (10 videos/day for most accounts)
- **Retry Logic**: Automatic retry with exponential backoff
- **Queue Management**: Posts can be queued when limits are reached

## Testing

### Development Testing

1. Use Facebook/Instagram test apps for development
2. TikTok provides sandbox environment for testing
3. Mock services available for testing without API calls

### Production Testing

1. Test with small audience first
2. Monitor error rates and API responses
3. Verify webhook endpoints (if implemented)
4. Test token refresh flows

## Troubleshooting

### Common Issues

1. **"Platform not configured"**
   - Check environment variables are set correctly
   - Verify API credentials in platform developer console

2. **"OAuth failed"**
   - Check redirect URIs match exactly
   - Verify app is in development/live mode as needed
   - Check required permissions are granted

3. **"Upload failed"**
   - Verify content meets platform guidelines
   - Check file formats and sizes
   - Ensure account has necessary permissions

4. **"Rate limited"**
   - Wait for rate limit reset
   - Consider spreading posts across time
   - Check if account has special rate limits

### Debug Tools

- Enable detailed logging in development mode
- Use browser network tab to inspect API calls
- Check platform developer consoles for API usage

## Best Practices

### Content Strategy

1. **Optimal Posting Times**:
   - Instagram: 6-9 AM, 7-9 PM
   - Facebook: 9 AM, 1-3 PM
   - TikTok: 6-10 AM, 7-9 PM

2. **Content Guidelines**:
   - Use high-quality images/videos
   - Include relevant hashtags
   - Write engaging captions
   - Maintain consistent posting schedule

3. **Engagement**:
   - Respond to comments promptly
   - Use trending hashtags appropriately
   - Post consistently
   - Analyze performance data

### Technical Best Practices

1. **Error Handling**: Always handle API errors gracefully
2. **Token Management**: Implement automatic token refresh
3. **Content Validation**: Validate content before API calls
4. **Monitoring**: Track API usage and error rates
5. **Fallbacks**: Provide alternative flows when APIs fail

## Support

For additional support:

1. Check platform-specific developer documentation
2. Review API status pages for service issues
3. Contact platform developer support for API-specific issues
4. Check community forums for common solutions

## Future Enhancements

Potential improvements to consider:

1. **Additional Platforms**: LinkedIn, Twitter, Pinterest
2. **Advanced Scheduling**: Bulk scheduling, content calendar
3. **Analytics Dashboard**: Comprehensive cross-platform analytics
4. **Content Templates**: Pre-designed post templates
5. **A/B Testing**: Test different captions/hashtags
6. **Automation**: Auto-posting based on triggers
7. **Team Management**: Multi-user access and permissions