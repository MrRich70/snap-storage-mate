
import { uploadProgressMap } from './uploadTypes';
import { updateProgress } from './uploadProgress';
import { uploadFileToSupabase } from './uploadCore';

// Retry a failed upload
export const retryUpload = async (
  uploadId: string, 
  file: File, 
  folderId: string,
  isSharedStorage = false
): Promise<string> => {
  const progress = uploadProgressMap.get(uploadId);
  if (!progress) {
    throw new Error(`Upload with ID ${uploadId} not found`);
  }
  
  // Reset progress to resume state
  updateProgress(uploadId, {
    status: 'uploading',
    progress: 0,
    bytesUploaded: 0,
    error: undefined
  });
  
  try {
    // Start a new upload with the same file and return the public URL
    const publicUrl = await uploadFileToSupabase(file, folderId, isSharedStorage);
    return publicUrl;
  } catch (error) {
    console.error('Retry failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Retry failed';
    updateProgress(uploadId, { 
      status: 'error', 
      error: errorMessage
    });
    throw error;
  }
};
