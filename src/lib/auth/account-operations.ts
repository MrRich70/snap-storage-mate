
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Deletes the current user's account
 */
export const deleteUserAccount = async (email: string, password: string): Promise<boolean> => {
  try {
    // First verify the credentials by signing in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (signInError || !signInData.user) {
      toast.error('Invalid credentials. Account deletion failed.');
      return false;
    }
    
    // Use the direct RPC call to delete_user function
    const { error } = await supabase.rpc('delete_user');
    
    if (error) {
      console.error('Account deletion error:', error);
      toast.error(`Account deletion failed: ${error.message}`);
      return false;
    }
    
    toast.success('Your account has been permanently deleted.');
    
    // Force logout after account deletion
    await supabase.auth.signOut();
    
    return true;
  } catch (error) {
    console.error('Account deletion error:', error);
    toast.error('Account deletion failed due to an unexpected error.');
    return false;
  }
};
