
import React from 'react';
import FolderGrid from '@/components/FolderGrid';
import ImageGrid from '@/components/ImageGrid';
import LoadingState from '@/components/dashboard/LoadingState';
import SelectionControls from '@/components/dashboard/SelectionControls';
import MoveFilesModal from '@/components/dashboard/MoveFilesModal';
import { Folder, ImageFile } from '@/utils/storage';
import { UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface DashboardContentWithSelectionProps {
  isLoading: boolean;
  folders: Folder[];
  files: ImageFile[];
  onFolderClick: (folder: Folder) => void;
  onRenameFolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => void;
  onRenameFile: (file: ImageFile) => void;
  onDeleteFile: (file: ImageFile) => void;
  onDownloadFile: (file: ImageFile) => void;
  onViewFile: (file: ImageFile) => void;
  selectionMode: boolean;
  setSelectionMode: (mode: boolean) => void;
  selectedFiles: string[];
  onSelectFile: (fileId: string, isSelected: boolean) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDeleteSelected: () => void;
  onDownloadSelected: () => void;
  onMoveSelected: () => void; // Changed to accept no parameters
  moveModalOpen: boolean;
  setMoveModalOpen: (open: boolean) => void;
  currentFolderId: string;
  refreshFiles: () => void;
}

const DashboardContentWithSelection: React.FC<DashboardContentWithSelectionProps> = ({
  isLoading,
  folders,
  files,
  onFolderClick,
  onRenameFolder,
  onDeleteFolder,
  onRenameFile,
  onDeleteFile,
  onDownloadFile,
  onViewFile,
  selectionMode,
  setSelectionMode,
  selectedFiles,
  onSelectFile,
  onSelectAll,
  onDeselectAll,
  onDeleteSelected,
  onDownloadSelected,
  onMoveSelected,
  moveModalOpen,
  setMoveModalOpen,
  currentFolderId,
  refreshFiles
}) => {
  const { user } = useAuth();
  
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Workspace</h1>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <UserIcon className="h-4 w-4" />
          <span>{user?.email || 'Personal'} workspace</span>
        </div>
      </div>
      
      {files.length > 0 && (
        <SelectionControls
          selectionMode={selectionMode}
          setSelectionMode={setSelectionMode}
          selectedFiles={selectedFiles}
          allFiles={files}
          onSelectAll={onSelectAll}
          onDeselectAll={onDeselectAll}
          onDeleteSelected={onDeleteSelected}
          onDownloadSelected={onDownloadSelected}
          onMoveSelected={onMoveSelected}
        />
      )}
      
      {folders.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-4">Folders</h2>
          <FolderGrid
            folders={folders}
            onFolderClick={onFolderClick}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
          />
        </div>
      )}
      
      <div>
        <h2 className="text-lg font-medium mb-4">Images</h2>
        <ImageGrid
          files={files}
          onRenameFile={onRenameFile}
          onDeleteFile={onDeleteFile}
          onDownloadFile={onDownloadFile}
          onViewFile={onViewFile}
          selectedFiles={selectedFiles}
          onSelectFile={onSelectFile}
          selectionMode={selectionMode}
        />
      </div>

      <MoveFilesModal 
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        selectedFiles={selectedFiles}
        files={files}
        currentFolderId={currentFolderId}
        onSuccess={refreshFiles}
      />
    </div>
  );
};

export default DashboardContentWithSelection;
