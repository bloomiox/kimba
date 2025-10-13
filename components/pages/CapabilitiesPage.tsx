import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import {
  LogoIcon,
  HeartIcon,
  SparklesIcon,
  UsersIcon,
  CalendarIcon,
  TrendingUpIcon,
  CreditCardIcon,
  CheckCircleIcon,
  PlusIcon,
  CameraIcon,
  ClipboardListIcon,
  BarChartIcon,
  MessageSquareIcon,
  ShareIcon,
  SettingsIcon,
} from '../common/Icons';
import LanguageSwitcher from '../common/LanguageSwitcher';

interface CapabilitiesPageProps {
  onNavigate: (
    page: 'signin' | 'signup' | 'landing' | 'about' | 'contact' | 'blog' | 'terms' | 'privacy'
  ) => void;
}

const CapabilitiesPage: React.FC<CapabilitiesPageProps> = ({ onNavigate }) => {
  const { t, loading } = useSettings();

  // Don't render until translations are loaded
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading translations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onNavigate('landing')}
          >
            <LogoIcon className="w-10 h-10 text-accent" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Kimba
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => onNavigate('landing')}
              className="hover:text-accent transition-colors font-semibold"
            >
              {t('nav.home')}
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="hover:text-accent transition-colors font-semibold"
            >
              {t('nav.about')}
            </button>
            <span className="text-accent font-semibold">{t('capabilities.nav.capabilities')}</span>
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-accent transition-colors font-semibold"
            >
              {t('nav.contact')}
            </button>
            <button
              onClick={() => onNavigate('blog')}
              className="hover:text-accent transition-colors font-semibold"
            >
              {t('nav.blog')}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => onNavigate('signin')}
              className="hover:text-accent transition-colors font-semibold"
            >
              {t('auth.landing.signIn')}
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className="px-5 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white transition-all shadow-md"
            >
              {t('auth.landing.getStarted')}
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 px-6 text-center bg-gradient-to-br from-white via-accent-50/30 to-accent-100/20 dark:from-gray-900 dark:via-accent-950/30 dark:to-accent-900/20">
          <div className="container mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              {t('capabilities.hero.title')}
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              {t('capabilities.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => onNavigate('signup')}
                className="px-8 py-4 bg-accent hover:bg-accent-600 rounded-xl text-lg font-bold text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
              >
                {t('capabilities.hero.cta')}
              </button>
              <button
                onClick={() => onNavigate('about')}
                className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-lg font-bold text-gray-900 dark:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {t('capabilities.hero.learnMore')}
              </button>
            </div>
          </div>
        </section>

        {/* Problems & Solutions Overview */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                {t('capabilities.overview.title')}
              </h3>
              <p className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-300">
                {t('capabilities.overview.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  {t('capabilities.overview.problems.title')}
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>{t('capabilities.overview.problems.p1')}</li>
                  <li>{t('capabilities.overview.problems.p2')}</li>
                  <li>{t('capabilities.overview.problems.p3')}</li>
                  <li>{t('capabilities.overview.problems.p4')}</li>
                </ul>
              </div>

              <div className="text-center p-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SparklesIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  {t('capabilities.overview.solution.title')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t('capabilities.overview.solution.description')}
                </p>
              </div>

              <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUpIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  {t('capabilities.overview.results.title')}
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>{t('capabilities.overview.results.r1')}</li>
                  <li>{t('capabilities.overview.results.r2')}</li>
                  <li>{t('capabilities.overview.results.r3')}</li>
                  <li>{t('capabilities.overview.results.r4')}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Capabilities */}
        <section className="py-20 px-6 bg-gray-100 dark:bg-gray-800/50">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                {t('capabilities.detailed.title')}
              </h3>
              <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
                {t('capabilities.detailed.subtitle')}
              </p>
            </div>

            <div className="space-y-16">
              {/* AI Design Studio */}
              <CapabilityCard
                icon={CameraIcon}
                title={t('capabilities.studio.title')}
                challenge={t('capabilities.studio.challenge')}
                solution={t('capabilities.studio.solution')}
                benefits={[
                  t('capabilities.studio.benefit1'),
                  t('capabilities.studio.benefit2'),
                  t('capabilities.studio.benefit3'),
                  t('capabilities.studio.benefit4'),
                ]}
                features={[
                  t('capabilities.studio.feature1'),
                  t('capabilities.studio.feature2'),
                  t('capabilities.studio.feature3'),
                  t('capabilities.studio.feature4'),
                ]}
                iconColor="text-purple-600 dark:text-purple-400"
                bgColor="bg-purple-100 dark:bg-purple-900/30"
                reverse={false}
              />

              {/* Client Management */}
              <CapabilityCard
                icon={UsersIcon}
                title={t('capabilities.clients.title')}
                challenge={t('capabilities.clients.challenge')}
                solution={t('capabilities.clients.solution')}
                benefits={[
                  t('capabilities.clients.benefit1'),
                  t('capabilities.clients.benefit2'),
                  t('capabilities.clients.benefit3'),
                  t('capabilities.clients.benefit4'),
                ]}
                features={[
                  t('capabilities.clients.feature1'),
                  t('capabilities.clients.feature2'),
                  t('capabilities.clients.feature3'),
                  t('capabilities.clients.feature4'),
                ]}
                iconColor="text-blue-600 dark:text-blue-400"
                bgColor="bg-blue-100 dark:bg-blue-900/30"
                reverse={true}
              />

              {/* Smart Scheduling */}
              <CapabilityCard
                icon={CalendarIcon}
                title={t('capabilities.scheduling.title')}
                challenge={t('capabilities.scheduling.challenge')}
                solution={t('capabilities.scheduling.solution')}
                benefits={[
                  t('capabilities.scheduling.benefit1'),
                  t('capabilities.scheduling.benefit2'),
                  t('capabilities.scheduling.benefit3'),
                  t('capabilities.scheduling.benefit4'),
                ]}
                features={[
                  t('capabilities.scheduling.feature1'),
                  t('capabilities.scheduling.feature2'),
                  t('capabilities.scheduling.feature3'),
                  t('capabilities.scheduling.feature4'),
                ]}
                iconColor="text-green-600 dark:text-green-400"
                bgColor="bg-green-100 dark:bg-green-900/30"
                reverse={false}
              />

              {/* Analytics & Insights */}
              <CapabilityCard
                icon={BarChartIcon}
                title={t('capabilities.analytics.title')}
                challenge={t('capabilities.analytics.challenge')}
                solution={t('capabilities.analytics.solution')}
                benefits={[
                  t('capabilities.analytics.benefit1'),
                  t('capabilities.analytics.benefit2'),
                  t('capabilities.analytics.benefit3'),
                  t('capabilities.analytics.benefit4'),
                ]}
                features={[
                  t('capabilities.analytics.feature1'),
                  t('capabilities.analytics.feature2'),
                  t('capabilities.analytics.feature3'),
                  t('capabilities.analytics.feature4'),
                ]}
                iconColor="text-orange-600 dark:text-orange-400"
                bgColor="bg-orange-100 dark:bg-orange-900/30"
                reverse={true}
              />

              {/* POS & Sales */}
              <CapabilityCard
                icon={CreditCardIcon}
                title={t('capabilities.pos.title')}
                challenge={t('capabilities.pos.challenge')}
                solution={t('capabilities.pos.solution')}
                benefits={[
                  t('capabilities.pos.benefit1'),
                  t('capabilities.pos.benefit2'),
                  t('capabilities.pos.benefit3'),
                  t('capabilities.pos.benefit4'),
                ]}
                features={[
                  t('capabilities.pos.feature1'),
                  t('capabilities.pos.feature2'),
                  t('capabilities.pos.feature3'),
                  t('capabilities.pos.feature4'),
                ]}
                iconColor="text-emerald-600 dark:text-emerald-400"
                bgColor="bg-emerald-100 dark:bg-emerald-900/30"
                reverse={false}
              />

              {/* Marketing & Social */}
              <CapabilityCard
                icon={ShareIcon}
                title={t('capabilities.marketing.title')}
                challenge={t('capabilities.marketing.challenge')}
                solution={t('capabilities.marketing.solution')}
                benefits={[
                  t('capabilities.marketing.benefit1'),
                  t('capabilities.marketing.benefit2'),
                  t('capabilities.marketing.benefit3'),
                  t('capabilities.marketing.benefit4'),
                ]}
                features={[
                  t('capabilities.marketing.feature1'),
                  t('capabilities.marketing.feature2'),
                  t('capabilities.marketing.feature3'),
                  t('capabilities.marketing.feature4'),
                ]}
                iconColor="text-pink-600 dark:text-pink-400"
                bgColor="bg-pink-100 dark:bg-pink-900/30"
                reverse={true}
              />
            </div>
          </div>
        </section>

        {/* Integration & Workflow */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                {t('capabilities.integration.title')}
              </h3>
              <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
                {t('capabilities.integration.subtitle')}
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                      {t('capabilities.integration.workflow.title')}
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                          1
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">
                          {t('capabilities.integration.workflow.step1')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                          2
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">
                          {t('capabilities.integration.workflow.step2')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                          3
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">
                          {t('capabilities.integration.workflow.step3')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                          4
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">
                          {t('capabilities.integration.workflow.step4')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                          5
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">
                          {t('capabilities.integration.workflow.step5')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-6">
                      <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <SettingsIcon className="w-8 h-8 text-accent" />
                      </div>
                      <h5 className="text-lg font-bold text-center mb-3 text-gray-900 dark:text-white">
                        {t('capabilities.integration.unified.title')}
                      </h5>
                      <p className="text-center text-gray-600 dark:text-gray-300 text-sm">
                        {t('capabilities.integration.unified.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-accent text-white">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">{t('capabilities.cta.title')}</h3>
            <p className="max-w-xl mx-auto text-accent-100 mb-8">
              {t('capabilities.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => onNavigate('signup')}
                className="px-8 py-4 bg-white hover:bg-gray-100 rounded-lg text-lg font-bold text-accent transition-all shadow-2xl"
              >
                {t('capabilities.cta.tryFree')}
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="px-8 py-4 bg-accent-600 hover:bg-accent-700 border-2 border-white/20 rounded-lg text-lg font-bold text-white transition-all"
              >
                {t('capabilities.cta.getDemo')}
              </button>
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
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('footer.description')}</p>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                {t('footer.product.title')}
              </h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="text-accent font-semibold">
                    {t('capabilities.nav.capabilities')}
                  </span>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-accent">
                    {t('footer.product.pricing')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-accent">
                    {t('footer.product.api')}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                {t('footer.company.title')}
              </h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => onNavigate('about')}
                    className="text-gray-600 dark:text-gray-400 hover:text-accent"
                  >
                    {t('nav.about')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('contact')}
                    className="text-gray-600 dark:text-gray-400 hover:text-accent"
                  >
                    {t('nav.contact')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('blog')}
                    className="text-gray-600 dark:text-gray-400 hover:text-accent"
                  >
                    {t('nav.blog')}
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                {t('footer.legal.title')}
              </h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => onNavigate('privacy')}
                    className="text-gray-600 dark:text-gray-400 hover:text-accent"
                  >
                    {t('footer.legal.privacy')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('terms')}
                    className="text-gray-600 dark:text-gray-400 hover:text-accent"
                  >
                    {t('footer.legal.terms')}
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">{t('footer.copyright')}</p>
            <p className="text-sm mt-2 md:mt-0 flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              {t('footer.madeWith')} <HeartIcon className="w-4 h-4 text-red-500" />{' '}
              {t('footer.forProfessionals')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface CapabilityCardProps {
  icon: React.ElementType;
  title: string;
  challenge: string;
  solution: string;
  benefits: string[];
  features: string[];
  iconColor: string;
  bgColor: string;
  reverse: boolean;
}

const CapabilityCard: React.FC<CapabilityCardProps> = ({
  icon: Icon,
  title,
  challenge,
  solution,
  benefits,
  features,
  iconColor,
  bgColor,
  reverse,
}) => {
  return (
    <div
      className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h4>
        </div>

        <div className="space-y-6">
          <div>
            <h5 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Challenge</h5>
            <p className="text-gray-600 dark:text-gray-300">{challenge}</p>
          </div>

          <div>
            <h5 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
              Our Solution
            </h5>
            <p className="text-gray-600 dark:text-gray-300">{solution}</p>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="mb-6">
            <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Key Benefits
            </h5>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Core Features
            </h5>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <SparklesIcon className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapabilitiesPage;
