import React, { useState } from 'react';
import Sidebar from './Sidebar';
import type { View } from './MainApp';
import { SettingsProvider } from '../contexts/SettingsContext';

const SidebarTest: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNavigate = (view: View) => {
    setActiveView(view);
    console.log('Navigated to:', view);
  };

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  return (
    <SettingsProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar
          activeView={activeView}
          onNavigate={handleNavigate}
          isCollapsed={isCollapsed}
          onToggle={handleToggle}
          onLogout={handleLogout}
        />
        <div className="flex-1 p-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Sidebar Test Page
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Current view: <span className="font-semibold text-accent">{activeView}</span>
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  🎯 Test Drag & Drop
                </h3>
                <ol className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                  <li>1. Click the settings icon (⚙️) in the sidebar header</li>
                  <li>2. Try dragging menu items to reorder them</li>
                  <li>3. Check browser console for drag events</li>
                </ol>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  👥 Test Grouping
                </h3>
                <ol className="text-green-700 dark:text-green-300 text-sm space-y-1">
                  <li>1. Click the list icon (📋) for advanced settings</li>
                  <li>2. Select multiple items with checkboxes</li>
                  <li>3. Click "Group Selected" and enter a name</li>
                  <li>4. Create the group and test expand/collapse</li>
                </ol>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  👁️ Test Hide/Show
                </h3>
                <ol className="text-purple-700 dark:text-purple-300 text-sm space-y-1">
                  <li>1. In quick customization mode, hover over items</li>
                  <li>2. Click "Hide" to hide menu items</li>
                  <li>3. Use advanced settings to show hidden items</li>
                  <li>4. Use "Show All" to restore all items</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsProvider>
  );
};

export default SidebarTest;
