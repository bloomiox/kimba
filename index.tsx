import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SettingsProvider } from './contexts/SettingsContext';
import { ToastProvider } from './components/common/ToastContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = createRoot(rootElement);

// Ensure the SettingsProvider is properly initialized
root.render(
  <React.StrictMode>
    <ToastProvider>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </ToastProvider>
  </React.StrictMode>
);
