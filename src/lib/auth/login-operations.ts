
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { isValidAccessCode } from './types';
import { confirmUserEmail } from './admin-operations';

/**
 * Authenticates a user with their email, password and access code
 */
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
      
      // If the error is about unconfirmed email, try to auto-confirm it
      if (error.message.includes('Email not confirmed')) {
        const confirmed = await confirmUserEmail(email);
        if (confirmed) {
          toast.success('Email confirmed automatically. Please try logging in again.');
          return false;
        } else {
          toast.error(error.message);
          return false;
        }
      } else {
        toast.error(error.message);
        return false;
      }
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

/**
 * Signs the user out of their current session
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    toast.info('You have been logged out');
  } catch (error) {
    console.error('Logout error:', error);
    toast.error('Logout failed');
  }
};
