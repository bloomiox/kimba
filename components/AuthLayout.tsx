import React from 'react';
// FIX: Updated import path to use the common Icons component.
import { LogoIcon } from './common/Icons';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800/50 p-8 border-r border-gray-200 dark:border-gray-700">
        <div className="max-w-md text-center">
          <LogoIcon className="w-24 h-24 text-accent mx-auto mb-6" />
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Kimba</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            The future of hair consultations is here. Visualize any style, instantly.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12 bg-gray-50 dark:bg-gray-900">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
