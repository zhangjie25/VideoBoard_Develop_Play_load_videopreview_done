import React from 'react';
import './InfoPanel.css';

const InfoPanel = ({ selectedNode }) => {
  if (!selectedNode) {
    return (
      <div className="info-panel">
        <div className="info-panel-header">Node Properties</div>
        <div className="info-panel-content">
          <p>Select a node to view its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="info-panel">
      <div className="info-panel-header">Node Properties</div>
      <div className="info-panel-content">
        <div className="property">
          <div className="property-label">ID:</div>
          <div className="property-value">{selectedNode.id}</div>
        </div>
        <div className="property">
          <div className="property-label">Type:</div>
          <div className="property-value">{selectedNode.type}</div>
        </div>
        <div className="property">
          <div className="property-label">Label:</div>
          <div className="property-value">{selectedNode.data.label}</div>
        </div>
        {selectedNode.data.value1 !== undefined && (
          <div className="property">
            <div className="property-label">Value 1:</div>
            <div className="property-value">{selectedNode.data.value1}</div>
          </div>
        )}
        {selectedNode.data.value2 !== undefined && (
          <div className="property">
            <div className="property-label">Value 2:</div>
            <div className="property-value">{selectedNode.data.value2}</div>
          </div>
        )}
        <div className="property">
          <div className="property-label">Position:</div>
          <div className="property-value">
            x: {Math.round(selectedNode.position.x)}, y: {Math.round(selectedNode.position.y)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel; 