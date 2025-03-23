
import { supabase } from '@/integrations/supabase/client';
import { isValidAccessCode } from './types';
import { confirmUserEmail } from './admin-operations';

/**
 * Registers a new user with their name, email, password and access code
 */
export const signupWithPassword = async (
  name: string, 
  email: string, 
  password: string,
  accessCode: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Signup attempt:', { name, email, accessCodeValid: isValidAccessCode(accessCode) });
    
    // Validate input parameters
    if (!name.trim()) {
      return { success: false, error: 'Name is required' };
    }
    
    if (!email.trim()) {
      return { success: false, error: 'Email is required' };
    }
    
    if (!password) {
      return { success: false, error: 'Password is required' };
    }
    
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }
    
    // Validate access code
    if (!accessCode) {
      return { success: false, error: 'Access code is required' };
    }

    // Check for valid access code
    if (!isValidAccessCode(accessCode)) {
      return { success: false, error: 'Invalid access code' };
    }

    // Sign up the user with email confirmation enabled
    // Ensure the redirect URL points to the auth callback route specifically
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
      console.error('Signup error:', error.message);
      return { success: false, error: error.message };
    }
    
    if (data.user) {
      if (data.user.identities && data.user.identities.length === 0) {
        return { success: false, error: 'This email is already registered. Please log in instead.' };
      }
      
      // Auto confirm the user's email
      await confirmUserEmail(email);
      
      return { success: true };
    } else {
      return { success: false, error: 'Signup failed for unknown reasons' };
    }
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred during signup' };
  }
};
