
import { useEffect } from 'react';
import { useUploadOperations } from './useUploadOperations';
import { useFileActions } from './useFileActions';
import { useFileLoading } from './useFileLoading';
import { getUploadProgress } from '@/utils/storage';

export const useFileOperations = (
  currentFolderId: string, 
  refreshTrigger: number, 
  setRefreshTrigger: (value: (prev: number) => number) => void
) => {
  // Use our new modular hooks
  const { 
    files, 
    loadFiles, 
    forceRefresh 
  } = useFileLoading(currentFolderId, refreshTrigger);
  
  const {
    fileInputRef,
    uploadProgress,
    uploadingFile,
    fileCache,
    handleUploadClick,
    handleFileInputChange,
    handleRetryUpload,
    handleCancelUpload,
    handleClearCompletedUploads,
    trackUploadProgress,
    setShouldAutoRefresh
  } = useUploadOperations(currentFolderId, setRefreshTrigger, loadFiles);
  
  const {
    selectedFile,
    renameFileModalOpen,
    setRenameFileModalOpen,
    deleteFileModalOpen,
    setDeleteFileModalOpen,
    viewFileModalOpen,
    setViewFileModalOpen,
    handleRenameFileClick,
    handleRenameFile,
    handleDeleteFileClick,
    handleDeleteFile,
    handleDownloadFile,
    handleViewFile
  } = useFileActions(currentFolderId, setRefreshTrigger);
  
  // Set up progress tracking interval
  useEffect(() => {
    const interval = setInterval(() => {
      trackUploadProgress();
    }, 500);
    
    return () => clearInterval(interval);
  }, [trackUploadProgress]);
  
  return {
    // File data
    files,
    fileInputRef,
    selectedFile,
    uploadProgress,
    uploadingFile,
    
    // Modal states
    renameFileModalOpen,
    setRenameFileModalOpen,
    deleteFileModalOpen,
    setDeleteFileModalOpen,
    viewFileModalOpen,
    setViewFileModalOpen,
    
    // File operations
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
    loadFiles,
    forceRefresh
  };
};
