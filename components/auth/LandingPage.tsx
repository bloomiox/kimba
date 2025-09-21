import React from 'react';
// FIX: Replaced missing BarChartIcon with TrendingUpIcon.
import { LogoIcon, SparklesIcon, UsersIcon, CalendarIcon, TrendingUpIcon, CheckCircleIcon, HeartIcon } from '../common/Icons';
import { useSettings } from '../../contexts/SettingsContext';
import LanguageSwitcher from '../common/LanguageSwitcher';

interface LandingPageProps {
  onNavigate: (page: 'signin' | 'signup') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { t } = useSettings();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans flex flex-col selection:bg-accent/30">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LogoIcon className="w-10 h-10 text-accent" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Kimba</h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <a href="#features" className="hover:text-accent transition-colors font-semibold">{t('auth.landing.nav.features')}</a>
            <a href="#pricing" className="hover:text-accent transition-colors font-semibold">{t('auth.landing.nav.pricing')}</a>
            <a href="#contact" className="hover:text-accent transition-colors font-semibold">{t('auth.landing.nav.contact')}</a>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button onClick={() => onNavigate('signin')} className="hover:text-accent transition-colors font-semibold">{t('auth.landing.signIn')}</button>
            <button onClick={() => onNavigate('signup')} className="px-5 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white transition-all shadow-md">{t('auth.landing.getStarted')}</button>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative text-center py-20 md:py-32 px-6 bg-gradient-to-br from-white via-accent-50/30 to-accent-100/20 dark:from-gray-900 dark:via-accent-950/30 dark:to-accent-900/20 overflow-hidden">
            <div className="absolute inset-0 bg-grid-gray-200/30 dark:bg-grid-gray-800/30 [mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_80%)]"></div>
            
            {/* Floating elements */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-accent/10 rounded-full blur-xl animate-float-slow"></div>
            <div className="absolute top-40 right-20 w-32 h-32 bg-accent/5 rounded-full blur-2xl animate-float-slower"></div>
            <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-accent/15 rounded-full blur-lg animate-float"></div>
            
            <div className="container mx-auto relative z-10">
                <div className="animate-fade-in-up">
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight text-gray-900 dark:text-white leading-tight">
                        {t('auth.landing.hero.title')}
                    </h2>
                    <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
                        {t('auth.landing.hero.subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                        <button 
                            onClick={() => onNavigate('signup')} 
                            className="group px-8 py-4 bg-accent hover:bg-accent-600 rounded-xl text-lg font-bold text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {t('auth.landing.freeTrial')}
                                <SparklesIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            </span>
                        </button>
                        <button 
                            onClick={() => onNavigate('signin')} 
                            className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-lg font-bold text-gray-900 dark:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {t('auth.landing.signIn')}
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        {t('auth.landing.noCreditCard')}
                    </p>
                </div>
            </div>
             <style>{`
                .bg-grid-gray-200\\/30 {
                    background-image: linear-gradient(to right, #e5e7eb50 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb50 1px, transparent 1px);
                    background-size: 3rem 3rem;
                }
                .dark .bg-grid-gray-800\\/30 {
                    background-image: linear-gradient(to right, #37415150 1px, transparent 1px), linear-gradient(to bottom, #37415150 1px, transparent 1px);
                }
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
                @keyframes float-slow { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-30px) rotate(180deg); } }
                @keyframes float-slower { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-15px) rotate(-90deg); } }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
                .animate-float-slower { animation: float-slower 10s ease-in-out infinite; }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
            `}</style>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6">
            <div className="container mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h3 className="text-3xl md:text-4xl font-bold mb-3">{t('auth.landing.features.title')}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{t('auth.landing.features.subtitle')}</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard icon={SparklesIcon} title={t('auth.landing.features.ai.title')} description={t('auth.landing.features.ai.description')} />
                    <FeatureCard icon={UsersIcon} title={t('auth.landing.features.clients.title')} description={t('auth.landing.features.clients.description')} />
                    <FeatureCard icon={CalendarIcon} title={t('auth.landing.features.appointments.title')} description={t('auth.landing.features.appointments.description')} />
                    <FeatureCard icon={TrendingUpIcon} title={t('auth.landing.features.analytics.title')} description={t('auth.landing.features.analytics.description')} />
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-6 bg-gray-100 dark:bg-gray-800/50">
            <div className="container mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h3 className="text-3xl md:text-4xl font-bold mb-3">{t('auth.landing.testimonials.title')}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{t('auth.landing.testimonials.subtitle')}</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <TestimonialCard quote={t('auth.landing.testimonials.t1.quote')} name={t('auth.landing.testimonials.t1.name')} salon={t('auth.landing.testimonials.t1.salon')} />
                    <TestimonialCard quote={t('auth.landing.testimonials.t2.quote')} name={t('auth.landing.testimonials.t2.name')} salon={t('auth.landing.testimonials.t2.salon')} />
                    <TestimonialCard quote={t('auth.landing.testimonials.t3.quote')} name={t('auth.landing.testimonials.t3.name')} salon={t('auth.landing.testimonials.t3.salon')} />
                </div>
            </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-6">
            <div className="container mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h3 className="text-3xl md:text-4xl font-bold mb-3">{t('auth.landing.pricing.title')}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{t('auth.landing.pricing.subtitle')}</p>
                </div>
                <div className="flex flex-col lg:flex-row justify-center items-center gap-8">
                    <PricingCard 
                        plan={t('auth.landing.pricing.starter.plan')}
                        price={t('auth.landing.pricing.starter.price')}
                        period={t('auth.landing.pricing.starter.period')}
                        description={t('auth.landing.pricing.starter.description')}
                        features={[t('auth.landing.pricing.starter.f1'), t('auth.landing.pricing.starter.f2'), t('auth.landing.pricing.starter.f3')]}
                        buttonText={t('auth.landing.pricing.starter.cta')}
                        onSelect={() => onNavigate('signup')}
                    />
                     <PricingCard 
                        plan={t('auth.landing.pricing.pro.plan')}
                        price={t('auth.landing.pricing.pro.price')}
                        period={t('auth.landing.pricing.pro.period')}
                        description={t('auth.landing.pricing.pro.description')}
                        features={[t('auth.landing.pricing.pro.f1'), t('auth.landing.pricing.pro.f2'), t('auth.landing.pricing.pro.f3'), t('auth.landing.pricing.pro.f4')]}
                        buttonText={t('auth.landing.pricing.pro.cta')}
                        onSelect={() => onNavigate('signup')}
                        featured
                    />
                     <PricingCard 
                        plan={t('auth.landing.pricing.enterprise.plan')}
                        price={t('auth.landing.pricing.enterprise.price')}
                        period=""
                        description={t('auth.landing.pricing.enterprise.description')}
                        features={[t('auth.landing.pricing.enterprise.f1'), t('auth.landing.pricing.enterprise.f2'), t('auth.landing.pricing.enterprise.f3')]}
                        buttonText={t('auth.landing.pricing.enterprise.cta')}
                        onSelect={() => { window.location.href = 'mailto:sales@aistylist.pro' }}
                    />
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-accent text-white">
            <div className="container mx-auto text-center">
                <h3 className="text-3xl md:text-4xl font-bold mb-4">{t('auth.landing.cta.title')}</h3>
                <p className="max-w-xl mx-auto text-accent-100 mb-8">{t('auth.landing.cta.subtitle')}</p>
                <button onClick={() => onNavigate('signup')} className="px-8 py-4 bg-white hover:bg-gray-100 rounded-lg text-lg font-bold text-accent transition-all shadow-2xl">{t('auth.landing.freeTrial')}</button>
            </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 px-6">
            <div className="container mx-auto text-center">
                 <h3 className="text-3xl md:text-4xl font-bold mb-3">{t('auth.landing.contact.title')}</h3>
                 <p className="text-gray-600 dark:text-gray-400 mb-6">{t('auth.landing.contact.subtitle')}</p>
                 <a href="mailto:support@aistylist.pro" className="text-accent font-bold text-xl hover:underline">support@aistylist.pro</a>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-gray-100 dark:bg-gray-800/50">
        <div className="container mx-auto px-6 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} Kimba. {t('auth.landing.copyright')}</p>
            <p className="text-sm mt-2 flex items-center justify-center gap-1.5">{t('auth.landing.madeIn')} <HeartIcon className="w-4 h-4 text-red-500" /></p>
        </div>
      </footer>
    </div>
  );
};


const FeatureCard: React.FC<{icon: React.ElementType, title: string, description: string}> = ({ icon: Icon, title, description }) => (
    <div className="text-center p-6 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
        <div className="w-12 h-12 bg-accent/10 text-accent rounded-lg flex items-center justify-center mx-auto mb-4">
            <Icon className="w-6 h-6" />
        </div>
        <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h4>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
);

const TestimonialCard: React.FC<{quote: string, name: string, salon: string}> = ({ quote, name, salon }) => (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <p className="text-gray-600 dark:text-gray-300 mb-4 italic">"{quote}"</p>
        <p className="font-bold text-gray-900 dark:text-white">{name}</p>
        <p className="text-sm text-gray-500">{salon}</p>
    </div>
);

const PricingCard: React.FC<{plan: string, price: string, period: string, description: string, features: string[], buttonText: string, onSelect: () => void, featured?: boolean}> = ({ plan, price, period, description, features, buttonText, onSelect, featured = false }) => (
    <div className={`p-8 border rounded-xl w-full max-w-sm ${featured ? 'border-accent ring-2 ring-accent shadow-2xl bg-white dark:bg-gray-800/50' : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20'}`}>
        <h4 className="text-lg font-semibold text-accent">{plan}</h4>
        <p className="text-4xl font-bold my-4 text-gray-900 dark:text-white">{price} <span className="text-base font-normal text-gray-500 dark:text-gray-400">{period}</span></p>
        <p className="text-gray-600 dark:text-gray-400 h-12">{description}</p>
        <ul className="my-6 space-y-3">
            {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        <button onClick={onSelect} className={`w-full py-3 rounded-lg font-semibold transition-colors ${featured ? 'bg-accent text-white hover:opacity-90' : 'bg-accent/10 text-accent hover:bg-accent/20'}`}>
            {buttonText}
        </button>
    </div>
);

export default LandingPage;