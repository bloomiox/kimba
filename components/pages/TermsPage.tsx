import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import Card from '../common/Card';

interface TermsPageProps {
  onNavigate: (
    page: 'signin' | 'signup' | 'landing' | 'about' | 'contact' | 'blog' | 'privacy'
  ) => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  const { t } = useSettings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-6">
            {t('terms.title')}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
            {t('terms.lastUpdated')}
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('terms.agreement.title')}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {t('terms.agreement.content')}
            </p>
          </Card>

          <Card className="p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('terms.service.title')}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {t('terms.service.content')}
            </p>
          </Card>

          <Card className="p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('terms.accounts.title')}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {t('terms.accounts.content')}
            </p>
          </Card>

          <Card className="p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('terms.acceptable.title')}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {t('terms.acceptable.content')}
            </p>
          </Card>

          <Card className="p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('terms.content.title')}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {t('terms.content.content')}
            </p>
          </Card>

          <Card className="p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('terms.privacy.title')}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {t('terms.privacy.content')}
            </p>
          </Card>

          <Card className="p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('terms.payment.title')}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {t('terms.payment.content')}
            </p>
          </Card>

          <Card className="p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('terms.termination.title')}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {t('terms.termination.content')}
            </p>
          </Card>

          <Card className="p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('terms.warranty.title')}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {t('terms.warranty.content')}
            </p>
          </Card>

          <Card className="p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('terms.limitation.title')}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {t('terms.limitation.content')}
            </p>
          </Card>

          <Card className="p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('terms.indemnification.title')}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {t('terms.indemnification.content')}
            </p>
          </Card>

          <Card className="p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('terms.governing.title')}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {t('terms.governing.content')}
            </p>
          </Card>

          <Card className="p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('terms.severability.title')}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {t('terms.severability.content')}
            </p>
          </Card>

          <Card className="p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('terms.changes.title')}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {t('terms.changes.content')}
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;
