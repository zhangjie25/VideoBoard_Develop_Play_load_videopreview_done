import { useCallback } from 'react';

/**
 * Custom hook for generating unique IDs using timestamp plus random number
 * @param {string} prefix - Prefix for the generated ID 
 */
const useCreateId = (prefix = 'no prefix is provided') => {
  const generateId = useCallback(() => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    return `${prefix}_${timestamp}_${randomNum}`;
  }, [prefix]);

  return generateId;
};

export default useCreateId; 