
import { nanoid } from 'nanoid';
import { uploadToStorage, getPublicUrl } from '@/integrations/supabase/storage';
import { toast } from 'sonner';
import { UploadProgress, CHUNK_SIZE, uploadProgressMap } from './uploadTypes';
import { updateProgress } from './uploadProgress';
import { 
  getResumableUploadData, 
  clearResumableUploadData 
} from './resumableUpload';

// Upload a file to Supabase Storage with progress tracking
export const uploadFileToSupabase = async (
  file: File, 
  folderId: string,
  isSharedStorage = false
): Promise<string> => {
  const fileId = nanoid();
  const fileName = file.name;
  const storagePrefix = isSharedStorage ? 'servpro' : 'user';
  const filePath = `${storagePrefix}/${folderId}/${fileId}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const bucket = 'images';
  
  // Initialize upload progress
  const initialProgress: UploadProgress = {
    id: fileId,
    fileName,
    progress: 0,
    status: 'pending',
    bytesUploaded: 0,
    totalBytes: file.size
  };
  
  uploadProgressMap.set(fileId, initialProgress);
  
  try {
    updateProgress(fileId, { status: 'uploading' });
    
    // Upload the file to Supabase storage
    let progress = 0;
    
    // Update progress every 200ms to provide visual feedback
    const interval = setInterval(() => {
      if (progress < 95) {
        progress += 5;
        const bytesUploaded = Math.floor((progress / 100) * file.size);
        updateProgress(fileId, { 
          progress, 
          bytesUploaded,
          status: 'uploading' 
        });
      }
    }, 200);
    
    // Actual upload to Supabase
    await uploadToStorage(bucket, filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
    
    clearInterval(interval);
    
    // Complete the upload
    updateProgress(fileId, { 
      status: 'completed', 
      progress: 100, 
      bytesUploaded: file.size 
    });
    
    // Get the public URL for the uploaded file
    const publicUrl = getPublicUrl(bucket, filePath);
    return publicUrl;
    
  } catch (error) {
    console.error('Upload error:', error);
    updateProgress(fileId, { 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    toast.error(`Failed to upload ${fileName}`);
    throw error;
  }
};
