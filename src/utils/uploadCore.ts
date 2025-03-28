
import { supabase } from '@/integrations/supabase/client';

/**
 * Function to upload a file to Supabase storage
 */
export const uploadFileToSupabase = async (
  file: File,
  folderId: string,
  userId: string = 'anonymous'
): Promise<string> => {
  try {
    console.log(`Uploading file to Supabase: ${file.name}, folder: ${folderId}, user: ${userId}`);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${folderId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error("Supabase upload error:", error);
      throw error;
    }
    
    console.log("Supabase upload successful:", data);
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('files')
      .getPublicUrl(filePath);
    
    console.log("Generated public URL:", publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file to Supabase:', error);
    throw error;
  }
};
