
import React from 'react';
import { Button } from '@/components/ui/button';
import { useDropbox } from '@/hooks/useDropbox';
import { LogOutIcon, LogInIcon, Loader2Icon } from 'lucide-react';

const DropboxConnect: React.FC = () => {
  const { isConnected, isConnecting, connectToDropbox, disconnectFromDropbox } = useDropbox();

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Dropbox Connection</h3>
          <p className="text-sm text-muted-foreground">
            {isConnected 
              ? 'Your account is connected to Dropbox' 
              : 'Connect your account to Dropbox for storage'}
          </p>
        </div>
        {isConnecting ? (
          <Button disabled variant="outline">
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </Button>
        ) : isConnected ? (
          <Button onClick={disconnectFromDropbox} variant="outline">
            <LogOutIcon className="mr-2 h-4 w-4" />
            Disconnect
          </Button>
        ) : (
          <Button onClick={connectToDropbox}>
            <LogInIcon className="mr-2 h-4 w-4" />
            Connect Dropbox
          </Button>
        )}
      </div>
    </div>
  );
};

export default DropboxConnect;
