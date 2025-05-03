/**
 * File System Access API Utilities
 * Provides functions for accessing local files using the File System Access API
 */

/**
 * Opens a file picker and returns the selected file
 * @param {Object} options - File picker options
 * @param {Array} options.accept - Array of accepted file types
 * @returns {Promise<{file: File, handle: FileSystemFileHandle, path: string}>}
 */
export const openFilePicker = async (options = {}) => {
  if (!window.showOpenFilePicker) {
    throw new Error('File System Access API is not supported in this browser');
  }

  try {
    const pickerOpts = {
      types: [
        {
          description: 'Media Files',
          accept: {
            'video/*': ['.mp4', '.webm', '.ogg', '.mov'],
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
            'audio/*': ['.mp3', '.wav', '.ogg', '.aac'],
          },
        },
      ],
      excludeAcceptAllOption: false,
      multiple: false,
      ...options,
    };

    const [fileHandle] = await window.showOpenFilePicker(pickerOpts);
    const file = await fileHandle.getFile();
    
    // Get the file path - this is a workaround as the File System Access API doesn't provide the path directly
    // We store the file handle for later use
    const path = fileHandle.name;

    return { 
      file, 
      handle: fileHandle,
      path: path
    };
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Error opening file:', err);
    }
    throw err;
  }
};

/**
 * Creates an object URL from a file
 * @param {File} file - The file to create an object URL for
 * @returns {string} The object URL
 */
export const createFileObjectURL = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Revokes an object URL to free up memory
 * @param {string} url - The object URL to revoke
 */
export const revokeFileObjectURL = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

/**
 * Verifies if a file handle is still valid
 * @param {FileSystemFileHandle} handle - The file handle to verify
 * @returns {Promise<boolean>} Whether the handle is still valid
 */
export const verifyFileHandle = async (handle) => {
  if (!handle) return false;
  
  try {
    // Try to get permission - this will fail if the handle is invalid
    await handle.requestPermission({ mode: 'read' });
    // Try to access the file to verify it still exists
    await handle.getFile();
    return true;
  } catch (err) {
    console.warn('File handle verification failed:', err);
    return false;
  }
}; 