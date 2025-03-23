
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { LockIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from 'lucide-react';

const AuthCallback = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | null>(null);
  const [verificationMessage, setVerificationMessage] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { updatePassword } = useAuth();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const type = searchParams.get('type');
      
      try {
        if (type === 'recovery') {
          // This is a password reset
          setIsPasswordReset(true);
          setIsProcessing(false);
          return;
        }
        
        // Handle email verification
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        // Successfully verified email
        setVerificationStatus('success');
        setVerificationMessage('Your email has been successfully verified! You can now log in.');
        setTimeout(() => navigate('/'), 5000); // Redirect to login page after 5 seconds
      } catch (error: any) {
        console.error('Error handling auth callback:', error);
        setVerificationStatus('error');
        setVerificationMessage('Failed to verify your email. Please try again or contact support.');
        setTimeout(() => navigate('/'), 5000); // Redirect to login page after 5 seconds
      } finally {
        setIsProcessing(false);
      }
    };
    
    handleAuthCallback();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, navigate]);
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await updatePassword(password);
      
      if (success) {
        toast.success('Password updated successfully');
        setTimeout(() => navigate('/'), 1000); // Redirect to login page
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Processing your request...</p>
        </div>
      </div>
    );
  }
  
  if (verificationStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <Card className="w-full max-w-md mx-auto animate-zoom-in">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              {verificationStatus === 'success' ? 'Email Verified' : 'Verification Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className={verificationStatus === 'success' ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-red-500 bg-red-50 dark:bg-red-950/20"}>
              {verificationStatus === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
              <AlertTitle className={verificationStatus === 'success' ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}>
                {verificationStatus === 'success' ? 'Success' : 'Error'}
              </AlertTitle>
              <AlertDescription className={verificationStatus === 'success' ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
                {verificationMessage}
              </AlertDescription>
            </Alert>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">You will be redirected to the login page in a few seconds.</p>
              <Button onClick={() => navigate('/')}>Login Now</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isPasswordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <Card className="w-full max-w-md mx-auto animate-zoom-in">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
            <CardDescription>Please enter your new password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
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
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full mt-6" 
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm text-muted-foreground">
            Your password must be at least 6 characters long
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-bounce text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
        <p className="mb-4">You'll be redirected to your dashboard shortly.</p>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    </div>
  );
};

export default AuthCallback;
