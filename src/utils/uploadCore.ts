
import { nanoid } from 'nanoid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UploadProgress, CHUNK_SIZE, uploadProgressMap } from './uploadTypes';
import { updateProgress } from './uploadProgress';
import { 
  getResumableUploadData, 
  clearResumableUploadData 
} from './resumableUpload';
import { uploadFileChunked } from './uploadChunked';

// Upload a file to Supabase Storage with chunk support and resumability
export const uploadFileToSupabase = async (
  file: File, 
  folderId: string
): Promise<string> => {
  const fileId = nanoid();
  const fileName = file.name;
  const filePath = `${folderId}/${fileName}`;
  
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
    // Check for resumable upload
    let bytesUploaded = 0;
    const resumableData = getResumableUploadData(file, folderId);
    
    if (resumableData && resumableData.bytesUploaded > 0) {
      // We have a resumed upload
      bytesUploaded = resumableData.bytesUploaded;
      updateProgress(fileId, { 
        bytesUploaded, 
        progress: Math.round((bytesUploaded / file.size) * 100),
        status: 'uploading'
      });
      
      toast.info(`Resuming upload of ${fileName} at ${bytesUploaded} bytes`);
    } else {
      updateProgress(fileId, { status: 'uploading' });
    }
    
    // For small files (< 5MB) or when Supabase doesn't support chunked upload
    if (file.size <= CHUNK_SIZE) {
      updateProgress(fileId, { status: 'uploading' });
      
      // Manual progress tracking via XHR
      const { error: uploadError } = await supabase
        .storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Complete the upload
      updateProgress(fileId, { status: 'completed', progress: 100, bytesUploaded: file.size });
      clearResumableUploadData(file, folderId);
      
      const { data: publicUrl } = supabase
        .storage
        .from('images')
        .getPublicUrl(filePath);
        
      return publicUrl.publicUrl;
    } 
    
    // For larger files, we implement chunked upload with resume capability
    return await uploadFileChunked(file, folderId, fileId, filePath, bytesUploaded);
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
