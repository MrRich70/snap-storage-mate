
import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { 
  uploadFile,
  retryUpload,
  cancelUpload,
  clearCompletedUploads,
  getUploadProgress
} from '@/utils/storage';
import { broadcastFileChanged } from '@/utils/realtimeSync';

export const useUploadOperations = (
  currentFolderId: string, 
  setRefreshTrigger: (value: (prev: number) => number) => void,
  loadFiles: () => Promise<void>
) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [fileCache, setFileCache] = useState<Map<string, File>>(new Map());
  const [shouldAutoRefresh, setShouldAutoRefresh] = useState<boolean>(false);
  
  const handleUploadClick = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    fileInputRef.current?.click();
  }, []);
  
  const handleFileInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { files } = e.target;
    if (!files || files.length === 0) return;
    
    setUploadingFile(true);
    
    const newFileCache = new Map(fileCache);
    const uploadPromises = [];
    
    try {
      console.log(`Uploading ${files.length} files to folder ${currentFolderId}`);
      
      // Process each file individually
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const cacheKey = `${currentFolderId}_${file.name}_${Date.now()}`;
        newFileCache.set(cacheKey, file);
        
        const uploadPromise = uploadFile(file, currentFolderId)
          .then((newFile) => {
            // Broadcast each file change individually with a unique timestamp
            broadcastFileChanged(currentFolderId);
            console.log(`File uploaded successfully:`, newFile);
            return newFile;
          })
          .catch((error) => {
            console.error('Upload error:', error);
            toast.error(`Failed to upload ${file.name}`);
            return null;
          });
          
        uploadPromises.push(uploadPromise);
      }
      
      setFileCache(newFileCache);
      
      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result !== null);
      
      if (successfulUploads.length > 0) {
        // Load files only once after all uploads are complete
        await loadFiles();
        toast.success(`${successfulUploads.length} file(s) uploaded successfully`);
        // Force refresh to make sure UI is updated
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error('All uploads failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file(s)');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [currentFolderId, fileCache, loadFiles, setRefreshTrigger]);
  
  const handleRetryUpload = useCallback(async (uploadId: string) => {
    for (const [cacheKey, cachedFile] of fileCache.entries()) {
      if (cacheKey.includes(uploadId)) {
        try {
          await retryUpload(uploadId, cachedFile, currentFolderId);
          // Broadcast file change
          broadcastFileChanged(currentFolderId);
          await loadFiles();
          setRefreshTrigger(prev => prev + 1);
          return;
        } catch (error) {
          console.error('Retry failed:', error);
          toast.error('Failed to retry upload');
        }
      }
    }
    
    toast.error('Original file not found for retry. Please upload again.');
  }, [fileCache, currentFolderId, setRefreshTrigger, loadFiles]);
  
  const handleCancelUpload = useCallback((uploadId: string) => {
    cancelUpload(uploadId);
    setUploadProgress(getUploadProgress());
  }, []);
  
  const handleClearCompletedUploads = useCallback(() => {
    clearCompletedUploads();
    setUploadProgress(getUploadProgress());
  }, []);
  
  // Monitor upload progress
  const trackUploadProgress = useCallback(() => {
    const currentUploads = getUploadProgress();
    setUploadProgress(currentUploads);
    
    if (shouldAutoRefresh && currentUploads.length > 0 && 
        currentUploads.every(u => u.status === 'completed' || u.status === 'error')) {
      setShouldAutoRefresh(false);
      loadFiles().then(() => {
        setRefreshTrigger(prev => prev + 1);
      });
    }
  }, [shouldAutoRefresh, setRefreshTrigger, loadFiles]);
  
  return {
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
  };
};
