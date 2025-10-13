import React, { useState } from 'react';
import LandingPage from './LandingPage';
import SignInPage from './SignInPage';
import SignUpPage from './SignUpPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import BlogPage from '../pages/BlogPage';
import TermsPage from '../pages/TermsPage';
import PrivacyPage from '../pages/PrivacyPage';
import CapabilitiesPage from '../pages/CapabilitiesPage';

const Auth: React.FC = () => {
  const [page, setPage] = useState<
    | 'landing'
    | 'signin'
    | 'signup'
    | 'about'
    | 'capabilities'
    | 'contact'
    | 'blog'
    | 'terms'
    | 'privacy'
  >('landing');

  // The actual sign-in/sign-up logic is now handled inside the respective
  // components using Supabase, so this component just routes between them.
  switch (page) {
    case 'signin':
      return <SignInPage onNavigate={setPage} />;
    case 'signup':
      return <SignUpPage onNavigate={setPage} />;
    case 'about':
      return <AboutPage onNavigate={setPage} />;
    case 'capabilities':
      return <CapabilitiesPage onNavigate={setPage} />;
    case 'contact':
      return <ContactPage onNavigate={setPage} />;
    case 'blog':
      return <BlogPage onNavigate={setPage} />;
    case 'terms':
      return <TermsPage onNavigate={setPage} />;
    case 'privacy':
      return <PrivacyPage onNavigate={setPage} />;
    case 'landing':
    default:
      return <LandingPage onNavigate={setPage} />;
  }
};

export default Auth;
