import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import CampaignsTab from './CampaignsTab';
import SegmentsTab from './SegmentsTab';
import CouponsTab from './CouponsTab';
import SocialMediaTab from './SocialMediaTab';

type MarketingTab = 'campaigns' | 'segments' | 'coupons' | 'social';

const MarketingPage: React.FC = () => {
  const { t } = useSettings();
  const [activeTab, setActiveTab] = useState<MarketingTab>('campaigns');

  const tabClasses = (tabName: MarketingTab) => 
    `py-3 px-4 font-semibold text-sm transition-colors border-b-2 ${
      activeTab === tabName
        ? 'border-accent text-accent'
        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
    }`;
  
  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="flex-shrink-0 flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-3xl font-bold">{t('sidebar.marketing')}</h2>
      </div>
      
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          <button onClick={() => setActiveTab('campaigns')} className={tabClasses('campaigns')}>
            {t('marketing.tabs.campaigns')}
          </button>
          <button onClick={() => setActiveTab('segments')} className={tabClasses('segments')}>
            {t('marketing.tabs.segments')}
          </button>
          <button onClick={() => setActiveTab('coupons')} className={tabClasses('coupons')}>
            {t('marketing.tabs.coupons')}
          </button>
          <button onClick={() => setActiveTab('social')} className={tabClasses('social')}>
            {t('marketing.tabs.social')}
          </button>
        </nav>
      </div>

      <div className="flex-grow mt-6">
        {activeTab === 'campaigns' && <CampaignsTab />}
        {activeTab === 'segments' && <SegmentsTab />}
        {activeTab === 'coupons' && <CouponsTab />}
        {activeTab === 'social' && <SocialMediaTab />}
      </div>
    </div>
  );
};

export default MarketingPage;