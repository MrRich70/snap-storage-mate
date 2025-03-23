
import React from 'react';
import { 
  FolderIcon, 
  MoreVerticalIcon,
  Edit2Icon,
  Trash2Icon
} from 'lucide-react';
import { Folder } from '@/utils/storage';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FolderGridProps {
  folders: Folder[];
  onFolderClick: (folder: Folder) => void;
  onRenameFolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => void;
}

const FolderGrid: React.FC<FolderGridProps> = ({
  folders,
  onFolderClick,
  onRenameFolder,
  onDeleteFolder
}) => {
  if (folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <FolderIcon className="h-12 w-12 mb-2 opacity-40" />
        <p>No folders found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-fade-in">
      {folders.map((folder) => (
        <div
          key={folder.id}
          className="group relative flex flex-col items-center p-4 rounded-lg border bg-card transition-all duration-200 hover:shadow-md hover:bg-accent/30 cursor-pointer animate-slide-up"
          onClick={(e) => {
            // Don't open folder if dropdown was clicked
            const target = e.target as HTMLElement;
            if (!target.closest('.dropdown-trigger')) {
              onFolderClick(folder);
            }
          }}
        >
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity dropdown-trigger"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenameFolder(folder);
                  }}
                >
                  <Edit2Icon className="mr-2 h-4 w-4" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(folder);
                  }}
                >
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mb-3">
            <FolderIcon className="h-12 w-12 text-primary/80" />
          </div>
          <span className="text-sm font-medium truncate max-w-full px-2">
            {folder.name}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            {new Date(folder.createdAt).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default FolderGrid;
