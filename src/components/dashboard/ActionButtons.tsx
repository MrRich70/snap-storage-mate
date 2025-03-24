
import React from 'react';
import { Button } from '@/components/ui/button';
import { FolderPlusIcon, UploadIcon, Loader2Icon, RefreshCwIcon } from 'lucide-react';

interface ActionButtonsProps {
  onCreateFolderClick: () => void;
  onUploadClick: (e: React.MouseEvent) => void;
  isUploading: boolean;
  onManualRefresh?: () => void; // Optional manual refresh handler
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCreateFolderClick,
  onUploadClick,
  isUploading,
  onManualRefresh
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        className="flex items-center gap-1"
        onClick={onCreateFolderClick}
        type="button" // Explicitly set type to button
      >
        <FolderPlusIcon className="h-4 w-4" />
        <span>New Folder</span>
      </Button>
      
      <Button
        size="sm"
        onClick={(e) => {
          e.preventDefault(); // Prevent default behavior
          e.stopPropagation(); // Stop event propagation
          onUploadClick(e);
        }}
        disabled={isUploading}
        className="relative"
        type="button" // Explicitly set type to button
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
      
      {onManualRefresh && (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onManualRefresh();
          }}
          title="Refresh Images (if not loading)"
          className="flex items-center gap-1"
          type="button"
        >
          <RefreshCwIcon className="h-4 w-4" />
          <span>Refresh Images</span>
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
