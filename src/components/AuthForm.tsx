
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { LockIcon, MailIcon, UserIcon, ArrowLeftIcon, KeyIcon } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot-password';

const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const { login, signup, resetPassword } = useAuth();
  
  const toggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    setName('');
    setPassword('');
    setLoginError(null);
    if (newMode !== 'forgot-password') {
      setEmail('');
    }
    setAccessCode('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setLoginError(null);
    let success = false;
    
    try {
      if (mode === 'login') {
        console.log('Attempting login with:', { email, accessCode: accessCode });
        success = await login(email, password, accessCode);
      } else if (mode === 'signup') {
        if (!name.trim()) {
          throw new Error('Name is required');
        }
        success = await signup(name, email, password, accessCode);
      } else if (mode === 'forgot-password') {
        success = await resetPassword(email);
        if (success) {
          setTimeout(() => toggleMode('login'), 2000);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setLoginError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
    
    if (!success) {
      setPassword('');
      setLoginError('Login failed. Please check your email, password, and access code.');
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden animate-zoom-in shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          {mode === 'login' 
            ? 'Sign In' 
            : mode === 'signup' 
              ? 'Create Account' 
              : 'Reset Password'}
        </CardTitle>
        <CardDescription>
          {mode === 'login'
            ? 'Enter your credentials to access your account'
            : mode === 'signup'
              ? 'Fill in the information to create your account'
              : 'Enter your email to receive a password reset link'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {loginError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
              {loginError}
            </div>
          )}
          
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}
          
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
          
          {mode !== 'forgot-password' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                {mode === 'login' && (
                  <Button 
                    type="button" 
                    variant="link" 
                    className="px-0 text-xs" 
                    onClick={() => toggleMode('forgot-password')}
                  >
                    Forgot password?
                  </Button>
                )}
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
          )}
          
          {(mode === 'login' || mode === 'signup') && (
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
          )}
          
          <Button 
            type="submit" 
            className="w-full mt-6" 
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? 'Processing...' 
              : mode === 'login' 
                ? 'Sign In' 
                : mode === 'signup'
                  ? 'Create Account'
                  : 'Send Reset Link'
            }
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 text-center">
        {mode === 'forgot-password' ? (
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
        ) : (
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
        )}
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
