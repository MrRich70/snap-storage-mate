
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Folder, initializeStorage } from '@/utils/storage';
import { useFileOperations } from './useFileOperations';
import { useFolderOperations } from './useFolderOperations';
import { useSelectionOperations } from './useSelectionOperations';
import { setupRealtimeSync } from '@/utils/realtimeSync';

// Configuration for shared storage
const SHARED_STORAGE = true;

export const useDashboard = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Core state
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [currentPath, setCurrentPath] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
  // Custom hooks
  const fileOperations = useFileOperations(currentFolderId, refreshTrigger, setRefreshTrigger);
  const folderOperations = useFolderOperations(currentFolderId, setCurrentFolderId, setCurrentPath, setRefreshTrigger);
  const selectionOperations = useSelectionOperations(fileOperations.files, currentFolderId, setRefreshTrigger);
  
  // Authentication check
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, authLoading]);
  
  // Initialize storage and load current folder
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        initializeStorage(SHARED_STORAGE);
        folderOperations.loadFolders();
        await fileOperations.loadFiles();
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [refreshTrigger, currentFolderId]);

  // Setup real-time sync
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleFoldersChanged = () => {
      console.log('Folders changed, refreshing folder list');
      folderOperations.loadFolders();
    };

    const handleFilesChanged = () => {
      console.log('Files changed, refreshing file list');
      fileOperations.loadFiles();
    };

    // Setup real-time listeners
    const cleanup = setupRealtimeSync(
      handleFoldersChanged,
      handleFilesChanged,
      currentFolderId
    );

    return cleanup;
  }, [isAuthenticated, currentFolderId]);
  
  // Reset selection when folder changes
  useEffect(() => {
    selectionOperations.resetSelection();
  }, [currentFolderId]);
  
  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Refreshed content');
  }, []);
  
  // Wrapper for back button to use currentPath
  const handleBackClick = useCallback(() => {
    folderOperations.handleBackClick(currentPath);
  }, [folderOperations, currentPath]);
  
  return {
    // Core state
    currentFolderId,
    currentPath,
    isLoading,
    
    // File operations
    files: fileOperations.files,
    fileInputRef: fileOperations.fileInputRef,
    selectedFile: fileOperations.selectedFile,
    uploadProgress: fileOperations.uploadProgress,
    uploadingFile: fileOperations.uploadingFile,
    
    // File modals
    renameFileModalOpen: fileOperations.renameFileModalOpen,
    setRenameFileModalOpen: fileOperations.setRenameFileModalOpen,
    deleteFileModalOpen: fileOperations.deleteFileModalOpen,
    setDeleteFileModalOpen: fileOperations.setDeleteFileModalOpen,
    viewFileModalOpen: fileOperations.viewFileModalOpen,
    setViewFileModalOpen: fileOperations.setViewFileModalOpen,
    
    // Folder operations
    folders: folderOperations.folders,
    selectedFolder: folderOperations.selectedFolder,
    
    // Folder modals
    newFolderModalOpen: folderOperations.newFolderModalOpen,
    setNewFolderModalOpen: folderOperations.setNewFolderModalOpen,
    renameFolderModalOpen: folderOperations.renameFolderModalOpen,
    setRenameFolderModalOpen: folderOperations.setRenameFolderModalOpen,
    deleteFolderModalOpen: folderOperations.deleteFolderModalOpen,
    setDeleteFolderModalOpen: folderOperations.setDeleteFolderModalOpen,
    
    // Selection operations
    selectionMode: selectionOperations.selectionMode,
    setSelectionMode: selectionOperations.setSelectionMode,
    selectedFiles: selectionOperations.selectedFiles,
    moveModalOpen: selectionOperations.moveModalOpen,
    setMoveModalOpen: selectionOperations.setMoveModalOpen,
    
    // Handlers - File Operations
    handleUploadClick: fileOperations.handleUploadClick,
    handleFileInputChange: fileOperations.handleFileInputChange,
    handleRenameFileClick: fileOperations.handleRenameFileClick,
    handleRenameFile: fileOperations.handleRenameFile,
    handleDeleteFileClick: fileOperations.handleDeleteFileClick,
    handleDeleteFile: fileOperations.handleDeleteFile,
    handleDownloadFile: fileOperations.handleDownloadFile,
    handleViewFile: fileOperations.handleViewFile,
    handleRetryUpload: fileOperations.handleRetryUpload,
    handleCancelUpload: fileOperations.handleCancelUpload,
    handleClearCompletedUploads: fileOperations.handleClearCompletedUploads,
    
    // Handlers - Folder Operations
    handleFolderClick: folderOperations.handleFolderClick,
    handleBreadcrumbClick: folderOperations.handleBreadcrumbClick,
    handleBackClick,
    handleCreateFolderClick: folderOperations.handleCreateFolderClick,
    handleCreateFolder: folderOperations.handleCreateFolder,
    handleRenameFolderClick: folderOperations.handleRenameFolderClick,
    handleRenameFolder: folderOperations.handleRenameFolder,
    handleDeleteFolderClick: folderOperations.handleDeleteFolderClick,
    handleDeleteFolder: folderOperations.handleDeleteFolder,
    
    // Handlers - Selection Operations
    handleSelectFile: selectionOperations.handleSelectFile,
    handleSelectAll: selectionOperations.handleSelectAll,
    handleDeselectAll: selectionOperations.handleDeselectAll,
    handleDeleteSelected: selectionOperations.handleDeleteSelected,
    handleDownloadSelected: selectionOperations.handleDownloadSelected,
    handleMoveSelected: selectionOperations.handleMoveSelected,
    
    // Refresh
    handleRefresh,
    setRefreshTrigger
  };
};
