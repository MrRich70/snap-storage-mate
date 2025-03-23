
import { nanoid } from 'nanoid';
import { toast } from 'sonner';

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
  const files = localStorage.getItem('files');
  
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
  
  if (!files) {
    localStorage.setItem('files', JSON.stringify([]));
  }
};

// Get all folders
export const getFolders = (): Folder[] => {
  const folders = localStorage.getItem('folders');
  return folders ? JSON.parse(folders) : [];
};

// Get all files in a specific folder
export const getFiles = (folderId: string): ImageFile[] => {
  const files = localStorage.getItem('files');
  const allFiles = files ? JSON.parse(files) as ImageFile[] : [];
  return allFiles.filter(file => file.folderId === folderId);
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
export const deleteFolder = (folderId: string): boolean => {
  if (folderId === 'root') {
    toast.error('Cannot delete root folder');
    return false;
  }
  
  const folders = getFolders().filter(folder => folder.id !== folderId);
  const files = localStorage.getItem('files');
  const allFiles = files ? JSON.parse(files) as ImageFile[] : [];
  const remainingFiles = allFiles.filter(file => file.folderId !== folderId);
  
  localStorage.setItem('folders', JSON.stringify(folders));
  localStorage.setItem('files', JSON.stringify(remainingFiles));
  
  toast.success('Folder deleted');
  return true;
};

// Upload a file (simulated for demo)
export const uploadFile = async (file: File, folderId: string): Promise<ImageFile> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const files = localStorage.getItem('files');
      const allFiles = files ? JSON.parse(files) as ImageFile[] : [];
      
      // Create a thumbnail by using the same data URL for demo
      const fileUrl = e.target?.result as string;
      
      const newFile: ImageFile = {
        id: nanoid(),
        name: file.name,
        url: fileUrl,
        thumbnailUrl: fileUrl,
        size: file.size,
        type: file.type,
        folderId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('files', JSON.stringify([...allFiles, newFile]));
      toast.success(`File "${file.name}" uploaded`);
      resolve(newFile);
    };
    
    reader.readAsDataURL(file);
  });
};

// Rename a file
export const renameFile = (fileId: string, newName: string): boolean => {
  const files = localStorage.getItem('files');
  const allFiles = files ? JSON.parse(files) as ImageFile[] : [];
  const fileIndex = allFiles.findIndex(file => file.id === fileId);
  
  if (fileIndex < 0) {
    toast.error('File not found');
    return false;
  }
  
  allFiles[fileIndex].name = newName;
  allFiles[fileIndex].updatedAt = new Date().toISOString();
  localStorage.setItem('files', JSON.stringify(allFiles));
  toast.success(`File renamed to "${newName}"`);
  return true;
};

// Delete a file
export const deleteFile = (fileId: string): boolean => {
  const files = localStorage.getItem('files');
  const allFiles = files ? JSON.parse(files) as ImageFile[] : [];
  const remainingFiles = allFiles.filter(file => file.id !== fileId);
  
  localStorage.setItem('files', JSON.stringify(remainingFiles));
  toast.success('File deleted');
  return true;
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
