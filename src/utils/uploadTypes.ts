
/**
 * Types for upload operations
 */

export interface UploadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'error';
  bytesUploaded: number;
  totalBytes: number;
  error?: string;
}

// Maximum chunk size for chunked uploads (5MB)
export const CHUNK_SIZE = 5 * 1024 * 1024;

// Storage for tracking upload progress
export const uploadProgressMap = new Map<string, UploadProgress>();
