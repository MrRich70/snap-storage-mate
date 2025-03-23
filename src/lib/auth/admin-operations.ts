
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthUser } from './types';

export const getAllUsers = async (): Promise<AuthUser[]> => {
  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profileError) {
      toast.error(`Failed to fetch users: ${profileError.message}`);
      return [];
    }
    
    // Get the session to access authentication data
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.email) {
      toast.error('You must be logged in to access user data');
      return [];
    }
    
    // Check if current user has admin access
    const accessCode = user.user_metadata.accessCode || '';
    const isCurrentUserAdmin = accessCode.toLowerCase() === 'njoyadmin';
    
    if (!isCurrentUserAdmin) {
      toast.error('You do not have permission to view users');
      return [];
    }
    
    // Map the profiles to AuthUser objects
    const users: AuthUser[] = profileData ? profileData.map(profile => {
      // For each profile, extract the data we need
      return {
        id: profile.id,
        name: profile.name || '',
        email: '', // We'll populate this later if possible
        accessCode: '', // We'll try to get this from metadata
        isAdmin: false // Default to false
      };
    }) : [];
    
    // For a real admin view, we would ideally have an admin API that provides more user details
    // This is a simplified version that works with the available data
    
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    toast.error('Failed to load users');
    return [];
  }
};

export const adminDeleteUser = async (userId: string): Promise<boolean> => {
  try {
    // First, check if the current user is an admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.email) {
      toast.error('You must be logged in to perform admin actions');
      return false;
    }
    
    const accessCode = user.user_metadata.accessCode || '';
    const isAdmin = accessCode.toLowerCase() === 'njoyadmin';
    
    if (!isAdmin) {
      toast.error('You do not have permission to delete users');
      return false;
    }
    
    // For demonstration purposes, we're using a direct delete from profiles
    // In a real-world scenario, you would use an admin API with appropriate permissions
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) {
      toast.error(`Failed to delete user: ${error.message}`);
      return false;
    }
    
    toast.success('User deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    toast.error('Failed to delete user');
    return false;
  }
};

export const adminDeleteAllUsers = async (exceptUserId: string): Promise<boolean> => {
  try {
    // First, check if the current user is an admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.email) {
      toast.error('You must be logged in to perform admin actions');
      return false;
    }
    
    const accessCode = user.user_metadata.accessCode || '';
    const isAdmin = accessCode.toLowerCase() === 'njoyadmin';
    
    if (!isAdmin) {
      toast.error('You do not have permission to delete users');
      return false;
    }
    
    // Delete all profiles except the specified one
    const { error } = await supabase
      .from('profiles')
      .delete()
      .neq('id', exceptUserId);
    
    if (error) {
      toast.error(`Failed to delete users: ${error.message}`);
      return false;
    }
    
    toast.success('All users deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting all users:', error);
    toast.error('Failed to delete users');
    return false;
  }
};
