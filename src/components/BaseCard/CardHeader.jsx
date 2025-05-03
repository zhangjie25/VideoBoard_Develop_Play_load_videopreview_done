import React from 'react';
import './BaseCard.css';

function CardHeader({ nodeLabel, expanded, onToggleExpand }) {
  console.log('CardHeader nodeLabel:', nodeLabel);
  return (
    <div className="card-header for-drag" onClick={onToggleExpand}>
      <span className="card-title">{nodeLabel}</span>
      <button className="expand-button">{expanded ? '−' : '+'}</button>
    </div>
  );
}

export default CardHeader; 