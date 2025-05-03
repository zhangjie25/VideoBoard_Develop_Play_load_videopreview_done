import React from 'react';
import './BaseCard.css';
import BaseCardSub from './BaseCardSub';

function TabContent({ 
  tabs, 
  activeTabId, 
  onTabTextChange, 
  onTabImageChange,
  nodeId
}) {
  return (
    <div className="tab-content-container">
      {tabs.map(tab => (
        <div 
          key={tab.id} 
          className={`tab-content ${activeTabId === tab.id ? 'active' : ''}`}
        >
          <BaseCardSub 
            data={tab} 
            onTextChange={(newText) => onTabTextChange(tab.id, newText)}
            onImageChange={(newImage, filePath) => onTabImageChange(tab.id, newImage, filePath)}
            nodeId={nodeId}
          />
        </div>
      ))}
    </div>
  );
}

export default TabContent; 