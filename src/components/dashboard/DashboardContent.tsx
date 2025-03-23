
import React from 'react';
import DashboardContentWithSelection from './DashboardContentWithSelection';
import { Folder, ImageFile } from '@/utils/storageTypes';

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
  selectionMode: boolean;
  setSelectionMode: (mode: boolean) => void;
  selectedFiles: string[];
  onSelectFile: (fileId: string, isSelected: boolean) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDeleteSelected: () => void;
  onDownloadSelected: () => void;
  onMoveSelected: () => void;
  moveModalOpen: boolean;
  setMoveModalOpen: (open: boolean) => void;
  currentFolderId: string;
  refreshFiles: () => void;
}

const DashboardContent: React.FC<DashboardContentProps> = (props) => {
  return <DashboardContentWithSelection {...props} />;
};

export default DashboardContent;
