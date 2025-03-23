
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export const mapUserToAuthUser = (user: User | null, metadata?: { name?: string }): AuthUser | null => {
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email || '',
    name: metadata?.name || user.user_metadata.name || ''
  };
};

export const loginWithPassword = async (email: string, password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      toast.error(error.message);
      return false;
    }
    
    if (data.user) {
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
  password: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        },
      }
    });
    
    if (error) {
      toast.error(error.message);
      return false;
    }
    
    if (data.user) {
      // Auto-login after signup since we're not requiring verification
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
