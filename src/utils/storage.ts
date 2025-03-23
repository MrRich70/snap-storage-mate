
import { nanoid } from 'nanoid';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
  parentId: string | null;
}

export interface ImageFile {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  size: number;
  type: string;
  folderId: string;
  createdAt: string;
  updatedAt: string;
}

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

// Get all files in a specific folder
export const getFiles = async (folderId: string): Promise<ImageFile[]> => {
  try {
    const { data, error } = await supabase
      .storage
      .from('images')
      .list(`${folderId}/`, {
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to fetch files');
      return [];
    }
    
    const imageFiles: ImageFile[] = [];
    
    for (const item of data || []) {
      if (!item.name.startsWith('.')) { // Skip hidden files
        const fileId = item.id || nanoid();
        const filePath = `${folderId}/${item.name}`;
        
        const { data: publicUrl } = supabase
          .storage
          .from('images')
          .getPublicUrl(filePath);
          
        const { data: thumbnailUrl } = supabase
          .storage
          .from('images')
          .getPublicUrl(filePath);
          
        imageFiles.push({
          id: fileId,
          name: item.name,
          url: publicUrl.publicUrl,
          thumbnailUrl: thumbnailUrl.publicUrl,
          size: item.metadata?.size || 0,
          type: item.metadata?.mimetype || '',
          folderId: folderId,
          createdAt: item.created_at || new Date().toISOString(),
          updatedAt: item.updated_at || new Date().toISOString()
        });
      }
    }
    
    return imageFiles;
  } catch (error) {
    console.error('Error fetching files:', error);
    toast.error('Failed to fetch files');
    return [];
  }
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

// Upload a file to Supabase Storage
export const uploadFile = async (file: File, folderId: string): Promise<ImageFile> => {
  const fileExt = file.name.split('.').pop();
  const fileId = nanoid();
  const fileName = file.name;
  const filePath = `${folderId}/${fileName}`;

  try {
    const { error: uploadError } = await supabase
      .storage
      .from('images')
      .upload(filePath, file);
      
    if (uploadError) {
      throw uploadError;
    }
    
    const { data: publicUrl } = supabase
      .storage
      .from('images')
      .getPublicUrl(filePath);
      
    const newFile: ImageFile = {
      id: fileId,
      name: fileName,
      url: publicUrl.publicUrl,
      thumbnailUrl: publicUrl.publicUrl,
      size: file.size,
      type: file.type,
      folderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    toast.success(`File "${file.name}" uploaded`);
    return newFile;
  } catch (error) {
    console.error('Upload error:', error);
    toast.error('Failed to upload file');
    throw error;
  }
};

// Rename a file
export const renameFile = async (fileId: string, newName: string, folderId: string): Promise<boolean> => {
  try {
    // Get the files in the folder to find the file
    const files = await getFiles(folderId);
    const file = files.find(f => f.id === fileId);
    
    if (!file) {
      toast.error('File not found');
      return false;
    }
    
    // Copy the file with the new name
    const { error: copyError } = await supabase
      .storage
      .from('images')
      .copy(`${folderId}/${file.name}`, `${folderId}/${newName}`);
      
    if (copyError) {
      throw copyError;
    }
    
    // Delete the original file
    const { error: deleteError } = await supabase
      .storage
      .from('images')
      .remove([`${folderId}/${file.name}`]);
      
    if (deleteError) {
      throw deleteError;
    }
    
    toast.success(`File renamed to "${newName}"`);
    return true;
  } catch (error) {
    console.error('Rename error:', error);
    toast.error('Failed to rename file');
    return false;
  }
};

// Delete a file
export const deleteFile = async (fileId: string, folderId: string): Promise<boolean> => {
  try {
    // Get the files in the folder to find the file
    const files = await getFiles(folderId);
    const file = files.find(f => f.id === fileId);
    
    if (!file) {
      toast.error('File not found');
      return false;
    }
    
    const { error } = await supabase
      .storage
      .from('images')
      .remove([`${folderId}/${file.name}`]);
      
    if (error) {
      throw error;
    }
    
    toast.success('File deleted');
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    toast.error('Failed to delete file');
    return false;
  }
};

// Download a file
export const downloadFile = (file: ImageFile): void => {
  const link = document.createElement('a');
  link.href = file.url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success(`Downloading "${file.name}"`);
};
