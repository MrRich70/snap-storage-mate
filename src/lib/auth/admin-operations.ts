import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthUser } from './types';

export const getAllUsers = async (): Promise<AuthUser[]> => {
  try {
    // First, check if the current user is an admin
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
    
    // Get all auth users (admin only function that uses the RPC method)
    const { data: authUsers, error: authError } = await supabase.rpc('get_all_users');
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      toast.error(`Failed to fetch users: ${authError.message}`);
      return [];
    }
    
    // Get all profiles to merge with auth data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      toast.error(`Failed to fetch user profiles: ${profileError.message}`);
      return [];
    }
    
    // Map and merge auth users with profile data
    const users: AuthUser[] = Array.isArray(authUsers) ? authUsers.map(authUser => {
      // Find matching profile, with proper null/undefined check
      const profile = profileData?.find(p => p.id === authUser.id) || { name: '' };
      
      // Determine if user is admin
      const userAccessCode = authUser.raw_user_meta_data?.accessCode || '';
      const isAdmin = userAccessCode.toLowerCase() === 'njoyadmin';
      
      return {
        id: authUser.id,
        name: profile.name || authUser.raw_user_meta_data?.name || '',
        email: authUser.email || '',
        accessCode: authUser.raw_user_meta_data?.accessCode || '',
        isAdmin
      };
    }) : [];
    
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
