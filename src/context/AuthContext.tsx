
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthSession } from '@/hooks/useAuthSession';
import { 
  AuthUser, 
  loginWithPassword, 
  signupWithPassword, 
  resetPasswordForEmail, 
  updateUserPassword, 
  logoutUser 
} from '@/lib/auth-utils';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading, isAuthenticated } = useAuthSession();
  
  const authContextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login: async (email, password) => {
      return await loginWithPassword(email, password);
    },
    signup: async (name, email, password) => {
      return await signupWithPassword(name, email, password);
    },
    logout: async () => {
      await logoutUser();
    },
    resetPassword: async (email) => {
      return await resetPasswordForEmail(email);
    },
    updatePassword: async (password) => {
      return await updateUserPassword(password);
    }
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
