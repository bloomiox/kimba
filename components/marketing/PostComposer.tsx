import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Client, Lookbook, SocialPost, SocialPlatform } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { 
  HashtagIcon, 
  SparklesIcon,
  ShareIcon,
  PhotoIcon,
  CheckCircleIcon,
  ClockIcon
} from '../common/Icons';

interface PostComposerProps {
  selectedPhotos: Lookbook[];
  client: Client;
  onBack: () => void;
  onPost: (post: SocialPost) => void;
}

interface PlatformOption {
  id: 'instagram' | 'facebook' | 'tiktok';
  name: string;
  icon: string;
  maxLength: number;
  supportsHashtags: boolean;
  isConnected: boolean;
}

const SUGGESTED_HASHTAGS = [
  '#hairtransformation', '#newlook', '#hairgoals', '#salon', '#hairstyle',
  '#beforeandafter', '#hairmakeover', '#beauty', '#confidence', '#style',
  '#haircut', '#haircolor', '#professional', '#glamour', '#selfcare'
];

const PostComposer: React.FC<PostComposerProps> = ({ 
  selectedPhotos, 
  client, 
  onBack, 
  onPost 
}) => {
  const { settings, t } = useSettings();
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const platforms: PlatformOption[] = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📷',
      maxLength: 2200,
      supportsHashtags: true,
      isConnected: Boolean(settings.socialMedia?.instagram)
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '👥',
      maxLength: 63206,
      supportsHashtags: true,
      isConnected: Boolean(settings.socialMedia?.facebook)
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: '🎵',
      maxLength: 300,
      supportsHashtags: true,
      isConnected: Boolean(settings.socialMedia?.tiktok)
    }
  ];

  const connectedPlatforms = platforms.filter(p => p.isConnected);

  useEffect(() => {
    // Auto-select connected platforms
    setSelectedPlatforms(connectedPlatforms.map(p => p.id));
  }, []);

  const handleGenerateCaption = async () => {
    setIsGeneratingCaption(true);
    
    try {
      // Simulate AI caption generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedCaptions = [
        `✨ Amazing transformation for ${client.name}! From vision to reality - love how this ${selectedPhotos[0]?.finalImage.hairstyleName.toLowerCase()} turned out! 💫`,
        `${client.name} is absolutely glowing with her new ${selectedPhotos[0]?.finalImage.hairstyleName.toLowerCase()}! ✨ Sometimes a fresh cut is all you need to feel amazing! 💕`,
        `The joy on ${client.name}'s face says it all! 😍 This ${selectedPhotos[0]?.finalImage.hairstyleName.toLowerCase()} is pure perfection! ✂️✨`,
        `Another stunning transformation! ${client.name} rocks this ${selectedPhotos[0]?.finalImage.hairstyleName.toLowerCase()} so beautifully! 🌟`
      ];
      
      const randomCaption = generatedCaptions[Math.floor(Math.random() * generatedCaptions.length)];
      setCaption(randomCaption);
      
      // Auto-suggest relevant hashtags
      const suggestedHashtags = SUGGESTED_HASHTAGS
        .sort(() => 0.5 - Math.random())
        .slice(0, 8);
      setHashtags(suggestedHashtags);
      
    } catch (error) {
      console.error('Failed to generate caption:', error);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => {
      const isSelected = prev.includes(platformId);
      if (isSelected) {
        return prev.filter(id => id !== platformId);
      } else {
        return [...prev, platformId];
      }
    });
  };

  const handleHashtagToggle = (hashtag: string) => {
    setHashtags(prev => {
      const isSelected = prev.includes(hashtag);
      if (isSelected) {
        return prev.filter(h => h !== hashtag);
      } else {
        return [...prev, hashtag];
      }
    });
  };

  const handleAddCustomHashtag = (customHashtag: string) => {
    const tag = customHashtag.startsWith('#') ? customHashtag : `#${customHashtag}`;
    if (!hashtags.includes(tag)) {
      setHashtags(prev => [...prev, tag]);
    }
  };

  const handlePublish = async () => {
    if (!selectedPlatforms.length || !caption.trim()) return;

    setIsPublishing(true);
    
    try {
      const socialPlatforms: SocialPlatform[] = selectedPlatforms.map(platformId => ({
        platform: platformId as 'instagram' | 'facebook' | 'tiktok',
        status: 'pending'
      }));

      const newPost: SocialPost = {
        id: `post_${Date.now()}`,
        lookbookId: selectedPhotos[0].id,
        clientId: client.id,
        platforms: socialPlatforms,
        caption: caption.trim(),
        hashtags,
        status: 'published',
        publishedAt: new Date(),
        externalIds: {},
        createdAt: new Date()
      };

      // Simulate publishing delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mark platforms as published with mock external IDs
      newPost.platforms = newPost.platforms.map(platform => ({
        ...platform,
        status: 'published',
        postId: `${platform.platform}_${Date.now()}`,
        url: `https://${platform.platform}.com/p/${Date.now()}`
      }));

      onPost(newPost);
      
    } catch (error) {
      console.error('Failed to publish post:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const getCharacterCount = () => {
    const fullText = `${caption} ${hashtags.join(' ')}`;
    return fullText.length;
  };

  const getMaxCharacters = () => {
    const selectedPlatformObjects = platforms.filter(p => selectedPlatforms.includes(p.id));
    return Math.min(...selectedPlatformObjects.map(p => p.maxLength));
  };

  const isOverLimit = () => {
    return getCharacterCount() > getMaxCharacters();
  };

  return (
    <div className="space-y-6">
      {/* Selected Photos Preview */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('social.selectedPhotos')}
          </h3>
          
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {selectedPhotos.map((lookbook) => (
              <div key={lookbook.id} className="flex-shrink-0">
                <img
                  src={lookbook.finalImage.src}
                  alt={lookbook.finalImage.hairstyleName}
                  className="w-24 h-32 object-cover rounded-lg"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  {lookbook.finalImage.hairstyleName}
                </p>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            {t('social.clientName')}: <span className="font-medium">{client.name}</span>
          </p>
        </div>
      </Card>

      {/* Platform Selection */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('social.selectPlatforms')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {connectedPlatforms.map((platform) => (
              <div
                key={platform.id}
                onClick={() => handlePlatformToggle(platform.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPlatforms.includes(platform.id)
                    ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-accent-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{platform.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {platform.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('social.maxCharacters', { count: platform.maxLength })}
                      </p>
                    </div>
                  </div>
                  {selectedPlatforms.includes(platform.id) && (
                    <CheckCircleIcon className="h-5 w-5 text-accent-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Caption Composition */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('social.composeCaption')}
            </h3>
            <Button
              onClick={handleGenerateCaption}
              disabled={isGeneratingCaption}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              {isGeneratingCaption ? (
                <>
                  <div className="w-4 h-4 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
                  <span>{t('common.generating')}</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="h-4 w-4" />
                  <span>{t('social.generateCaption')}</span>
                </>
              )}
            </Button>
          </div>
          
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={t('social.captionPlaceholder')}
            className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-accent-500 dark:bg-gray-800 dark:text-white"
          />
          
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('social.captionTip')}
            </p>
            <p className={`text-sm ${isOverLimit() ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
              {getCharacterCount()} / {getMaxCharacters()}
            </p>
          </div>
        </div>
      </Card>

      {/* Hashtags */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <HashtagIcon className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('social.hashtags')}
            </h3>
          </div>
          
          <div className="space-y-4">
            {/* Selected Hashtags */}
            {hashtags.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('social.selectedHashtags')}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((hashtag) => (
                    <span
                      key={hashtag}
                      onClick={() => handleHashtagToggle(hashtag)}
                      className="inline-flex items-center px-3 py-1 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-full text-sm cursor-pointer hover:bg-accent-200 dark:hover:bg-accent-900/50"
                    >
                      {hashtag}
                      <button className="ml-2 text-accent-500 hover:text-accent-700">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Suggested Hashtags */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('social.suggestedHashtags')}:
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_HASHTAGS
                  .filter(hashtag => !hashtags.includes(hashtag))
                  .map((hashtag) => (
                    <span
                      key={hashtag}
                      onClick={() => handleHashtagToggle(hashtag)}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      {hashtag}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Publish Actions */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={onBack}
              variant="outline"
            >
              {t('common.back')}
            </Button>
            
            <div className="flex items-center space-x-3">
              <Button
                disabled
                variant="outline"
                className="flex items-center space-x-2 opacity-50"
              >
                <ClockIcon className="h-4 w-4" />
                <span>{t('social.schedule')}</span>
              </Button>
              
              <Button
                onClick={handlePublish}
                disabled={!selectedPlatforms.length || !caption.trim() || isOverLimit() || isPublishing}
                className="flex items-center space-x-2 bg-accent-600 hover:bg-accent-700 disabled:opacity-50"
              >
                {isPublishing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('social.publishing')}</span>
                  </>
                ) : (
                  <>
                    <ShareIcon className="h-4 w-4" />
                    <span>{t('social.publishNow')}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PostComposer;