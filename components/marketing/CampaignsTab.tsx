import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Campaign, Coupon, Segment } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { PlusIcon } from '../common/Icons';
import Modal from '../common/Modal';

const CampaignsTab: React.FC = () => {
  const { campaigns, segments, coupons, sendCampaign, t } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const segmentsById = React.useMemo(
    () => segments.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {} as Record<string, string>),
    [segments]
  );
  const couponsById = React.useMemo(
    () => coupons.reduce((acc, c) => ({ ...acc, [c.id]: c.code }), {} as Record<string, string>),
    [coupons]
  );

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{t('marketing.campaigns.title')}</h3>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="w-5 h-5" /> {t('marketing.campaigns.new')}
        </Button>
      </div>

      <Card>
        {campaigns.length > 0 ? (
          <div className="space-y-4">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg">{campaign.name}</p>
                    <p className="text-sm text-gray-500 italic">"{campaign.message}"</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{new Date(campaign.sentAt).toLocaleString(t('language.code'))}</p>
                    <p className="text-gray-500">
                      {t('marketing.campaigns.recipients', { count: campaign.recipientCount })}
                    </p>
                  </div>
                </div>
                <div className="text-xs mt-2 text-gray-600 dark:text-gray-400">
                  <span>
                    {t('marketing.campaigns.segment')}:{' '}
                    <span className="font-semibold">
                      {segmentsById[campaign.segmentId] || 'Deleted Segment'}
                    </span>
                  </span>
                  {campaign.couponId && (
                    <span className="ml-4">
                      {t('marketing.campaigns.coupon')}:{' '}
                      <span className="font-semibold">
                        {couponsById[campaign.couponId] || 'Deleted Coupon'}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500">{t('marketing.campaigns.empty')}</p>
        )}
      </Card>

      {isModalOpen && <CampaignModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

const CampaignModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { segments, coupons, sendCampaign, t } = useSettings();
  const activeCoupons = coupons.filter(c => c.isActive);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const message = formData.get('message') as string;
    const segmentId = formData.get('segmentId') as string;
    const couponId = formData.get('couponId') as string;

    if (!name || !message || !segmentId) return;

    sendCampaign({ name, message, segmentId, couponId: couponId || undefined });
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={t('marketing.campaigns.new')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            {t('marketing.campaigns.form.name')}
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium">
            {t('marketing.campaigns.form.message')}
          </label>
          <textarea
            name="message"
            id="message"
            rows={4}
            required
            className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
          />
        </div>
        <div>
          <label htmlFor="segmentId" className="block text-sm font-medium">
            {t('marketing.campaigns.form.segment')}
          </label>
          <select
            name="segmentId"
            id="segmentId"
            required
            className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="">{t('marketing.campaigns.form.selectSegment')}</option>
            {segments.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="couponId" className="block text-sm font-medium">
            {t('marketing.campaigns.form.coupon')}
          </label>
          <select
            name="couponId"
            id="couponId"
            className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="">{t('marketing.campaigns.form.noCoupon')}</option>
            {activeCoupons.map(c => (
              <option key={c.id} value={c.id}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" onClick={onClose} variant="secondary">
            {t('common.cancel')}
          </Button>
          <Button type="submit">{t('marketing.campaigns.form.send')}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CampaignsTab;
