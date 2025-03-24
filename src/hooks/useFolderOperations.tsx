
// Update any function calls to use the correct parameter count.
// This is a partial update focusing on the function calls with errors.

import { useState, useCallback, useEffect } from 'react';
import { 
  Folder, 
  getFolders, 
  createFolder, 
  renameFolder, 
  deleteFolder 
} from '@/utils/storage';
import { toast } from 'sonner';

export const useFolderOperations = (
  currentFolderId: string,
  setCurrentFolderId: (id: string) => void,
  setCurrentPath: (path: Folder[]) => void,
  setRefreshTrigger: (value: (prev: number) => number) => void
) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [newFolderModalOpen, setNewFolderModalOpen] = useState<boolean>(false);
  const [renameFolderModalOpen, setRenameFolderModalOpen] = useState<boolean>(false);
  const [deleteFolderModalOpen, setDeleteFolderModalOpen] = useState<boolean>(false);
  
  // Load folders
  const loadFolders = useCallback(() => {
    try {
      const loadedFolders = getFolders();
      setFolders(loadedFolders.filter(folder => folder.parentId === currentFolderId));
    } catch (error) {
      console.error('Error loading folders:', error);
      toast.error('Failed to load folders');
    }
  }, [currentFolderId]);
  
  // Update current path
  useEffect(() => {
    const buildPath = (): Folder[] => {
      const path: Folder[] = [];
      let currentFolder = folders.find(f => f.id === currentFolderId);
      
      // If current folder is not found in children (could be root or path not fully loaded yet)
      if (!currentFolder) {
        const allFolders = getFolders();
        currentFolder = allFolders.find(f => f.id === currentFolderId);
        if (!currentFolder) return path;
      }
      
      path.unshift(currentFolder);
      
      // Traverse up the folder hierarchy
      const allFolders = getFolders();
      let parentId = currentFolder.parentId;
      
      while (parentId) {
        const parent = allFolders.find(f => f.id === parentId);
        if (!parent) break;
        
        path.unshift(parent);
        parentId = parent.parentId;
      }
      
      return path;
    };
    
    setCurrentPath(buildPath());
  }, [currentFolderId, folders, setCurrentPath]);
  
  // Folder operations
  const handleFolderClick = useCallback((folder: Folder) => {
    setCurrentFolderId(folder.id);
  }, [setCurrentFolderId]);
  
  const handleBreadcrumbClick = useCallback((folder: Folder) => {
    setCurrentFolderId(folder.id);
  }, [setCurrentFolderId]);
  
  const handleBackClick = useCallback((path: Folder[]) => {
    if (path.length > 1) {
      // Go to parent folder
      const parentFolder = path[path.length - 2];
      setCurrentFolderId(parentFolder.id);
    } else if (path.length === 1 && path[0].parentId) {
      // If we have a single item with a parent, go to that parent
      setCurrentFolderId(path[0].parentId);
    } else {
      // We're at root, should not happen but handle gracefully
      const allFolders = getFolders();
      const rootFolder = allFolders.find(f => f.id === 'root');
      if (rootFolder) {
        setCurrentFolderId(rootFolder.id);
      }
    }
  }, [setCurrentFolderId]);
  
  const handleCreateFolderClick = useCallback(() => {
    setNewFolderModalOpen(true);
  }, []);
  
  const handleCreateFolder = useCallback(async (name: string) => {
    try {
      await createFolder(name, currentFolderId);
      loadFolders();
      setRefreshTrigger(prev => prev + 1);
      return true;
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
      return false;
    }
  }, [currentFolderId, loadFolders, setRefreshTrigger]);
  
  const handleRenameFolderClick = useCallback((folder: Folder) => {
    setSelectedFolder(folder);
    setRenameFolderModalOpen(true);
  }, []);
  
  const handleRenameFolder = useCallback(async (newName: string) => {
    if (selectedFolder) {
      try {
        await renameFolder(selectedFolder.id, newName);
        loadFolders();
        setRefreshTrigger(prev => prev + 1);
        return true;
      } catch (error) {
        console.error('Error renaming folder:', error);
        toast.error('Failed to rename folder');
        return false;
      }
    }
    return false;
  }, [selectedFolder, loadFolders, setRefreshTrigger]);
  
  const handleDeleteFolderClick = useCallback((folder: Folder) => {
    setSelectedFolder(folder);
    setDeleteFolderModalOpen(true);
  }, []);
  
  const handleDeleteFolder = useCallback(async () => {
    if (selectedFolder) {
      try {
        await deleteFolder(selectedFolder.id);
        loadFolders();
        setRefreshTrigger(prev => prev + 1);
        return true;
      } catch (error) {
        console.error('Error deleting folder:', error);
        toast.error('Failed to delete folder');
        return false;
      }
    }
    return false;
  }, [selectedFolder, loadFolders, setRefreshTrigger]);
  
  return {
    folders,
    selectedFolder,
    newFolderModalOpen,
    setNewFolderModalOpen,
    renameFolderModalOpen,
    setRenameFolderModalOpen,
    deleteFolderModalOpen,
    setDeleteFolderModalOpen,
    loadFolders,
    handleFolderClick,
    handleBreadcrumbClick,
    handleBackClick,
    handleCreateFolderClick,
    handleCreateFolder,
    handleRenameFolderClick,
    handleRenameFolder,
    handleDeleteFolderClick,
    handleDeleteFolder
  };
};
