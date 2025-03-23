
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import LoginForm from './auth/LoginForm';
import SignupForm from './auth/SignupForm';
import ForgotPasswordForm from './auth/ForgotPasswordForm';
import FormFooter from './auth/FormFooter';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
    
    try {
      if (mode === 'login') {
        console.log('Attempting login with:', { email, accessCode });
        const success = await login(email, password, accessCode);
        
        if (!success) {
          setPassword('');
          setLoginError('Login failed. Please check your credentials and access code.');
        }
      } else if (mode === 'signup') {
        console.log('Attempting signup with:', { name, email, accessCode });
        const { success, error } = await signup(name, email, password, accessCode);
        
        if (success) {
          toast.success('Account created successfully! Please check your email to verify your account.');
          setTimeout(() => toggleMode('login'), 3000);
        } else {
          setPassword('');
          setLoginError(error || 'Signup failed. Please try again.');
        }
      } else if (mode === 'forgot-password') {
        const success = await resetPassword(email);
        if (success) {
          toast.success('Password reset email sent. Please check your inbox.');
          setTimeout(() => toggleMode('login'), 2000);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setLoginError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
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
        {loginError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        )}
        
        {mode === 'login' && (
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            accessCode={accessCode}
            setAccessCode={setAccessCode}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={null} // Using Alert component above instead
            onForgotPassword={() => toggleMode('forgot-password')}
          />
        )}
        
        {mode === 'signup' && (
          <SignupForm
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            accessCode={accessCode}
            setAccessCode={setAccessCode}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={null} // Using Alert component above instead
          />
        )}
        
        {mode === 'forgot-password' && (
          <ForgotPasswordForm
            email={email}
            setEmail={setEmail}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={null} // Using Alert component above instead
          />
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 text-center">
        <FormFooter mode={mode} toggleMode={toggleMode} />
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
