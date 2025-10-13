import React from 'react';
// FIX: Updated import path to use the common Icons component.
import { LogoIcon } from './common/Icons';
import { useSettings } from '../contexts/SettingsContext';

interface LandingPageProps {
  onNavigate: (page: 'signin' | 'signup' | 'landing') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { t } = useSettings();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LogoIcon className="w-10 h-10 text-accent" />
            <h1 className="text-2xl font-bold tracking-tight">Kimba</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('signin')}
              className="hover:text-accent transition-colors font-semibold"
            >
              {t('auth.signin')}
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className="px-5 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white transition-all shadow-md"
            >
              {t('auth.getStarted')}
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-grow flex items-center justify-center">
        {/* Hero Section */}
        <section className="text-center py-20 px-6">
          <div className="container mx-auto">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
              {t('landing.hero.title')}
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-8">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => onNavigate('signup')}
                className="px-8 py-4 bg-accent hover:opacity-90 rounded-lg text-lg font-bold text-white transition-all shadow-xl"
              >
                {t('landing.hero.cta')}
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-500">{t('landing.hero.noCreditCard')}</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8">
        <div className="container mx-auto px-6 text-center text-gray-600 dark:text-gray-400">
          <p>{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
