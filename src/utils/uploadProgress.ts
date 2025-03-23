
import { UploadProgress, uploadProgressMap } from './uploadTypes';

// Get upload progress for all files
export const getUploadProgress = (): UploadProgress[] => {
  return Array.from(uploadProgressMap.values());
};

// Get a single upload's progress
export const getUploadProgressById = (id: string): UploadProgress | undefined => {
  return uploadProgressMap.get(id);
};

// Clear completed uploads from progress tracking
export const clearCompletedUploads = () => {
  for (const [id, progress] of uploadProgressMap.entries()) {
    if (progress.status === 'completed' || progress.status === 'error') {
      uploadProgressMap.delete(id);
    }
  }
};

// Helper to update progress
export const updateProgress = (
  id: string, 
  updates: Partial<UploadProgress>
): UploadProgress => {
  const current = uploadProgressMap.get(id);
  if (!current) {
    throw new Error(`Upload with ID ${id} not found`);
  }
  
  const updated = { ...current, ...updates };
  uploadProgressMap.set(id, updated);
  return updated;
};

// Cancel an ongoing upload
export const cancelUpload = (uploadId: string): boolean => {
  const progress = uploadProgressMap.get(uploadId);
  if (!progress) {
    return false;
  }
  
  uploadProgressMap.delete(uploadId);
  return true;
};
