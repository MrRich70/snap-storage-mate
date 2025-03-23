
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
  onUploadClick: () => void;
  isUploading: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentPath,
  onBreadcrumbClick,
  onBackClick,
  onRefresh,
  onCreateFolderClick,
  onUploadClick,
  isUploading
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
          onClick={onRefresh} 
          title="Refresh"
          className="ml-2"
        >
          <RefreshCwIcon className="h-4 w-4" />
        </Button>
      </div>
      
      <ActionButtons
        onCreateFolderClick={onCreateFolderClick}
        onUploadClick={onUploadClick}
        isUploading={isUploading}
      />
    </div>
  );
};

export default DashboardHeader;
