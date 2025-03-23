
import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/context/AuthContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LogOutIcon, UploadIcon, UserIcon } from 'lucide-react';
import { toast } from 'sonner';

interface NavigationProps {
  onUpload: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onUpload }) => {
  const { user, logout } = useAuth();
  
  const handleUpload = () => {
    onUpload();
  };
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <header className="w-full sticky top-0 z-10 animate-fade-in">
      <div className="glass backdrop-blur-lg px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-xl tracking-tight">SnapStore</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 glass glass-hover"
            onClick={handleUpload}
          >
            <UploadIcon className="h-4 w-4" />
            <span>Upload</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-white">
                  {user?.name.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass backdrop-blur-md">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
