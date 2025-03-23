
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
  uploadFile as uploadLocalFile 
} from './fileOperations';
export {
  getUploadProgress,
  clearCompletedUploads,
  cancelUpload,
  retryUpload,
  uploadToSupabase
} from './uploadUtils';

// Add initialization function for shared storage
export const initializeStorage = (isSharedStorage = false) => {
  // Set a localStorage flag for shared storage
  localStorage.setItem('isSharedStorage', isSharedStorage ? 'true' : 'false');
  
  // Make sure the root folder exists
  const storageKey = isSharedStorage ? 'servpro_folders' : 'folders';
  const folders = JSON.parse(localStorage.getItem(storageKey) || '[]');
  
  if (!folders.some((folder: any) => folder.id === 'root')) {
    folders.push({
      id: 'root',
      name: 'Root',
      parentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    localStorage.setItem(storageKey, JSON.stringify(folders));
  }
};
