import React, { useState } from 'react';
import type { MenuItem } from '../types';
import { useSettings } from '../contexts/SettingsContext';

interface MenuCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  onUpdateItems: (items: MenuItem[]) => void;
}

const MenuCustomizer: React.FC<MenuCustomizerProps> = ({ 
  isOpen, 
  onClose, 
  menuItems, 
  onUpdateItems 
}) => {
  const { t } = useSettings();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [showGroupDialog, setShowGroupDialog] = useState(false);

  if (!isOpen) return null;

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedItems.length < 2) return;

    const groupId = `group_${Date.now()}`;
    const maxOrder = Math.max(...menuItems.map(item => item.order));
    
    const updatedItems = menuItems.map(item => {
      if (selectedItems.includes(item.id)) {
        return { ...item, parentId: groupId };
      }
      return item;
    });

    const groupItem: MenuItem = {
      id: groupId,
      label: groupName,
      icon: menuItems[0].icon, // Use first item's icon as default
      isVisible: true,
      order: maxOrder + 1,
      isGroup: true,
      isExpanded: true
    };

    onUpdateItems([...updatedItems, groupItem]);
    setSelectedItems([]);
    setGroupName('');
    setShowGroupDialog(false);
  };

  const visibleItems = menuItems.filter(item => !item.isGroup && !item.parentId);
  const hiddenItems = menuItems.filter(item => !item.isVisible && !item.isGroup);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Customize Menu
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Visible Items */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Visible Menu Items
            </h3>
            <div className="space-y-2">
              {visibleItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleItemToggle(item.id)}
                      className="mr-3"
                    />
                    <item.icon className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-300" />
                    <span className="text-gray-900 dark:text-white">{item.label}</span>
                  </div>
                  <button
                    onClick={() => {
                      const updatedItems = menuItems.map(i => 
                        i.id === item.id ? { ...i, isVisible: false } : i
                      );
                      onUpdateItems(updatedItems);
                    }}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Hide
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Hidden Items */}
          {hiddenItems.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Hidden Menu Items
              </h3>
              <div className="space-y-2">
                {hiddenItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg opacity-60"
                  >
                    <div className="flex items-center">
                      <item.icon className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-300" />
                      <span className="text-gray-900 dark:text-white">{item.label}</span>
                    </div>
                    <button
                      onClick={() => {
                        const updatedItems = menuItems.map(i => 
                          i.id === item.id ? { ...i, isVisible: true } : i
                        );
                        onUpdateItems(updatedItems);
                      }}
                      className="text-green-500 hover:text-green-600 text-sm"
                    >
                      Show
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group Creation */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Create Group
              </h3>
              <button
                onClick={() => setShowGroupDialog(!showGroupDialog)}
                disabled={selectedItems.length < 2}
                className={`px-4 py-2 rounded-lg text-sm ${
                  selectedItems.length >= 2
                    ? 'bg-accent text-white hover:bg-accent/90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Group Selected ({selectedItems.length})
              </button>
            </div>
            
            {showGroupDialog && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateGroup}
                    disabled={!groupName.trim()}
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Create Group
                  </button>
                  <button
                    onClick={() => {
                      setShowGroupDialog(false);
                      setGroupName('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => {
                // Reset to defaults
                const defaultItems = menuItems.map(item => ({
                  ...item,
                  isVisible: true,
                  parentId: undefined,
                  order: menuItems.findIndex(i => i.id === item.id)
                })).filter(item => !item.isGroup);
                onUpdateItems(defaultItems);
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Reset to Default
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuCustomizer;