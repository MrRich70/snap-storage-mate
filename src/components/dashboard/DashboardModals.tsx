
import React from 'react';
import Modal from '@/components/Modal';
import { Folder, ImageFile } from '@/utils/storage';

interface DashboardModalsProps {
  newFolderModalOpen: boolean;
  renameFolderModalOpen: boolean;
  renameFileModalOpen: boolean;
  deleteFolderModalOpen: boolean;
  deleteFileModalOpen: boolean;
  selectedFolder: Folder | null;
  selectedFile: ImageFile | null;
  onCloseNewFolderModal: () => void;
  onCloseRenameFolderModal: () => void;
  onCloseRenameFileModal: () => void;
  onCloseDeleteFolderModal: () => void;
  onCloseDeleteFileModal: () => void;
  onCreateFolder: (name: string) => void;
  onRenameFolder: (name: string) => void;
  onRenameFile: (name: string) => void;
  onDeleteFolder: () => void;
  onDeleteFile: () => void;
}

const DashboardModals: React.FC<DashboardModalsProps> = ({
  newFolderModalOpen,
  renameFolderModalOpen,
  renameFileModalOpen,
  deleteFolderModalOpen,
  deleteFileModalOpen,
  selectedFolder,
  selectedFile,
  onCloseNewFolderModal,
  onCloseRenameFolderModal,
  onCloseRenameFileModal,
  onCloseDeleteFolderModal,
  onCloseDeleteFileModal,
  onCreateFolder,
  onRenameFolder,
  onRenameFile,
  onDeleteFolder,
  onDeleteFile,
}) => {
  return (
    <>
      <Modal
        title="Create New Folder"
        isOpen={newFolderModalOpen}
        onClose={onCloseNewFolderModal}
        onConfirm={onCreateFolder}
        placeholder="Enter folder name"
        confirmText="Create"
      />
      
      <Modal
        title="Rename Folder"
        isOpen={renameFolderModalOpen}
        onClose={onCloseRenameFolderModal}
        onConfirm={onRenameFolder}
        defaultValue={selectedFolder?.name}
        placeholder="Enter new folder name"
        confirmText="Rename"
      />
      
      <Modal
        title="Delete Folder"
        isOpen={deleteFolderModalOpen}
        onClose={onCloseDeleteFolderModal}
        onConfirm={onDeleteFolder}
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
        onClose={onCloseRenameFileModal}
        onConfirm={onRenameFile}
        defaultValue={selectedFile?.name}
        placeholder="Enter new file name"
        confirmText="Rename"
      />
      
      <Modal
        title="Delete File"
        isOpen={deleteFileModalOpen}
        onClose={onCloseDeleteFileModal}
        onConfirm={onDeleteFile}
        showInput={false}
        confirmText="Delete"
      >
        <p>Are you sure you want to delete this file?</p>
        <p className="font-medium mt-2">{selectedFile?.name}</p>
        <p className="text-sm text-destructive mt-2">This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default DashboardModals;
