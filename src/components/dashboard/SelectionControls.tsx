
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckSquare, Trash2Icon, DownloadIcon, XIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { ImageFile } from '@/utils/storage';

interface SelectionControlsProps {
  selectionMode: boolean;
  setSelectionMode: (mode: boolean) => void;
  selectedFiles: string[];
  allFiles: ImageFile[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDeleteSelected: () => void;
  onDownloadSelected: () => void;
}

const SelectionControls: React.FC<SelectionControlsProps> = ({
  selectionMode,
  setSelectionMode,
  selectedFiles,
  allFiles,
  onSelectAll,
  onDeselectAll,
  onDeleteSelected,
  onDownloadSelected
}) => {
  const allSelected = selectedFiles.length === allFiles.length && allFiles.length > 0;
  const someSelected = selectedFiles.length > 0 && selectedFiles.length < allFiles.length;
  
  return (
    <div className="flex items-center space-x-4 mb-4">
      <div className="flex items-center space-x-2">
        <Switch
          checked={selectionMode}
          onCheckedChange={setSelectionMode}
          id="selection-mode"
        />
        <label 
          htmlFor="selection-mode" 
          className="text-sm font-medium cursor-pointer"
        >
          Selection Mode
        </label>
      </div>
      
      {selectionMode && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="flex items-center gap-1"
            disabled={allFiles.length === 0}
          >
            <CheckSquare className="h-4 w-4" />
            <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
          </Button>
          
          {selectedFiles.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onDownloadSelected}
                className="flex items-center gap-1"
              >
                <DownloadIcon className="h-4 w-4" />
                <span>Download {selectedFiles.length}</span>
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={onDeleteSelected}
                className="flex items-center gap-1"
              >
                <Trash2Icon className="h-4 w-4" />
                <span>Delete {selectedFiles.length}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onDeselectAll}
                className="flex items-center gap-1"
              >
                <XIcon className="h-4 w-4" />
                <span>Clear</span>
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SelectionControls;
