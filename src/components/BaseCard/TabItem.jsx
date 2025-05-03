import React, { useRef, memo } from 'react';
import './BaseCard.css';

function TabItemComponent({ tab, isActive, onClick, onDragStart, nodeId }) {
  const dragRef = useRef(null);

  const handleDragStart = (e) => {
    // Set transfer data including sourceNodeId and tabData
    e.dataTransfer.setData('application/json', JSON.stringify({
      sourceNodeId: nodeId, // Include the source node ID
      tabData: tab // Include the full tab object
    }));
    
    e.dataTransfer.effectAllowed = 'move';
    
    // If an external onDragStart handler is provided, call it
    if (onDragStart) {
      onDragStart(tab.id, e); // Pass tab.id and the event
    }
  };

  return (
    <div 
      ref={dragRef}
      className={`tab-button ${isActive ? 'active' : ''}`}
      onClick={onClick}
      draggable={true}
      onDragStart={handleDragStart}
      data-tab-id={tab.id} // Add data attribute for easier identification
    >
      {tab.title}
    </div>
  );
}

// Memoize the component
const TabItem = memo(TabItemComponent);

export default TabItem; 