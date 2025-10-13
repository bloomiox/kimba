import React, { useState } from 'react';
import { LogoIcon } from '../common/Icons';
import AuthLayout from './AuthLayout';
import { useSettings } from '../../contexts/SettingsContext';
import { supabase } from '../../services/supabaseClient';

interface SignInPageProps {
  onNavigate: (
    page: 'signup' | 'landing' | 'about' | 'contact' | 'blog' | 'terms' | 'privacy'
  ) => void;
}

const SignInPage: React.FC<SignInPageProps> = ({ onNavigate }) => {
  const { t } = useSettings();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 lg:hidden">
          <LogoIcon className="w-16 h-16 text-accent mx-auto mb-4" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          {t('auth.signIn.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">
          {t('auth.signIn.subtitle')}
        </p>

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('auth.signIn.emailLabel')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              placeholder={t('auth.signIn.emailPlaceholder')}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('auth.signIn.passwordLabel')}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              placeholder={t('auth.signIn.passwordPlaceholder')}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-accent text-white font-bold rounded-lg hover:opacity-90 disabled:bg-gray-400"
          >
            {loading ? 'Signing In...' : t('auth.signIn.signIn')}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          {t('auth.signIn.needAccount')}{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="font-medium text-accent hover:underline"
          >
            {t('auth.signIn.signUp')}
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignInPage;
