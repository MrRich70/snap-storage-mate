
import { useState } from 'react';
import { toast } from 'sonner';

export const useDropbox = () => {
  const [isConnected, setIsConnected] = useState<boolean>(
    localStorage.getItem('localStorageEnabled') === 'true'
  );
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const connectToDropbox = async () => {
    try {
      localStorage.setItem('localStorageEnabled', 'true');
      setIsConnected(true);
      toast.success('Local storage enabled successfully!');
    } catch (error) {
      console.error('Error enabling local storage:', error);
      toast.error('Failed to enable local storage');
    }
  };

  const disconnectFromDropbox = () => {
    localStorage.setItem('localStorageEnabled', 'false');
    setIsConnected(false);
    toast.success('Local storage disabled');
  };

  return {
    isConnected,
    isConnecting,
    connectToDropbox,
    disconnectFromDropbox
  };
};
