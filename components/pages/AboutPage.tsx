import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { LogoIcon, HeartIcon, SparklesIcon, UsersIcon, ShieldIcon, TrendingUpIcon } from '../common/Icons';
import LanguageSwitcher from '../common/LanguageSwitcher';

interface AboutPageProps {
  onNavigate: (page: 'signin' | 'signup' | 'landing' | 'capabilities' | 'contact' | 'blog' | 'terms' | 'privacy') => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { t } = useSettings();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('landing')}>
            <LogoIcon className="w-10 h-10 text-accent" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Kimba</h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => onNavigate('landing')} className="hover:text-accent transition-colors font-semibold">{t('nav.home')}</button>
            <span className="text-accent font-semibold">{t('nav.about')}</span>
            <button onClick={() => onNavigate('capabilities')} className="hover:text-accent transition-colors font-semibold">{t('capabilities.nav.capabilities')}</button>
            <button onClick={() => onNavigate('contact')} className="hover:text-accent transition-colors font-semibold">{t('nav.contact')}</button>
            <button onClick={() => onNavigate('blog')} className="hover:text-accent transition-colors font-semibold">{t('nav.blog')}</button>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button onClick={() => onNavigate('signin')} className="hover:text-accent transition-colors font-semibold">{t('auth.signin')}</button>
            <button onClick={() => onNavigate('signup')} className="px-5 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white transition-all shadow-md">{t('auth.getStarted')}</button>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 px-6 text-center bg-gradient-to-br from-white via-accent-50/30 to-accent-100/20 dark:from-gray-900 dark:via-accent-950/30 dark:to-accent-900/20">
          <div className="container mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">{t('about.hero.title')}</h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('about.hero.subtitle')}
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-8 h-8 text-accent" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{t('about.mission.title')}</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('about.mission.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-6 bg-gray-100 dark:bg-gray-800/50">
          <div className="container mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">{t('about.values.title')}</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">{t('about.values.innovation.title')}</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('about.values.innovation.description')}
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">{t('about.values.simplicity.title')}</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('about.values.simplicity.description')}
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">{t('about.values.support.title')}</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('about.values.support.description')}
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUpIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h4 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">{t('about.values.quality.title')}</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('about.values.quality.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{t('about.story.title')}</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('about.story.description')}
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-accent text-white">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">{t('about.cta.title')}</h3>
            <p className="max-w-xl mx-auto text-accent-100 mb-8">{t('about.cta.description')}</p>
            <button onClick={() => onNavigate('signup')} className="px-8 py-4 bg-white hover:bg-gray-100 rounded-lg text-lg font-bold text-accent transition-all shadow-2xl">{t('about.cta.button')}</button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-gray-100 dark:bg-gray-800/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <LogoIcon className="w-8 h-8 text-accent" />
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Kimba</h4>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {t('footer.description')}
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">{t('footer.product.title')}</h5>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => onNavigate('capabilities')} className="text-gray-600 dark:text-gray-400 hover:text-accent">{t('capabilities.nav.capabilities')}</button></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-accent">{t('footer.product.pricing')}</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-accent">{t('footer.product.api')}</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">{t('footer.company.title')}</h5>
              <ul className="space-y-2 text-sm">
                <li><span className="text-accent font-semibold">{t('nav.about')}</span></li>
                <li><button onClick={() => onNavigate('capabilities')} className="text-gray-600 dark:text-gray-400 hover:text-accent">{t('capabilities.nav.capabilities')}</button></li>
                <li><button onClick={() => onNavigate('contact')} className="text-gray-600 dark:text-gray-400 hover:text-accent">{t('nav.contact')}</button></li>
                <li><button onClick={() => onNavigate('blog')} className="text-gray-600 dark:text-gray-400 hover:text-accent">{t('nav.blog')}</button></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">{t('footer.legal.title')}</h5>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => onNavigate('privacy')} className="text-gray-600 dark:text-gray-400 hover:text-accent">{t('footer.legal.privacy')}</button></li>
                <li><button onClick={() => onNavigate('terms')} className="text-gray-600 dark:text-gray-400 hover:text-accent">{t('footer.legal.terms')}</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('footer.copyright')}
            </p>
            <p className="text-sm mt-2 md:mt-0 flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              {t('footer.madeWith')} <HeartIcon className="w-4 h-4 text-red-500" /> {t('footer.forProfessionals')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;