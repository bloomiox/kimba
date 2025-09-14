import React, { useState } from 'react';
import LandingPage from './LandingPage';
import SignInPage from './SignInPage';
import SignUpPage from './SignUpPage';

const Auth: React.FC = () => {
  const [page, setPage] = useState<'landing' | 'signin' | 'signup'>('landing');

  // The actual sign-in/sign-up logic is now handled inside the respective
  // components using Supabase, so this component just routes between them.
  switch (page) {
    case 'signin':
      return <SignInPage onNavigate={setPage} />;
    case 'signup':
      return <SignUpPage onNavigate={setPage} />;
    case 'landing':
    default:
      return <LandingPage onNavigate={setPage} />;
  }
};

export default Auth;
