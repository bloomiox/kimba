import React, { useState, useEffect } from 'react';
import { SocialPost, EngagementMetrics } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';
import Card from '../common/Card';
import Button from '../common/Button';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  EyeIcon,
  CalendarIcon,
  PhotoIcon,
  ArrowTopRightOnSquareIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '../common/Icons';
import {
  HeartIconSolid,
  ChatBubbleLeftIconSolid,
  ShareIconSolid,
  EyeIconSolid,
} from '../common/Icons';

interface PostHistoryProps {}

type FilterOption = 'all' | 'instagram' | 'facebook' | 'tiktok';
type SortOption = 'newest' | 'oldest' | 'engagement';

const PostHistory: React.FC<PostHistoryProps> = () => {
  const { t } = useSettings();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<SocialPost[]>([]);
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock posts data
  const mockPosts: SocialPost[] = [
    {
      id: '1',
      lookbookId: 'lb1',
      clientId: 'client1',
      platforms: [
        {
          platform: 'instagram',
          status: 'published',
          postId: 'ig_123',
          url: 'https://instagram.com/p/123',
        },
        {
          platform: 'facebook',
          status: 'published',
          postId: 'fb_456',
          url: 'https://facebook.com/posts/456',
        },
      ],
      caption:
        '✨ Amazing transformation for Sarah! From vision to reality - love how this classic bob turned out! 💫',
      hashtags: ['#hairtransformation', '#newlook', '#hairgoals', '#salon', '#hairstyle'],
      status: 'published',
      publishedAt: new Date('2024-01-15T14:30:00Z'),
      engagementMetrics: {
        likes: 89,
        comments: 12,
        shares: 5,
        views: 1250,
        lastUpdated: new Date('2024-01-15T18:00:00Z'),
      },
      externalIds: {
        instagram: 'ig_123',
        facebook: 'fb_456',
      },
      createdAt: new Date('2024-01-15T14:30:00Z'),
    },
    {
      id: '2',
      lookbookId: 'lb2',
      clientId: 'client3',
      platforms: [
        {
          platform: 'instagram',
          status: 'published',
          postId: 'ig_789',
          url: 'https://instagram.com/p/789',
        },
      ],
      caption:
        'Jessica is absolutely glowing with her new modern layers! ✨ Sometimes a fresh cut is all you need to feel amazing! 💕',
      hashtags: ['#beforeandafter', '#hairmakeover', '#beauty', '#confidence', '#style'],
      status: 'published',
      publishedAt: new Date('2024-01-10T10:15:00Z'),
      engagementMetrics: {
        likes: 156,
        comments: 23,
        shares: 8,
        views: 2100,
        lastUpdated: new Date('2024-01-10T16:30:00Z'),
      },
      externalIds: {
        instagram: 'ig_789',
      },
      createdAt: new Date('2024-01-10T10:15:00Z'),
    },
    {
      id: '3',
      lookbookId: 'lb3',
      clientId: 'client2',
      platforms: [
        {
          platform: 'tiktok',
          status: 'published',
          postId: 'tt_321',
          url: 'https://tiktok.com/@salon/video/321',
        },
      ],
      caption: "The joy on Emily's face says it all! 😍 This elegant updo is pure perfection! ✂️✨",
      hashtags: ['#haircut', '#haircolor', '#professional', '#glamour', '#selfcare'],
      status: 'published',
      publishedAt: new Date('2024-01-05T16:45:00Z'),
      engagementMetrics: {
        likes: 234,
        comments: 45,
        shares: 67,
        views: 5600,
        lastUpdated: new Date('2024-01-05T20:00:00Z'),
      },
      externalIds: {
        tiktok: 'tt_321',
      },
      createdAt: new Date('2024-01-05T16:45:00Z'),
    },
  ];

  useEffect(() => {
    setPosts(mockPosts);
  }, []);

  useEffect(() => {
    let filtered = posts;

    // Filter by platform
    if (filterBy !== 'all') {
      filtered = filtered.filter(post =>
        post.platforms.some(platform => platform.platform === filterBy)
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        post =>
          post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.hashtags.some(hashtag => hashtag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime();
        case 'oldest':
          return new Date(a.publishedAt!).getTime() - new Date(b.publishedAt!).getTime();
        case 'engagement':
          const aEngagement =
            (a.engagementMetrics?.likes || 0) + (a.engagementMetrics?.comments || 0);
          const bEngagement =
            (b.engagementMetrics?.likes || 0) + (b.engagementMetrics?.comments || 0);
          return bEngagement - aEngagement;
        default:
          return 0;
      }
    });

    setFilteredPosts(filtered);
  }, [posts, filterBy, sortBy, searchQuery]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return '📷';
      case 'facebook':
        return '👥';
      case 'tiktok':
        return '🎵';
      default:
        return '📱';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'from-pink-500 to-purple-600';
      case 'facebook':
        return 'from-blue-500 to-blue-700';
      case 'tiktok':
        return 'from-gray-800 to-gray-900';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  const formatEngagement = (metrics?: EngagementMetrics) => {
    if (!metrics) return { likes: 0, comments: 0, shares: 0, views: 0 };
    return {
      likes: metrics.likes || 0,
      comments: metrics.comments || 0,
      shares: metrics.shares || 0,
      views: metrics.views || 0,
    };
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('social.searchPosts')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-4 w-4 text-gray-500" />
                <select
                  value={filterBy}
                  onChange={e => setFilterBy(e.target.value as FilterOption)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="all">{t('social.allPlatforms')}</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="newest">{t('social.sortNewest')}</option>
                <option value="oldest">{t('social.sortOldest')}</option>
                <option value="engagement">{t('social.sortEngagement')}</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('social.noPostsFound')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || filterBy !== 'all'
                ? t('social.noPostsMatchFilter')
                : t('social.noPostsYet')}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map(post => {
            const engagement = formatEngagement(post.engagementMetrics);

            return (
              <Card key={post.id}>
                <div className="p-6">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(post.publishedAt!)}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {post.platforms.map((platform, index) => (
                            <div
                              key={index}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs bg-gradient-to-r ${getPlatformColor(platform.platform)} text-white`}
                            >
                              <span className="mr-1">{getPlatformIcon(platform.platform)}</span>
                              {platform.platform}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* External Links */}
                    <div className="flex items-center space-x-2">
                      {post.platforms.map(
                        (platform, index) =>
                          platform.url && (
                            <Button
                              key={index}
                              onClick={() => window.open(platform.url, '_blank')}
                              variant="outline"
                              size="sm"
                              className="flex items-center space-x-1"
                            >
                              <span>{getPlatformIcon(platform.platform)}</span>
                              <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                            </Button>
                          )
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <p className="text-gray-900 dark:text-white mb-2">{post.caption}</p>
                    {post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.hashtags.map((hashtag, index) => (
                          <span
                            key={index}
                            className="text-accent-600 text-sm hover:underline cursor-pointer"
                          >
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Engagement Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <HeartIconSolid className="h-5 w-5 text-red-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {engagement.likes.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t('social.likes')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <ChatBubbleLeftIconSolid className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {engagement.comments.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t('social.comments')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <ShareIconSolid className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {engagement.shares.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t('social.shares')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <EyeIconSolid className="h-5 w-5 text-purple-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {engagement.views.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t('social.views')}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PostHistory;
