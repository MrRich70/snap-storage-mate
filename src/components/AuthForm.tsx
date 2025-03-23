
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { LockIcon, MailIcon, UserIcon } from 'lucide-react';

type AuthMode = 'login' | 'signup';

const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, signup } = useAuth();
  
  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    // Reset form when toggling
    setName('');
    setEmail('');
    setPassword('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    let success = false;
    
    try {
      if (mode === 'login') {
        success = await login(email, password);
      } else {
        success = await signup(name, email, password);
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsSubmitting(false);
    }
    
    // If successful, the redirect will happen via auth state
    if (!success) {
      // Reset password on failed attempt
      setPassword('');
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden animate-zoom-in shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </CardTitle>
        <CardDescription>
          {mode === 'login'
            ? 'Enter your credentials to access your account'
            : 'Fill in the information to create your account'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
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
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-6" 
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? 'Processing...' 
              : mode === 'login' 
                ? 'Sign In' 
                : 'Create Account'
            }
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 text-center">
        <div className="text-sm text-muted-foreground">
          {mode === 'login' 
            ? "Don't have an account?" 
            : "Already have an account?"}
          <button 
            onClick={toggleMode}
            className="ml-1 underline text-primary font-medium hover:text-primary/80"
            type="button"
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
        
        {mode === 'login' && (
          <div className="text-xs text-muted-foreground">
            <p className="mb-2">Demo Account:</p>
            <p>Email: user@example.com</p>
            <p>Password: password</p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
