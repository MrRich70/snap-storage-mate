
import React from 'react';
import { Button } from '@/components/ui/button';
import { FolderPlusIcon, UploadIcon, Loader2Icon } from 'lucide-react';

interface ActionButtonsProps {
  onCreateFolderClick: () => void;
  onUploadClick: () => void;
  isUploading: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCreateFolderClick,
  onUploadClick,
  isUploading,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        className="flex items-center gap-1"
        onClick={onCreateFolderClick}
      >
        <FolderPlusIcon className="h-4 w-4" />
        <span>New Folder</span>
      </Button>
      
      <Button
        size="sm"
        onClick={onUploadClick}
        disabled={isUploading}
        className="relative"
      >
        {isUploading ? (
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
    </div>
  );
};

export default ActionButtons;
