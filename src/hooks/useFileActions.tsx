
import { useState, useCallback } from 'react';
import { 
  ImageFile,
  renameFile,
  deleteFile,
  downloadFile
} from '@/utils/storage';

export const useFileActions = (
  currentFolderId: string,
  setRefreshTrigger: (value: (prev: number) => number) => void
) => {
  const [selectedFile, setSelectedFile] = useState<ImageFile | null>(null);
  const [renameFileModalOpen, setRenameFileModalOpen] = useState<boolean>(false);
  const [deleteFileModalOpen, setDeleteFileModalOpen] = useState<boolean>(false);
  const [viewFileModalOpen, setViewFileModalOpen] = useState<boolean>(false);
  
  const handleRenameFileClick = useCallback((file: ImageFile) => {
    setSelectedFile(file);
    setRenameFileModalOpen(true);
  }, []);
  
  const handleRenameFile = useCallback(async (newName: string) => {
    if (selectedFile) {
      await renameFile(selectedFile.id, newName, currentFolderId);
      setRefreshTrigger(prev => prev + 1);
    }
  }, [selectedFile, currentFolderId, setRefreshTrigger]);
  
  const handleDeleteFileClick = useCallback((file: ImageFile) => {
    setSelectedFile(file);
    setDeleteFileModalOpen(true);
  }, []);
  
  const handleDeleteFile = useCallback(async () => {
    if (selectedFile) {
      await deleteFile(selectedFile.id, currentFolderId);
      setRefreshTrigger(prev => prev + 1);
    }
  }, [selectedFile, currentFolderId, setRefreshTrigger]);
  
  const handleDownloadFile = useCallback((file: ImageFile) => {
    downloadFile(file);
  }, []);
  
  const handleViewFile = useCallback((file: ImageFile) => {
    setSelectedFile(file);
    setViewFileModalOpen(true);
  }, []);
  
  return {
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
  };
};
