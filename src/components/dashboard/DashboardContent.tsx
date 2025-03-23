
import React from 'react';
import FolderGrid from '@/components/FolderGrid';
import ImageGrid from '@/components/ImageGrid';
import LoadingState from '@/components/dashboard/LoadingState';
import { Folder, ImageFile } from '@/utils/storage';

interface DashboardContentProps {
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
}

const DashboardContent: React.FC<DashboardContentProps> = ({
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
}) => {
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-8">
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
        />
      </div>
    </div>
  );
};

export default DashboardContent;
