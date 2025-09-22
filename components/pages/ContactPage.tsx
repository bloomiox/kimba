import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { LogoIcon, HeartIcon, MailIcon, PhoneIcon, MessageCircleIcon, UserIcon } from '../common/Icons';
import LanguageSwitcher from '../common/LanguageSwitcher';

interface ContactPageProps {
  onNavigate: (page: 'signin' | 'signup' | 'landing' | 'about' | 'capabilities' | 'blog' | 'terms' | 'privacy') => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const { t } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

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
            <button onClick={() => onNavigate('capabilities')} className="hover:text-accent transition-colors font-semibold">{t('capabilities.nav.capabilities')}</button>
            <span className="text-accent font-semibold">{t('nav.contact')}</span>
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
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">{t('contact.hero.title')}</h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('contact.hero.subtitle')}
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-20 px-6 bg-gray-100 dark:bg-gray-800/50">
          <div className="container mx-auto">
            <h3 className="text-2xl font-bold text-center mb-12 text-gray-900 dark:text-white">{t('contact.info.title')}</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MailIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">{t('contact.support.title')}</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('contact.support.description')}
                </p>
                <p className="text-accent font-semibold mt-2">support@kimba.pro</p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">{t('contact.chat.title')}</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('contact.chat.description')}
                </p>
                <p className="text-accent font-semibold mt-2">{t('contact.chat.hours')}</p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">{t('contact.help.title')}</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('contact.help.description')}
                </p>
                <p className="text-accent font-semibold mt-2">{t('contact.help.link')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-2xl">
            <h3 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">{t('contact.form.title')}</h3>
            
            {isSubmitted ? (
              <div className="p-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-green-800 dark:text-green-400 mb-2">
                  {t('contact.form.success.title')}
                </h4>
                <p className="text-green-700 dark:text-green-300">
                  {t('contact.form.success.description')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('contact.form.name')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent dark:bg-gray-800 dark:text-white"
                      placeholder={t('contact.form.name')}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('contact.form.email')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent dark:bg-gray-800 dark:text-white"
                      placeholder={t('contact.form.email')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('contact.form.subject')}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent dark:bg-gray-800 dark:text-white"
                    placeholder={t('contact.form.subject')}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('contact.form.message')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                    placeholder={t('contact.form.message')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 bg-accent hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-lg transition-all shadow-md"
                >
                  {isSubmitting ? t('contact.form.sending') : t('contact.form.send')}
                </button>
              </form>
            )}
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
                <li><span className="text-accent font-semibold">{t('nav.contact')}</span></li>
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

export default ContactPage;