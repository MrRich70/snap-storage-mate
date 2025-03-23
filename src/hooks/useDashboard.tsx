
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { 
  Folder, 
  ImageFile, 
  initializeStorage, 
  getFolders,
  getFiles,
  createFolder,
  renameFolder,
  deleteFolder,
  uploadLocalFile,
  renameFile,
  deleteFile,
  downloadFile,
  getUploadProgress,
  retryUpload,
  cancelUpload,
  clearCompletedUploads
} from '@/utils/storage';

// Configuration for shared storage
const SHARED_STORAGE = true;

export const useDashboard = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [currentPath, setCurrentPath] = useState<Folder[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<ImageFile | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [uploadProgress, setUploadProgress] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  
  // Modals state
  const [newFolderModalOpen, setNewFolderModalOpen] = useState<boolean>(false);
  const [renameFolderModalOpen, setRenameFolderModalOpen] = useState<boolean>(false);
  const [renameFileModalOpen, setRenameFileModalOpen] = useState<boolean>(false);
  const [deleteFolderModalOpen, setDeleteFolderModalOpen] = useState<boolean>(false);
  const [deleteFileModalOpen, setDeleteFileModalOpen] = useState<boolean>(false);
  const [viewFileModalOpen, setViewFileModalOpen] = useState<boolean>(false);
  const [moveModalOpen, setMoveModalOpen] = useState<boolean>(false);
  
  // File cache for retrying uploads
  const [fileCache, setFileCache] = useState<Map<string, File>>(new Map());
  
  // Selection state
  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  
  // Authentication check
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, authLoading]);
  
  // Initialize storage and load current folder
  useEffect(() => {
    initializeStorage(SHARED_STORAGE);
    loadCurrentFolder('root');
  }, [refreshTrigger]);
  
  // Reset selection when folder changes
  useEffect(() => {
    resetSelection();
  }, [currentFolderId]);
  
  // Monitor upload progress
  useEffect(() => {
    const interval = setInterval(() => {
      const currentUploads = getUploadProgress();
      setUploadProgress(currentUploads);
      
      const completedUploads = currentUploads.filter(u => u.status === 'completed');
      if (completedUploads.length > 0 && currentUploads.every(u => u.status !== 'uploading')) {
        setRefreshTrigger(prev => prev + 1);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  const loadCurrentFolder = useCallback(async (folderId: string) => {
    setIsLoading(true);
    
    try {
      const allFolders = getFolders(SHARED_STORAGE);
      const folderChildren = allFolders.filter(folder => folder.parentId === folderId);
      setFolders(folderChildren);
      
      const folderFiles = await getFiles(folderId, SHARED_STORAGE);
      setFiles(folderFiles);
      
      setCurrentFolderId(folderId);
      
      if (folderId === 'root') {
        const rootFolder = allFolders.find(f => f.id === 'root');
        setCurrentPath(rootFolder ? [rootFolder] : []);
      } else {
        const pathItems: Folder[] = [];
        let currentId: string | null = folderId;
        
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
      console.error('Error loading folder:', error);
      toast.error('Failed to load folder contents');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Refreshed content');
  }, []);
  
  const handleFolderClick = useCallback((folder: Folder) => {
    loadCurrentFolder(folder.id);
  }, [loadCurrentFolder]);
  
  const handleBreadcrumbClick = useCallback((folder: Folder) => {
    loadCurrentFolder(folder.id);
  }, [loadCurrentFolder]);

  const handleBackClick = useCallback(() => {
    if (currentPath.length > 1) {
      const parentFolder = currentPath[currentPath.length - 2];
      loadCurrentFolder(parentFolder.id);
    }
  }, [currentPath, loadCurrentFolder]);
  
  const handleCreateFolderClick = useCallback(() => {
    setNewFolderModalOpen(true);
  }, []);
  
  const handleCreateFolder = useCallback((name: string) => {
    createFolder(name, currentFolderId, SHARED_STORAGE);
    loadCurrentFolder(currentFolderId);
  }, [currentFolderId, loadCurrentFolder]);
  
  const handleRenameFolderClick = useCallback((folder: Folder) => {
    setSelectedFolder(folder);
    setRenameFolderModalOpen(true);
  }, []);
  
  const handleRenameFolder = useCallback((newName: string) => {
    if (selectedFolder) {
      renameFolder(selectedFolder.id, newName, SHARED_STORAGE);
      loadCurrentFolder(currentFolderId);
    }
  }, [selectedFolder, currentFolderId, loadCurrentFolder]);
  
  const handleDeleteFolderClick = useCallback((folder: Folder) => {
    setSelectedFolder(folder);
    setDeleteFolderModalOpen(true);
  }, []);
  
  const handleDeleteFolder = useCallback(async () => {
    if (selectedFolder) {
      await deleteFolder(selectedFolder.id, SHARED_STORAGE);
      loadCurrentFolder(currentFolderId);
    }
  }, [selectedFolder, currentFolderId, loadCurrentFolder]);
  
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  const handleFileInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!files || files.length === 0) return;
    
    setUploadingFile(true);
    
    const newFileCache = new Map(fileCache);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const cacheKey = `${currentFolderId}_${file.name}_${Date.now()}`;
        newFileCache.set(cacheKey, file);
        
        uploadLocalFile(file, currentFolderId, SHARED_STORAGE)
          .then(() => {
            if (i === files.length - 1) {
              setRefreshTrigger(prev => prev + 1);
            }
          })
          .catch((error) => {
            console.error('Upload error:', error);
            toast.error(`Failed to upload ${file.name}`);
          });
      }
      
      setFileCache(newFileCache);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file(s)');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  }, [currentFolderId, fileCache]);
  
  const handleRenameFileClick = useCallback((file: ImageFile) => {
    setSelectedFile(file);
    setRenameFileModalOpen(true);
  }, []);
  
  const handleRenameFile = useCallback(async (newName: string) => {
    if (selectedFile) {
      await renameFile(selectedFile.id, newName, currentFolderId, SHARED_STORAGE);
      loadCurrentFolder(currentFolderId);
    }
  }, [selectedFile, currentFolderId, loadCurrentFolder]);
  
  const handleDeleteFileClick = useCallback((file: ImageFile) => {
    setSelectedFile(file);
    setDeleteFileModalOpen(true);
  }, []);
  
  const handleDeleteFile = useCallback(async () => {
    if (selectedFile) {
      await deleteFile(selectedFile.id, currentFolderId, SHARED_STORAGE);
      loadCurrentFolder(currentFolderId);
    }
  }, [selectedFile, currentFolderId, loadCurrentFolder]);
  
  const handleDownloadFile = useCallback((file: ImageFile) => {
    downloadFile(file);
  }, []);
  
  const handleViewFile = useCallback((file: ImageFile) => {
    setSelectedFile(file);
    setViewFileModalOpen(true);
  }, []);
  
  const handleRetryUpload = useCallback(async (uploadId: string) => {
    for (const [cacheKey, cachedFile] of fileCache.entries()) {
      if (cacheKey.includes(uploadId)) {
        try {
          await retryUpload(uploadId, cachedFile, currentFolderId, SHARED_STORAGE);
          setRefreshTrigger(prev => prev + 1);
        } catch (error) {
          console.error('Retry failed:', error);
        }
        return;
      }
    }
    
    toast.error('Original file not found for retry. Please upload again.');
  }, [fileCache, currentFolderId]);
  
  const handleCancelUpload = useCallback((uploadId: string) => {
    cancelUpload(uploadId);
    setUploadProgress(getUploadProgress());
  }, []);
  
  const handleClearCompletedUploads = useCallback(() => {
    clearCompletedUploads();
    setUploadProgress(getUploadProgress());
  }, []);
  
  // Selection functions
  const resetSelection = useCallback(() => {
    setSelectedFiles([]);
    setSelectionMode(false);
  }, []);

  const handleSelectFile = useCallback((fileId: string, isSelected: boolean) => {
    setSelectedFiles(prev => {
      if (isSelected) {
        return [...prev, fileId];
      } else {
        return prev.filter(id => id !== fileId);
      }
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allFileIds = files.map(file => file.id);
    setSelectedFiles(allFileIds);
  }, [files]);

  const handleDeselectAll = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedFiles.length} files?`);
    if (!confirmed) return;
    
    try {
      // Collect all delete promises
      const deletePromises = selectedFiles.map(fileId => 
        deleteFile(fileId, currentFolderId, SHARED_STORAGE)
      );
      
      // Wait for all files to be deleted
      await Promise.all(deletePromises);
      
      toast.success(`${selectedFiles.length} files deleted successfully`);
      setSelectedFiles([]);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting selected files:', error);
      toast.error('Failed to delete some files');
    }
  }, [selectedFiles, currentFolderId]);

  const handleDownloadSelected = useCallback(() => {
    if (selectedFiles.length === 0) return;
    
    try {
      // Find the selected file objects
      const filesToDownload = files.filter(file => 
        selectedFiles.includes(file.id)
      );
      
      // Download each file
      filesToDownload.forEach(file => {
        downloadFile(file);
      });
      
      toast.success(`Downloading ${selectedFiles.length} files`);
    } catch (error) {
      console.error('Error downloading selected files:', error);
      toast.error('Failed to download some files');
    }
  }, [selectedFiles, files]);

  const handleMoveSelected = useCallback(() => {
    if (selectedFiles.length === 0) return;
    setMoveModalOpen(true);
  }, [selectedFiles]);

  return {
    // Refs
    fileInputRef,
    
    // State
    currentFolderId,
    currentPath,
    folders,
    files,
    isLoading,
    selectedFile,
    selectedFolder,
    uploadProgress,
    uploadingFile,
    
    // Modal state
    newFolderModalOpen,
    setNewFolderModalOpen,
    renameFolderModalOpen,
    setRenameFolderModalOpen,
    renameFileModalOpen,
    setRenameFileModalOpen,
    deleteFolderModalOpen,
    setDeleteFolderModalOpen,
    deleteFileModalOpen,
    setDeleteFileModalOpen,
    viewFileModalOpen,
    setViewFileModalOpen,
    moveModalOpen,
    setMoveModalOpen,
    
    // Selection state
    selectionMode,
    setSelectionMode,
    selectedFiles,
    
    // Handlers
    handleRefresh,
    handleFolderClick,
    handleBreadcrumbClick,
    handleBackClick,
    handleCreateFolderClick,
    handleCreateFolder,
    handleRenameFolderClick,
    handleRenameFolder,
    handleDeleteFolderClick,
    handleDeleteFolder,
    handleUploadClick,
    handleFileInputChange,
    handleRenameFileClick,
    handleRenameFile,
    handleDeleteFileClick,
    handleDeleteFile,
    handleDownloadFile,
    handleViewFile,
    handleRetryUpload,
    handleCancelUpload,
    handleClearCompletedUploads,
    
    // Selection handlers
    resetSelection,
    handleSelectFile,
    handleSelectAll,
    handleDeselectAll,
    handleDeleteSelected,
    handleDownloadSelected,
    handleMoveSelected,
    
    // Updates
    setRefreshTrigger
  };
};
