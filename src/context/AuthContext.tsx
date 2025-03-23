
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
  adminDeleteAllUsers,
  confirmUserEmail
} from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, accessCode: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, accessCode: string) => Promise<{success: boolean; error?: string}>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  deleteAccount: (email: string, password: string) => Promise<boolean>;
  // Admin functions
  fetchAllUsers: () => Promise<AuthUser[]>;
  deleteUser: (userId: string) => Promise<boolean>;
  deleteAllUsers: (exceptUserId: string) => Promise<boolean>;
  confirmEmail: (email: string) => Promise<boolean>;
}

// Initialize with default values to prevent the "must be used within a Provider" error
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,
  login: async () => false,
  signup: async () => ({ success: false }),
  logout: async () => {},
  resetPassword: async () => false,
  updatePassword: async () => false,
  deleteAccount: async () => false,
  fetchAllUsers: async () => [],
  deleteUser: async () => false,
  deleteAllUsers: async () => false,
  confirmEmail: async () => false,
});

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
    },
    confirmEmail: async (email) => {
      return await confirmUserEmail(email);
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
  return context;
};
