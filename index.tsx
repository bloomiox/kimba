import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SettingsProvider } from './contexts/SettingsContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);

// Ensure the SettingsProvider is properly initialized
root.render(
  <React.StrictMode>
    <SettingsProvider>
        <App />
    </SettingsProvider>
  </React.StrictMode>
);
