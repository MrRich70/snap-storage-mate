import { v4 as uuidv4 } from 'uuid';
import { uploadToSupabase } from './uploadCore';
import { getUserStorageKey } from './storage';

// Store upload progress in memory
const uploadProgressMap = new Map<string, {
  id: string;
  fileName: string;
  progress: number;
  status: string;
  bytesUploaded: number;
  totalBytes: number;
  error?: string;
}>();

// Get current upload progress
export const getUploadProgress = () => {
  return Array.from(uploadProgressMap.values());
};

// Clear completed uploads
export const clearCompletedUploads = () => {
  for (const [id, data] of uploadProgressMap.entries()) {
    if (data.status === 'completed' || data.status === 'error') {
      uploadProgressMap.delete(id);
    }
  }
};

// Cancel an upload
export const cancelUpload = (uploadId: string) => {
  if (uploadProgressMap.has(uploadId)) {
    uploadProgressMap.set(uploadId, {
      ...uploadProgressMap.get(uploadId)!,
      status: 'error',
      error: 'Cancelled by user'
    });
  }
};

// Retry a failed upload
export const retryUpload = async (
  uploadId: string,
  file: File,
  folderId: string
): Promise<void> => {
  if (!uploadProgressMap.has(uploadId)) {
    throw new Error('Upload not found');
  }

  // Reset progress
  uploadProgressMap.set(uploadId, {
    id: uploadId,
    fileName: file.name,
    progress: 0,
    status: 'uploading',
    bytesUploaded: 0,
    totalBytes: file.size
  });

  try {
    const userId = localStorage.getItem('servpro_current_user') || 'anonymous';
    
    // Track progress
    let lastProgress = 0;
    const progressInterval = setInterval(() => {
      // Simulate progress updates
      if (lastProgress < 100) {
        lastProgress += Math.random() * 20;
        if (lastProgress > 100) lastProgress = 100;
        
        uploadProgressMap.set(uploadId, {
          ...uploadProgressMap.get(uploadId)!,
          progress: lastProgress,
          bytesUploaded: Math.floor(file.size * (lastProgress / 100))
        });
      }
    }, 500);

    // Upload to Supabase
    await uploadToSupabase(file, folderId, userId);
    
    clearInterval(progressInterval);
    
    // Mark as completed
    uploadProgressMap.set(uploadId, {
      ...uploadProgressMap.get(uploadId)!,
      progress: 100,
      status: 'completed',
      bytesUploaded: file.size
    });
  } catch (error) {
    // Mark as failed
    uploadProgressMap.set(uploadId, {
      ...uploadProgressMap.get(uploadId)!,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

// Upload a file to Supabase with progress tracking
export const uploadToSupabase = async (
  file: File,
  folderId: string,
  userId: string = 'anonymous'
): Promise<string> => {
  const uploadId = uuidv4();
  
  // Initialize progress tracking
  uploadProgressMap.set(uploadId, {
    id: uploadId,
    fileName: file.name,
    progress: 0,
    status: 'uploading',
    bytesUploaded: 0,
    totalBytes: file.size
  });
  
  try {
    // Track progress
    let lastProgress = 0;
    const progressInterval = setInterval(() => {
      // Simulate progress updates
      if (lastProgress < 95) {  // Only go to 95% until we confirm upload is complete
        lastProgress += Math.random() * 15;
        if (lastProgress > 95) lastProgress = 95;
        
        uploadProgressMap.set(uploadId, {
          ...uploadProgressMap.get(uploadId)!,
          progress: lastProgress,
          bytesUploaded: Math.floor(file.size * (lastProgress / 100))
        });
      }
    }, 500);
    
    // Perform the actual upload
    const publicUrl = await uploadFileToSupabase(file, folderId, userId);
    
    clearInterval(progressInterval);
    
    // Mark as completed
    uploadProgressMap.set(uploadId, {
      ...uploadProgressMap.get(uploadId)!,
      progress: 100,
      status: 'completed',
      bytesUploaded: file.size
    });
    
    return publicUrl;
  } catch (error) {
    // Mark as failed
    uploadProgressMap.set(uploadId, {
      ...uploadProgressMap.get(uploadId)!,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

// Helper function to upload file to Supabase
const uploadFileToSupabase = async (
  file: File,
  folderId: string,
  userId: string
): Promise<string> => {
  try {
    return await uploadToSupabase(file, folderId, userId);
  } catch (error) {
    console.error('Error in uploadFileToSupabase:', error);
    throw error;
  }
};
