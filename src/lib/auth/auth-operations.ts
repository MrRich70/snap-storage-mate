import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthUser, isValidAccessCode } from './types';

export const loginWithPassword = async (
  email: string, 
  password: string, 
  accessCode: string
): Promise<boolean> => {
  try {
    console.log('Login attempt:', { email, accessCodeValid: isValidAccessCode(accessCode) });
    
    // Validate access code
    if (!accessCode) {
      toast.error('Access code is required');
      return false;
    }

    // Check for valid access code
    if (!isValidAccessCode(accessCode)) {
      toast.error('Invalid access code');
      return false;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Supabase login error:', error.message);
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

    // Check for valid access code
    if (!isValidAccessCode(accessCode)) {
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
      // Do not auto-login after signup - wait for email verification
      toast.success('Account created successfully! Please check your email to verify your account.');
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
