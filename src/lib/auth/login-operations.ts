
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

    // First attempt to login normally
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    // If successful login, update access code and return
    if (data.user && !error) {
      // Store the access code in user metadata
      await supabase.auth.updateUser({
        data: { accessCode }
      });

      toast.success('Successfully logged in');
      return true;
    }
    
    // If there's an error about unconfirmed email, try to confirm it
    if (error && error.message.includes('Email not confirmed')) {
      console.log('Attempting to auto-confirm email for:', email);
      
      const confirmed = await confirmUserEmail(email);
      
      if (confirmed) {
        // Try logging in again after confirming the email
        const secondAttempt = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (secondAttempt.data.user && !secondAttempt.error) {
          // Store the access code in user metadata
          await supabase.auth.updateUser({
            data: { accessCode }
          });
          
          toast.success('Email confirmed and logged in successfully');
          return true;
        } else {
          toast.error(secondAttempt.error?.message || 'Login failed after email confirmation');
          return false;
        }
      } else {
        toast.error(error.message);
        return false;
      }
    } else if (error) {
      toast.error(error.message);
      return false;
    }
    
    toast.error('Login failed');
    return false;
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
