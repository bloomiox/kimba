import React, { useState, useRef } from 'react';
import type { View } from './MainApp';
import type { MenuItem, MenuCustomization } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import MenuCustomizer from './MenuCustomizer';
import { 
    DashboardIcon, 
    DesignStudioIcon, 
    CalendarIcon, 
    SettingsIcon, 
    LogoutIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    LogoIcon,
    ClipboardListIcon,
    UsersIcon,
    CreditCardIcon,
    TrendingUpIcon,
    BarChartIcon,
    MegaphoneIcon,
    ShareIcon,
    ShoppingBagIcon
} from './common/Icons';

interface SidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

interface DragState {
  isDragging: boolean;
  draggedItem: MenuItem | null;
  dragOverItem: MenuItem | null;
  dropPosition: 'above' | 'below' | 'inside' | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, isCollapsed, onToggle, onLogout }) => {
    const { salonLogo, t, menuCustomization, updateSettings } = useSettings();
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [showCustomizer, setShowCustomizer] = useState(false);
    const [dragState, setDragState] = useState<DragState>({
        isDragging: false,
        draggedItem: null,
        dragOverItem: null,
        dropPosition: null
    });
    const dragCounter = useRef(0);
    const mouseDownRef = useRef<{ item: MenuItem | null; startX: number; startY: number; time: number }>({
        item: null,
        startX: 0,
        startY: 0,
        time: 0
    });
    const lastValidDropTarget = useRef<{ item: MenuItem | null; position: 'above' | 'below' | 'inside' | null }>({
        item: null,
        position: null
    });

    const DEFAULT_MENU_ITEMS: MenuItem[] = [
      { id: 'dashboard', label: t('sidebar.dashboard'), icon: DashboardIcon, isVisible: true, order: 0 },
      { id: 'booking', label: t('sidebar.booking'), icon: ClipboardListIcon, isVisible: true, order: 1 },
      { id: 'studio', label: t('sidebar.designStudio'), icon: DesignStudioIcon, isVisible: true, order: 2 },
      { id: 'clients', label: t('sidebar.clients'), icon: UsersIcon, isVisible: true, order: 3 },
      { id: 'calendar', label: t('sidebar.calendar'), icon: CalendarIcon, isVisible: true, order: 4 },
      { id: 'services', label: t('sidebar.services'), icon: ClipboardListIcon, isVisible: true, order: 5 },
      { id: 'products', label: t('sidebar.products'), icon: ShoppingBagIcon, isVisible: true, order: 6 },
      { id: 'team', label: t('sidebar.team'), icon: UsersIcon, isVisible: true, order: 7 },
      { id: 'pos', label: t('sidebar.pos'), icon: CreditCardIcon, isVisible: true, order: 8 },
      { id: 'analytics', label: t('sidebar.analytics'), icon: TrendingUpIcon, isVisible: true, order: 9 },
      { id: 'report', label: t('sidebar.report'), icon: BarChartIcon, isVisible: true, order: 10 },
      { id: 'marketing', label: t('sidebar.marketing'), icon: MegaphoneIcon, isVisible: true, order: 11 },
      { id: 'social', label: t('sidebar.social'), icon: ShareIcon, isVisible: true, order: 12 },
      { id: 'settings', label: t('sidebar.settings'), icon: SettingsIcon, isVisible: true, order: 13 },
    ];

    // Get current menu items, merging with defaults if needed
    const getMenuItems = (): MenuItem[] => {
        if (!menuCustomization?.items) {
            return DEFAULT_MENU_ITEMS;
        }
        
        // Merge with defaults to handle new items or missing translations
        const customItems = menuCustomization.items;
        const mergedItems = DEFAULT_MENU_ITEMS.map(defaultItem => {
            const customItem = customItems.find(item => item.id === defaultItem.id);
            return customItem ? { ...defaultItem, ...customItem, label: defaultItem.label } : defaultItem;
        });
        
        // Add any custom groups that don't exist in defaults
        const customGroups = customItems.filter(item => item.isGroup && !mergedItems.find(m => m.id === item.id));
        
        return [...mergedItems, ...customGroups].sort((a, b) => a.order - b.order);
    };

    const menuItems = getMenuItems();


    // Menu management functions
    const updateMenuCustomization = (items: MenuItem[]) => {
        const customization: MenuCustomization = {
            items,
            version: 1
        };
        updateSettings({ menuCustomization: customization });
    };

    const toggleItemVisibility = (itemId: string) => {
        const updatedItems = menuItems.map(item => 
            item.id === itemId ? { ...item, isVisible: !item.isVisible } : item
        );
        updateMenuCustomization(updatedItems);
    };



    const toggleGroupExpansion = (groupId: string) => {
        const updatedItems = menuItems.map(item => 
            item.id === groupId ? { ...item, isExpanded: !item.isExpanded } : item
        );
        updateMenuCustomization(updatedItems);
    };

    const ungroupItems = (groupId: string) => {
        const updatedItems = menuItems
            .map(item => item.parentId === groupId ? { ...item, parentId: undefined } : item)
            .filter(item => item.id !== groupId);
        updateMenuCustomization(updatedItems);
    };

    // Manual drag detection handlers
    const handleMouseDown = (e: React.MouseEvent, item: MenuItem) => {
        if (!isCustomizing) return;
        
        console.log('🖱️ Mouse down on:', item.label);
        console.log('🔍 Element draggable:', (e.currentTarget as HTMLElement).draggable);
        
        mouseDownRef.current = {
            item,
            startX: e.clientX,
            startY: e.clientY,
            time: Date.now()
        };
        
        // Add global mouse move and up listeners
        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!mouseDownRef.current.item) return;
            
            const deltaX = Math.abs(moveEvent.clientX - mouseDownRef.current.startX);
            const deltaY = Math.abs(moveEvent.clientY - mouseDownRef.current.startY);
            const deltaTime = Date.now() - mouseDownRef.current.time;
            
            // Start drag if mouse moved more than 5px or held for more than 200ms
            if ((deltaX > 5 || deltaY > 5) || deltaTime > 200) {
                console.log('🚀 Manual drag started:', item.label);
                
                // Clear any previous drop target
                lastValidDropTarget.current = {
                    item: null,
                    position: null
                };
                
                setDragState({
                    isDragging: true,
                    draggedItem: item,
                    dragOverItem: null,
                    dropPosition: null
                });
                
                // Clean up listeners
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                
                // Add drag-specific listeners
                document.addEventListener('mousemove', handleDragMove);
                document.addEventListener('mouseup', handleDragEnd);
            }
        };
        
        const handleMouseUp = () => {
            mouseDownRef.current = { item: null, startX: 0, startY: 0, time: 0 };
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };
    
    const handleDragMove = (e: MouseEvent) => {
        if (!dragState.isDragging) return;
        
        // Find element under cursor
        const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
        const menuItemElement = elementBelow?.closest('[data-menu-item]');
        
        if (menuItemElement) {
            const itemId = menuItemElement.getAttribute('data-menu-item');
            const targetItem = menuItems.find(item => item.id === itemId);
            
            if (targetItem && targetItem.id !== dragState.draggedItem?.id) {
                const rect = menuItemElement.getBoundingClientRect();
                const y = e.clientY - rect.top;
                const height = rect.height;
                
                let dropPosition: 'above' | 'below' | 'inside' = 'below';
                
                if (targetItem.isGroup) {
                    if (y < height * 0.25) dropPosition = 'above';
                    else if (y > height * 0.75) dropPosition = 'below';
                    else dropPosition = 'inside';
                } else {
                    dropPosition = y < height / 2 ? 'above' : 'below';
                }
                
                console.log('🎯 Manual drag over:', targetItem.label, 'position:', dropPosition);
                
                // Store the last valid drop target
                lastValidDropTarget.current = {
                    item: targetItem,
                    position: dropPosition
                };
                
                setDragState(prev => ({
                    ...prev,
                    dragOverItem: targetItem,
                    dropPosition
                }));
            }
        }
    };
    
    const handleDragEnd = (e?: MouseEvent) => {
        if (!dragState.isDragging) return;
        
        console.log('🏁 Manual drag ended');
        
        // Capture drag state before clearing it
        const draggedItem = dragState.draggedItem;
        let targetItem = dragState.dragOverItem;
        let dropPosition = dragState.dropPosition;
        
        // Use last valid drop target if current one is missing
        if (!targetItem || !dropPosition) {
            targetItem = lastValidDropTarget.current.item;
            dropPosition = lastValidDropTarget.current.position;
            console.log('🔄 Using last valid drop target:', targetItem?.label, 'position:', dropPosition);
        }
        
        console.log('🔍 Drop check - draggedItem:', draggedItem?.label, 'dragOverItem:', targetItem?.label, 'dropPosition:', dropPosition);
        
        // Perform drop if we have a valid target
        if (draggedItem && targetItem && dropPosition) {
            console.log('✅ Manual drop:', draggedItem.label, 'on', targetItem.label, 'position:', dropPosition);
            
            let updatedItems = [...menuItems];
            
            if (dropPosition === 'inside' && targetItem.isGroup) {
                // Move item into group
                updatedItems = updatedItems.map(item => 
                    item.id === draggedItem.id ? { ...item, parentId: targetItem.id } : item
                );
            } else {
                // Reorder items
                const draggedIndex = updatedItems.findIndex(item => item.id === draggedItem.id);
                const targetIndex = updatedItems.findIndex(item => item.id === targetItem.id);
                
                if (draggedIndex !== -1 && targetIndex !== -1) {
                    // Remove dragged item
                    const [removed] = updatedItems.splice(draggedIndex, 1);
                    
                    // Calculate new insertion index
                    const newTargetIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
                    const insertIndex = dropPosition === 'above' ? newTargetIndex : newTargetIndex + 1;
                    
                    // Insert at new position
                    updatedItems.splice(insertIndex, 0, removed);
                    
                    // Update order values
                    updatedItems = updatedItems.map((item, index) => ({ ...item, order: index }));
                }
            }
            
            updateMenuCustomization(updatedItems);
        } else {
            console.log('❌ Drop failed - missing required data');
        }
        
        // Clean up with a small delay to ensure drop logic completes
        setTimeout(() => {
            setDragState({
                isDragging: false,
                draggedItem: null,
                dragOverItem: null,
                dropPosition: null
            });
            
            // Clear last valid drop target
            lastValidDropTarget.current = {
                item: null,
                position: null
            };
        }, 10);
        
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
    };

    // Legacy drag handlers (keeping for fallback)
    const handleDragStart = (e: React.DragEvent, item: MenuItem) => {
        if (!isCustomizing) {
            e.preventDefault();
            return;
        }
        
        console.log('🚀 HTML5 Drag started:', item.label);
        
        setDragState({
            isDragging: true,
            draggedItem: item,
            dragOverItem: null,
            dropPosition: null
        });
        
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.id);
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragOver = (e: React.DragEvent, item: MenuItem) => {
        if (!isCustomizing || !dragState.draggedItem) return;
        
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;
        
        let dropPosition: 'above' | 'below' | 'inside' = 'below';
        
        if (item.isGroup) {
            if (y < height * 0.25) dropPosition = 'above';
            else if (y > height * 0.75) dropPosition = 'below';
            else dropPosition = 'inside';
        } else {
            dropPosition = y < height / 2 ? 'above' : 'below';
        }
        
        console.log('🎯 Drag over:', item.label, 'position:', dropPosition);
        
        setDragState(prev => ({
            ...prev,
            dragOverItem: item,
            dropPosition
        }));
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setDragState(prev => ({
                ...prev,
                dragOverItem: null,
                dropPosition: null
            }));
        }
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        dragCounter.current++;
    };

    const handleDrop = (e: React.DragEvent, targetItem: MenuItem) => {
        if (!isCustomizing || !dragState.draggedItem || !dragState.dropPosition) {
            e.preventDefault();
            return;
        }
        
        e.preventDefault();
        dragCounter.current = 0;
        
        const draggedItem = dragState.draggedItem;
        const dropPosition = dragState.dropPosition;
        
        console.log('✅ Drop:', draggedItem.label, 'on', targetItem.label, 'position:', dropPosition);
        
        let updatedItems = [...menuItems];
        
        if (dropPosition === 'inside' && targetItem.isGroup) {
            // Move item into group
            updatedItems = updatedItems.map(item => 
                item.id === draggedItem.id ? { ...item, parentId: targetItem.id } : item
            );
        } else {
            // Reorder items
            const draggedIndex = updatedItems.findIndex(item => item.id === draggedItem.id);
            const targetIndex = updatedItems.findIndex(item => item.id === targetItem.id);
            
            if (draggedIndex !== -1 && targetIndex !== -1) {
                // Remove dragged item
                const [removed] = updatedItems.splice(draggedIndex, 1);
                
                // Calculate new insertion index
                const newTargetIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
                const insertIndex = dropPosition === 'above' ? newTargetIndex : newTargetIndex + 1;
                
                // Insert at new position
                updatedItems.splice(insertIndex, 0, removed);
                
                // Update order values
                updatedItems = updatedItems.map((item, index) => ({ ...item, order: index }));
            }
        }
        
        updateMenuCustomization(updatedItems);
        
        setDragState({
            isDragging: false,
            draggedItem: null,
            dragOverItem: null,
            dropPosition: null
        });
    };

    const handleHTML5DragEnd = () => {
        setDragState({
            isDragging: false,
            draggedItem: null,
            dragOverItem: null,
            dropPosition: null
        });
        dragCounter.current = 0;
    };

    // Get visible menu items organized by groups
    const getOrganizedMenuItems = () => {
        const visibleItems = menuItems.filter(item => item.isVisible);
        const groups: { [key: string]: MenuItem[] } = {};
        const ungroupedItems: MenuItem[] = [];
        
        // First pass: initialize groups
        visibleItems.forEach(item => {
            if (item.isGroup) {
                groups[item.id] = [];
            }
        });
        
        // Second pass: categorize items
        visibleItems.forEach(item => {
            if (item.isGroup) {
                // Groups are handled separately
                return;
            } else if (item.parentId && groups[item.parentId] !== undefined) {
                groups[item.parentId].push(item);
            } else if (!item.parentId) {
                ungroupedItems.push(item);
            }
        });
        
        return { groups, ungroupedItems };
    };

    const { groups, ungroupedItems } = getOrganizedMenuItems();

    const NavLink: React.FC<{
        item: MenuItem;
        isGrouped?: boolean;
        isDragOver?: boolean;
        dropPosition?: 'above' | 'below' | 'inside' | null;
    }> = ({ item, isGrouped = false, isDragOver = false, dropPosition = null }) => {
        const isActive = activeView === item.id;
        const isDragging = dragState.draggedItem?.id === item.id;
        
        if (item.isGroup) {
            const groupItems = groups[item.id] || [];
            const isExpanded = item.isExpanded !== false;
            
            return (
                <div className="relative">
                    {isDragOver && dropPosition === 'above' && (
                        <div className="h-0.5 bg-accent rounded-full mb-1" />
                    )}
                    {isCustomizing ? (
                        // Draggable version for customization mode
                        <div
                            draggable={true}
                            data-menu-item={item.id}
                            onDragStart={(e) => handleDragStart(e, item)}
                            onDragOver={(e) => handleDragOver(e, item)}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, item)}
                            onDragEnd={handleHTML5DragEnd}
                            onMouseDown={(e) => handleMouseDown(e, item)}
                            onMouseUp={(e) => console.log('🖱️ Mouse up on group:', item.label)}
                            className={`group relative flex items-center w-full px-4 py-2 rounded-lg transition-all duration-200 cursor-move border-2 border-dashed border-transparent hover:border-accent/30 ${
                                isDragging ? 'opacity-50 bg-accent/10' : ''
                            } ${
                                isDragOver && dropPosition === 'inside' 
                                    ? 'bg-accent/20 border-2 border-accent border-dashed' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                            }`}
                            title="Drag to reorder group"
                            style={{ 
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                                MozUserSelect: 'none',
                                msUserSelect: 'none'
                            }}
                        >
                            <div className="flex items-center text-gray-400 mr-2" style={{ pointerEvents: 'none' }}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                                </svg>
                            </div>
                            <ChevronRightIcon className={`w-4 h-4 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} style={{ pointerEvents: 'none' }} />
                            <span className={`ml-2 font-medium whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`} style={{ pointerEvents: 'none' }}>
                                {item.label}
                            </span>
                            {!isCollapsed && (
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        ungroupItems(item.id);
                                    }}
                                    className="ml-auto opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
                                    style={{ pointerEvents: 'auto' }}
                                >
                                    Ungroup
                                </div>
                            )}
                        </div>
                    ) : (
                        // Regular clickable version for normal mode
                        <button
                            data-menu-item={item.id}
                            onClick={() => toggleGroupExpansion(item.id)}
                            className={`group relative flex items-center w-full px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                isDragOver && dropPosition === 'inside' 
                                    ? 'bg-accent/20 border-2 border-accent border-dashed' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                            }`}
                        >
                            <ChevronRightIcon className={`w-4 h-4 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            <span className={`ml-2 font-medium whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                                {item.label}
                            </span>
                        </button>
                    )}
                    {isExpanded && groupItems.map(groupItem => (
                        <div key={groupItem.id} className="ml-4">
                            <NavLink item={groupItem} isGrouped={true} />
                        </div>
                    ))}
                    {isDragOver && dropPosition === 'below' && (
                        <div className="h-0.5 bg-accent rounded-full mt-1" />
                    )}
                </div>
            );
        }
        
        return (
            <div className="relative">
                {isDragOver && dropPosition === 'above' && (
                    <div className="h-0.5 bg-accent rounded-full mb-1" />
                )}
                {isCustomizing ? (
                    // Draggable version for customization mode
                    <div
                        draggable={true}
                        data-menu-item={item.id}
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragOver={(e) => handleDragOver(e, item)}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, item)}
                        onDragEnd={handleHTML5DragEnd}
                        onMouseDown={(e) => handleMouseDown(e, item)}
                        onMouseUp={(e) => console.log('🖱️ Mouse up on:', item.label)}
                        className={`group relative flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 cursor-move border-2 border-dashed border-transparent hover:border-accent/30 ${
                            isDragging ? 'opacity-50 bg-accent/10' : ''
                        } ${
                            isActive
                                ? 'bg-accent text-white shadow-lg'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60'
                        } ${isGrouped ? 'ml-2' : ''}`}
                        title="Drag to reorder"
                        style={{ 
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none'
                        }}
                    >
                        <div className="flex items-center text-gray-400 mr-2" style={{ pointerEvents: 'none' }}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                            </svg>
                        </div>
                        <item.icon className={`w-6 h-6 flex-shrink-0 ${
                            isActive ? 'text-white' : 'text-gray-400 dark:text-gray-300 group-hover:text-accent'
                        }`} style={{ pointerEvents: 'none' }} />
                        <span className={`ml-4 font-semibold whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`} style={{ pointerEvents: 'none' }}>
                            {item.label}
                        </span>
                        {!isCollapsed && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItemVisibility(item.id);
                                }}
                                className="ml-auto opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-xs px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
                                style={{ pointerEvents: 'auto' }}
                            >
                                Hide
                            </div>
                        )}
                        {isCollapsed && (
                            <span className="absolute left-full ml-4 w-auto p-2 min-w-max rounded-md shadow-md text-white bg-gray-900 dark:bg-gray-800 text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100 z-20">
                                {item.label}
                            </span>
                        )}
                    </div>
                ) : (
                    // Regular clickable version for normal mode
                    <button
                        data-menu-item={item.id}
                        onClick={() => onNavigate(item.id as View)}
                        className={`group relative flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                            isActive
                                ? 'bg-accent text-white shadow-lg'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60'
                        } ${isGrouped ? 'ml-2' : ''}`}
                        aria-label={item.label}
                    >
                        <item.icon className={`w-6 h-6 flex-shrink-0 ${
                            isActive ? 'text-white' : 'text-gray-400 dark:text-gray-300 group-hover:text-accent'
                        }`} />
                        <span className={`ml-4 font-semibold whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                            {item.label}
                        </span>
                        {isCollapsed && (
                            <span className="absolute left-full ml-4 w-auto p-2 min-w-max rounded-md shadow-md text-white bg-gray-900 dark:bg-gray-800 text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100 z-20">
                                {item.label}
                            </span>
                        )}
                    </button>
                )}
                {isDragOver && dropPosition === 'below' && (
                    <div className="h-0.5 bg-accent rounded-full mt-1" />
                )}
            </div>
        );
    };
    
  return (
    <aside className={`relative flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 h-[73px]">
            <div className="flex items-center">
                {salonLogo ? (
                    <img src={salonLogo} alt="Logo" className={`rounded-lg object-cover transition-all duration-300 ${isCollapsed ? 'w-10 h-10' : 'w-12 h-12'}`} />
                ) : (
                    <LogoIcon className="text-accent w-10 h-10" />
                )}
            </div>
            {!isCollapsed && (
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsCustomizing(!isCustomizing)}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                            isCustomizing 
                                ? 'bg-accent text-white' 
                                : 'text-gray-400 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={isCustomizing ? 'Exit Quick Mode' : 'Quick Customize'}
                    >
                        <SettingsIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setShowCustomizer(true)}
                        className="p-2 rounded-lg transition-colors duration-200 text-gray-400 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Advanced Menu Settings"
                    >
                        <ClipboardListIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
      
        {isCustomizing && !isCollapsed && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    🎯 Click and hold to drag items • 👁️ Click "Hide" to hide items • 📋 Use advanced settings to group
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            // Reset to defaults
                            updateMenuCustomization(DEFAULT_MENU_ITEMS);
                        }}
                        className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                        Reset
                    </button>
                    <button
                        onClick={() => {
                            // Show all hidden items
                            const updatedItems = menuItems.map(item => ({ ...item, isVisible: true }));
                            updateMenuCustomization(updatedItems);
                        }}
                        className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                        Show All
                    </button>
                </div>
            </div>
        )}
      
        <nav className="flex-grow p-3 space-y-1 overflow-y-auto">
            {/* Render ungrouped items */}
            {ungroupedItems.map(item => (
                <NavLink 
                    key={item.id} 
                    item={item}
                    isDragOver={dragState.dragOverItem?.id === item.id}
                    dropPosition={dragState.dragOverItem?.id === item.id ? dragState.dropPosition : null}
                />
            ))}
            
            {/* Render groups */}
            {Object.keys(groups).map(groupId => {
                const groupItem = menuItems.find(item => item.id === groupId && item.isGroup);
                if (!groupItem) return null;
                
                return (
                    <NavLink 
                        key={groupId} 
                        item={groupItem}
                        isDragOver={dragState.dragOverItem?.id === groupId}
                        dropPosition={dragState.dragOverItem?.id === groupId ? dragState.dropPosition : null}
                    />
                );
            })}
        </nav>
      
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <button
                onClick={onLogout}
                className={`group relative flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 text-gray-500 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60`}
                aria-label={t('sidebar.logout')}
            >
                <LogoutIcon className="w-6 h-6 flex-shrink-0 text-gray-400 dark:text-gray-300 group-hover:text-red-500" />
                <span className={`ml-4 font-semibold whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                    {t('sidebar.logout')}
                </span>
                {isCollapsed && (
                    <span className="absolute left-full ml-4 w-auto p-2 min-w-max rounded-md shadow-md text-white bg-gray-900 dark:bg-gray-800 text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100 z-20">
                        {t('sidebar.logout')}
                    </span>
                )}
            </button>
        </div>

        <button 
            onClick={onToggle} 
            className="absolute top-1/2 -right-3 w-6 h-6 bg-gray-200 dark:bg-gray-700 hover:bg-accent text-gray-600 dark:text-gray-300 hover:text-white rounded-full flex items-center justify-center shadow-md transition-all"
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
            {isCollapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
        </button>

        <MenuCustomizer
            isOpen={showCustomizer}
            onClose={() => setShowCustomizer(false)}
            menuItems={menuItems}
            onUpdateItems={updateMenuCustomization}
        />
        
        {/* Drag overlay for visual feedback */}
        {dragState.isDragging && (
            <div className="fixed inset-0 pointer-events-none z-50">
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-accent text-white px-4 py-2 rounded-lg shadow-lg">
                    🎯 Dragging: {dragState.draggedItem?.label}
                    {dragState.dragOverItem && (
                        <span className="ml-2">
                            → {dragState.dropPosition} {dragState.dragOverItem.label}
                        </span>
                    )}
                </div>
            </div>
        )}
    </aside>
  );
};

export default Sidebar;