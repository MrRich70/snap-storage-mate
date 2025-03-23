
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as dropboxService from '../services/dropboxService';

export const useDropbox = () => {
  const [isConnected, setIsConnected] = useState<boolean>(dropboxService.isConnected());
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for redirect callback from Dropbox
    const handleAuthRedirect = async () => {
      if (window.location.search.includes('code=')) {
        setIsConnecting(true);
        const success = await dropboxService.handleRedirect();
        setIsConnected(success);
        setIsConnecting(false);
      }
    };

    handleAuthRedirect();
  }, []);

  const connectToDropbox = async () => {
    try {
      const authUrl = dropboxService.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error initiating Dropbox connection:', error);
      toast.error('Failed to connect to Dropbox');
    }
  };

  const disconnectFromDropbox = () => {
    dropboxService.disconnectDropbox();
    setIsConnected(false);
    toast.success('Disconnected from Dropbox');
  };

  return {
    isConnected,
    isConnecting,
    connectToDropbox,
    disconnectFromDropbox
  };
};
