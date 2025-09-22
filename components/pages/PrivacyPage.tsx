import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { LogoIcon, HeartIcon, ShieldIcon, LockIcon, EyeIcon } from '../common/Icons';
import LanguageSwitcher from '../common/LanguageSwitcher';

interface PrivacyPageProps {
  onNavigate: (page: 'signin' | 'signup' | 'landing' | 'about' | 'contact' | 'blog' | 'terms') => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
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
            <button onClick={() => onNavigate('about')} className="hover:text-accent transition-colors font-semibold">{t('nav.about')}</button>
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
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                <ShieldIcon className="w-8 h-8 text-accent" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">{t('privacy.hero.title')}</h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('privacy.hero.subtitle')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              {t('privacy.hero.lastUpdated')}
            </p>
          </div>
        </section>

        {/* Privacy Highlights */}
        <section className="py-16 px-6 bg-gray-100 dark:bg-gray-800/50">
          <div className="container mx-auto">
            <h3 className="text-2xl font-bold text-center mb-12 text-gray-900 dark:text-white">{t('privacy.highlights.title')}</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LockIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">{t('privacy.highlights.encryption.title')}</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('privacy.highlights.encryption.description')}
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <EyeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">{t('privacy.highlights.transparency.title')}</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('privacy.highlights.transparency.description')}
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">{t('privacy.highlights.control.title')}</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('privacy.highlights.control.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Policy Content */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.information.title')}</h3>
              <div className="text-gray-700 dark:text-gray-300 mb-6">
                <p className="mb-4">{t('privacy.information.description')}</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>{t('privacy.information.list.account')}</li>
                  <li>{t('privacy.information.list.services')}</li>
                  <li>{t('privacy.information.list.support')}</li>
                  <li>{t('privacy.information.list.newsletter')}</li>
                  <li>{t('privacy.information.list.surveys')}</li>
                </ul>
                <p className="mt-4">{t('privacy.information.includes')}</p>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.usage.title')}</h3>
              <div className="text-gray-700 dark:text-gray-300 mb-6">
                <p className="mb-4">{t('privacy.usage.description')}</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>{t('privacy.usage.list.provide')}</li>
                  <li>{t('privacy.usage.list.process')}</li>
                  <li>{t('privacy.usage.list.send')}</li>
                  <li>{t('privacy.usage.list.respond')}</li>
                  <li>{t('privacy.usage.list.communicate')}</li>
                  <li>{t('privacy.usage.list.monitor')}</li>
                  <li>{t('privacy.usage.list.detect')}</li>
                </ul>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.sharing.title')}</h3>
              <div className="text-gray-700 dark:text-gray-300 mb-6">
                <p className="mb-4">{t('privacy.sharing.description')}</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>{t('privacy.sharing.list.providers.title')}:</strong> {t('privacy.sharing.list.providers.description')}</li>
                  <li><strong>{t('privacy.sharing.list.legal.title')}:</strong> {t('privacy.sharing.list.legal.description')}</li>
                  <li><strong>{t('privacy.sharing.list.business.title')}:</strong> {t('privacy.sharing.list.business.description')}</li>
                  <li><strong>{t('privacy.sharing.list.consent.title')}:</strong> {t('privacy.sharing.list.consent.description')}</li>
                </ul>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.security.title')}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {t('privacy.security.description')}
              </p>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.retention.title')}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {t('privacy.retention.description')}
              </p>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.rights.title')}</h3>
              <div className="text-gray-700 dark:text-gray-300 mb-6">
                <p className="mb-4">{t('privacy.rights.description')}</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>{t('privacy.rights.list.access.title')}:</strong> {t('privacy.rights.list.access.description')}</li>
                  <li><strong>{t('privacy.rights.list.correction.title')}:</strong> {t('privacy.rights.list.correction.description')}</li>
                  <li><strong>{t('privacy.rights.list.deletion.title')}:</strong> {t('privacy.rights.list.deletion.description')}</li>
                  <li><strong>{t('privacy.rights.list.portability.title')}:</strong> {t('privacy.rights.list.portability.description')}</li>
                  <li><strong>{t('privacy.rights.list.objection.title')}:</strong> {t('privacy.rights.list.objection.description')}</li>
                  <li><strong>{t('privacy.rights.list.withdrawal.title')}:</strong> {t('privacy.rights.list.withdrawal.description')}</li>
                </ul>
                <p className="mt-4">{t('privacy.rights.contact')}</p>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.cookies.title')}</h3>
              <div className="text-gray-700 dark:text-gray-300 mb-6">
                <p className="mb-4">{t('privacy.cookies.description')}</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>{t('privacy.cookies.list.remember')}</li>
                  <li>{t('privacy.cookies.list.analyze')}</li>
                  <li>{t('privacy.cookies.list.improve')}</li>
                  <li>{t('privacy.cookies.list.personalized')}</li>
                </ul>
                <p className="mt-4">{t('privacy.cookies.control')}</p>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.thirdParty.title')}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {t('privacy.thirdParty.description')}
              </p>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.children.title')}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {t('privacy.children.description')}
              </p>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.international.title')}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {t('privacy.international.description')}
              </p>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.changes.title')}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {t('privacy.changes.description')}
              </p>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.contact.title')}</h3>
              <div className="text-gray-700 dark:text-gray-300 mb-6">
                <p className="mb-4">{t('privacy.contact.description')}</p>
                <ul className="space-y-2">
                  <li>{t('privacy.contact.email')}</li>
                  <li>{t('privacy.contact.phone')}</li>
                  <li>{t('privacy.contact.address')}</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg mt-12">
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-2">{t('privacy.dpo.title')}</h4>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {t('privacy.dpo.description')}
                </p>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mt-8">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('privacy.summary.title')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('privacy.summary.description')}
                </p>
              </div>
            </div>
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
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-accent">{t('footer.product.features')}</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-accent">{t('footer.product.pricing')}</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-accent">{t('footer.product.api')}</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">{t('footer.company.title')}</h5>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => onNavigate('about')} className="text-gray-600 dark:text-gray-400 hover:text-accent">{t('nav.about')}</button></li>
                <li><button onClick={() => onNavigate('contact')} className="text-gray-600 dark:text-gray-400 hover:text-accent">{t('nav.contact')}</button></li>
                <li><button onClick={() => onNavigate('blog')} className="text-gray-600 dark:text-gray-400 hover:text-accent">{t('nav.blog')}</button></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">{t('footer.legal.title')}</h5>
              <ul className="space-y-2 text-sm">
                <li><span className="text-accent font-semibold">{t('footer.legal.privacy')}</span></li>
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

export default PrivacyPage;