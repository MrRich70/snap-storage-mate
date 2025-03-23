
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2Icon } from 'lucide-react';
import Navigation from '@/components/Navigation';
import BreadcrumbNav from '@/components/dashboard/BreadcrumbNav';
import ActionButtons from '@/components/dashboard/ActionButtons';
import DashboardContent from '@/components/dashboard/DashboardContent';
import ImageViewer from '@/components/dashboard/ImageViewer';
import DashboardModals from '@/components/dashboard/DashboardModals';
import UploadProgress from '@/components/UploadProgress';
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
  uploadFile,
  renameFile,
  deleteFile,
  downloadFile
} from '@/utils/storage';
import { 
  getUploadProgress, 
  retryUpload, 
  cancelUpload, 
  clearCompletedUploads 
} from '@/utils/uploadUtils';

const Dashboard: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [currentPath, setCurrentPath] = useState<Folder[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<ImageFile | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [uploadProgress, setUploadProgress] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
  const [newFolderModalOpen, setNewFolderModalOpen] = useState<boolean>(false);
  const [renameFolderModalOpen, setRenameFolderModalOpen] = useState<boolean>(false);
  const [renameFileModalOpen, setRenameFileModalOpen] = useState<boolean>(false);
  const [deleteFolderModalOpen, setDeleteFolderModalOpen] = useState<boolean>(false);
  const [deleteFileModalOpen, setDeleteFileModalOpen] = useState<boolean>(false);
  const [viewFileModalOpen, setViewFileModalOpen] = useState<boolean>(false);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  
  // Store file reference for retry operations
  const [fileCache, setFileCache] = useState<Map<string, File>>(new Map());
  
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, authLoading]);
  
  useEffect(() => {
    initializeStorage();
    loadCurrentFolder('root');
  }, [refreshTrigger]);
  
  // Update upload progress periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const currentUploads = getUploadProgress();
      setUploadProgress(currentUploads);
      
      // Check if any uploads completed since last check
      const completedUploads = currentUploads.filter(u => u.status === 'completed');
      if (completedUploads.length > 0 && currentUploads.every(u => u.status !== 'uploading')) {
        // If all uploads are either completed or error, refresh the file list
        setRefreshTrigger(prev => prev + 1);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  const loadCurrentFolder = async (folderId: string) => {
    setIsLoading(true);
    
    try {
      const allFolders = getFolders();
      const folderChildren = allFolders.filter(folder => folder.parentId === folderId);
      setFolders(folderChildren);
      
      const folderFiles = await getFiles(folderId);
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
  };
  
  const handleFolderClick = (folder: Folder) => {
    loadCurrentFolder(folder.id);
  };
  
  const handleBreadcrumbClick = (folder: Folder) => {
    loadCurrentFolder(folder.id);
  };

  const handleBackClick = () => {
    if (currentPath.length > 1) {
      const parentFolder = currentPath[currentPath.length - 2];
      loadCurrentFolder(parentFolder.id);
    }
  };
  
  const handleCreateFolderClick = () => {
    setNewFolderModalOpen(true);
  };
  
  const handleCreateFolder = (name: string) => {
    createFolder(name, currentFolderId);
    loadCurrentFolder(currentFolderId);
  };
  
  const handleRenameFolderClick = (folder: Folder) => {
    setSelectedFolder(folder);
    setRenameFolderModalOpen(true);
  };
  
  const handleRenameFolder = (newName: string) => {
    if (selectedFolder) {
      renameFolder(selectedFolder.id, newName);
      loadCurrentFolder(currentFolderId);
    }
  };
  
  const handleDeleteFolderClick = (folder: Folder) => {
    setSelectedFolder(folder);
    setDeleteFolderModalOpen(true);
  };
  
  const handleDeleteFolder = async () => {
    if (selectedFolder) {
      await deleteFolder(selectedFolder.id);
      loadCurrentFolder(currentFolderId);
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!files || files.length === 0) return;
    
    setUploadingFile(true);
    
    // Cache files for potential retry operations
    const newFileCache = new Map(fileCache);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Store file in cache using a unique key
        const cacheKey = `${currentFolderId}_${file.name}_${Date.now()}`;
        newFileCache.set(cacheKey, file);
        
        // Upload and process in background
        uploadFile(file, currentFolderId)
          .then(() => {
            // Refresh the file list after all uploads
            if (i === files.length - 1) {
              // Trigger a refresh
              setRefreshTrigger(prev => prev + 1);
            }
          })
          .catch((error) => {
            console.error('Upload error:', error);
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
  };
  
  const handleRenameFileClick = (file: ImageFile) => {
    setSelectedFile(file);
    setRenameFileModalOpen(true);
  };
  
  const handleRenameFile = async (newName: string) => {
    if (selectedFile) {
      await renameFile(selectedFile.id, newName, currentFolderId);
      loadCurrentFolder(currentFolderId);
    }
  };
  
  const handleDeleteFileClick = (file: ImageFile) => {
    setSelectedFile(file);
    setDeleteFileModalOpen(true);
  };
  
  const handleDeleteFile = async () => {
    if (selectedFile) {
      await deleteFile(selectedFile.id, currentFolderId);
      loadCurrentFolder(currentFolderId);
    }
  };
  
  const handleDownloadFile = (file: ImageFile) => {
    downloadFile(file);
  };
  
  const handleViewFile = (file: ImageFile) => {
    setSelectedFile(file);
    setViewFileModalOpen(true);
  };
  
  const handleRetryUpload = async (uploadId: string) => {
    // Find the file in our cache
    for (const [cacheKey, cachedFile] of fileCache.entries()) {
      if (cacheKey.includes(uploadId)) {
        try {
          await retryUpload(uploadId, cachedFile, currentFolderId);
          // Auto-refresh when upload completed
          setRefreshTrigger(prev => prev + 1);
        } catch (error) {
          console.error('Retry failed:', error);
        }
        return;
      }
    }
    
    toast.error('Original file not found for retry. Please upload again.');
  };
  
  const handleCancelUpload = (uploadId: string) => {
    cancelUpload(uploadId);
    // Update the UI immediately
    setUploadProgress(getUploadProgress());
  };
  
  const handleClearCompletedUploads = () => {
    clearCompletedUploads();
    // Update the UI immediately
    setUploadProgress(getUploadProgress());
  };
  
  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <Navigation onUpload={handleUploadClick} />
      
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <BreadcrumbNav 
            currentPath={currentPath}
            onBreadcrumbClick={handleBreadcrumbClick}
            onBackClick={handleBackClick}
          />
          
          <ActionButtons
            onCreateFolderClick={handleCreateFolderClick}
            onUploadClick={handleUploadClick}
            isUploading={uploadingFile}
          />
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            className="hidden"
            accept="image/*"
            multiple
          />
        </div>
        
        <DashboardContent 
          isLoading={isLoading}
          folders={folders}
          files={files}
          onFolderClick={handleFolderClick}
          onRenameFolder={handleRenameFolderClick}
          onDeleteFolder={handleDeleteFolderClick}
          onRenameFile={handleRenameFileClick}
          onDeleteFile={handleDeleteFileClick}
          onDownloadFile={handleDownloadFile}
          onViewFile={handleViewFile}
        />
      </main>
      
      {/* Upload Progress Component */}
      <UploadProgress
        uploads={uploadProgress}
        onRetry={handleRetryUpload}
        onCancel={handleCancelUpload}
        onClearCompleted={handleClearCompletedUploads}
      />
      
      <DashboardModals
        newFolderModalOpen={newFolderModalOpen}
        renameFolderModalOpen={renameFolderModalOpen}
        renameFileModalOpen={renameFileModalOpen}
        deleteFolderModalOpen={deleteFolderModalOpen}
        deleteFileModalOpen={deleteFileModalOpen}
        selectedFolder={selectedFolder}
        selectedFile={selectedFile}
        onCloseNewFolderModal={() => setNewFolderModalOpen(false)}
        onCloseRenameFolderModal={() => setRenameFolderModalOpen(false)}
        onCloseRenameFileModal={() => setRenameFileModalOpen(false)}
        onCloseDeleteFolderModal={() => setDeleteFolderModalOpen(false)}
        onCloseDeleteFileModal={() => setDeleteFileModalOpen(false)}
        onCreateFolder={handleCreateFolder}
        onRenameFolder={handleRenameFolder}
        onRenameFile={handleRenameFile}
        onDeleteFolder={handleDeleteFolder}
        onDeleteFile={handleDeleteFile}
      />
      
      <ImageViewer
        isOpen={viewFileModalOpen}
        onClose={() => setViewFileModalOpen(false)}
        selectedFile={selectedFile}
      />
    </div>
  );
};

export default Dashboard;
