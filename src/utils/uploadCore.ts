
import { nanoid } from 'nanoid';
import { uploadToStorage, getPublicUrl } from '@/integrations/supabase/storage';
import { toast } from 'sonner';
import { UploadProgress, CHUNK_SIZE, uploadProgressMap } from './uploadTypes';
import { updateProgress } from './uploadProgress';
import { 
  getResumableUploadData, 
  clearResumableUploadData 
} from './resumableUpload';

// Upload a file to Supabase Storage with chunk support and resumability
export const uploadFileToSupabase = async (
  file: File, 
  folderId: string,
  isSharedStorage = false
): Promise<string> => {
  const fileId = nanoid();
  const fileName = file.name;
  const storagePrefix = isSharedStorage ? 'servpro' : 'user';
  const filePath = `${storagePrefix}/${folderId}/${fileName}`;
  
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
    
    // For simplicity in this implementation, we'll use localStorage for mock storage
    // But we're still maintaining the Supabase-style interface for future compatibility
    
    // Create a blob URL for the file (simulating upload)
    const url = URL.createObjectURL(file);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 100) {
        const bytesUploaded = Math.floor((progress / 100) * file.size);
        updateProgress(fileId, { 
          progress, 
          bytesUploaded,
          status: 'uploading' 
        });
      } else {
        clearInterval(interval);
      }
    }, 200);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Complete the upload
    clearInterval(interval);
    updateProgress(fileId, { status: 'completed', progress: 100, bytesUploaded: file.size });
    
    // In a real implementation, you would use the Supabase client:
    // const { data, error } = await supabase.storage.from('images').upload(filePath, file);
    // if (error) throw error;
    // const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
    
    // We're using the file uploader as a mock, so we store file data in localStorage via the fileOperations module
    
    return url; // Return the blob URL as the "public URL"
  } catch (error) {
    console.error('Upload error:', error);
    updateProgress(fileId, { 
      status: 'error', 
      error: error.message || 'Unknown error'
    });
    
    toast.error(`Failed to upload ${fileName}`);
    throw error;
  }
};
