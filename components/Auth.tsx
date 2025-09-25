import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import SignInPage from './SignInPage';
import SignUpPage from './SignUpPage';
import OnboardingFlow from './OnboardingFlow';
import { useSettings } from '../contexts/SettingsContext';

interface AuthProps {
  onAuthComplete?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthComplete }) => {
  const [page, setPage] = useState<'landing' | 'signin' | 'signup' | 'onboarding'>('landing');
  const [initialSalonName, setInitialSalonName] = useState<string>('');
  // FIX: These properties were from a legacy implementation of the context.
  // Dummy properties have been added to the new context to ensure this legacy component
  // does not break the build, though it appears to be unused.
  const { users, setCurrentUser, addUser, salonName } = useSettings();

  // Get the salon name from the profile when user is authenticated
  useEffect(() => {
    if (salonName) {
      setInitialSalonName(salonName);
    }
  }, [salonName]);

  const handleSignIn = (salon: string) => {
    if (users[salon]) {
      setCurrentUser(salon);
    }
  };

  const handleSignUp = (newSalonName: string) => {
    addUser(newSalonName);
  };

  const handleOnboardingComplete = () => {
    if (onAuthComplete) {
      onAuthComplete();
    }
  };

  switch (page) {
    case 'signin':
      return <SignInPage onNavigate={setPage} onSignIn={handleSignIn} />;
    case 'signup':
      return <SignUpPage onNavigate={setPage} onSignUp={handleSignUp} />;
    case 'onboarding':
      return <OnboardingFlow onComplete={handleOnboardingComplete} initialSalonName={initialSalonName} />;
    case 'landing':
    default:
      return <LandingPage onNavigate={setPage} />;
  }
};

export default Auth;