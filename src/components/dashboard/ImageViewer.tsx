
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { ImageFile } from '@/utils/storage';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFile: ImageFile | null;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  isOpen,
  onClose,
  selectedFile,
}) => {
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="sm:max-w-4xl glass backdrop-blur-xl p-1 animate-zoom-in">
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60"
            onClick={onClose}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-center w-full h-full max-h-[80vh] overflow-hidden">
          {selectedFile && (
            <img
              src={selectedFile.url}
              alt={selectedFile.name}
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>
        
        {selectedFile && (
          <div className="p-2 text-center">
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {(selectedFile.size / 1024).toFixed(0)} KB • 
              {new Date(selectedFile.updatedAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
