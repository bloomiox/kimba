import React, { useState } from 'react';
import { LogoIcon, EmailIcon } from '../common/Icons';
import AuthLayout from './AuthLayout';
import { useSettings } from '../../contexts/SettingsContext';
import { supabase } from '../../services/supabaseClient';

interface SignUpPageProps {
  onNavigate: (page: 'signin' | 'landing') => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate }) => {
  const { t } = useSettings();
  const [loading, setLoading] = useState(false);
  const [salonName, setSalonName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          salon_name: salonName,
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // With Supabase email confirmation enabled, we'll always show the success message
      // regardless of whether data.user is present
      setSignupSuccess(true);
      
      // Only try to create a profile if we have a user ID
      if (data.user?.id) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({ id: data.user.id, salon_name: salonName, settings: {} });
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't show RLS errors to user, just log them
          if (profileError.message.includes('row-level security')) {
            setError('Account created successfully, but profile setup needs configuration. Please contact support.');
          } else {
            setError(profileError.message);
          }
        }
      }
      setLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <AuthLayout>
        <div className="w-full max-w-sm">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <EmailIcon className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('auth.signUp.confirmationTitle')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('auth.signUp.confirmationMessage', { email })}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('auth.signUp.confirmationInstruction')}
            </p>
            <button 
              onClick={() => onNavigate('signin')}
              className="w-full py-3 px-4 bg-accent text-white font-bold rounded-lg hover:opacity-90"
            >
              {t('auth.signUp.backToSignIn')}
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
        <div className="w-full max-w-sm">
            <div className="text-center mb-8 lg:hidden">
                <LogoIcon className="w-16 h-16 text-accent mx-auto mb-4" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">{t('auth.signUp.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">{t('auth.signUp.subtitle')}</p>

            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center">{error}</p>}

            <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                    <label htmlFor="salonName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth.signUp.salonNameLabel')}</label>
                    <input type="text" id="salonName" name="salonName" value={salonName} onChange={e => setSalonName(e.target.value)} required className="mt-1 block w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg" placeholder={t('auth.signUp.salonNamePlaceholder')} />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth.signUp.emailLabel')}</label>
                    <input type="email" id="email" name="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg" placeholder={t('auth.signUp.emailPlaceholder')} />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth.signUp.passwordLabel')}</label>
                    <input type="password" id="password" name="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg" placeholder={t('auth.signUp.passwordPlaceholder')} />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-accent text-white font-bold rounded-lg hover:opacity-90 disabled:bg-gray-400">
                  {loading ? 'Signing Up...' : t('auth.signUp.createAccount')}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                {t('auth.signUp.haveAccount')}{' '}
                <button onClick={() => onNavigate('signin')} className="font-medium text-accent hover:underline">
                    {t('auth.signUp.signIn')}
                </button>
            </p>
        </div>
    </AuthLayout>
  );
};

export default SignUpPage;