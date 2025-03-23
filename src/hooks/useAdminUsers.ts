
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthUser } from '@/lib/auth/types';
import { toast } from 'sonner';

export const useAdminUsers = () => {
  const { user, fetchAllUsers, deleteUser, deleteAllUsers } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    const allUsers = await fetchAllUsers();
    setUsers(allUsers);
    setLoading(false);
  };

  const handleDeleteUser = async (userId: string) => {
    setSelectedUserId(userId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUserId) return;
    
    if (selectedUserId === user?.id) {
      toast.error("You cannot delete your own account through the admin panel");
      setDeleteDialogOpen(false);
      return;
    }

    const success = await deleteUser(selectedUserId);
    if (success) {
      await loadUsers();
    }
    setDeleteDialogOpen(false);
  };

  const handleDeleteAllUsers = () => {
    setDeleteAllDialogOpen(true);
  };

  const confirmDeleteAllUsers = async () => {
    if (!user?.id) return;
    
    const success = await deleteAllUsers(user.id);
    if (success) {
      await loadUsers();
    }
    setDeleteAllDialogOpen(false);
  };

  return {
    users,
    loading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleteAllDialogOpen,
    setDeleteAllDialogOpen,
    selectedUserId,
    loadUsers,
    handleDeleteUser,
    confirmDeleteUser,
    handleDeleteAllUsers,
    confirmDeleteAllUsers
  };
};
