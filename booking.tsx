import React from 'react';
import { createRoot } from 'react-dom/client';
import BookingForm from './components/booking/BookingForm';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';

const StandaloneBookingPage: React.FC<{ salonId: string }> = ({ salonId }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans p-4 sm:p-8 flex items-center justify-center">
             {/* FIX: The `publicSalonId` prop was not defined on SettingsProvider. It has been added to the provider's props. */}
             <SettingsProvider publicSalonId={salonId}>
                <BookingForm />
            </SettingsProvider>
        </div>
    );
};

const ErrorDisplay: React.FC = () => {
    const { t } = useSettings();
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans p-4 sm:p-8 flex items-center justify-center">
            <div className="font-sans text-center p-10 text-gray-700 dark:text-gray-300">
                <h1 className="text-red-600 text-2xl font-bold">{t('booking.error.title')}</h1>
                <p>{t('booking.error.missingId')}</p>
                <p className="mt-2 text-gray-500">{t('booking.error.instructions')}</p>
            </div>
        </div>
    );
}


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const urlParams = new URLSearchParams(window.location.search);
const salonId = urlParams.get('salonId');
const root = createRoot(rootElement);

if (!salonId) {
    // Render an error component that can use the settings provider for i18n
    root.render(
        <React.StrictMode>
            <SettingsProvider>
                <ErrorDisplay />
            </SettingsProvider>
        </React.StrictMode>
    );
} else {
    root.render(
        <React.StrictMode>
            <StandaloneBookingPage salonId={salonId} />
        </React.StrictMode>
    );
}
