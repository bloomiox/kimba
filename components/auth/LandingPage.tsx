import React from 'react';
// FIX: Replaced missing BarChartIcon with TrendingUpIcon.
import { LogoIcon, SparklesIcon, UsersIcon, CalendarIcon, TrendingUpIcon, CheckCircleIcon, HeartIcon } from '../common/Icons';
import { useSettings } from '../../contexts/SettingsContext';
import LanguageSwitcher from '../common/LanguageSwitcher';

interface LandingPageProps {
  onNavigate: (page: 'signin' | 'signup' | 'about' | 'capabilities' | 'contact' | 'blog') => void;
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
            <span className="text-accent font-semibold">{t('nav.home')}</span>
            <button onClick={() => onNavigate('about')} className="hover:text-accent transition-colors font-semibold">{t('nav.about')}</button>
            <button onClick={() => onNavigate('capabilities')} className="hover:text-accent transition-colors font-semibold">{t('capabilities.nav.capabilities')}</button>
            <button onClick={() => onNavigate('contact')} className="hover:text-accent transition-colors font-semibold">{t('nav.contact')}</button>
            <button onClick={() => onNavigate('blog')} className="hover:text-accent transition-colors font-semibold">{t('nav.blog')}</button>
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
                        onSelect={() => onNavigate('signup')}
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
            <div className="container mx-auto text-center max-w-4xl">
                 <h3 className="text-3xl md:text-4xl font-bold mb-3">{t('auth.landing.contact.title')}</h3>
                 <p className="text-gray-600 dark:text-gray-400 mb-12">{t('auth.landing.contact.subtitle')}</p>
                 
                 <div className="grid md:grid-cols-3 gap-8">
                   <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                     <div className="w-12 h-12 bg-accent/10 text-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                       </svg>
                     </div>
                     <h4 className="text-lg font-semibold mb-2">Email Support</h4>
                     <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Get help with any questions</p>
                     <a href="mailto:support@kimba.pro" className="text-accent font-semibold hover:underline">support@kimba.pro</a>
                   </div>
                   
                   <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                     <div className="w-12 h-12 bg-accent/10 text-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                       </svg>
                     </div>
                     <h4 className="text-lg font-semibold mb-2">Live Chat</h4>
                     <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Chat with our team</p>
                     <button className="text-accent font-semibold hover:underline">Start Conversation</button>
                   </div>
                   
                   <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                     <div className="w-12 h-12 bg-accent/10 text-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                       </svg>
                     </div>
                     <h4 className="text-lg font-semibold mb-2">Help Center</h4>
                     <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Browse our guides</p>
                     <button onClick={() => onNavigate('blog')} className="text-accent font-semibold hover:underline">View Articles</button>
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
                AI-powered CRM platform for beauty professionals.
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Product</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-accent">Features</a></li>
                <li><a href="#pricing" className="text-gray-600 dark:text-gray-400 hover:text-accent">Pricing</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-accent">API</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Company</h5>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => onNavigate('about')} className="text-gray-600 dark:text-gray-400 hover:text-accent">{t('nav.about')}</button></li>
                <li><button onClick={() => onNavigate('contact')} className="text-gray-600 dark:text-gray-400 hover:text-accent">{t('nav.contact')}</button></li>
                <li><button onClick={() => onNavigate('blog')} className="text-gray-600 dark:text-gray-400 hover:text-accent">{t('nav.blog')}</button></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Legal</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-accent">{t('footer.legal.privacy')}</a></li>
                <li><a href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-accent">{t('footer.legal.terms')}</a></li>
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