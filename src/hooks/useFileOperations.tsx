
import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  ImageFile, 
  uploadLocalFile,
  renameFile,
  deleteFile,
  downloadFile,
  getFiles,
  retryUpload,
  cancelUpload,
  clearCompletedUploads,
  getUploadProgress
} from '@/utils/storage';

export const useFileOperations = (currentFolderId: string, refreshTrigger: number, setRefreshTrigger: (value: (prev: number) => number) => void) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ImageFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [fileCache, setFileCache] = useState<Map<string, File>>(new Map());
  
  const [renameFileModalOpen, setRenameFileModalOpen] = useState<boolean>(false);
  const [deleteFileModalOpen, setDeleteFileModalOpen] = useState<boolean>(false);
  const [viewFileModalOpen, setViewFileModalOpen] = useState<boolean>(false);
  
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
  }, [setRefreshTrigger]);
  
  const handleUploadClick = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    fileInputRef.current?.click();
  }, []);
  
  const handleFileInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent any form submission or page reload
    e.preventDefault();
    e.stopPropagation();
    
    const { files } = e.target;
    if (!files || files.length === 0) return;
    
    setUploadingFile(true);
    
    const newFileCache = new Map(fileCache);
    const uploadPromises = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const cacheKey = `${currentFolderId}_${file.name}_${Date.now()}`;
        newFileCache.set(cacheKey, file);
        
        const uploadPromise = uploadLocalFile(file, currentFolderId, SHARED_STORAGE)
          .catch((error) => {
            console.error('Upload error:', error);
            toast.error(`Failed to upload ${file.name}`);
          });
          
        uploadPromises.push(uploadPromise);
      }
      
      setFileCache(newFileCache);
      
      // Wait for all uploads to complete
      Promise.all(uploadPromises)
        .then(() => {
          // Only refresh the trigger after all uploads are done
          setRefreshTrigger(prev => prev + 1);
          toast.success(`${files.length} file(s) uploaded successfully`);
        })
        .catch((error) => {
          console.error('Upload error:', error);
          toast.error('Some files failed to upload');
        })
        .finally(() => {
          setUploadingFile(false);
          // Reset the input value to allow the same file to be uploaded again
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file(s)');
      setUploadingFile(false);
      // Always reset the input value even if there's an error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [currentFolderId, fileCache, setRefreshTrigger]);
  
  const handleRenameFileClick = useCallback((file: ImageFile) => {
    setSelectedFile(file);
    setRenameFileModalOpen(true);
  }, []);
  
  const handleRenameFile = useCallback(async (newName: string) => {
    if (selectedFile) {
      await renameFile(selectedFile.id, newName, currentFolderId, SHARED_STORAGE);
      setRefreshTrigger(prev => prev + 1);
    }
  }, [selectedFile, currentFolderId, setRefreshTrigger]);
  
  const handleDeleteFileClick = useCallback((file: ImageFile) => {
    setSelectedFile(file);
    setDeleteFileModalOpen(true);
  }, []);
  
  const handleDeleteFile = useCallback(async () => {
    if (selectedFile) {
      await deleteFile(selectedFile.id, currentFolderId, SHARED_STORAGE);
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
  
  const handleRetryUpload = useCallback(async (uploadId: string) => {
    for (const [cacheKey, cachedFile] of fileCache.entries()) {
      if (cacheKey.includes(uploadId)) {
        try {
          await retryUpload(uploadId, cachedFile, currentFolderId, SHARED_STORAGE);
          setRefreshTrigger(prev => prev + 1);
          return;
        } catch (error) {
          console.error('Retry failed:', error);
          toast.error('Failed to retry upload');
        }
      }
    }
    
    toast.error('Original file not found for retry. Please upload again.');
  }, [fileCache, currentFolderId, setRefreshTrigger]);
  
  const handleCancelUpload = useCallback((uploadId: string) => {
    cancelUpload(uploadId);
    setUploadProgress(getUploadProgress());
  }, []);
  
  const handleClearCompletedUploads = useCallback(() => {
    clearCompletedUploads();
    setUploadProgress(getUploadProgress());
  }, []);
  
  useEffect(() => {
    loadFiles();
  }, [loadFiles, refreshTrigger]);
  
  return {
    files,
    fileInputRef,
    selectedFile,
    uploadProgress,
    uploadingFile,
    renameFileModalOpen,
    setRenameFileModalOpen,
    deleteFileModalOpen,
    setDeleteFileModalOpen,
    viewFileModalOpen,
    setViewFileModalOpen,
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
    loadFiles
  };
};
