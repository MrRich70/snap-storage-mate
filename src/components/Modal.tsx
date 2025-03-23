
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  showInput?: boolean;
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  title,
  isOpen,
  onClose,
  onConfirm,
  defaultValue = '',
  placeholder = '',
  confirmText = 'Confirm',
  showInput = true,
  children
}) => {
  const [value, setValue] = useState(defaultValue);
  
  // Reset value when modal opens
  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);
  
  const handleConfirm = () => {
    if (showInput && !value.trim()) return;
    onConfirm(value);
    onClose();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md glass backdrop-blur-xl animate-zoom-in">
        <DialogHeader className="flex flex-row items-center">
          <DialogTitle>{title}</DialogTitle>
          <Button
            className="ml-auto h-8 w-8 p-0"
            size="icon"
            variant="ghost"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="py-4">
          {showInput ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modal-input">Name</Label>
                <Input
                  id="modal-input"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  autoFocus
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          ) : (
            children
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={showInput && !value.trim()}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
