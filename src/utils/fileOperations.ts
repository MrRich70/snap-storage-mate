import { ImageFile } from './storageTypes';
import { v4 as uuidv4 } from 'uuid';
import { uploadToSupabase } from '@/utils/fileUploader';
import { toast } from 'sonner';
import { broadcastFileChanged } from './realtimeSync';

// Get all files in a folder
export const getFiles = async (folderId: string, isSharedStorage = false): Promise<ImageFile[]> => {
  try {
    const storageKey = isSharedStorage ? 'servpro_files' : 'files';
    const filesObj = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return filesObj[folderId] || [];
  } catch (error) {
    console.error('Error getting files:', error);
    return [];
  }
};

// Create/upload a new file
export const uploadFile = async (file: File, folderId: string, isSharedStorage = false): Promise<ImageFile> => {
  try {
    const storageKey = isSharedStorage ? 'servpro_files' : 'files';
    const filesObj = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    // Upload the file to Supabase and get the public URL
    const fileId = uuidv4();
    const url = await uploadToSupabase(file, folderId, isSharedStorage);
    
    // Use the actual URL from Supabase, not a local blob URL
    const thumbnailUrl = url;
    
    const newFile: ImageFile = {
      id: fileId,
      name: file.name,
      type: file.type,
      size: file.size,
      url: url,
      thumbnailUrl: thumbnailUrl,
      folderId: folderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add the file to the folder
    if (!filesObj[folderId]) {
      filesObj[folderId] = [];
    }
    
    // Make sure we're adding to the array, not replacing it
    filesObj[folderId].push(newFile);
    localStorage.setItem(storageKey, JSON.stringify(filesObj));
    
    return newFile;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Rename a file
export const renameFile = async (fileId: string, newName: string, folderId: string, isSharedStorage = false): Promise<boolean> => {
  try {
    const storageKey = isSharedStorage ? 'servpro_files' : 'files';
    const filesObj = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    if (!filesObj[folderId]) return false;
    
    const fileIndex = filesObj[folderId].findIndex(file => file.id === fileId);
    if (fileIndex === -1) return false;
    
    filesObj[folderId][fileIndex] = {
      ...filesObj[folderId][fileIndex],
      name: newName,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(storageKey, JSON.stringify(filesObj));
    
    // Broadcast file change to all clients
    broadcastFileChanged(folderId);
    
    return true;
  } catch (error) {
    console.error('Error renaming file:', error);
    return false;
  }
};

// Delete a file
export const deleteFile = async (fileId: string, folderId: string, isSharedStorage = false): Promise<boolean> => {
  try {
    const storageKey = isSharedStorage ? 'servpro_files' : 'files';
    const filesObj = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    if (!filesObj[folderId]) return false;
    
    const fileIndex = filesObj[folderId].findIndex(file => file.id === fileId);
    if (fileIndex === -1) return false;
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(filesObj[folderId][fileIndex].url);
    if (filesObj[folderId][fileIndex].thumbnailUrl !== filesObj[folderId][fileIndex].url) {
      URL.revokeObjectURL(filesObj[folderId][fileIndex].thumbnailUrl);
    }
    
    filesObj[folderId].splice(fileIndex, 1);
    localStorage.setItem(storageKey, JSON.stringify(filesObj));
    
    // Broadcast file change to all clients
    broadcastFileChanged(folderId);
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Download a file
export const downloadFile = (file: ImageFile): void => {
  try {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};

// Move files to a different folder
export const moveFiles = async (fileIds: string[], sourceFolderId: string, targetFolderId: string, isSharedStorage = false): Promise<boolean> => {
  try {
    const storageKey = isSharedStorage ? 'servpro_files' : 'files';
    const filesObj = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    if (!filesObj[sourceFolderId]) return false;
    if (!filesObj[targetFolderId]) {
      filesObj[targetFolderId] = [];
    }
    
    // Find the files to move
    const filesToMove = filesObj[sourceFolderId].filter(file => fileIds.includes(file.id));
    if (filesToMove.length === 0) return false;
    
    // Remove files from source folder
    filesObj[sourceFolderId] = filesObj[sourceFolderId].filter(file => !fileIds.includes(file.id));
    
    // Add files to target folder
    filesObj[targetFolderId] = [...filesObj[targetFolderId], ...filesToMove];
    
    localStorage.setItem(storageKey, JSON.stringify(filesObj));
    
    // Broadcast file changes to all clients for both source and target folders
    broadcastFileChanged(sourceFolderId);
    if (sourceFolderId !== targetFolderId) {
      broadcastFileChanged(targetFolderId);
    }
    
    return true;
  } catch (error) {
    console.error('Error moving files:', error);
    return false;
  }
};

// Export the moveFiles function as moveFile as well for backward compatibility
export const moveFile = moveFiles;
