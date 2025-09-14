import React, { useState } from 'react';

interface DragItem {
  id: string;
  label: string;
}

const SimpleDragTest: React.FC = () => {
  const [items, setItems] = useState<DragItem[]>([
    { id: '1', label: 'Item 1' },
    { id: '2', label: 'Item 2' },
    { id: '3', label: 'Item 3' },
    { id: '4', label: 'Item 4' },
  ]);
  
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);

  const handleDragStart = (e: React.DragEvent, item: DragItem) => {
    console.log('🚀 Drag started:', item.label);
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetItem: DragItem) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    console.log('✅ Drop:', draggedItem.label, 'on', targetItem.label);
    
    const draggedIndex = items.findIndex(item => item.id === draggedItem.id);
    const targetIndex = items.findIndex(item => item.id === targetItem.id);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newItems = [...items];
      const [removed] = newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, removed);
      setItems(newItems);
    }
    
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    console.log('🏁 Drag ended');
    setDraggedItem(null);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Simple Drag Test</h1>
        <p className="text-gray-600 mb-6">Try dragging the items to reorder them:</p>
        
        <div className="space-y-2">
          {items.map(item => (
            <div
              key={item.id}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, item)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, item)}
              onDragEnd={handleDragEnd}
              className={`p-4 bg-blue-50 border-2 border-blue-200 rounded-lg cursor-move transition-all ${
                draggedItem?.id === item.id ? 'opacity-50' : 'hover:bg-blue-100'
              }`}
              style={{ 
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
            >
              <div className="flex items-center">
                <div className="mr-3 text-gray-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                  </svg>
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p className="text-sm text-gray-600">
            Open browser console (F12) to see drag events
          </p>
          <p className="text-sm text-gray-600">
            Current order: {items.map(item => item.label).join(' → ')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleDragTest;