
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthSession } from '@/hooks/useAuthSession';
import { 
  AuthUser, 
  loginWithPassword, 
  signupWithPassword, 
  resetPasswordForEmail, 
  updateUserPassword, 
  logoutUser,
  deleteUserAccount,
  getAllUsers,
  adminDeleteUser,
  adminDeleteAllUsers
} from '@/lib/auth-utils';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, accessCode: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, accessCode: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  deleteAccount: (email: string, password: string) => Promise<boolean>;
  // Admin functions
  fetchAllUsers: () => Promise<AuthUser[]>;
  deleteUser: (userId: string) => Promise<boolean>;
  deleteAllUsers: (exceptUserId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading, isAuthenticated } = useAuthSession();
  
  const authContextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.isAdmin || false,
    login: async (email, password, accessCode) => {
      return await loginWithPassword(email, password, accessCode);
    },
    signup: async (name, email, password, accessCode) => {
      return await signupWithPassword(name, email, password, accessCode);
    },
    logout: async () => {
      await logoutUser();
    },
    resetPassword: async (email) => {
      return await resetPasswordForEmail(email);
    },
    updatePassword: async (password) => {
      return await updateUserPassword(password);
    },
    deleteAccount: async (email, password) => {
      return await deleteUserAccount(email, password);
    },
    // Admin functions
    fetchAllUsers: async () => {
      return await getAllUsers();
    },
    deleteUser: async (userId) => {
      return await adminDeleteUser(userId);
    },
    deleteAllUsers: async (exceptUserId) => {
      return await adminDeleteAllUsers(exceptUserId);
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
