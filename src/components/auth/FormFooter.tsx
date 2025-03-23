
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot-password';

interface FormFooterProps {
  mode: AuthMode;
  toggleMode: (mode: AuthMode) => void;
}

const FormFooter: React.FC<FormFooterProps> = ({ mode, toggleMode }) => {
  if (mode === 'forgot-password') {
    return (
      <div className="text-sm text-muted-foreground">
        <Button 
          onClick={() => toggleMode('login')}
          className="flex items-center gap-1 text-primary text-sm font-medium hover:text-primary/80"
          variant="link"
          type="button"
        >
          <ArrowLeftIcon className="h-3 w-3" />
          Back to login
        </Button>
      </div>
    );
  }
  
  return (
    <div className="text-sm text-muted-foreground">
      {mode === 'login' 
        ? "Don't have an account?" 
        : "Already have an account?"}
      <button 
        onClick={() => toggleMode(mode === 'login' ? 'signup' : 'login')}
        className="ml-1 underline text-primary font-medium hover:text-primary/80"
        type="button"
      >
        {mode === 'login' ? 'Sign Up' : 'Sign In'}
      </button>
    </div>
  );
};

export default FormFooter;
