
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCcw, Trash2, MailCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface AdminHeaderProps {
  loadUsers: () => Promise<void>;
  handleDeleteAllUsers: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ loadUsers, handleDeleteAllUsers }) => {
  const { confirmEmail } = useAuth();
  const [confirmEmailInput, setConfirmEmailInput] = useState('');
  const [isConfirmingEmail, setIsConfirmingEmail] = useState(false);

  const handleRefresh = () => {
    loadUsers();
  };

  const handleConfirmEmail = async () => {
    if (!confirmEmailInput) {
      toast.error("Please enter an email address");
      return;
    }

    setIsConfirmingEmail(true);
    try {
      const success = await confirmEmail(confirmEmailInput);
      if (success) {
        toast.success(`Email confirmed: ${confirmEmailInput}`);
        setConfirmEmailInput('');
        await loadUsers();
      } else {
        toast.error("Failed to confirm email");
      }
    } catch (error) {
      toast.error("An error occurred while confirming email");
      console.error(error);
    } finally {
      setIsConfirmingEmail(false);
    }
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteAllUsers}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Delete All Users
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Confirm User Email</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="user@example.com"
            value={confirmEmailInput}
            onChange={(e) => setConfirmEmailInput(e.target.value)}
          />
          <Button 
            variant="default" 
            onClick={handleConfirmEmail}
            disabled={isConfirmingEmail || !confirmEmailInput}
            className="whitespace-nowrap"
          >
            <MailCheck className="h-4 w-4 mr-2" />
            Confirm Email
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
