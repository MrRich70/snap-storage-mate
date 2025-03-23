import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDropbox } from '@/hooks/useDropbox';
import { 
  FolderIcon, 
  UploadIcon, 
  FolderPlusIcon,
  ArrowLeftIcon,
  Loader2Icon,
  XIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Navigation from '@/components/Navigation';
import FolderGrid from '@/components/FolderGrid';
import ImageGrid from '@/components/ImageGrid';
import DropboxConnect from '@/components/DropboxConnect';
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
import Modal from '@/components/Modal';

const Dashboard: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isConnected: isDropboxConnected } = useDropbox();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [currentPath, setCurrentPath] = useState<Folder[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<ImageFile | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  
  const [newFolderModalOpen, setNewFolderModalOpen] = useState<boolean>(false);
  const [renameFolderModalOpen, setRenameFolderModalOpen] = useState<boolean>(false);
  const [renameFileModalOpen, setRenameFileModalOpen] = useState<boolean>(false);
  const [deleteFolderModalOpen, setDeleteFolderModalOpen] = useState<boolean>(false);
  const [deleteFileModalOpen, setDeleteFileModalOpen] = useState<boolean>(false);
  const [viewFileModalOpen, setViewFileModalOpen] = useState<boolean>(false);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  
  const [showDropboxDialog, setShowDropboxDialog] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, isLoading]);
  
  useEffect(() => {
    initializeStorage();
    loadCurrentFolder('root');
  }, []);
  
  const loadCurrentFolder = (folderId: string) => {
    setIsLoading(true);
    
    try {
      const allFolders = getFolders();
      const folderChildren = allFolders.filter(folder => folder.parentId === folderId);
      setFolders(folderChildren);
      
      const folderFiles = getFiles(folderId);
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
  
  useEffect(() => {
    if (isAuthenticated && !isDropboxConnected && !authLoading) {
      setShowDropboxDialog(true);
    }
  }, [isAuthenticated, isDropboxConnected, authLoading]);
  
  const handleFolderClick = (folder: Folder) => {
    loadCurrentFolder(folder.id);
  };
  
  const handleBreadcrumbClick = (folder: Folder) => {
    loadCurrentFolder(folder.id);
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
  
  const handleDeleteFolder = () => {
    if (selectedFolder) {
      deleteFolder(selectedFolder.id);
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
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await uploadFile(file, currentFolderId);
      }
      
      loadCurrentFolder(currentFolderId);
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
  
  const handleRenameFile = (newName: string) => {
    if (selectedFile) {
      renameFile(selectedFile.id, newName);
      loadCurrentFolder(currentFolderId);
    }
  };
  
  const handleDeleteFileClick = (file: ImageFile) => {
    setSelectedFile(file);
    setDeleteFileModalOpen(true);
  };
  
  const handleDeleteFile = () => {
    if (selectedFile) {
      deleteFile(selectedFile.id);
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
        {!isDropboxConnected && (
          <div className="mb-6">
            <DropboxConnect />
          </div>
        )}
        
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center overflow-x-auto no-scrollbar">
            {currentPath.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-1"
                onClick={() => {
                  const parentFolder = currentPath[currentPath.length - 2];
                  loadCurrentFolder(parentFolder.id);
                }}
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </Button>
            )}
            
            <div className="flex items-center space-x-1">
              {currentPath.map((folder, index) => (
                <React.Fragment key={folder.id}>
                  {index > 0 && <span className="text-muted-foreground mx-1">/</span>}
                  <button
                    onClick={() => handleBreadcrumbClick(folder)}
                    className={`px-2 py-1 rounded-md hover:bg-muted transition-colors ${
                      index === currentPath.length - 1 
                        ? 'font-medium' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    {folder.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={handleCreateFolderClick}
            >
              <FolderPlusIcon className="h-4 w-4" />
              <span>New Folder</span>
            </Button>
            
            <Button
              size="sm"
              onClick={handleUploadClick}
              disabled={uploadingFile}
              className="relative"
            >
              {uploadingFile ? (
                <>
                  <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  <span>Upload Images</span>
                </>
              )}
            </Button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              className="hidden"
              accept="image/*"
              multiple
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin-slow"></div>
              <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {folders.length > 0 && (
              <div>
                <h2 className="text-lg font-medium mb-4">Folders</h2>
                <FolderGrid
                  folders={folders}
                  onFolderClick={handleFolderClick}
                  onRenameFolder={handleRenameFolderClick}
                  onDeleteFolder={handleDeleteFolderClick}
                />
              </div>
            )}
            
            <div>
              <h2 className="text-lg font-medium mb-4">Images</h2>
              <ImageGrid
                files={files}
                onRenameFile={handleRenameFileClick}
                onDeleteFile={handleDeleteFileClick}
                onDownloadFile={handleDownloadFile}
                onViewFile={handleViewFile}
              />
            </div>
          </div>
        )}
      </main>
      
      <Modal
        title="Create New Folder"
        isOpen={newFolderModalOpen}
        onClose={() => setNewFolderModalOpen(false)}
        onConfirm={handleCreateFolder}
        placeholder="Enter folder name"
        confirmText="Create"
      />
      
      <Modal
        title="Rename Folder"
        isOpen={renameFolderModalOpen}
        onClose={() => setRenameFolderModalOpen(false)}
        onConfirm={handleRenameFolder}
        defaultValue={selectedFolder?.name}
        placeholder="Enter new folder name"
        confirmText="Rename"
      />
      
      <Modal
        title="Delete Folder"
        isOpen={deleteFolderModalOpen}
        onClose={() => setDeleteFolderModalOpen(false)}
        onConfirm={handleDeleteFolder}
        showInput={false}
        confirmText="Delete"
      >
        <p>Are you sure you want to delete this folder and all its contents?</p>
        <p className="font-medium mt-2">{selectedFolder?.name}</p>
        <p className="text-sm text-destructive mt-2">This action cannot be undone.</p>
      </Modal>
      
      <Modal
        title="Rename File"
        isOpen={renameFileModalOpen}
        onClose={() => setRenameFileModalOpen(false)}
        onConfirm={handleRenameFile}
        defaultValue={selectedFile?.name}
        placeholder="Enter new file name"
        confirmText="Rename"
      />
      
      <Modal
        title="Delete File"
        isOpen={deleteFileModalOpen}
        onClose={() => setDeleteFileModalOpen(false)}
        onConfirm={handleDeleteFile}
        showInput={false}
        confirmText="Delete"
      >
        <p>Are you sure you want to delete this file?</p>
        <p className="font-medium mt-2">{selectedFile?.name}</p>
        <p className="text-sm text-destructive mt-2">This action cannot be undone.</p>
      </Modal>
      
      <Dialog 
        open={viewFileModalOpen} 
        onOpenChange={(open) => !open && setViewFileModalOpen(false)}
      >
        <DialogContent className="sm:max-w-4xl glass backdrop-blur-xl p-1 animate-zoom-in">
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60"
              onClick={() => setViewFileModalOpen(false)}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-center w-full h-full max-h-[80vh] overflow-hidden">
            {selectedFile && (
              <img
                src={selectedFile.url}
                alt={selectedFile.name}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
          
          {selectedFile && (
            <div className="p-2 text-center">
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(selectedFile.size / 1024).toFixed(0)} KB • 
                {new Date(selectedFile.updatedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={showDropboxDialog} onOpenChange={setShowDropboxDialog}>
        <DialogContent className="max-w-md">
          <div className="space-y-4 p-2">
            <h2 className="text-xl font-bold">Connect to Dropbox</h2>
            <p className="text-muted-foreground">
              Connect your account to Dropbox to store and organize your images in the cloud.
            </p>
            <DropboxConnect />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
