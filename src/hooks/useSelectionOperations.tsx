
import { useState, useCallback } from 'react';
import { ImageFile, moveFiles, deleteFile, downloadFile } from '@/utils/storage';
import { toast } from 'sonner';

export const useSelectionOperations = (
  files: ImageFile[],
  currentFolderId: string,
  setRefreshTrigger: (value: (prev: number) => number) => void
) => {
  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [moveModalOpen, setMoveModalOpen] = useState<boolean>(false);
  
  // Reset selection when files change
  const resetSelection = useCallback(() => {
    setSelectedFiles([]);
    setSelectionMode(false);
  }, []);
  
  // Toggle file selection
  const handleSelectFile = useCallback((fileId: string, isSelected: boolean) => {
    setSelectedFiles(prev => {
      if (isSelected) {
        return [...prev, fileId];
      } else {
        return prev.filter(id => id !== fileId);
      }
    });
  }, []);
  
  // Select all files
  const handleSelectAll = useCallback(() => {
    setSelectedFiles(files.map(file => file.id));
  }, [files]);
  
  // Deselect all files
  const handleDeselectAll = useCallback(() => {
    setSelectedFiles([]);
  }, []);
  
  // Delete selected files
  const handleDeleteSelected = useCallback(async () => {
    try {
      const promises = selectedFiles.map(fileId => deleteFile(fileId, currentFolderId));
      await Promise.all(promises);
      toast.success('Files deleted successfully');
      resetSelection();
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting files:', error);
      toast.error('Failed to delete files');
    }
  }, [selectedFiles, currentFolderId, resetSelection, setRefreshTrigger]);
  
  // Download selected files
  const handleDownloadSelected = useCallback(() => {
    try {
      selectedFiles.forEach(fileId => {
        const file = files.find(f => f.id === fileId);
        if (file) {
          downloadFile(file);
        }
      });
      toast.success('Files downloaded');
    } catch (error) {
      console.error('Error downloading files:', error);
      toast.error('Failed to download files');
    }
  }, [selectedFiles, files]);
  
  // Move selected files
  const handleMoveSelected = useCallback(async (targetFolderId: string) => {
    try {
      await moveFiles(selectedFiles, currentFolderId, targetFolderId);
      toast.success('Files moved successfully');
      resetSelection();
      setRefreshTrigger(prev => prev + 1);
      setMoveModalOpen(false);
    } catch (error) {
      console.error('Error moving files:', error);
      toast.error('Failed to move files');
    }
  }, [selectedFiles, currentFolderId, resetSelection, setRefreshTrigger]);
  
  return {
    selectionMode,
    setSelectionMode,
    selectedFiles,
    moveModalOpen,
    setMoveModalOpen,
    handleSelectFile,
    handleSelectAll,
    handleDeselectAll,
    handleDeleteSelected,
    handleDownloadSelected,
    handleMoveSelected,
    resetSelection
  };
};
