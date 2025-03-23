
import { supabase } from './client';

/**
 * Gets a public URL for a file in Supabase storage
 */
export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Uploads a file to Supabase storage
 */
export const uploadToStorage = async (
  bucket: string, 
  path: string, 
  file: File, 
  options?: { 
    cacheControl?: string; 
    upsert?: boolean;
    onProgress?: (progress: number) => void;
  }
) => {
  const { cacheControl = '3600', upsert = true } = options || {};
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl,
      upsert
    });
    
  if (error) throw error;
  return data;
};

/**
 * Deletes a file from Supabase storage
 */
export const deleteFromStorage = async (bucket: string, path: string) => {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
  return true;
};
