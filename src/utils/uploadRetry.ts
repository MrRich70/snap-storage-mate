
import { uploadProgressMap } from './uploadTypes';
import { updateProgress } from './uploadProgress';
import { uploadFileToSupabase } from './uploadCore';

// Retry a failed upload
export const retryUpload = async (
  uploadId: string, 
  file: File, 
  folderId: string
): Promise<string> => {
  const progress = uploadProgressMap.get(uploadId);
  if (!progress) {
    throw new Error(`Upload with ID ${uploadId} not found`);
  }
  
  // Reset progress to resume state
  updateProgress(uploadId, {
    status: 'uploading',
    error: undefined
  });
  
  try {
    // Use the same upload function but it will resume from where it left off
    return await uploadFileToSupabase(file, folderId);
  } catch (error) {
    console.error('Retry failed:', error);
    updateProgress(uploadId, { 
      status: 'error', 
      error: error.message || 'Retry failed'
    });
    throw error;
  }
};
