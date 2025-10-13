import React, { useState } from 'react';
import Sidebar from './Sidebar';
import type { View } from './MainApp';

const SidebarDemo: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNavigate = (view: View) => {
    setActiveView(view);
  };

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  return (
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
            Enhanced Sidebar Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Current view: <span className="font-semibold text-accent">{activeView}</span>
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                🎯 Drag & Drop Reordering
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Click the settings icon in the sidebar header to enable quick customization mode.
                Then drag menu items to reorder them.
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                👥 Menu Grouping
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Click the list icon for advanced settings. Select multiple items and create groups
                to organize your menu items logically.
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                👁️ Hide/Show Items
              </h3>
              <p className="text-purple-700 dark:text-purple-300 text-sm">
                In quick customization mode, click "Hide" next to any menu item to hide it. Use
                advanced settings to show hidden items again.
              </p>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                🔄 Persistent Settings
              </h3>
              <p className="text-orange-700 dark:text-orange-300 text-sm">
                All customizations are automatically saved to your user settings and will persist
                across sessions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarDemo;
