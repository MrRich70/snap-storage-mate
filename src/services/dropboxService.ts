
import { Dropbox } from 'dropbox';
import { toast } from 'sonner';

// Replace with your actual Dropbox app credentials
const CLIENT_ID = 'YOUR_DROPBOX_APP_KEY';
const REDIRECT_URI = `${window.location.origin}/dashboard`;

// Store tokens in localStorage
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'dropbox_access_token',
  REFRESH_TOKEN: 'dropbox_refresh_token',
};

export const createDropboxClient = (accessToken?: string) => {
  return new Dropbox({ clientId: CLIENT_ID, accessToken });
};

export const getAuthUrl = () => {
  const dbx = createDropboxClient();
  return dbx.auth.getAuthenticationUrl(REDIRECT_URI, undefined, 'code', 'offline', undefined, undefined, true);
};

export const isConnected = (): boolean => {
  return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

export const handleRedirect = async (): Promise<boolean> => {
  // Extract authorization code from URL
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (!code) return false;

  try {
    const dbx = createDropboxClient();
    const response = await dbx.auth.getAccessTokenFromCode(REDIRECT_URI, code);
    
    if (response.result.access_token) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.result.access_token);
      
      if (response.result.refresh_token) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.result.refresh_token);
      }
      
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      toast.success('Connected to Dropbox successfully!');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error connecting to Dropbox:', error);
    toast.error('Failed to connect to Dropbox');
    return false;
  }
};

export const disconnectDropbox = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  toast.info('Disconnected from Dropbox');
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

export const refreshToken = async (): Promise<boolean> => {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (!refreshToken) return false;
  
  try {
    const dbx = createDropboxClient();
    const response = await dbx.auth.refreshAccessToken(refreshToken);
    
    if (response.result.access_token) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.result.access_token);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error refreshing Dropbox token:', error);
    return false;
  }
};
