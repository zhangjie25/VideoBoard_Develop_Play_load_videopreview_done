import React, { useState, useRef, useEffect } from 'react';
import './BaseCard.css';
import { openFilePicker, createFileObjectURL, revokeFileObjectURL, verifyFileHandle } from '../../utils/fileSystemAccess';
import { storeMediaHandle, getMediaHandle, deleteMediaHandle } from '../../utils/indexedDBStorage';

function BaseCardSubMultimedia({ image, onImageChange, tabId, nodeId }) {
  const [dragActive, setDragActive] = useState(false);
  const [mediaType, setMediaType] = useState(null);
  const [objectUrl, setObjectUrl] = useState(null);
  const [filePath, setFilePath] = useState(null);
  const inputRef = useRef(null);
  
  // Load the file when the component mounts or when tabId changes
  useEffect(() => {
    const loadMediaFile = async () => {
      if (!tabId) return;
      
      try {
        // Try to get the media handle from IndexedDB
        const mediaData = await getMediaHandle(tabId);
        
        if (mediaData && mediaData.handle) {
          // Verify the file handle is still valid
          const isValid = await verifyFileHandle(mediaData.handle);
          
          if (isValid) {
            const file = await mediaData.handle.getFile();
            const type = file.type.startsWith('video/') ? 'video' : 
                        file.type.startsWith('image/') ? 'image' : 
                        file.type.startsWith('audio/') ? 'audio' : null;
            
            setMediaType(type);
            setFilePath(mediaData.path);
            
            // Create object URL for the file
            const newObjectUrl = createFileObjectURL(file);
            setObjectUrl(newObjectUrl);
            onImageChange(newObjectUrl, mediaData.path);
          } else {
            // If the handle is no longer valid, delete it from IndexedDB
            await deleteMediaHandle(tabId);
            setMediaType(null);
            setFilePath(null);
            setObjectUrl(null);
            onImageChange(null, null);
          }
        } else if (image && !objectUrl) {
          // If there's an image URL but no object URL, determine media type from URL
          const type = determineMediaTypeFromUrl(image);
          setMediaType(type);
        }
      } catch (error) {
        console.error('Error loading media file:', error);
      }
    };
    
    loadMediaFile();
    
    // Clean up function
    return () => {
      if (objectUrl) {
        revokeFileObjectURL(objectUrl);
      }
    };
  }, [tabId, nodeId]);

  // Determine media type from URL
  const determineMediaTypeFromUrl = (url) => {
    if (!url) return null;
    
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.aac'];
    
    const lowercaseUrl = url.toLowerCase();
    
    if (videoExtensions.some(ext => lowercaseUrl.endsWith(ext)) || url.includes('video')) {
      return 'video';
    } else if (audioExtensions.some(ext => lowercaseUrl.endsWith(ext))) {
      return 'audio';
    } else if (imageExtensions.some(ext => lowercaseUrl.endsWith(ext)) || url.includes('image')) {
      return 'image';
    }
    
    return 'image'; // Default to image if can't determine
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.match('image.*') && !file.type.match('video.*') && !file.type.match('audio.*')) {
      alert('Please select an image, video, or audio file');
      return;
    }

    let type = 'image';
    if (file.type.match('video.*')) {
      type = 'video';
    } else if (file.type.match('audio.*')) {
      type = 'audio';
    }
    
    setMediaType(type);
    
    // Clean up previous object URL if it exists
    if (objectUrl) {
      revokeFileObjectURL(objectUrl);
    }
    
    // Create new object URL
    const newObjectUrl = createFileObjectURL(file);
    setObjectUrl(newObjectUrl);
    setFilePath(file.name);
    
    // Pass the object URL and file path to the parent component
    onImageChange(newObjectUrl, file.name);
  };

  const handleFileSystemPicker = async () => {
    try {
      const { file, handle, path } = await openFilePicker();
      
      // Store the file handle in IndexedDB
      if (tabId && nodeId) {
        await storeMediaHandle({
          id: tabId,
          handle,
          path,
          nodeId,
          timestamp: new Date().toISOString()
        });
      }
      
      handleFile(file);
      setFilePath(path);
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error selecting file:', error);
      }
    }
  };

  const handleClick = () => {
    if (window.showOpenFilePicker) {
      handleFileSystemPicker();
    } else {
      // Fallback to traditional file input
      inputRef.current.click();
    }
  };

  const handleRemoveMedia = (e) => {
    e.stopPropagation();
    
    // Clean up object URL if it exists
    if (objectUrl) {
      revokeFileObjectURL(objectUrl);
      setObjectUrl(null);
    }
    
    // Delete from IndexedDB if tab ID exists
    if (tabId) {
      deleteMediaHandle(tabId).catch(err => console.error('Error deleting media handle:', err));
    }
    
    setMediaType(null);
    setFilePath(null);
    onImageChange(null, null);
  };

  return (
    <div className="multimedia-div">
      <div 
        className={`media-placeholder ${dragActive ? 'drag-active' : ''} ${image ? 'has-image' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {!image ? (
          <>
            <span>+</span>
            <p>Add media (drag & drop or click)</p>
          </>
        ) : (
          <div className="image-container">
            {mediaType === 'video' ? (
              <video src={image} controls width="100%" />
            ) : mediaType === 'audio' ? (
              <audio src={image} controls width="100%" />
            ) : (
              <img src={image} alt="Uploaded content" />
            )}
            <button className="remove-image-btn" onClick={handleRemoveMedia}>×</button>
            {filePath && <div className="file-path-indicator">{filePath}</div>}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*,audio/*"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}

export default BaseCardSubMultimedia; 