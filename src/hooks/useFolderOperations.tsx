
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  Folder, 
  getFolders,
  createFolder,
  renameFolder,
  deleteFolder
} from '@/utils/storage';

export const useFolderOperations = (
  currentFolderId: string,
  setCurrentFolderId: (folderId: string) => void,
  setCurrentPath: (path: Folder[]) => void,
  setRefreshTrigger: (value: (prev: number) => number) => void
) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  
  // Modals for folder operations
  const [newFolderModalOpen, setNewFolderModalOpen] = useState<boolean>(false);
  const [renameFolderModalOpen, setRenameFolderModalOpen] = useState<boolean>(false);
  const [deleteFolderModalOpen, setDeleteFolderModalOpen] = useState<boolean>(false);
  
  // Shared storage flag
  const SHARED_STORAGE = true;
  
  // Load folders for the current folder
  const loadFolders = useCallback(() => {
    try {
      const allFolders = getFolders(SHARED_STORAGE);
      const folderChildren = allFolders.filter(folder => folder.parentId === currentFolderId);
      setFolders(folderChildren);
      
      // Update path breadcrumbs
      if (currentFolderId === 'root') {
        const rootFolder = allFolders.find(f => f.id === 'root');
        setCurrentPath(rootFolder ? [rootFolder] : []);
      } else {
        const pathItems: Folder[] = [];
        let currentId: string | null = currentFolderId;
        
        while (currentId) {
          const folder = allFolders.find(f => f.id === currentId);
          if (folder) {
            pathItems.unshift(folder);
            currentId = folder.parentId;
          } else {
            currentId = null;
          }
        }
        
        setCurrentPath(pathItems);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      toast.error('Failed to load folders');
    }
  }, [currentFolderId, setCurrentPath]);
  
  // Folder navigation handlers
  const handleFolderClick = useCallback((folder: Folder) => {
    setCurrentFolderId(folder.id);
  }, [setCurrentFolderId]);
  
  const handleBreadcrumbClick = useCallback((folder: Folder) => {
    setCurrentFolderId(folder.id);
  }, [setCurrentFolderId]);

  const handleBackClick = useCallback((currentPath: Folder[]) => {
    if (currentPath.length > 1) {
      const parentFolder = currentPath[currentPath.length - 2];
      setCurrentFolderId(parentFolder.id);
    }
  }, [setCurrentFolderId]);
  
  // Folder operation handlers
  const handleCreateFolderClick = useCallback(() => {
    setNewFolderModalOpen(true);
  }, []);
  
  const handleCreateFolder = useCallback((name: string) => {
    createFolder(name, currentFolderId, SHARED_STORAGE);
    setRefreshTrigger(prev => prev + 1);
  }, [currentFolderId, setRefreshTrigger]);
  
  const handleRenameFolderClick = useCallback((folder: Folder) => {
    setSelectedFolder(folder);
    setRenameFolderModalOpen(true);
  }, []);
  
  const handleRenameFolder = useCallback((newName: string) => {
    if (selectedFolder) {
      renameFolder(selectedFolder.id, newName, SHARED_STORAGE);
      setRefreshTrigger(prev => prev + 1);
    }
  }, [selectedFolder, setRefreshTrigger]);
  
  const handleDeleteFolderClick = useCallback((folder: Folder) => {
    setSelectedFolder(folder);
    setDeleteFolderModalOpen(true);
  }, []);
  
  const handleDeleteFolder = useCallback(async () => {
    if (selectedFolder) {
      await deleteFolder(selectedFolder.id, SHARED_STORAGE);
      setRefreshTrigger(prev => prev + 1);
    }
  }, [selectedFolder, setRefreshTrigger]);
  
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
