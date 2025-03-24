
import { Folder } from './storageTypes';
import { v4 as uuidv4 } from 'uuid';
import { broadcastFolderChanged } from './realtimeSync';

// Get all folders - always use shared storage
export const getFolders = (isSharedStorage = true): Folder[] => {
  const storageKey = 'servpro_folders'; // Always use shared storage key
  return JSON.parse(localStorage.getItem(storageKey) || '[]');
};

// Get a specific folder by ID - always use shared storage
export const getFolder = (folderId: string, isSharedStorage = true): Folder | null => {
  const folders = getFolders(true); // Always use shared storage
  return folders.find(folder => folder.id === folderId) || null;
};

// Create a new folder - always use shared storage
export const createFolder = (name: string, parentId: string, isSharedStorage = true): Folder => {
  const folders = getFolders(true); // Always use shared storage
  const storageKey = 'servpro_folders'; // Always use shared storage key
  
  const newFolder: Folder = {
    id: uuidv4(),
    name,
    parentId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  folders.push(newFolder);
  localStorage.setItem(storageKey, JSON.stringify(folders));
  
  // Broadcast the change to all clients
  broadcastFolderChanged();
  
  return newFolder;
};

// Rename a folder
export const renameFolder = (folderId: string, newName: string, isSharedStorage = false): boolean => {
  const folders = getFolders(isSharedStorage);
  const storageKey = isSharedStorage ? 'servpro_folders' : 'folders';
  
  const folderIndex = folders.findIndex(folder => folder.id === folderId);
  if (folderIndex === -1) return false;
  
  folders[folderIndex] = {
    ...folders[folderIndex],
    name: newName,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(storageKey, JSON.stringify(folders));
  
  // Broadcast the change to all clients
  broadcastFolderChanged();
  
  return true;
};

// Delete a folder and all its contents
export const deleteFolder = async (folderId: string, isSharedStorage = false): Promise<boolean> => {
  if (folderId === 'root') return false; // Cannot delete root folder
  
  try {
    const folders = getFolders(isSharedStorage);
    const storageKey = isSharedStorage ? 'servpro_folders' : 'folders';
    const fileStorageKey = isSharedStorage ? 'servpro_files' : 'files';
    
    // Find all child folder IDs recursively
    const getAllChildFolderIds = (parentId: string): string[] => {
      const directChildren = folders.filter(folder => folder.parentId === parentId);
      const childIds = directChildren.map(folder => folder.id);
      
      return [
        ...childIds,
        ...directChildren.flatMap(folder => getAllChildFolderIds(folder.id))
      ];
    };
    
    const childFolderIds = getAllChildFolderIds(folderId);
    const allFolderIdsToDelete = [folderId, ...childFolderIds];
    
    // Delete all child folders
    const remainingFolders = folders.filter(folder => !allFolderIdsToDelete.includes(folder.id));
    localStorage.setItem(storageKey, JSON.stringify(remainingFolders));
    
    // Delete all files in the folders
    const files = JSON.parse(localStorage.getItem(fileStorageKey) || '{}');
    allFolderIdsToDelete.forEach(id => {
      delete files[id];
    });
    localStorage.setItem(fileStorageKey, JSON.stringify(files));
    
    // Broadcast the change to all clients
    broadcastFolderChanged();
    
    return true;
  } catch (error) {
    console.error('Error deleting folder:', error);
    return false;
  }
};

// Move a folder to a new parent
export const moveFolder = (folderId: string, newParentId: string, isSharedStorage = false): boolean => {
  if (folderId === 'root') return false; // Cannot move root folder
  if (folderId === newParentId) return false; // Cannot move to itself
  
  const folders = getFolders(isSharedStorage);
  const storageKey = isSharedStorage ? 'servpro_folders' : 'folders';
  
  const folderIndex = folders.findIndex(folder => folder.id === folderId);
  if (folderIndex === -1) return false;
  
  // Check if new parent exists
  const newParent = folders.find(folder => folder.id === newParentId);
  if (!newParent) return false;
  
  // Check for circular references
  const checkCircular = (parentId: string, targetId: string): boolean => {
    if (parentId === targetId) return true;
    
    const parent = folders.find(folder => folder.id === parentId);
    if (!parent || !parent.parentId) return false;
    
    return checkCircular(parent.parentId, targetId);
  };
  
  if (checkCircular(newParentId, folderId)) return false;
  
  folders[folderIndex] = {
    ...folders[folderIndex],
    parentId: newParentId,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(storageKey, JSON.stringify(folders));
  
  // Broadcast the change to all clients
  broadcastFolderChanged();
  
  return true;
};
