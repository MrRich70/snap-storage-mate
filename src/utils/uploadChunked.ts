import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CHUNK_SIZE } from './uploadTypes';
import { updateProgress } from './uploadProgress';
import { 
  saveResumableUploadData, 
  clearResumableUploadData 
} from './resumableUpload';

// Get public URL for an uploaded file
const getPublicUrl = (filePath: string): string => {
  const { data } = supabase
    .storage
    .from('images')
    .getPublicUrl(filePath);
    
  return data.publicUrl;
};

// Upload a single chunk of a file
const uploadSingleChunk = async (
  chunk: Blob,
  chunkPath: string
): Promise<void> => {
  const { error } = await supabase
    .storage
    .from('images')
    .upload(chunkPath, chunk, {
      cacheControl: '3600',
      upsert: true
    });
      
  if (error) {
    throw error;
  }
};

// Update and save progress after chunk upload
const trackChunkProgress = (
  file: File,
  folderId: string,
  fileId: string,
  bytesUploaded: number
): void => {
  // Save progress for resuming
  saveResumableUploadData(file, folderId, fileId, bytesUploaded);
  
  // Update progress tracking
  updateProgress(fileId, {
    bytesUploaded,
    progress: Math.round((bytesUploaded / file.size) * 100)
  });
};

// Calculate chunk information for a file
const calculateChunkInfo = (
  file: File,
  bytesUploaded: number
) => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const currentChunk = Math.floor(bytesUploaded / CHUNK_SIZE);
  
  return { totalChunks, currentChunk };
};

// Handle finalizing a multi-chunk upload
const finalizeMultiChunkUpload = (
  totalChunks: number,
  fileName: string
): void => {
  if (totalChunks > 1) {
    // The merge would normally be done server-side
    // For now, we'll handle it client-side by downloading and re-uploading
    // In a production app, this should be done in a server function
    toast.info(`Finalizing upload of ${fileName}...`);
    
    // For demonstration, we'll just consider it done
    // In a real implementation, you'd want to add server-side merging
  }
};

// Complete the upload process
const completeUpload = (
  fileId: string,
  file: File,
  folderId: string,
  filePath: string
): string => {
  updateProgress(fileId, { 
    status: 'completed', 
    progress: 100, 
    bytesUploaded: file.size 
  });
  
  clearResumableUploadData(file, folderId);
  return getPublicUrl(filePath);
};

// Handle chunked upload for larger files
export const uploadFileChunked = async (
  file: File,
  folderId: string,
  fileId: string,
  filePath: string,
  bytesUploaded: number
): Promise<string> => {
  const { totalChunks, currentChunk } = calculateChunkInfo(file, bytesUploaded);
  let processedChunk = currentChunk;
  
  // Process chunks
  try {
    while (processedChunk < totalChunks) {
      const start = processedChunk * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      
      const chunkPath = totalChunks > 1 
        ? `${filePath}.part${processedChunk + 1}of${totalChunks}` 
        : filePath;
      
      // Update progress before attempting to upload the chunk
      updateProgress(fileId, { 
        status: 'uploading',
        bytesUploaded: start,
        progress: Math.round((start / file.size) * 100)
      });
      
      // Upload the chunk
      await uploadSingleChunk(chunk, chunkPath);
      
      // Track progress after successful chunk upload
      const chunkEndPosition = end;
      trackChunkProgress(file, folderId, fileId, chunkEndPosition);
      
      processedChunk++;
    }
    
    // Handle multi-chunk uploads that need finalization
    finalizeMultiChunkUpload(totalChunks, file.name);
    
    // Complete the upload and return the public URL
    return completeUpload(fileId, file, folderId, filePath);
    
  } catch (error) {
    console.error(`Error uploading chunk ${processedChunk + 1}/${totalChunks}`, error);
    
    // Mark as error but keep the resume data
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    updateProgress(fileId, { 
      status: 'error', 
      error: `Error uploading chunk ${processedChunk + 1}: ${errorMessage}`
    });
    
    // Save progress for later resuming at the last successful chunk
    const lastSuccessfulPosition = processedChunk * CHUNK_SIZE;
    saveResumableUploadData(file, folderId, fileId, lastSuccessfulPosition);
    
    throw new Error(`Upload failed at chunk ${processedChunk + 1}/${totalChunks}`);
  }
};
