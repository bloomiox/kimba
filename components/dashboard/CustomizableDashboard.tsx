import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import type { DashboardWidget, DashboardConfiguration, WidgetType, Lookbook } from '../../types';
import type { View } from '../MainApp';
import DraggableWidget from './DraggableWidget';
import WidgetLibrary from './WidgetLibrary';
import BookingForm from '../booking/BookingForm';

// Advanced grid system with intelligence
interface GridMetrics {
  density: number;
  efficiency: number;
  alignment: number;
  balance: number;
}

interface PositionCandidate {
  x: number;
  y: number;
  score: number;
  reasons: string[];
}

interface SnapZone {
  x: number;
  y: number;
  width: number;
  height: number;
  strength: number;
  type: 'magnetic' | 'alignment' | 'edge';
}

// Revolutionary dashboard configuration with AI-like optimization
const DEFAULT_DASHBOARD_CONFIG: DashboardConfiguration = {
  widgets: [
    {
      id: 'today-revenue',
      type: 'today-revenue',
      title: 'Today\'s Revenue',
      position: { x: 0, y: 0, order: 0 },
      size: { width: 3, height: 1 },
      isVisible: true
    },
    {
      id: 'monthly-revenue',
      type: 'monthly-revenue',
      title: 'Monthly Revenue',
      position: { x: 3, y: 0, order: 1 },
      size: { width: 3, height: 1 },
      isVisible: true
    },
    {
      id: 'today-appointments',
      type: 'today-appointments',
      title: 'Today\'s Appointments',
      position: { x: 6, y: 0, order: 2 },
      size: { width: 3, height: 1 },
      isVisible: true
    },
    {
      id: 'ai-generations',
      type: 'ai-generations',
      title: 'AI Generations',
      position: { x: 9, y: 0, order: 3 },
      size: { width: 3, height: 1 },
      isVisible: true
    },
    {
      id: 'revenue-chart',
      type: 'revenue-chart',
      title: 'Revenue Chart',
      position: { x: 0, y: 1, order: 4 },
      size: { width: 6, height: 3 },
      isVisible: true
    },
    {
      id: 'average-price-trend',
      type: 'average-price-trend',
      title: 'Average Price Trend',
      position: { x: 6, y: 1, order: 5 },
      size: { width: 6, height: 3 },
      isVisible: true
    },
    {
      id: 'quick-actions',
      type: 'quick-actions',
      title: 'Quick Actions',
      position: { x: 0, y: 4, order: 6 },
      size: { width: 3, height: 2 },
      isVisible: true
    },
    {
      id: 'recent-bookings',
      type: 'recent-bookings',
      title: 'Recent Bookings',
      position: { x: 3, y: 4, order: 7 },
      size: { width: 3, height: 2 },
      isVisible: true
    },
    {
      id: 'sticky-notes',
      type: 'sticky-notes',
      title: 'Sticky Notes',
      position: { x: 6, y: 4, order: 8 },
      size: { width: 6, height: 2 },
      isVisible: true
    },
    {
      id: 'recent-lookbooks',
      type: 'recent-lookbooks',
      title: 'Recent Lookbooks',
      position: { x: 0, y: 6, order: 9 },
      size: { width: 12, height: 2 },
      isVisible: true
    }
  ],
  gridCols: 12,
  gridRows: 10,
  version: 2 // Upgraded version with advanced features
};

interface CustomizableDashboardProps {
  onQuickAction: (view: View) => void;
  savedLookbooks: Lookbook[];
}

const CustomizableDashboard: React.FC<CustomizableDashboardProps> = ({ onQuickAction, savedLookbooks }) => {
  const settings = useSettings();
  const { salonName, updateSettings, dashboardConfiguration: savedDashboardConfig } = settings;
  
  // Advanced state management
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<{ x: number; y: number } | null>(null);
  const [snapZones, setSnapZones] = useState<SnapZone[]>([]);
  const [isAutoArranging, setIsAutoArranging] = useState(false);
  const [isCompacting, setIsCompacting] = useState(false);
  const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [layoutAnalytics, setLayoutAnalytics] = useState<GridMetrics>({ density: 0, efficiency: 0, alignment: 0, balance: 0 });
  const [draggedWidgetSize, setDraggedWidgetSize] = useState<{ width: number; height: number } | null>(null);
  const [gridColumns, setGridColumns] = useState(12);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const [animationStates, setAnimationStates] = useState<Record<string, string>>({});
  const [hoverWidget, setHoverWidget] = useState<string | null>(null);
  
  // Refs for advanced interactions
  const gridRef = useRef<HTMLDivElement>(null);
  const dragPreviewRef = useRef<HTMLDivElement>(null);
  const analyticsRef = useRef<GridMetrics>({ density: 0, efficiency: 0, alignment: 0, balance: 0 });

  // Enhanced dashboard configuration with Supabase persistence
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfiguration>(
    savedDashboardConfig || DEFAULT_DASHBOARD_CONFIG
  );

  // Load dashboard configuration from settings context when available
  useEffect(() => {
    if (savedDashboardConfig) {
      setDashboardConfig(savedDashboardConfig);
    }
  }, [savedDashboardConfig]);

  // Save dashboard configuration to Supabase
  const saveDashboardConfig = useCallback(async (newConfig: DashboardConfiguration) => {
    setDashboardConfig(newConfig);
    try {
      await updateSettings({ dashboardConfiguration: newConfig });
      console.log('✅ Dashboard configuration saved to Supabase');
    } catch (error) {
      console.error('❌ Failed to save dashboard configuration:', error);
      // You could show a toast notification here
    }
  }, [updateSettings]);

  // Advanced responsive grid system
  useEffect(() => {
    const updateGridColumns = () => {
      const width = window.innerWidth;
      let cols = 12;
      if (width < 640) cols = 2;
      else if (width < 768) cols = 4;
      else if (width < 1024) cols = 8;
      else cols = 12;
      
      setGridColumns(cols);
    };
    
    updateGridColumns();
    window.addEventListener('resize', updateGridColumns);
    return () => window.removeEventListener('resize', updateGridColumns);
  }, []);

  // Helper functions defined before calculateLayoutMetrics
  const calculateBoundingBox = (widgets: DashboardWidget[]): { width: number; height: number } => {
    if (widgets.length === 0) return { width: 0, height: 0 };
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    widgets.forEach(widget => {
      minX = Math.min(minX, widget.position.x);
      minY = Math.min(minY, widget.position.y);
      maxX = Math.max(maxX, widget.position.x + widget.size.width);
      maxY = Math.max(maxY, widget.position.y + widget.size.height);
    });
    
    return { width: maxX - minX, height: maxY - minY };
  };

  const calculateSpaceEfficiency = (widgets: DashboardWidget[]): number => {
    if (widgets.length === 0) return 1;
    
    const totalArea = widgets.reduce((sum, w) => sum + (w.size.width * w.size.height), 0);
    const boundingBox = calculateBoundingBox(widgets);
    const boundingArea = boundingBox.width * boundingBox.height;
    
    return boundingArea > 0 ? totalArea / boundingArea : 0;
  };
  
  const calculateAlignmentScore = (widgets: DashboardWidget[]): number => {
    if (widgets.length < 2) return 1;
    
    let alignmentScore = 0;
    let totalComparisons = 0;
    
    for (let i = 0; i < widgets.length; i++) {
      for (let j = i + 1; j < widgets.length; j++) {
        const w1 = widgets[i];
        const w2 = widgets[j];
        
        // Check horizontal alignment
        if (w1.position.x === w2.position.x || 
            w1.position.x + w1.size.width === w2.position.x + w2.size.width) {
          alignmentScore += 1;
        }
        
        // Check vertical alignment
        if (w1.position.y === w2.position.y || 
            w1.position.y + w1.size.height === w2.position.y + w2.size.height) {
          alignmentScore += 1;
        }
        
        totalComparisons += 2;
      }
    }
    
    return totalComparisons > 0 ? alignmentScore / totalComparisons : 0;
  };
  
  const calculateLayoutBalance = (widgets: DashboardWidget[]): number => {
    if (widgets.length === 0) return 1;
    
    const centerX = dashboardConfig.gridCols / 2;
    const centerY = dashboardConfig.gridRows / 2;
    
    let totalWeight = 0;
    let weightedDistanceSum = 0;
    
    widgets.forEach(widget => {
      const weight = widget.size.width * widget.size.height;
      const widgetCenterX = widget.position.x + widget.size.width / 2;
      const widgetCenterY = widget.position.y + widget.size.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(widgetCenterX - centerX, 2) + 
        Math.pow(widgetCenterY - centerY, 2)
      );
      
      totalWeight += weight;
      weightedDistanceSum += weight * distance;
    });
    
    const averageDistance = totalWeight > 0 ? weightedDistanceSum / totalWeight : 0;
    const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
    
    return maxDistance > 0 ? 1 - (averageDistance / maxDistance) : 1;
  };

  // Intelligent layout analytics - simplified to avoid dependency issues
  const calculateLayoutMetrics = useMemo((): GridMetrics => {
    const widgets = dashboardConfig.widgets.filter(w => w.isVisible);
    if (widgets.length === 0) return { density: 0, efficiency: 0, alignment: 0, balance: 0 };
    
    const totalCells = dashboardConfig.gridCols * dashboardConfig.gridRows;
    const occupiedCells = widgets.reduce((sum, w) => sum + (w.size.width * w.size.height), 0);
    const density = occupiedCells / totalCells;
    
    // Simplified calculations to avoid function dependency issues
    const efficiency = Math.min(density * 2, 1);
    const alignment = widgets.length > 1 ? 0.8 : 1;
    const balance = 0.9;
    
    return { density, efficiency, alignment, balance };
  }, [dashboardConfig.widgets, dashboardConfig.gridCols, dashboardConfig.gridRows]);



  const handleAddWidget = useCallback((widgetType: WidgetType) => {
    const widgetSize = getDefaultWidgetSize(widgetType);
    const optimal = findOptimalPosition(widgetSize);
    
    const newWidget: DashboardWidget = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType,
      title: widgetType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      position: { x: optimal.x, y: optimal.y, order: dashboardConfig.widgets.length },
      size: widgetSize,
      isVisible: true
    };

    const newConfig = {
      ...dashboardConfig,
      widgets: [...dashboardConfig.widgets, newWidget]
    };
    saveDashboardConfig(newConfig);
  }, [dashboardConfig.widgets.length]);

  const handleRemoveWidget = useCallback((widgetId: string) => {
    const newConfig = {
      ...dashboardConfig,
      widgets: dashboardConfig.widgets.filter(w => w.id !== widgetId)
    };
    saveDashboardConfig(newConfig);
  }, []);

  const handleResizeWidget = useCallback((widgetId: string, newSize: { width: number; height: number }) => {
    const newConfig = {
      ...dashboardConfig,
      widgets: dashboardConfig.widgets.map(w => 
        w.id === widgetId ? { ...w, size: newSize } : w
      )
    };
    saveDashboardConfig(newConfig);
  }, []);

  const handleReorderWidgets = useCallback((sourceIndex: number, targetIndex: number) => {
    // This function is kept for compatibility but the new grid system 
    // handles positioning through drag and drop directly
    const newWidgets = [...dashboardConfig.widgets];
    const [movedWidget] = newWidgets.splice(sourceIndex, 1);
    newWidgets.splice(targetIndex, 0, movedWidget);
    
    const reorderedWidgets = newWidgets.map((widget, index) => ({
      ...widget,
      position: { ...widget.position, order: index }
    }));
    
    const newConfig = {
      ...dashboardConfig,
      widgets: reorderedWidgets
    };
    saveDashboardConfig(newConfig);
  }, [dashboardConfig, saveDashboardConfig]);

  const getDefaultWidgetSize = (widgetType: WidgetType): { width: number; height: number } => {
    const sizeMap: Record<WidgetType, { width: number; height: number }> = {
      'today-revenue': { width: 3, height: 1 },
      'monthly-revenue': { width: 3, height: 1 },
      'weekly-revenue': { width: 3, height: 1 },
      'average-sale': { width: 3, height: 1 },
      'average-price-trend': { width: 6, height: 2 },
      'today-appointments': { width: 3, height: 1 },
      'pending-appointments': { width: 3, height: 1 },
      'total-clients': { width: 3, height: 1 },
      'active-hairstylists': { width: 3, height: 1 },
      'ai-generations': { width: 3, height: 1 },
      'revenue-chart': { width: 6, height: 3 },
      'recent-bookings': { width: 4, height: 3 },
      'sticky-notes': { width: 4, height: 3 },
      'quick-actions': { width: 4, height: 2 },
      'recent-lookbooks': { width: 8, height: 3 }
    };
    return sizeMap[widgetType] || { width: 4, height: 2 };
  };

  const getUsedWidgetTypes = useCallback((): WidgetType[] => {
    return dashboardConfig.widgets.map(w => w.type);
  }, [dashboardConfig.widgets]);

  // Advanced grid layout helper functions
  const createGridLayout = () => {
    const grid: (string | null)[][] = Array(dashboardConfig.gridRows)
      .fill(null)
      .map(() => Array(dashboardConfig.gridCols).fill(null));
    
    // Fill grid with current widgets
    dashboardConfig.widgets
      .filter(w => w.isVisible && w.id !== draggedWidget)
      .forEach(widget => {
        for (let y = widget.position.y; y < widget.position.y + widget.size.height; y++) {
          for (let x = widget.position.x; x < widget.position.x + widget.size.width; x++) {
            if (y < grid.length && x < grid[0].length) {
              grid[y][x] = widget.id;
            }
          }
        }
      });
    
    return grid;
  };

  const canPlaceWidget = (x: number, y: number, width: number, height: number, excludeId?: string): boolean => {
    if (x < 0 || y < 0 || x + width > dashboardConfig.gridCols || y + height > dashboardConfig.gridRows) {
      return false;
    }
    
    const grid = createGridLayout();
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        if (grid[y + dy][x + dx] !== null) {
          return false;
        }
      }
    }
    return true;
  };

  const findOptimalPosition = (widgetSize: { width: number; height: number }, preferredX?: number, preferredY?: number): { x: number; y: number; score: number } => {
    const candidates: Array<{ x: number; y: number; score: number }> = [];
    
    // Try preferred position first if provided
    if (preferredX !== undefined && preferredY !== undefined) {
      if (canPlaceWidget(preferredX, preferredY, widgetSize.width, widgetSize.height, draggedWidget || undefined)) {
        return { x: preferredX, y: preferredY, score: 1000 };
      }
      
      // Try magnetic snapping around preferred position
      const snapRadius = 2;
      for (let dy = -snapRadius; dy <= snapRadius; dy++) {
        for (let dx = -snapRadius; dx <= snapRadius; dx++) {
          const newX = preferredX + dx;
          const newY = preferredY + dy;
          if (canPlaceWidget(newX, newY, widgetSize.width, widgetSize.height, draggedWidget || undefined)) {
            const distance = Math.abs(dx) + Math.abs(dy);
            candidates.push({ x: newX, y: newY, score: 900 - distance * 50 });
          }
        }
      }
    }
    
    // Find all possible positions and score them
    for (let y = 0; y <= dashboardConfig.gridRows - widgetSize.height; y++) {
      for (let x = 0; x <= dashboardConfig.gridCols - widgetSize.width; x++) {
        if (canPlaceWidget(x, y, widgetSize.width, widgetSize.height, draggedWidget || undefined)) {
          let score = 0;
          
          // Prefer top-left positions
          score += (dashboardConfig.gridRows - y) * 10;
          score += (dashboardConfig.gridCols - x) * 5;
          
          // Prefer positions that align with existing widgets
          const alignmentBonus = calculateAlignmentBonus(x, y, widgetSize);
          score += alignmentBonus;
          
          // Prefer positions that create compact layouts
          const compactBonus = calculateCompactBonus(x, y, widgetSize);
          score += compactBonus;
          
          candidates.push({ x, y, score });
        }
      }
    }
    
    // Return best candidate or fallback
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0] || { x: 0, y: dashboardConfig.gridRows, score: 0 };
  };

  const calculateAlignmentBonus = (x: number, y: number, size: { width: number; height: number }): number => {
    let bonus = 0;
    const widgets = dashboardConfig.widgets.filter(w => w.isVisible && w.id !== draggedWidget);
    
    widgets.forEach(widget => {
      // Horizontal alignment
      if (widget.position.x === x || widget.position.x + widget.size.width === x + size.width) {
        bonus += 20;
      }
      // Vertical alignment
      if (widget.position.y === y || widget.position.y + widget.size.height === y + size.height) {
        bonus += 20;
      }
      // Edge proximity
      const distance = Math.min(
        Math.abs(widget.position.x - (x + size.width)),
        Math.abs((widget.position.x + widget.size.width) - x),
        Math.abs(widget.position.y - (y + size.height)),
        Math.abs((widget.position.y + widget.size.height) - y)
      );
      if (distance <= 1) bonus += 15;
    });
    
    return bonus;
  };

  const calculateCompactBonus = (x: number, y: number, size: { width: number; height: number }): number => {
    let bonus = 0;
    const widgets = dashboardConfig.widgets.filter(w => w.isVisible && w.id !== draggedWidget);
    
    // Check for adjacent widgets (promotes compactness)
    for (let dy = -1; dy <= size.height; dy++) {
      for (let dx = -1; dx <= size.width; dx++) {
        const checkX = x + dx;
        const checkY = y + dy;
        
        if (widgets.some(w => 
          checkX >= w.position.x && checkX < w.position.x + w.size.width &&
          checkY >= w.position.y && checkY < w.position.y + w.size.height
        )) {
          bonus += 5;
        }
      }
    }
    
    return bonus;
  };

  const autoCompactLayout = useCallback(() => {
    setIsCompacting(true);
    
    const sortedWidgets = [...dashboardConfig.widgets]
      .filter(w => w.isVisible)
      .sort((a, b) => {
        // Sort by row first, then by column
        if (a.position.y !== b.position.y) return a.position.y - b.position.y;
        return a.position.x - b.position.x;
      });
    
    const newWidgets = [...dashboardConfig.widgets];
    const tempGrid: (string | null)[][] = Array(dashboardConfig.gridRows)
      .fill(null)
      .map(() => Array(dashboardConfig.gridCols).fill(null));
    
    sortedWidgets.forEach(widget => {
      const optimal = findOptimalPositionInGrid(tempGrid, widget.size);
      const widgetIndex = newWidgets.findIndex(w => w.id === widget.id);
      
      if (widgetIndex !== -1) {
        newWidgets[widgetIndex] = {
          ...newWidgets[widgetIndex],
          position: { ...newWidgets[widgetIndex].position, x: optimal.x, y: optimal.y }
        };
        
        // Mark cells as occupied in temp grid
        for (let y = optimal.y; y < optimal.y + widget.size.height; y++) {
          for (let x = optimal.x; x < optimal.x + widget.size.width; x++) {
            if (y < tempGrid.length && x < tempGrid[0].length) {
              tempGrid[y][x] = widget.id;
            }
          }
        }
      }
    });
    
    const newConfig = { ...dashboardConfig, widgets: newWidgets };
    saveDashboardConfig(newConfig);
    
    setTimeout(() => setIsCompacting(false), 1000);
  }, [dashboardConfig]);

  const findOptimalPositionInGrid = (grid: (string | null)[][], size: { width: number; height: number }): { x: number; y: number } => {
    for (let y = 0; y <= dashboardConfig.gridRows - size.height; y++) {
      for (let x = 0; x <= dashboardConfig.gridCols - size.width; x++) {
        let canPlace = true;
        
        for (let dy = 0; dy < size.height && canPlace; dy++) {
          for (let dx = 0; dx < size.width && canPlace; dx++) {
            if (grid[y + dy][x + dx] !== null) {
              canPlace = false;
            }
          }
        }
        
        if (canPlace) return { x, y };
      }
    }
    
    return { x: 0, y: dashboardConfig.gridRows };
  };

  const getSnapPosition = (clientX: number, clientY: number, gridElement: HTMLElement): { x: number; y: number } | null => {
    const rect = gridElement.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;
    
    const cellWidth = rect.width / dashboardConfig.gridCols;
    const cellHeight = rect.height / dashboardConfig.gridRows;
    
    const gridX = Math.floor(relativeX / cellWidth);
    const gridY = Math.floor(relativeY / cellHeight);
    
    if (gridX >= 0 && gridX < dashboardConfig.gridCols && gridY >= 0 && gridY < dashboardConfig.gridRows) {
      return { x: gridX, y: gridY };
    }
    
    return null;
  };

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', widgetId);
    
    const widget = dashboardConfig.widgets.find(w => w.id === widgetId);
    if (widget) {
      setDraggedWidgetSize(widget.size);
    }
    
    setDraggedWidget(widgetId);
    
    // Add ghost image for better visual feedback
    const dragImage = document.createElement('div');
    dragImage.style.cssText = `
      position: absolute;
      top: -1000px;
      background: rgba(59, 130, 246, 0.1);
      border: 2px dashed #3b82f6;
      border-radius: 0.75rem;
      width: 200px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #3b82f6;
      font-weight: 600;
      font-size: 14px;
    `;
    dragImage.textContent = 'Moving Widget...';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 100, 50);
    
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (isCustomizing && draggedWidget && draggedWidgetSize) {
      const gridElement = e.currentTarget as HTMLElement;
      const rawSnapPos = getSnapPosition(e.clientX, e.clientY, gridElement);
      
      if (rawSnapPos) {
        // Always allow the position where the user is dragging
        // Don't enforce empty space requirement for drag preview
        setDragOverPosition({ x: rawSnapPos.x, y: rawSnapPos.y });
        setPreviewPosition({
          x: rawSnapPos.x,
          y: rawSnapPos.y,
          width: draggedWidgetSize.width,
          height: draggedWidgetSize.height
        });
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const sourceWidgetId = e.dataTransfer.getData('text/plain');
    
    if (sourceWidgetId && dragOverPosition && draggedWidgetSize) {
      const sourceWidget = dashboardConfig.widgets.find(w => w.id === sourceWidgetId);
      if (!sourceWidget) return;

      // Get all other widgets that would be affected by this placement
      const otherWidgets = dashboardConfig.widgets.filter(w => w.id !== sourceWidgetId && w.isVisible);
      
      // Check for conflicts and create displacement map
      const displacements = new Map<string, { x: number; y: number }>();
      const newPosition = { x: dragOverPosition.x, y: dragOverPosition.y };
      
      // Find widgets that would overlap with the new position
      const conflictingWidgets = otherWidgets.filter(widget => {
        const widgetRight = widget.position.x + widget.size.width;
        const widgetBottom = widget.position.y + widget.size.height;
        const newRight = newPosition.x + draggedWidgetSize.width;
        const newBottom = newPosition.y + draggedWidgetSize.height;
        
        return !(
          widgetRight <= newPosition.x || // widget is to the left
          widget.position.x >= newRight || // widget is to the right
          widgetBottom <= newPosition.y || // widget is above
          widget.position.y >= newBottom    // widget is below
        );
      });
      
      // Displace conflicting widgets
      conflictingWidgets.forEach(conflictWidget => {
        // Try to find a new position for the conflicting widget
        const optimalPosition = findOptimalPosition(
          conflictWidget.size,
          conflictWidget.position.x,
          conflictWidget.position.y + draggedWidgetSize.height // Try moving it down first
        );
        
        displacements.set(conflictWidget.id, {
          x: optimalPosition.x,
          y: optimalPosition.y
        });
      });
      
      // Apply all position changes
      const newConfig = {
        ...dashboardConfig,
        widgets: dashboardConfig.widgets.map(w => {
          if (w.id === sourceWidgetId) {
            return { ...w, position: { ...w.position, x: newPosition.x, y: newPosition.y } };
          } else if (displacements.has(w.id)) {
            const newPos = displacements.get(w.id)!;
            return { ...w, position: { ...w.position, x: newPos.x, y: newPos.y } };
          }
          return w;
        })
      };
      saveDashboardConfig(newConfig);
      
      // Show success feedback
      console.log(`✅ Widget "${sourceWidget.title}" moved to position (${newPosition.x}, ${newPosition.y})`);
      if (conflictingWidgets.length > 0) {
        console.log(`📦 Displaced ${conflictingWidgets.length} conflicting widgets`);
      }
    }
    
    // Clean up all drag states
    setDraggedWidget(null);
    setDragOverPosition(null);
    setPreviewPosition(null);
    setDraggedWidgetSize(null);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the grid container itself
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverPosition(null);
      setPreviewPosition(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
    setDragOverPosition(null);
    setPreviewPosition(null);
    setDraggedWidgetSize(null);
  };

  const resetToDefaults = () => {
    saveDashboardConfig(DEFAULT_DASHBOARD_CONFIG);
  };

  return (
    <div className="animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Welcome to {salonName}</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">Here's your salon overview for today</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBookingModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book Appointment
            </button>
            
            <button
              onClick={() => setShowWidgetLibrary(true)}
              className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Widget
            </button>
            
            {isCustomizing && (
              <button
                onClick={autoCompactLayout}
                disabled={isCompacting}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                title="Automatically arrange widgets for optimal layout"
              >
                <svg className={`w-4 h-4 ${isCompacting ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isCompacting ? 'Compacting...' : 'Auto Arrange'}
              </button>
            )}
            
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm hover:shadow-md ${
                isCustomizing 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isCustomizing ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                )}
              </svg>
              {isCustomizing ? 'Done' : 'Customize'}
            </button>
            
            {isCustomizing && (
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all text-sm shadow-sm hover:shadow-md"
                title="Reset dashboard to default layout"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Customization Help */}
        {isCustomizing && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-3 text-lg">🎯 Advanced Customization Mode</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                      <div className="font-semibold text-blue-800 dark:text-blue-200 mb-1 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
                        Drag & Drop
                      </div>
                      <p className="text-blue-700 dark:text-blue-300">Drag widgets to see intelligent snap indicators</p>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                      <div className="font-semibold text-blue-800 dark:text-blue-200 mb-1 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                        Auto Arrange
                      </div>
                      <p className="text-blue-700 dark:text-blue-300">Click to automatically optimize layout</p>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                      <div className="font-semibold text-blue-800 dark:text-blue-200 mb-1 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Remove
                      </div>
                      <p className="text-blue-700 dark:text-blue-300">Hover and click × to remove widgets</p>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                      <div className="font-semibold text-blue-800 dark:text-blue-200 mb-1 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" /></svg>
                        Resize
                      </div>
                      <p className="text-blue-700 dark:text-blue-300">Drag corner handles to resize widgets</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div 
          className={`dashboard-grid ${isCustomizing ? 'customizing' : ''}`}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${dashboardConfig.gridCols}, 1fr)`,
            gridTemplateRows: `repeat(${dashboardConfig.gridRows}, 120px)`,
            gap: '10px',
            minHeight: '800px',
            position: 'relative',
            padding: '10px'
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Enhanced Snap Indicators */}
          {isCustomizing && previewPosition && (
            <div 
              className="snap-indicator-enhanced"
              style={{
                gridColumn: `${previewPosition.x + 1} / span ${previewPosition.width}`,
                gridRow: `${previewPosition.y + 1} / span ${previewPosition.height}`,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '3px dashed rgba(59, 130, 246, 0.6)',
                borderRadius: '1rem',
                pointerEvents: 'none',
                zIndex: 1000,
                position: 'relative'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-lg" />
              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm">
                🎯 Drop here
              </div>
              <div className="absolute bottom-2 right-2 text-blue-600 text-xs font-medium bg-white/80 px-2 py-1 rounded-md">
                {previewPosition.width}×{previewPosition.height}
              </div>
            </div>
          )}
          
          {/* Grid Guidelines */}
          {isCustomizing && !draggedWidget && (
            <div className="grid-guidelines">
              {Array.from({ length: dashboardConfig.gridRows * dashboardConfig.gridCols }, (_, i) => {
                const row = Math.floor(i / dashboardConfig.gridCols);
                const col = i % dashboardConfig.gridCols;
                return (
                  <div
                    key={i}
                    className="grid-cell"
                    style={{
                      gridColumn: `${col + 1}`,
                      gridRow: `${row + 1}`,
                      border: '1px solid rgba(59, 130, 246, 0.1)',
                      borderRadius: '4px',
                      transition: 'all 0.2s ease',
                      pointerEvents: 'none'
                    }}
                  />
                );
              })}
            </div>
          )}
          
          {dashboardConfig.widgets
            .filter(widget => widget.isVisible)
            .map((widget) => (
              <div
                key={widget.id}
                draggable={isCustomizing}
                onDragStart={(e) => handleDragStart(e, widget.id)}
                onDragEnd={handleDragEnd}
                className={`widget-container transition-all duration-200 ease-in-out ${
                  draggedWidget === widget.id ? 'opacity-50 scale-105 z-10' : 'opacity-100 scale-100'
                }`}
                style={{
                  gridColumn: `${widget.position.x + 1} / span ${widget.size.width}`,
                  gridRow: `${widget.position.y + 1} / span ${widget.size.height}`,
                  padding: '0'
                }}
              >
                <DraggableWidget
                  widget={widget}
                  onRemove={handleRemoveWidget}
                  onResize={handleResizeWidget}
                  onQuickAction={onQuickAction}
                  savedLookbooks={savedLookbooks}
                  isDragging={draggedWidget === widget.id}
                  isCustomizing={isCustomizing}
                />
              </div>
            ))}
        </div>

        {/* Empty State */}
        {dashboardConfig.widgets.filter(w => w.isVisible).length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your dashboard is empty</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Add some widgets to get started with your personalized dashboard</p>
            <button
              onClick={() => setShowWidgetLibrary(true)}
              className="px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Widget
            </button>
          </div>
        )}

        {/* Widget Library Modal */}
        <WidgetLibrary
          isOpen={showWidgetLibrary}
          onClose={() => setShowWidgetLibrary(false)}
          onAddWidget={handleAddWidget}
          usedWidgets={getUsedWidgetTypes()}
        />
        
        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 z-50">
            <BookingForm onClose={() => setShowBookingModal(false)} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
            transform: scale(1.02);
          }
        }
        @keyframes grid-appear {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes widget-compact {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        
        .dashboard-grid {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          box-sizing: border-box;
        }
        
        .dashboard-grid.customizing {
          background: 
            linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
          background-size: calc((100% - 20px) / ${dashboardConfig.gridCols}) 120px;
          animation: grid-appear 0.3s ease-out;
        }
        
        .dashboard-grid.customizing::before {
          content: '';
          position: absolute;
          inset: -1rem;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(99, 102, 241, 0.05));
          border-radius: 1rem;
          z-index: -1;
          opacity: 0;
          animation: fade-in 0.3s ease-out 0.1s forwards;
        }
        
        .widget-container {
          will-change: transform, opacity;
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          box-sizing: border-box;
        }
        
        .widget-container:hover {
          transform: translateY(-2px);
          filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.1));
        }
        
        .dashboard-grid.customizing .widget-container {
          cursor: move;
        }
        
        .dashboard-grid.customizing .widget-container:hover {
          transform: translateY(-4px) scale(1.02);
          z-index: 10;
          filter: drop-shadow(0 8px 30px rgba(59, 130, 246, 0.2));
        }
        
        .snap-indicator-enhanced {
          animation: pulse-glow 1.5s infinite;
          backdrop-filter: blur(4px);
        }
        
        .grid-guidelines {
          position: absolute;
          inset: 10px;
          display: grid;
          grid-template-columns: repeat(${dashboardConfig.gridCols}, 1fr);
          grid-template-rows: repeat(${dashboardConfig.gridRows}, 120px);
          gap: 10px;
          pointer-events: none;
          z-index: 1;
          animation: fade-in 0.5s ease-out;
        }
        
        .grid-cell:hover {
          background: rgba(59, 130, 246, 0.05);
          border-color: rgba(59, 130, 246, 0.2) !important;
        }
        
        ${isCompacting ? `
          .widget-container {
            animation: widget-compact 0.8s ease-in-out;
          }
        ` : ''}
        
        /* Enhanced responsive design */
        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: repeat(8, 1fr) !important;
          }
          .grid-guidelines {
            grid-template-columns: repeat(8, 1fr) !important;
            gap: 10px;
          }
        }
        
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: repeat(4, 1fr) !important;
            grid-template-rows: repeat(auto, 140px) !important;
          }
          .grid-guidelines {
            grid-template-columns: repeat(4, 1fr) !important;
            grid-template-rows: repeat(auto, 140px) !important;
            gap: 10px;
          }
        }
        
        @media (max-width: 640px) {
          .dashboard-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .grid-guidelines {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px;
          }
        }
        
        /* Dark mode enhancements */
        .dark .dashboard-grid.customizing {
          background: 
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
        }
        
        .dark .snap-indicator-enhanced {
          border-color: rgba(99, 102, 241, 0.8);
          background-color: rgba(99, 102, 241, 0.1);
        }
        
        /* Prevent text selection during drag */
        .dashboard-grid.customizing {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        
        /* Accessibility improvements */
        .widget-container:focus-visible {
          outline: 2px solid rgba(59, 130, 246, 0.6);
          outline-offset: 2px;
        }
        
        /* Performance optimizations */
        .dashboard-grid * {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
};

export default CustomizableDashboard;