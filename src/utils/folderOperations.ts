
import { Folder } from './storageTypes';
import { v4 as uuidv4 } from 'uuid';
import { broadcastFolderChanged } from './realtimeSync';
import { getUserStorageKey } from './storage';

// Get all folders for the current user
export const getFolders = (): Folder[] => {
  const storageKey = `${getUserStorageKey()}_folders`;
  return JSON.parse(localStorage.getItem(storageKey) || '[]');
};

// Get a specific folder by ID for the current user
export const getFolder = (folderId: string): Folder | null => {
  const folders = getFolders();
  return folders.find(folder => folder.id === folderId) || null;
};

// Create a new folder for the current user
export const createFolder = (name: string, parentId: string): Folder => {
  const folders = getFolders();
  const storageKey = `${getUserStorageKey()}_folders`;
  
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

// Rename a folder for the current user
export const renameFolder = (folderId: string, newName: string): boolean => {
  const folders = getFolders();
  const storageKey = `${getUserStorageKey()}_folders`;
  
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

// Delete a folder and all its contents for the current user
export const deleteFolder = async (folderId: string): Promise<boolean> => {
  if (folderId === 'root') return false; // Cannot delete root folder
  
  try {
    const folders = getFolders();
    const storageKey = `${getUserStorageKey()}_folders`;
    const fileStorageKey = `${getUserStorageKey()}_files`;
    
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

// Move a folder to a new parent for the current user
export const moveFolder = (folderId: string, newParentId: string): boolean => {
  if (folderId === 'root') return false; // Cannot move root folder
  if (folderId === newParentId) return false; // Cannot move to itself
  
  const folders = getFolders();
  const storageKey = `${getUserStorageKey()}_folders`;
  
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
