
import { useState, useCallback } from 'react';
import { ImageFile, deleteFile, downloadFile, moveFiles } from '@/utils/storage';
import { toast } from 'sonner';

export const useSelectionOperations = (
  files: ImageFile[], 
  currentFolderId: string,
  setRefreshTrigger: (value: (prev: number) => number) => void
) => {
  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [moveModalOpen, setMoveModalOpen] = useState<boolean>(false);
  
  // Shared storage flag
  const SHARED_STORAGE = true;

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
  }, [selectedFiles, currentFolderId, setRefreshTrigger]);

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
    selectionMode,
    setSelectionMode,
    selectedFiles,
    moveModalOpen,
    setMoveModalOpen,
    resetSelection,
    handleSelectFile,
    handleSelectAll,
    handleDeselectAll,
    handleDeleteSelected,
    handleDownloadSelected,
    handleMoveSelected
  };
};
