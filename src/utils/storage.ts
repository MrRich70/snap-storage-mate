// Re-export all storage operations from the respective modules
export * from './storageTypes';
export * from './folderOperations';
export { 
  getFiles, 
  renameFile, 
  deleteFile, 
  downloadFile, 
  moveFiles, 
  moveFile,
  uploadFile 
} from './fileOperations';
export {
  getUploadProgress,
  clearCompletedUploads,
  cancelUpload,
  retryUpload,
  uploadToSupabase
} from './uploadUtils';

// Add initialization function for storage
export const initializeStorage = (userId?: string) => {
  // If userId is provided, use it to create a user-specific storage key
  // Otherwise, fall back to shared storage for non-authenticated users
  const userStorageKey = userId ? `servpro_${userId}` : 'servpro';
  
  // Store the current user ID in localStorage to be used by other functions
  if (userId) {
    localStorage.setItem('servpro_current_user', userId);
  }
  
  // Make sure the root folder exists for this user
  const foldersKey = `${userStorageKey}_folders`;
  const folders = JSON.parse(localStorage.getItem(foldersKey) || '[]');
  
  if (!folders.some((folder: any) => folder.id === 'root')) {
    folders.push({
      id: 'root',
      name: 'Root',
      parentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    localStorage.setItem(foldersKey, JSON.stringify(folders));
  }
};

// Helper to get the current user's storage key prefix
export const getUserStorageKey = () => {
  const userId = localStorage.getItem('servpro_current_user');
  return userId ? `servpro_${userId}` : 'servpro';
};
