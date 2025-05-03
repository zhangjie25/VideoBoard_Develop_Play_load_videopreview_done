import React, { useState, useEffect, useRef, memo } from 'react';
import './BaseCard.css';
import TabItem from './TabItem';

function TabContainerComponent({ 
  nodeId,
  tabs, 
  activeTabId, 
  onTabChange, 
  onAddTab, 
  onTabDrop,
  onTabRemove,
}) {
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [draggedTabId, setDraggedTabId] = useState(null);
  const tabsRef = useRef(null);

  const handleTabDragStart = (tabId) => {
    setDraggedTabId(tabId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isTabDrag = e.dataTransfer.types.includes('application/json');
    if (!isTabDrag || !draggedTabId) return;

    e.dataTransfer.dropEffect = 'move';

    if (tabsRef.current) {
      const tabElements = Array.from(tabsRef.current.querySelectorAll('.tab-button[data-tab-id]'));
      let targetIdx = -1;
      for (let i = 0; i < tabElements.length; i++) {
        const tabElement = tabElements[i];
        const rect = tabElement.getBoundingClientRect();
        if (e.clientX > rect.left && e.clientX < rect.right) {
          const midpoint = rect.left + rect.width / 2;
          targetIdx = (e.clientX < midpoint) ? i : i + 1;
          break;
        }
      }
      if (targetIdx === -1 && tabElements.length > 0) {
         const lastTabRect = tabElements[tabElements.length - 1].getBoundingClientRect();
         if (e.clientX > lastTabRect.right) {
            targetIdx = tabElements.length;
         }
      }
      
      setDragOverIndex(targetIdx);
    }
  };

  const handleDragLeave = (e) => {
    if (tabsRef.current && !tabsRef.current.contains(e.relatedTarget)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const dragOverIdx = dragOverIndex;
    setDragOverIndex(null);
    setDraggedTabId(null);
    
    try {
      const dataString = e.dataTransfer.getData('application/json');
      if (!dataString) return;
      
      const tabDropData = JSON.parse(dataString);
      
      if (onTabDrop) {
        onTabDrop(tabDropData, dragOverIdx, e);
      }
    } catch (error) {
      console.error("Error processing dropped tab:", error);
    }
  };

  return (
    <div 
      ref={tabsRef}
      className="tabs-container"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      {tabs.map((tab, index) => (
        <React.Fragment key={tab.id}>
          {dragOverIndex === index && draggedTabId && (!tabs[index] || draggedTabId !== tabs[index].id) && (
             <div className="drop-indicator" style={{ left: `${index * 100}px` }} />
          )}
          <TabItem
            nodeId={nodeId}
            tab={tab}
            isActive={activeTabId === tab.id}
            onClick={() => onTabChange(tab.id)}
            onDragStart={handleTabDragStart}
          />
        </React.Fragment>
      ))}
       {dragOverIndex === tabs.length && draggedTabId && (
         <div className="drop-indicator" style={{ left: `${tabs.length * 100}px` }} />
       )}
      <button 
        className="add-tab-button" 
        onClick={onAddTab}
      >
        +
      </button>
    </div>
  );
}

const TabContainer = memo(TabContainerComponent);

export default TabContainer; 