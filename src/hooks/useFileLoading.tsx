
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getFiles } from '@/utils/storage';
import { ImageFile } from '@/utils/storageTypes';

/**
 * Hook for loading files from storage
 */
export const useFileLoading = (
  currentFolderId: string,
  refreshTrigger: number
) => {
  const [files, setFiles] = useState<ImageFile[]>([]);
  
  // Force refresh function
  const forceRefresh = useCallback(() => {
    console.log('Forcing file refresh...');
    loadFiles();
  }, [currentFolderId]);
  
  // Load files function
  const loadFiles = useCallback(async () => {
    console.log('Loading files for folder:', currentFolderId);
    try {
      // Use the user-specific storage
      const loadedFiles = await getFiles(currentFolderId);
      console.log(`Loaded ${loadedFiles.length} files:`, loadedFiles);
      setFiles(loadedFiles);
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load files');
    }
  }, [currentFolderId]);
  
  // Load files on mount and when refreshTrigger or currentFolderId changes
  useEffect(() => {
    if (currentFolderId) {
      console.log(`Refreshing files for folder: ${currentFolderId} (trigger: ${refreshTrigger})`);
      loadFiles();
    }
  }, [currentFolderId, refreshTrigger, loadFiles]);
  
  return { files, loadFiles, forceRefresh };
};
