
import React from 'react';
import { Loader2Icon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import ImageViewer from '@/components/dashboard/ImageViewer';
import DashboardModals from '@/components/dashboard/DashboardModals';
import UploadProgress from '@/components/UploadProgress';
import FileUploader from '@/components/dashboard/FileUploader';
import { useDashboard } from '@/hooks/useDashboard';

const Dashboard: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const dashboard = useDashboard();
  
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
      <Navigation onUpload={dashboard.handleUploadClick} />
      
      <main className="flex-1 overflow-auto p-6">
        <DashboardHeader 
          currentPath={dashboard.currentPath}
          onBreadcrumbClick={dashboard.handleBreadcrumbClick}
          onBackClick={dashboard.handleBackClick}
          onRefresh={dashboard.handleRefresh}
          onCreateFolderClick={dashboard.handleCreateFolderClick}
          onUploadClick={dashboard.handleUploadClick}
          isUploading={dashboard.uploadingFile}
        />
        
        <DashboardContent 
          isLoading={dashboard.isLoading}
          folders={dashboard.folders}
          files={dashboard.files}
          onFolderClick={dashboard.handleFolderClick}
          onRenameFolder={dashboard.handleRenameFolderClick}
          onDeleteFolder={dashboard.handleDeleteFolderClick}
          onRenameFile={dashboard.handleRenameFileClick}
          onDeleteFile={dashboard.handleDeleteFileClick}
          onDownloadFile={dashboard.handleDownloadFile}
          onViewFile={dashboard.handleViewFile}
          selectionMode={dashboard.selectionMode}
          setSelectionMode={dashboard.setSelectionMode}
          selectedFiles={dashboard.selectedFiles}
          onSelectFile={dashboard.handleSelectFile}
          onSelectAll={dashboard.handleSelectAll}
          onDeselectAll={dashboard.handleDeselectAll}
          onDeleteSelected={dashboard.handleDeleteSelected}
          onDownloadSelected={dashboard.handleDownloadSelected}
          onMoveSelected={() => dashboard.setMoveModalOpen(true)} // Fixed to pass a function that takes no parameters
          moveModalOpen={dashboard.moveModalOpen}
          setMoveModalOpen={dashboard.setMoveModalOpen}
          currentFolderId={dashboard.currentFolderId}
          refreshFiles={() => dashboard.setRefreshTrigger(prev => prev + 1)}
        />
        
        <FileUploader 
          ref={dashboard.fileInputRef}
          onChange={dashboard.handleFileInputChange}
        />
      </main>
      
      <UploadProgress
        uploads={dashboard.uploadProgress}
        onRetry={dashboard.handleRetryUpload}
        onCancel={dashboard.handleCancelUpload}
        onClearCompleted={dashboard.handleClearCompletedUploads}
      />
      
      <DashboardModals
        newFolderModalOpen={dashboard.newFolderModalOpen}
        renameFolderModalOpen={dashboard.renameFolderModalOpen}
        renameFileModalOpen={dashboard.renameFileModalOpen}
        deleteFolderModalOpen={dashboard.deleteFolderModalOpen}
        deleteFileModalOpen={dashboard.deleteFileModalOpen}
        selectedFolder={dashboard.selectedFolder}
        selectedFile={dashboard.selectedFile}
        onCloseNewFolderModal={() => dashboard.setNewFolderModalOpen(false)}
        onCloseRenameFolderModal={() => dashboard.setRenameFolderModalOpen(false)}
        onCloseRenameFileModal={() => dashboard.setRenameFileModalOpen(false)}
        onCloseDeleteFolderModal={() => dashboard.setDeleteFolderModalOpen(false)}
        onCloseDeleteFileModal={() => dashboard.setDeleteFileModalOpen(false)}
        onCreateFolder={dashboard.handleCreateFolder}
        onRenameFolder={dashboard.handleRenameFolder}
        onRenameFile={dashboard.handleRenameFile}
        onDeleteFolder={dashboard.handleDeleteFolder}
        onDeleteFile={dashboard.handleDeleteFile}
      />
      
      <ImageViewer
        isOpen={dashboard.viewFileModalOpen}
        onClose={() => dashboard.setViewFileModalOpen(false)}
        selectedFile={dashboard.selectedFile}
      />
    </div>
  );
};

export default Dashboard;
