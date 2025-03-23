
import { nanoid } from 'nanoid';
import { toast } from 'sonner';
import { Folder } from './storageTypes';
import { deleteFile, getFiles } from './fileOperations';

// Initialize local storage with default folders
export const initializeStorage = () => {
  // Check if storage is already initialized
  const folders = localStorage.getItem('folders');
  
  if (!folders) {
    const defaultFolders: Folder[] = [
      {
        id: 'root',
        name: 'My Files',
        createdAt: new Date().toISOString(),
        parentId: null
      }
    ];
    localStorage.setItem('folders', JSON.stringify(defaultFolders));
  }
};

// Get all folders
export const getFolders = (): Folder[] => {
  const folders = localStorage.getItem('folders');
  return folders ? JSON.parse(folders) : [];
};

// Get folder by ID
export const getFolder = (folderId: string): Folder | undefined => {
  const folders = getFolders();
  return folders.find(folder => folder.id === folderId);
};

// Create a new folder
export const createFolder = (name: string, parentId: string | null = 'root'): Folder => {
  const folders = getFolders();
  
  const newFolder: Folder = {
    id: nanoid(),
    name,
    createdAt: new Date().toISOString(),
    parentId
  };
  
  localStorage.setItem('folders', JSON.stringify([...folders, newFolder]));
  toast.success(`Folder "${name}" created`);
  return newFolder;
};

// Rename a folder
export const renameFolder = (folderId: string, newName: string): boolean => {
  const folders = getFolders();
  const folderIndex = folders.findIndex(folder => folder.id === folderId);
  
  if (folderIndex < 0) {
    toast.error('Folder not found');
    return false;
  }
  
  folders[folderIndex].name = newName;
  localStorage.setItem('folders', JSON.stringify(folders));
  toast.success(`Folder renamed to "${newName}"`);
  return true;
};

// Delete a folder and all its contents
export const deleteFolder = async (folderId: string): Promise<boolean> => {
  if (folderId === 'root') {
    toast.error('Cannot delete root folder');
    return false;
  }
  
  try {
    // Get files in the folder
    const files = await getFiles(folderId);
    
    // Delete all files in the folder
    for (const file of files) {
      await deleteFile(file.id, folderId);
    }
    
    // Delete folder from local storage
    const folders = getFolders().filter(folder => folder.id !== folderId);
    localStorage.setItem('folders', JSON.stringify(folders));
    
    toast.success('Folder deleted');
    return true;
  } catch (error) {
    console.error('Error deleting folder:', error);
    toast.error('Failed to delete folder');
    return false;
  }
};
