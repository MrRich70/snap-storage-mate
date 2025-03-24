
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  ImageFile,
  getFiles
} from '@/utils/storage';

export const useFileLoading = (
  currentFolderId: string,
  refreshTrigger: number
) => {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const SHARED_STORAGE = true;
  
  const loadFiles = useCallback(async () => {
    try {
      const folderFiles = await getFiles(currentFolderId, SHARED_STORAGE);
      setFiles(folderFiles);
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load files');
    }
  }, [currentFolderId]);
  
  const forceRefresh = useCallback(() => {
    loadFiles();
  }, [loadFiles]);
  
  // Load files on mount and when triggered
  useEffect(() => {
    loadFiles();
  }, [loadFiles, refreshTrigger]);
  
  return {
    files,
    loadFiles,
    forceRefresh
  };
};
