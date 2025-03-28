
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LockIcon, MailIcon, KeyIcon } from 'lucide-react';
import FormError from './FormError';

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  accessCode: string;
  setAccessCode: (accessCode: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  error: string | null;
  onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  accessCode,
  setAccessCode,
  onSubmit,
  isSubmitting,
  error,
  onForgotPassword
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormError error={error} />
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
          <Button 
            type="button" 
            variant="link" 
            className="px-0 text-xs" 
            onClick={onForgotPassword}
          >
            Forgot password?
          </Button>
        </div>
        <div className="relative">
          <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
            minLength={6}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="accessCode">Access Code</Label>
        <div className="relative">
          <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="accessCode"
            type="text"
            placeholder="Enter access code"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full mt-6" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Processing...' : 'Sign In'}
      </Button>
    </form>
  );
};

export default LoginForm;
