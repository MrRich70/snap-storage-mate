
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  ImageIcon, 
  UploadIcon, 
  LogOutIcon,
  TrashIcon,
  ShieldIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface NavigationProps {
  onUpload?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onUpload }) => {
  const { user, logout, deleteAccount, isAdmin } = useAuth();
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      console.log('Navigation: Initiating logout...');
      await logout();
      
      // Force navigation to home page after logout and reset state
      console.log('Navigation: Logout successful, navigating to home page...');
      
      // Add a small delay to allow the auth state to update
      setTimeout(() => {
        navigate('/', { replace: true });
        setIsSubmitting(false);
      }, 100);
    } catch (error) {
      console.error('Navigation: Logout error:', error);
      toast.error('Failed to log out. Please refresh the page and try again.');
      setIsSubmitting(false);
      
      // As a fallback, force navigation to the home page
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    }
  };

  const handleDeleteAccount = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const success = await deleteAccount(email, password);
      if (success) {
        setIsDeleteAccountOpen(false);
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('Failed to delete account. Please try again.');
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
            {isAdmin && (
              <Link to="/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <ShieldIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </Link>
            )}
            
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
              <TrashIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Delete Account</span>
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center gap-1"
              onClick={handleLogout}
              disabled={isSubmitting}
            >
              <LogOutIcon className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isSubmitting ? 'Logging out...' : 'Logout'}
              </span>
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
