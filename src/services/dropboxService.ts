
// We're replacing Dropbox with localStorage, so we'll simplify this service

export const isConnected = (): boolean => {
  return localStorage.getItem('localStorageEnabled') === 'true';
};

export const getAuthUrl = (): string => {
  return '#enable-local-storage';
};

export const handleRedirect = async (): Promise<boolean> => {
  localStorage.setItem('localStorageEnabled', 'true');
  return true;
};

export const disconnectDropbox = (): void => {
  localStorage.setItem('localStorageEnabled', 'false');
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem('localStorageEnabled') === 'true' ? 'local-storage-token' : null;
};

export const refreshToken = async (): Promise<boolean> => {
  return localStorage.getItem('localStorageEnabled') === 'true';
};
