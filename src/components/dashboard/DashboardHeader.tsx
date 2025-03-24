
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCwIcon } from 'lucide-react';
import BreadcrumbNav from '@/components/dashboard/BreadcrumbNav';
import ActionButtons from '@/components/dashboard/ActionButtons';
import { Folder } from '@/utils/storage';

interface DashboardHeaderProps {
  currentPath: Folder[];
  onBreadcrumbClick: (folder: Folder) => void;
  onBackClick: () => void;
  onRefresh: () => void;
  onCreateFolderClick: () => void;
  onUploadClick: (e: React.MouseEvent) => void;
  isUploading: boolean;
  onManualRefresh?: () => void; // Optional manual refresh for images not loading
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentPath,
  onBreadcrumbClick,
  onBackClick,
  onRefresh,
  onCreateFolderClick,
  onUploadClick,
  isUploading,
  onManualRefresh
}) => {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <BreadcrumbNav 
          currentPath={currentPath}
          onBreadcrumbClick={onBreadcrumbClick}
          onBackClick={onBackClick}
        />
        <Button 
          variant="outline" 
          size="icon" 
          onClick={(e) => {
            e.preventDefault();
            onRefresh();
          }} 
          title="Refresh"
          className="ml-2"
          type="button"
        >
          <RefreshCwIcon className="h-4 w-4" />
        </Button>
      </div>
      
      <ActionButtons
        onCreateFolderClick={onCreateFolderClick}
        onUploadClick={(e) => {
          // Ensure we're preventing default before passing to the handler
          e.preventDefault();
          e.stopPropagation();
          onUploadClick(e);
        }}
        isUploading={isUploading}
        onManualRefresh={onManualRefresh}
      />
    </div>
  );
};

export default DashboardHeader;
