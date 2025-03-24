
// Import from the source file first
import { uploadFileToSupabase } from './uploadCore';

// Then re-export it
export { uploadFileToSupabase };
export { retryUpload } from './uploadRetry';

/**
 * Helper function to upload a file to Supabase
 */
export const uploadToSupabase = async (
  file: File, 
  folderId: string, 
  isSharedStorage = false
): Promise<string> => {
  // Call our existing upload function
  return await uploadFileToSupabase(file, folderId, isSharedStorage);
};
