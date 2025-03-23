
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  accessCode?: string;
  isAdmin?: boolean;
}

export const mapUserToAuthUser = (user: User | null, metadata?: { name?: string; accessCode?: string }): AuthUser | null => {
  if (!user) return null;
  
  const accessCode = metadata?.accessCode || user.user_metadata.accessCode || '';
  const isAdmin = accessCode.toLowerCase() === 'njoyadmin';
  
  return {
    id: user.id,
    email: user.email || '',
    name: metadata?.name || user.user_metadata.name || '',
    accessCode,
    isAdmin
  };
};

export const loginWithPassword = async (
  email: string, 
  password: string, 
  accessCode: string
): Promise<boolean> => {
  try {
    // Validate access code
    if (!accessCode) {
      toast.error('Access code is required');
      return false;
    }

    // Default code "servpro" is always allowed 
    if (accessCode.toLowerCase() !== 'servpro') {
      // In a real implementation, we'd check the access code against a database
      // For now, we'll just check if it matches our default code
      toast.error('Invalid access code');
      return false;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      toast.error(error.message);
      return false;
    }
    
    if (data.user) {
      // Store the access code in user metadata
      await supabase.auth.updateUser({
        data: { accessCode }
      });

      toast.success('Successfully logged in');
      return true;
    } else {
      toast.error('Login failed');
      return false;
    }
  } catch (error) {
    console.error('Login error:', error);
    toast.error('Login failed');
    return false;
  }
};

export const signupWithPassword = async (
  name: string, 
  email: string, 
  password: string,
  accessCode: string
): Promise<boolean> => {
  try {
    // Validate access code
    if (!accessCode) {
      toast.error('Access code is required');
      return false;
    }

    // Default code "servpro" is always allowed
    if (accessCode.toLowerCase() !== 'servpro') {
      toast.error('Invalid access code');
      return false;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          accessCode
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    
    if (error) {
      toast.error(error.message);
      return false;
    }
    
    if (data.user) {
      // Auto-login after signup without requiring email verification
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (loginError) {
        toast.error(loginError.message);
        return false;
      }
      
      toast.success('Account created successfully! You are now logged in.');
      return true;
    } else {
      toast.error('Signup failed');
      return false;
    }
  } catch (error) {
    console.error('Signup error:', error);
    toast.error('Signup failed');
    return false;
  }
};

export const resetPasswordForEmail = async (email: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) {
      toast.error(error.message);
      return false;
    }
    
    toast.success('Password reset email sent. Please check your inbox.');
    return true;
  } catch (error) {
    console.error('Password reset error:', error);
    toast.error('Password reset failed');
    return false;
  }
};

export const updateUserPassword = async (password: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password
    });
    
    if (error) {
      toast.error(error.message);
      return false;
    }
    
    toast.success('Password updated successfully');
    return true;
  } catch (error) {
    console.error('Password update error:', error);
    toast.error('Password update failed');
    return false;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    toast.info('You have been logged out');
  } catch (error) {
    console.error('Logout error:', error);
    toast.error('Logout failed');
  }
};

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

// New admin functions
export const getAllUsers = async (): Promise<AuthUser[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, avatar_url');
    
    if (error) {
      toast.error(`Failed to fetch users: ${error.message}`);
      return [];
    }
    
    // Get auth data for emails and metadata
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      toast.error(`Failed to fetch user details: ${authError.message}`);
      return [];
    }
    
    // Map and combine the data
    const users = data.map(profile => {
      const authUser = authData.users.find(u => u.id === profile.id);
      const accessCode = authUser?.user_metadata?.accessCode || '';
      const isAdmin = accessCode.toLowerCase() === 'njoyadmin';
      
      return {
        id: profile.id,
        name: profile.name || '',
        email: authUser?.email || '',
        accessCode,
        isAdmin
      };
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    toast.error('Failed to load users');
    return [];
  }
};

export const adminDeleteUser = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
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
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .neq('id', exceptUserId);
    
    if (error) {
      toast.error(`Failed to fetch users: ${error.message}`);
      return false;
    }
    
    let success = true;
    for (const profile of data) {
      const { error } = await supabase.auth.admin.deleteUser(profile.id);
      if (error) {
        console.error(`Failed to delete user ${profile.id}:`, error);
        success = false;
      }
    }
    
    if (success) {
      toast.success('All users deleted successfully');
    } else {
      toast.warning('Some users could not be deleted');
    }
    
    return success;
  } catch (error) {
    console.error('Error deleting all users:', error);
    toast.error('Failed to delete users');
    return false;
  }
};
