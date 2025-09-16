import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { PlusIcon, UserPlusIcon, ClipboardListIcon } from './common/Icons';
import Dashboard from './dashboard/Dashboard';
import Sidebar from './Sidebar';
import CalendarPage from './calendar/CalendarPage';
import DesignStudio from './studio/DesignStudio';
import BookingPage from './booking/BookingPage';
import ClientsPage from './clients/ClientsPage';
import SettingsPage from './settings/SettingsPage';
import AnalyticsPage from './analytics/AnalyticsPage';
import ClientModal from './clients/ClientModal';
import POSPage from './pos/POSPage';
import MarketingPage from './marketing/MarketingPage';
import SocialMediaPage from './social/SocialMediaPage';
import TeamPage from './TeamPage';
import ServicesPage from './ServicesPage';
import ProductsPage from './ProductsPage';
import { supabase } from '../services/supabaseClient';

export type View = 'dashboard' | 'studio' | 'calendar' | 'settings' | 'booking' | 'clients' | 'analytics' | 'pos' | 'marketing' | 'social' | 'team' | 'services' | 'products';

const MainApp: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [contentVisible, setContentVisible] = useState<boolean>(true);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const { 
    // FIX: `setCurrentUser` is a legacy method. A dummy implementation has been added to the context to prevent errors.
    // The correct Supabase logout is now used in handleLogout.
    setCurrentUser,
    salonName, 
    getCurrentUserLookbooks,
    t,
  } = useSettings();

  useEffect(() => {
    setContentVisible(false); // Fade out content
    const timer = setTimeout(() => {
        setContentVisible(true); // Fade in new content
    }, 50); 
    return () => clearTimeout(timer);
  }, [activeView]);
  
  const handleLogout = () => {
      supabase.auth.signOut();
  };

  const handleNavigate = (view: View) => {
    if (view === activeView) return;
    
    setContentVisible(false);
    setTimeout(() => {
        setActiveView(view);
        // The useEffect hook will handle making it visible again
    }, 300);
  };
  
  const handleNewClientClick = () => {
    setIsFabOpen(false);
    setIsClientModalOpen(true);
  };

  const handleNewBookingClick = () => {
    setIsFabOpen(false);
    handleNavigate('booking');
  };

  const renderView = () => {
      switch (activeView) {
        case 'dashboard':
          return <Dashboard onQuickAction={handleNavigate} savedLookbooks={getCurrentUserLookbooks()} />;
        case 'studio':
          return <DesignStudio />;
        case 'clients':
          return <ClientsPage />;
        case 'calendar':
            return <CalendarPage />;
        case 'services':
            return <ServicesPage />;
        case 'products':
            return <ProductsPage />;
        case 'team':
            return <TeamPage />;
        case 'pos':
            return <POSPage />;
        case 'booking':
            return <BookingPage />;
        case 'settings':
            return <SettingsPage />;
        case 'analytics':
            return <AnalyticsPage />;
        case 'marketing':
            return <MarketingPage />;
        case 'social':
            return <SocialMediaPage />;
        default:
          return null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex transition-colors duration-300">
      <Sidebar 
        activeView={activeView}
        onNavigate={handleNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(prev => !prev)}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 flex flex-col relative">
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
             <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {salonName}
            </h1>
            {/* Future header items can go here */}
        </header>

        <main className={`flex-grow p-4 sm:p-6 transition-opacity duration-300 ease-in-out ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
          {renderView()}
        </main>
        
        {/* FAB */}
        <div className="absolute bottom-8 right-8 flex flex-col items-center gap-4 z-40">
            {isFabOpen && (
                <div className="flex flex-col items-center gap-4 animate-fade-in-fast">
                    <div className="relative group">
                        <button
                            onClick={handleNewClientClick}
                            className="w-12 h-12 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                            aria-label={t('clients.newClient')}
                        >
                            <UserPlusIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                        </button>
                        <span className="absolute right-full mr-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {t('clients.newClient')}
                        </span>
                    </div>
                    <div className="relative group">
                        <button
                            onClick={handleNewBookingClick}
                            className="w-12 h-12 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                            aria-label={t('sidebar.booking')}
                        >
                            <ClipboardListIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                        </button>
                        <span className="absolute right-full mr-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {t('sidebar.booking')}
                        </span>
                    </div>
                </div>
            )}
            <button
                onClick={() => setIsFabOpen(prev => !prev)}
                className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-2xl hover:opacity-90 transition-transform duration-200"
                style={{ transform: isFabOpen ? 'rotate(45deg)' : 'rotate(0)' }}
                aria-expanded={isFabOpen}
                aria-label="Toggle quick actions"
            >
                <PlusIcon className="w-8 h-8 text-white" />
            </button>
        </div>

        {/* Client Modal */}
        <ClientModal
            isOpen={isClientModalOpen}
            onClose={() => setIsClientModalOpen(false)}
            client={null}
        />
        <style>{`
          @keyframes fade-in-fast { 
            from { opacity: 0; transform: translateY(10px); } 
            to { opacity: 1; transform: translateY(0); } 
          }
          .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
        `}</style>
      </div>
    </div>
  );
};

export default MainApp;
