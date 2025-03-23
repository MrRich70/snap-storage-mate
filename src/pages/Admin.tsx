
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { toast } from 'sonner';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import UserTable from '@/components/admin/UserTable';
import AdminHeader from '@/components/admin/AdminHeader';
import DeleteUserDialog from '@/components/admin/DeleteUserDialog';
import DeleteAllUsersDialog from '@/components/admin/DeleteAllUsersDialog';

const AdminPage: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const {
    users,
    loading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleteAllDialogOpen,
    setDeleteAllDialogOpen,
    loadUsers,
    handleDeleteUser,
    confirmDeleteUser,
    handleDeleteAllUsers,
    confirmDeleteAllUsers
  } = useAdminUsers();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (!isAdmin) {
      toast.error('You do not have admin privileges');
      navigate('/dashboard');
      return;
    }

    loadUsers();
  }, [isAuthenticated, isAdmin, navigate, loadUsers]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container py-8">
        <AdminHeader 
          loadUsers={loadUsers} 
          handleDeleteAllUsers={handleDeleteAllUsers} 
        />
        
        <UserTable 
          users={users} 
          loading={loading} 
          handleDeleteUser={handleDeleteUser}
          loadUsers={loadUsers}
        />
      </main>

      <DeleteUserDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen} 
        onConfirm={confirmDeleteUser} 
      />

      <DeleteAllUsersDialog 
        open={deleteAllDialogOpen} 
        onOpenChange={setDeleteAllDialogOpen} 
        onConfirm={confirmDeleteAllUsers} 
      />
    </div>
  );
};

export default AdminPage;
