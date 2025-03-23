
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import { Folder } from '@/utils/storage';

interface BreadcrumbNavProps {
  currentPath: Folder[];
  onBreadcrumbClick: (folder: Folder) => void;
  onBackClick: () => void;
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  currentPath,
  onBreadcrumbClick,
  onBackClick,
}) => {
  return (
    <div className="flex items-center overflow-x-auto no-scrollbar">
      {currentPath.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="mr-1"
          onClick={onBackClick}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
      )}

      <div className="flex items-center space-x-1">
        {currentPath.map((folder, index) => (
          <React.Fragment key={folder.id}>
            {index > 0 && <span className="text-muted-foreground mx-1">/</span>}
            <button
              onClick={() => onBreadcrumbClick(folder)}
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
  );
};

export default BreadcrumbNav;
