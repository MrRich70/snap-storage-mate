
import { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  accessCode: string;
  isAdmin: boolean;
  emailConfirmed: boolean;
}

export const mapUserToAuthUser = (user: User): AuthUser => {
  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || '',
    accessCode: user.user_metadata?.accessCode || '',
    isAdmin: (user.user_metadata?.accessCode || '').toLowerCase() === 'njoyadmin',
    emailConfirmed: !!user.email_confirmed_at
  };
};
