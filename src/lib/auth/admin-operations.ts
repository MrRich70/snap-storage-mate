
import { supabase } from '@/integrations/supabase/client';
import { AuthUser, mapUserToAuthUser } from './types';

/**
 * Retrieves all users for admin purposes
 */
export const getAllUsers = async (): Promise<AuthUser[]> => {
  try {
    // Call the RPC function to get all users
    const { data, error } = await supabase
      .rpc('get_all_users');

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    // Convert the raw user data to AuthUser objects
    if (Array.isArray(data)) {
      const authUsers = data.map(user => {
        return {
          id: user.id,
          email: user.email || '',
          name: user.raw_user_meta_data?.name || user.raw_app_meta_data?.name || '',
          accessCode: user.raw_user_meta_data?.accessCode || '',
          isAdmin: user.raw_user_meta_data?.accessCode?.toLowerCase() === 'njoyadmin'
        };
      });
      return authUsers;
    }

    return [];
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return [];
  }
};

/**
 * Deletes a user (admin only)
 */
export const adminDeleteUser = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .rpc('delete_user', { user_id: userId });

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in adminDeleteUser:', error);
    return false;
  }
};

/**
 * Deletes all users except the specified user (admin only)
 */
export const adminDeleteAllUsers = async (exceptUserId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .rpc('delete_all_users', { except_user_id: exceptUserId });

    if (error) {
      console.error('Error deleting all users:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in adminDeleteAllUsers:', error);
    return false;
  }
};
