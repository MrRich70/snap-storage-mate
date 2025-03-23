
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  ImageIcon, 
  UploadIcon, 
  LogOutIcon,
  UserIcon,
  TrashIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NavigationProps {
  onUpload?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onUpload }) => {
  const { user, logout, deleteAccount } = useAuth();
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteAccount = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const success = await deleteAccount(email, password);
      if (success) {
        setIsDeleteAccountOpen(false);
      }
    } catch (error) {
      console.error('Delete account error:', error);
    } finally {
      setIsSubmitting(false);
      setPassword('');
    }
  };

  return (
    <>
      <header className="w-full border-b bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <ImageIcon className="h-5 w-5" />
            <span>NJoy Easy Image Share</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {onUpload && (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
                onClick={onUpload}
              >
                <UploadIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Upload</span>
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setIsDeleteAccountOpen(true)}
            >
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center gap-1"
              onClick={handleLogout}
            >
              <LogOutIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <Dialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action is permanent. Once you delete your account, all your data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete-email">Confirm Email</Label>
              <Input 
                id="delete-email" 
                type="email" 
                placeholder={user?.email || 'your-email@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-password">Confirm Password</Label>
              <Input 
                id="delete-password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setIsDeleteAccountOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isSubmitting || !email || !password}
              className="flex items-center gap-1"
            >
              {isSubmitting ? (
                'Processing...'
              ) : (
                <>
                  <TrashIcon className="h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navigation;
