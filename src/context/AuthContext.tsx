
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
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
  confirmUserEmail,
  adminCreateUser
} from '@/lib/auth';
import { toast } from 'sonner';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  accessCode: string | null;
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
  createUser: (name: string, email: string, password: string, accessCode: string) => Promise<{success: boolean; error?: string}>;
}

// Initialize with default values to prevent the "must be used within a Provider" error
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,
  accessCode: null,
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
  createUser: async () => ({ success: false }),
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading, isAuthenticated, session } = useAuthSession();
  
  // Log user authentication status changes for debugging
  useEffect(() => {
    console.log('Auth status changed:', { 
      isAuthenticated, 
      isLoading, 
      userId: user?.id,
      email: user?.email,
      sessionStatus: session ? 'active' : 'none'
    });
  }, [isAuthenticated, isLoading, user, session]);
  
  const authContextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.isAdmin || false,
    accessCode: user?.accessCode || null,
    login: async (email, password, accessCode) => {
      try {
        return await loginWithPassword(email, password, accessCode);
      } catch (error) {
        console.error('Login error in context:', error);
        toast.error('Login failed. Please try again.');
        return false;
      }
    },
    signup: async (name, email, password, accessCode) => {
      try {
        return await signupWithPassword(name, email, password, accessCode);
      } catch (error) {
        console.error('Signup error in context:', error);
        toast.error('Signup failed. Please try again.');
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },
    logout: async () => {
      try {
        console.log('Logging out from auth context');
        await logoutUser();
      } catch (error) {
        console.error('Logout error in context:', error);
        toast.error('Logout failed. Please try again.');
      }
    },
    resetPassword: async (email) => {
      try {
        return await resetPasswordForEmail(email);
      } catch (error) {
        console.error('Reset password error in context:', error);
        toast.error('Failed to reset password. Please try again.');
        return false;
      }
    },
    updatePassword: async (password) => {
      try {
        return await updateUserPassword(password);
      } catch (error) {
        console.error('Update password error in context:', error);
        toast.error('Failed to update password. Please try again.');
        return false;
      }
    },
    deleteAccount: async (email, password) => {
      try {
        return await deleteUserAccount(email, password);
      } catch (error) {
        console.error('Delete account error in context:', error);
        toast.error('Failed to delete account. Please try again.');
        return false;
      }
    },
    // Admin functions
    fetchAllUsers: async () => {
      try {
        return await getAllUsers();
      } catch (error) {
        console.error('Fetch all users error in context:', error);
        toast.error('Failed to fetch users. Please try again.');
        return [];
      }
    },
    deleteUser: async (userId) => {
      try {
        return await adminDeleteUser(userId);
      } catch (error) {
        console.error('Delete user error in context:', error);
        toast.error('Failed to delete user. Please try again.');
        return false;
      }
    },
    deleteAllUsers: async (exceptUserId) => {
      try {
        return await adminDeleteAllUsers(exceptUserId);
      } catch (error) {
        console.error('Delete all users error in context:', error);
        toast.error('Failed to delete all users. Please try again.');
        return false;
      }
    },
    confirmEmail: async (email) => {
      try {
        return await confirmUserEmail(email);
      } catch (error) {
        console.error('Confirm email error in context:', error);
        toast.error('Failed to confirm email. Please try again.');
        return false;
      }
    },
    createUser: async (name, email, password, accessCode) => {
      try {
        return await adminCreateUser(name, email, password, accessCode);
      } catch (error) {
        console.error('Create user error in context:', error);
        toast.error('Failed to create user. Please try again.');
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
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
