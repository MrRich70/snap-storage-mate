
import React, { useState } from 'react';
import { 
  ImageIcon, 
  MoreVerticalIcon,
  Edit2Icon,
  Trash2Icon,
  DownloadIcon,
  ZoomInIcon
} from 'lucide-react';
import { ImageFile } from '@/utils/storage';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ImageGridProps {
  files: ImageFile[];
  onRenameFile: (file: ImageFile) => void;
  onDeleteFile: (file: ImageFile) => void;
  onDownloadFile: (file: ImageFile) => void;
  onViewFile: (file: ImageFile) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({
  files,
  onRenameFile,
  onDeleteFile,
  onDownloadFile,
  onViewFile
}) => {
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <ImageIcon className="h-12 w-12 mb-2 opacity-40" />
        <p>No images found</p>
      </div>
    );
  }

  const handleImageLoad = (id: string) => {
    setLoaded(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-fade-in">
      {files.map((file) => (
        <div
          key={file.id}
          className="group relative flex flex-col border rounded-lg overflow-hidden bg-card transition-all duration-200 hover:shadow-md animate-slide-up"
        >
          <div 
            className="h-32 flex items-center justify-center overflow-hidden bg-muted cursor-pointer relative"
            onClick={() => onViewFile(file)}
          >
            {!loaded[file.id] && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin-slow"></div>
              </div>
            )}
            
            <img
              src={file.thumbnailUrl}
              alt={file.name}
              className={`h-full w-full object-cover transition-opacity duration-300 ${loaded[file.id] ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => handleImageLoad(file.id)}
            />
            
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <ZoomInIcon className="text-white h-8 w-8" />
            </div>
          </div>

          <div className="p-3 flex-1 flex flex-col">
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium truncate max-w-[80%]">
                {file.name}
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 ml-auto -mr-2 -mt-1"
                  >
                    <MoreVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewFile(file)}>
                    <ZoomInIcon className="mr-2 h-4 w-4" />
                    <span>View</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDownloadFile(file)}>
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    <span>Download</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onRenameFile(file)}>
                    <Edit2Icon className="mr-2 h-4 w-4" />
                    <span>Rename</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDeleteFile(file)}
                  >
                    <Trash2Icon className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="mt-1 flex items-center text-xs text-muted-foreground">
              <span>
                {(file.size / 1024).toFixed(0)} KB
              </span>
              <span className="mx-1">•</span>
              <span>
                {new Date(file.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
