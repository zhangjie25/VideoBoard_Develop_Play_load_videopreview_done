import React from 'react';
import './BaseCard.css';

function BaseCardSubText({ data, onTextChange }) {
  return (
    <div className="text-div">
      <textarea 
        placeholder="Add your text here..." 
        value={data.text || ''}
        onChange={(e) => onTextChange(e.target.value)}
        className="text-input"
      />
    </div>
  );
}

export default BaseCardSubText; 