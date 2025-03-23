
import { User } from '@supabase/supabase-js';

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

export const isValidAccessCode = (accessCode: string): boolean => {
  return accessCode.toLowerCase() === 'servpro' || accessCode.toLowerCase() === 'njoyadmin';
};
