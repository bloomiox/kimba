import React, { useState } from 'react';
import Sidebar from './Sidebar';
import type { View } from './MainApp';
import { SettingsProvider } from '../contexts/SettingsContext';

const SidebarDragTest: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNavigate = (view: View) => {
    setActiveView(view);
    console.log('📍 Navigated to:', view);
  };

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    console.log('🔄 Sidebar collapsed:', !isCollapsed);
  };

  const handleLogout = () => {
    console.log('🚪 Logout clicked');
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
              🧪 Sidebar Drag & Drop Test
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Current view: <span className="font-semibold text-accent">{activeView}</span>
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  🧪 Simple Drag Test
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                  If sidebar drag isn't working, try this simple test:
                </p>
                <button
                  onClick={() => {
                    // Create a simple draggable test element
                    const testDiv = document.createElement('div');
                    testDiv.innerHTML = `
                      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; background: white; padding: 20px; border: 2px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <h3 style="margin: 0 0 10px 0;">Simple Drag Test</h3>
                        <div draggable="true" style="padding: 10px; background: #f0f0f0; border: 1px solid #ccc; margin: 5px 0; cursor: move; user-select: none;" 
                             ondragstart="console.log('✅ Basic drag works!'); event.dataTransfer.setData('text/plain', 'test');"
                             onmousedown="console.log('🖱️ Test mouse down');"
                             onmouseup="console.log('🖱️ Test mouse up');">
                          Drag me! (Hold and drag)
                        </div>
                        <div style="padding: 10px; background: #e0e0e0; border: 1px dashed #999; margin: 5px 0; min-height: 40px;"
                             ondragover="event.preventDefault(); console.log('🎯 Drag over drop zone');"
                             ondrop="event.preventDefault(); console.log('✅ Drop successful!'); this.style.background='#d4edda'; this.innerHTML='Drop successful!';">
                          Drop zone
                        </div>
                        <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                          Close
                        </button>
                      </div>
                    `;
                    document.body.appendChild(testDiv);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Open Simple Drag Test
                </button>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  🎯 Test Drag & Drop
                </h3>
                <ol className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                  <li>1. Click the settings icon (⚙️) in the sidebar header</li>
                  <li>2. Look for the drag handles (⋮⋮) next to menu items</li>
                  <li>3. Click and HOLD, then drag any menu item</li>
                  <li>4. Watch console for: 🖱️ Mouse down → 🚀 Manual drag started</li>
                  <li>5. Should see drag feedback and drop indicators</li>
                </ol>
                <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-800 rounded">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>Not working?</strong> Try the SimpleDragTest component to isolate the issue.
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  🔍 Debug Information
                </h3>
                <div className="text-green-700 dark:text-green-300 text-sm space-y-1">
                  <p>• Open browser console (F12) to see drag events</p>
                  <p>• Look for: 🚀 Drag started, 🎯 Drag over, ✅ Drop</p>
                  <p>• Items should show drag handles when customizing</p>
                  <p>• Dragged items should become semi-transparent</p>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  ⚠️ Troubleshooting
                </h3>
                <div className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
                  <p>• If drag doesn't work: Make sure customization mode is ON</p>
                  <p>• If items don't move: Check console for errors</p>
                  <p>• If no drag handles: Refresh the page and try again</p>
                  <p>• Try different browsers if issues persist</p>
                </div>
                
                <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-800 rounded">
                  <p className="text-xs font-semibold mb-2">Quick Inline Test:</p>
                  <div 
                    draggable={true}
                    onDragStart={(e) => {
                      console.log('✅ Inline drag test works!');
                      e.dataTransfer.setData('text/plain', 'test');
                    }}
                    onMouseDown={() => console.log('🖱️ Inline test mouse down')}
                    className="p-2 bg-yellow-200 dark:bg-yellow-700 border border-yellow-400 rounded cursor-move text-xs"
                    style={{ userSelect: 'none' }}
                  >
                    Drag this inline test element
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  ✅ Expected Behavior
                </h3>
                <div className="text-purple-700 dark:text-purple-300 text-sm space-y-1">
                  <p>• Items should have drag handles (⋮⋮) in customization mode</p>
                  <p>• Dragged items should become 50% transparent</p>
                  <p>• Drop zones should show colored lines</p>
                  <p>• Order should persist after dropping</p>
                  <p>• Console should show drag events</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsProvider>
  );
};

export default SidebarDragTest;