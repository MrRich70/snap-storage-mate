
import { supabase } from '@/integrations/supabase/client';

/**
 * Sets up real-time listeners for files and folders
 * @param onFoldersChanged Callback when folders change
 * @param onFilesChanged Callback when files change
 * @param currentFolderId Current folder ID to filter files for
 * @returns Cleanup function
 */
export const setupRealtimeSync = (
  onFoldersChanged: () => void,
  onFilesChanged: () => void,
  currentFolderId: string
) => {
  console.log('Setting up real-time sync for folder:', currentFolderId);
  
  // Create a channel for listening to changes
  const channel = supabase.channel('storage-changes')
    .on('broadcast', { event: 'folder_changed' }, (payload) => {
      console.log('Received folder_changed event', payload);
      onFoldersChanged();
    })
    .on('broadcast', { event: 'file_changed' }, (payload) => {
      console.log('Received file_changed event with payload:', payload);
      // Only refresh files if the change is relevant to current folder
      if (!payload.payload || payload.payload.folderId === currentFolderId) {
        onFilesChanged();
      }
    })
    .subscribe((status) => {
      console.log('Real-time channel status:', status);
    });

  // Return a cleanup function
  return () => {
    console.log('Cleaning up real-time sync');
    supabase.removeChannel(channel);
  };
};

/**
 * Broadcast a folder change event to all clients
 */
export const broadcastFolderChanged = async () => {
  console.log('Broadcasting folder_changed event');
  const timestamp = new Date().toISOString();
  try {
    await supabase.channel('storage-changes').send({
      type: 'broadcast',
      event: 'folder_changed',
      payload: { timestamp }
    });
  } catch (error) {
    console.error('Error broadcasting folder change:', error);
  }
};

/**
 * Broadcast a file change event to all clients
 * @param folderId Folder ID where the change occurred
 */
export const broadcastFileChanged = async (folderId: string) => {
  console.log('Broadcasting file_changed event for folder:', folderId);
  const timestamp = new Date().toISOString();
  try {
    await supabase.channel('storage-changes').send({
      type: 'broadcast',
      event: 'file_changed',
      payload: { folderId, timestamp }
    });
  } catch (error) {
    console.error('Error broadcasting file change:', error);
  }
};
