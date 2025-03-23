
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, ImageFile, getFolders, moveFile } from '@/utils/storage';
import { FolderIcon, ArrowRightIcon, CheckIcon } from 'lucide-react';
import { toast } from 'sonner';

interface MoveFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFiles: string[];
  files: ImageFile[];
  currentFolderId: string;
  onSuccess: () => void;
}

const MoveFilesModal: React.FC<MoveFilesModalProps> = ({
  isOpen,
  onClose,
  selectedFiles,
  files,
  currentFolderId,
  onSuccess
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load all folders
      const allFolders = getFolders();
      // Filter out the current folder from the list
      const availableFolders = allFolders.filter(folder => folder.id !== currentFolderId);
      setFolders(availableFolders);
      setSelectedFolderId(null);
    }
  }, [isOpen, currentFolderId]);

  const handleMoveFiles = async () => {
    if (!selectedFolderId || selectedFiles.length === 0) return;
    
    setIsMoving(true);
    
    try {
      const filesToMove = files.filter(file => selectedFiles.includes(file.id));
      
      // Process files one by one to ensure all files get moved
      for (const file of filesToMove) {
        await moveFile(file.id, currentFolderId, selectedFolderId);
      }
      
      toast.success(`${selectedFiles.length} files moved successfully`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error moving files:', error);
      toast.error('Failed to move some files');
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move {selectedFiles.length} files</DialogTitle>
        </DialogHeader>
        
        {folders.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            <FolderIcon className="mx-auto h-10 w-10 opacity-40 mb-2" />
            <p>No folders available to move files to</p>
            <p className="text-sm mt-1">Create a new folder first</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[50vh] mt-4">
            <div className="space-y-1">
              {folders.map(folder => (
                <div
                  key={folder.id}
                  className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                    selectedFolderId === folder.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedFolderId(folder.id)}
                >
                  <FolderIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="flex-1 truncate">{folder.name}</span>
                  
                  {selectedFolderId === folder.id && (
                    <CheckIcon className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <DialogFooter className="gap-2 sm:gap-0">
          <div className="w-full flex items-center justify-between gap-2">
            <Button variant="outline" onClick={onClose} disabled={isMoving}>
              Cancel
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedFolderId 
                  ? `Moving to: ${folders.find(f => f.id === selectedFolderId)?.name}` 
                  : 'Select a destination folder'}
              </span>
              
              <Button 
                onClick={handleMoveFiles} 
                disabled={!selectedFolderId || isMoving}
                className="gap-1"
              >
                {isMoving ? (
                  <span>Moving...</span>
                ) : (
                  <>
                    <ArrowRightIcon className="h-4 w-4" />
                    <span>Move Files</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveFilesModal;
