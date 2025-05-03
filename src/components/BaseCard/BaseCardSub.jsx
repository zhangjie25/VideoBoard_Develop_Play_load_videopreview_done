import React from 'react';
import './BaseCard.css';
import BaseCardSubText from './BaseCardSubText';
import BaseCardSubMultimedia from './BaseCardSubMultimedia';

function BaseCardSub({ data, onTextChange, onImageChange, nodeId }) {
  // We can use data.tabId to fetch tab-specific content in the future
  return (
    <div className="card-sub-div">
      <BaseCardSubText 
        data={data} 
        onTextChange={onTextChange} 
      />
      <BaseCardSubMultimedia 
        image={data.image} 
        onImageChange={(newImage, filePath) => {
          // Update both the image URL and file path
          onImageChange(newImage, filePath);
        }}
        tabId={data.id}
        nodeId={nodeId}
      />
    </div>
  );
}

export default BaseCardSub; 