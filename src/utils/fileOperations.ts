
import { nanoid } from 'nanoid';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ImageFile } from './storageTypes';
import { uploadFileToSupabase } from './uploadUtils';

// Get all files in a specific folder
export const getFiles = async (folderId: string): Promise<ImageFile[]> => {
  try {
    const { data, error } = await supabase
      .storage
      .from('images')
      .list(`${folderId}/`, {
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to fetch files');
      return [];
    }
    
    const imageFiles: ImageFile[] = [];
    
    for (const item of data || []) {
      if (!item.name.startsWith('.')) { // Skip hidden files
        const fileId = item.id || nanoid();
        const filePath = `${folderId}/${item.name}`;
        
        const { data: publicUrl } = supabase
          .storage
          .from('images')
          .getPublicUrl(filePath);
          
        const { data: thumbnailUrl } = supabase
          .storage
          .from('images')
          .getPublicUrl(filePath);
          
        imageFiles.push({
          id: fileId,
          name: item.name,
          url: publicUrl.publicUrl,
          thumbnailUrl: thumbnailUrl.publicUrl,
          size: item.metadata?.size || 0,
          type: item.metadata?.mimetype || '',
          folderId: folderId,
          createdAt: item.created_at || new Date().toISOString(),
          updatedAt: item.updated_at || new Date().toISOString()
        });
      }
    }
    
    return imageFiles;
  } catch (error) {
    console.error('Error fetching files:', error);
    toast.error('Failed to fetch files');
    return [];
  }
};

// Upload a file to Supabase Storage
export const uploadFile = async (file: File, folderId: string): Promise<ImageFile> => {
  const fileExt = file.name.split('.').pop();
  const fileId = nanoid();
  const fileName = file.name;

  try {
    // Use the enhanced upload utility
    const publicUrl = await uploadFileToSupabase(file, folderId);
    
    const newFile: ImageFile = {
      id: fileId,
      name: fileName,
      url: publicUrl,
      thumbnailUrl: publicUrl,
      size: file.size,
      type: file.type,
      folderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return newFile;
  } catch (error) {
    console.error('Upload error:', error);
    toast.error('Failed to upload file');
    throw error;
  }
};

// Rename a file
export const renameFile = async (fileId: string, newName: string, folderId: string): Promise<boolean> => {
  try {
    // Get the files in the folder to find the file
    const files = await getFiles(folderId);
    const file = files.find(f => f.id === fileId);
    
    if (!file) {
      toast.error('File not found');
      return false;
    }
    
    // Copy the file with the new name
    const { error: copyError } = await supabase
      .storage
      .from('images')
      .copy(`${folderId}/${file.name}`, `${folderId}/${newName}`);
      
    if (copyError) {
      throw copyError;
    }
    
    // Delete the original file
    const { error: deleteError } = await supabase
      .storage
      .from('images')
      .remove([`${folderId}/${file.name}`]);
      
    if (deleteError) {
      throw deleteError;
    }
    
    toast.success(`File renamed to "${newName}"`);
    return true;
  } catch (error) {
    console.error('Rename error:', error);
    toast.error('Failed to rename file');
    return false;
  }
};

// Move a file from one folder to another
export const moveFile = async (fileId: string, sourceFolderId: string, targetFolderId: string): Promise<boolean> => {
  try {
    // Get the files in the source folder to find the file
    const files = await getFiles(sourceFolderId);
    const file = files.find(f => f.id === fileId);
    
    if (!file) {
      toast.error('File not found');
      return false;
    }
    
    // Copy the file to the target folder
    const { error: copyError } = await supabase
      .storage
      .from('images')
      .copy(`${sourceFolderId}/${file.name}`, `${targetFolderId}/${file.name}`);
      
    if (copyError) {
      throw copyError;
    }
    
    // Delete the file from the source folder
    const { error: deleteError } = await supabase
      .storage
      .from('images')
      .remove([`${sourceFolderId}/${file.name}`]);
      
    if (deleteError) {
      throw deleteError;
    }
    
    return true;
  } catch (error) {
    console.error('Move error:', error);
    throw error;
  }
};

// Delete a file
export const deleteFile = async (fileId: string, folderId: string): Promise<boolean> => {
  try {
    // Get the files in the folder to find the file
    const files = await getFiles(folderId);
    const file = files.find(f => f.id === fileId);
    
    if (!file) {
      toast.error('File not found');
      return false;
    }
    
    const { error } = await supabase
      .storage
      .from('images')
      .remove([`${folderId}/${file.name}`]);
      
    if (error) {
      throw error;
    }
    
    toast.success('File deleted');
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    toast.error('Failed to delete file');
    return false;
  }
};

// Download a file
export const downloadFile = (file: ImageFile): void => {
  const link = document.createElement('a');
  link.href = file.url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success(`Downloading "${file.name}"`);
};
