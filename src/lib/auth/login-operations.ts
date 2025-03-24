
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
    
    // First try to confirm email if it's not already confirmed
    // This preemptive approach should help with persistent email confirmation issues
    await confirmUserEmail(email);
    console.log('Preemptively attempted to confirm email for:', email);
    
    // Now attempt login
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
    
    // If there's an error about unconfirmed email, try again with an explicit confirmation
    if (error && error.message.includes('Email not confirmed')) {
      console.log('Still getting email not confirmed error, retrying with explicit confirmation for:', email);
      
      const confirmed = await confirmUserEmail(email);
      console.log('Explicit email confirmation result:', confirmed);
      
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
          console.error('Second login attempt failed:', secondAttempt.error);
          toast.error(secondAttempt.error?.message || 'Login failed after email confirmation');
          return false;
        }
      } else {
        toast.error('Could not confirm email. Please contact support.');
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
 * Preserves shared storage data
 */
export const logoutUser = async (): Promise<void> => {
  try {
    console.log('Logging out user...');
    
    // First, try to clear any app-specific local storage except shared storage
    const appStorageKeys = Object.keys(localStorage).filter(key => 
      (key.startsWith('servpro_') === false) && // Preserve shared storage
      key.includes('supabase')
    );
    
    appStorageKeys.forEach(key => {
      try {
        console.log('Clearing local storage item:', key);
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Error clearing local storage item:', key, e);
      }
    });
    
    // Then, try to sign out from Supabase
    const { error } = await supabase.auth.signOut({
      scope: 'global' // Sign out from all tabs/windows
    });
    
    if (error) {
      console.error('Supabase logout error:', error);
      // Continue with client-side logout even if server logout fails
    }
    
    // Force clear any Supabase related storage items that might be keeping state
    try {
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-yipsbfttmpfeqzxxoiiv-auth-token');
      sessionStorage.removeItem('sb-yipsbfttmpfeqzxxoiiv-auth-token');
    } catch (e) {
      console.error('Error clearing auth tokens:', e);
    }
    
    console.log('User logged out successfully');
    toast.info('You have been logged out');
  } catch (error) {
    console.error('Logout error:', error);
    toast.error('Logout failed. Please refresh the page and try again.');
    
    // As a last resort, try to reload the page to clear the session state
    window.location.href = '/';
  }
};
