/**
 * IndexedDB Storage Utilities
 * Provides functions for storing and retrieving media file handles and node data
 */
import { openDB } from 'idb';

const DB_NAME = 'VideoboardDB';
const DB_VERSION = 1;
const MEDIA_STORE = 'mediaHandles';
const BOARD_STORE = 'boardData';

/**
 * Initialize the database
 * @returns {Promise<IDBDatabase>} The database instance
 */
const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create store for file handles if it doesn't exist
      if (!db.objectStoreNames.contains(MEDIA_STORE)) {
        db.createObjectStore(MEDIA_STORE, { keyPath: 'id' });
      }
      
      // Create store for board data if it doesn't exist
      if (!db.objectStoreNames.contains(BOARD_STORE)) {
        db.createObjectStore(BOARD_STORE, { keyPath: 'id' });
      }
    }
  });
};

/**
 * Store a file handle in IndexedDB
 * @param {Object} mediaData - The media data to store
 * @param {string} mediaData.id - Unique ID for the media (tabId)
 * @param {FileSystemFileHandle} mediaData.handle - The file handle to store
 * @param {string} mediaData.path - The file path
 * @param {string} mediaData.nodeId - ID of the node containing this media
 * @returns {Promise<void>}
 */
export const storeMediaHandle = async (mediaData) => {
  try {
    const db = await initDB();
    await db.put(MEDIA_STORE, mediaData);
  } catch (error) {
    console.error('Error storing media handle:', error);
    throw error;
  }
};

/**
 * Retrieve a file handle from IndexedDB
 * @param {string} id - The ID of the media to retrieve
 * @returns {Promise<Object>} The media data object
 */
export const getMediaHandle = async (id) => {
  try {
    const db = await initDB();
    return await db.get(MEDIA_STORE, id);
  } catch (error) {
    console.error('Error getting media handle:', error);
    throw error;
  }
};

/**
 * Store the entire board state
 * @param {Object} boardData - The board data to store
 * @param {Array} boardData.nodes - The nodes in the board
 * @param {Array} boardData.edges - The edges in the board
 * @returns {Promise<void>}
 */
export const storeBoardState = async (boardData) => {
  try {
    const db = await initDB();
    
    // Use 'currentBoard' as the fixed ID
    const storeData = {
      id: 'currentBoard',
      ...boardData,
      timestamp: new Date().toISOString()
    };
    
    await db.put(BOARD_STORE, storeData);
  } catch (error) {
    console.error('Error storing board state:', error);
    throw error;
  }
};

/**
 * Load the board state
 * @returns {Promise<Object>} The board data
 */
export const loadBoardState = async () => {
  try {
    const db = await initDB();
    return await db.get(BOARD_STORE, 'currentBoard');
  } catch (error) {
    console.error('Error loading board state:', error);
    throw error;
  }
};

/**
 * Delete a media handle from IndexedDB
 * @param {string} id - The ID of the media to delete
 * @returns {Promise<void>}
 */
export const deleteMediaHandle = async (id) => {
  try {
    const db = await initDB();
    await db.delete(MEDIA_STORE, id);
  } catch (error) {
    console.error('Error deleting media handle:', error);
    throw error;
  }
};

/**
 * Get all media handles from IndexedDB
 * @returns {Promise<Array>} Array of media data objects
 */
export const getAllMediaHandles = async () => {
  try {
    const db = await initDB();
    return await db.getAll(MEDIA_STORE);
  } catch (error) {
    console.error('Error getting all media handles:', error);
    throw error;
  }
}; 