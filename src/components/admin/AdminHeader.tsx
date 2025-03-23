
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Users, Trash2 } from 'lucide-react';

interface AdminHeaderProps {
  loadUsers: () => void;
  handleDeleteAllUsers: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ loadUsers, handleDeleteAllUsers }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={loadUsers}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        
        <Button 
          variant="destructive" 
          onClick={handleDeleteAllUsers}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          <Trash2 className="h-4 w-4" />
          Delete All Users
        </Button>
      </div>
    </div>
  );
};

export default AdminHeader;
