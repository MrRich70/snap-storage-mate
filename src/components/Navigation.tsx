
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ImageIcon, 
  UploadIcon, 
  LogOutIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavigationProps {
  onUpload?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onUpload }) => {
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <ImageIcon className="h-5 w-5" />
          <span>ImageVault</span>
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
  );
};

export default Navigation;
