
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { toast } from 'sonner';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import UserTable from '@/components/admin/UserTable';
import AdminHeader from '@/components/admin/AdminHeader';
import DeleteUserDialog from '@/components/admin/DeleteUserDialog';
import DeleteAllUsersDialog from '@/components/admin/DeleteAllUsersDialog';
import AddUserForm from '@/components/admin/AddUserForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  
  const [activeTab, setActiveTab] = useState<string>("users");

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

  const handleUserAdded = () => {
    loadUsers();
    setActiveTab("users");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="users">Manage Users</TabsTrigger>
            <TabsTrigger value="add-user">Add New User</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <AdminHeader 
              loadUsers={loadUsers} 
              handleDeleteAllUsers={handleDeleteAllUsers}
              users={users}
            />
            
            <UserTable 
              users={users} 
              loading={loading} 
              handleDeleteUser={handleDeleteUser}
              loadUsers={loadUsers}
            />
          </TabsContent>
          
          <TabsContent value="add-user">
            <AddUserForm onSuccess={handleUserAdded} />
          </TabsContent>
        </Tabs>
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
