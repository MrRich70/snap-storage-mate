
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserX, CheckCircle, XCircle, Mail } from 'lucide-react';
import { AuthUser } from '@/lib/auth/types';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface UserTableProps {
  users: AuthUser[];
  loading: boolean;
  handleDeleteUser: (userId: string) => void;
  loadUsers: () => Promise<void>;
}

const UserTable: React.FC<UserTableProps> = ({ 
  users, 
  loading, 
  handleDeleteUser,
  loadUsers 
}) => {
  const { confirmEmail } = useAuth();

  const handleConfirmEmail = async (email: string) => {
    try {
      const success = await confirmEmail(email);
      if (success) {
        toast.success(`Email confirmed: ${email}`);
        await loadUsers(); // Refresh user list
      } else {
        toast.error("Failed to confirm email");
      }
    } catch (error) {
      toast.error("An error occurred while confirming email");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Access Code</TableHead>
            <TableHead>Email Confirmed</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className={!user.emailConfirmed ? "bg-yellow-50 dark:bg-yellow-950/20" : ""}>
                <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.accessCode || 'N/A'}</TableCell>
                <TableCell>
                  {user.emailConfirmed ? (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      <span>Confirmed</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-500 mr-1" />
                      <span>Not Confirmed</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {user.isAdmin ? (
                    <Badge variant="default" className="bg-purple-500">Admin</Badge>
                  ) : (
                    <Badge variant="outline">User</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {!user.emailConfirmed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfirmEmail(user.email)}
                        className="flex items-center gap-1"
                      >
                        <Mail className="h-4 w-4" />
                        Confirm Email
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="flex items-center gap-1"
                    >
                      <UserX className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;

