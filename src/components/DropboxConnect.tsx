
import React from 'react';
import { Button } from '@/components/ui/button';
import { useDropbox } from '@/hooks/useDropbox';
import { LogOutIcon, LogInIcon, Loader2Icon, HardDriveIcon } from 'lucide-react';

const DropboxConnect: React.FC = () => {
  const { isConnected, isConnecting, connectToDropbox, disconnectFromDropbox } = useDropbox();

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Local Storage</h3>
          <p className="text-sm text-muted-foreground">
            {isConnected 
              ? 'Your images will be stored in your browser' 
              : 'Enable local storage for saving your images'}
          </p>
        </div>
        {isConnecting ? (
          <Button disabled variant="outline">
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Enabling...
          </Button>
        ) : isConnected ? (
          <Button onClick={disconnectFromDropbox} variant="outline">
            <LogOutIcon className="mr-2 h-4 w-4" />
            Disable
          </Button>
        ) : (
          <Button onClick={connectToDropbox}>
            <HardDriveIcon className="mr-2 h-4 w-4" />
            Enable Storage
          </Button>
        )}
      </div>
    </div>
  );
};

export default DropboxConnect;
