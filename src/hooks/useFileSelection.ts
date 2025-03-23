
import { useState, useCallback } from 'react';
import { ImageFile, downloadFile, deleteFile } from '@/utils/storage';
import { toast } from 'sonner';

export const useFileSelection = (files: ImageFile[], currentFolderId: string, refreshFiles: () => void) => {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Clear selection when files change (e.g., navigating folders)
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
        deleteFile(fileId, currentFolderId)
      );
      
      // Wait for all files to be deleted
      await Promise.all(deletePromises);
      
      toast.success(`${selectedFiles.length} files deleted successfully`);
      setSelectedFiles([]);
      refreshFiles();
    } catch (error) {
      console.error('Error deleting selected files:', error);
      toast.error('Failed to delete some files');
    }
  }, [selectedFiles, currentFolderId, refreshFiles]);

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

  return {
    selectionMode,
    setSelectionMode,
    selectedFiles,
    handleSelectFile,
    handleSelectAll,
    handleDeselectAll,
    handleDeleteSelected,
    handleDownloadSelected,
    resetSelection
  };
};
