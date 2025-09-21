import React, { useState, useEffect } from 'react';
import { useSettings } from './contexts/SettingsContext';
import './styles/accentColors.css';
import Auth from './components/auth/Auth';
import MainApp from './components/MainApp';
import OnboardingFlow from './components/OnboardingFlow';
import { supabase } from './services/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import LoadingSpinner from './components/common/LoadingSpinner';
import TranslationDebug from './components/debug/TranslationDebug';


const App: React.FC = () => {
  // Wrap the useSettings hook in a try-catch to handle the case where SettingsProvider might not be available
  let settingsData;
  try {
    settingsData = useSettings();
  } catch (error) {
    console.error('Error using settings context:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-500">Application Error</h1>
          <p className="mt-2">Unable to initialize settings. Please refresh the page.</p>
        </div>
      </div>
    );
  }
  
  const { session, setSession, hasCompletedOnboarding, services, hairstylists, loading: settingsLoading } = settingsData;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  // Check if user needs onboarding
  // New users: hasCompletedOnboarding is explicitly false
  // Existing users: if they have services or team members, assume onboarding is complete
  const needsOnboarding = session && (
    hasCompletedOnboarding === false && 
    services.length === 0 && 
    hairstylists.length === 0
  );

  if (needsOnboarding) {
    return <OnboardingFlow onComplete={() => window.location.reload()} />;
  }

  return (
    <>
      <TranslationDebug />
      {session ? <MainApp /> : <Auth />}
    </>
  );
};

export default App;
