
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import EmailVerificationStatus from '@/components/auth/EmailVerificationStatus';
import PasswordResetForm from '@/components/auth/PasswordResetForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';

const AuthCallback = () => {
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | null>(null);
  const [verificationMessage, setVerificationMessage] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('Auth callback processing with URL:', location.pathname + location.search + location.hash);
      
      // Check URL parameters and hash for type
      const searchParams = new URLSearchParams(location.search);
      const type = searchParams.get('type');
      const token = searchParams.get('token');
      
      // Also check the URL hash for recovery tokens
      // This is crucial for password reset links which use hash-based tokens
      const hash = location.hash;
      const isRecovery = hash.includes('type=recovery') || type === 'recovery';
      const isSignup = type === 'signup';
      
      try {
        if (isRecovery) {
          console.log('Processing password reset request');
          // This is a password reset
          setIsPasswordReset(true);
          setIsProcessing(false);
          return;
        }
        
        // Handle token from email verification link if present
        if (token && isSignup) {
          console.log('Processing email verification with token');
          // Let's improve token handling
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          });
          
          if (error) {
            console.error('Email verification error:', error);
            throw error;
          }
          
          // Successfully verified email
          setVerificationStatus('success');
          setVerificationMessage('Your email has been successfully verified! You can now log in to your account.');
          toast.success('Email verified successfully');
          
          // Delay redirecting to give time to read the message
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
          return;
        }
        
        // Handle general auth callback (like after auth.signIn with email verification)
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          throw error;
        }
        
        console.log('Auth callback session check result:', data.session?.user?.email);
        
        // Default success case
        setVerificationStatus('success');
        setVerificationMessage('Authentication successful!');
        
        // Delay redirecting to give time to read the message
        setTimeout(() => {
          if (isAuthenticated || data.session) {
            navigate('/dashboard', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }, 3000);
      } catch (error: any) {
        console.error('Error handling auth callback:', error);
        setVerificationStatus('error');
        setVerificationMessage('Authentication failed: ' + (error.message || 'Unknown error'));
        toast.error('Authentication failed');
        
        // Delay redirecting to give time to read the error
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };
    
    handleAuthCallback();
  }, [location.search, location.hash, navigate, isAuthenticated, location.pathname]);
  
  // Show loading spinner while processing
  if (isProcessing) {
    return <LoadingSpinner />;
  }
  
  // Show verification status (success or error)
  if (verificationStatus) {
    return (
      <EmailVerificationStatus 
        status={verificationStatus} 
        message={verificationMessage} 
        isAuthenticated={isAuthenticated} 
      />
    );
  }
  
  // Show password reset form
  if (isPasswordReset) {
    return <PasswordResetForm />;
  }
  
  // Fallback (should rarely happen)
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-bounce text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-2">Verification Complete</h1>
        <p className="mb-4">You'll be redirected shortly.</p>
        <Button onClick={() => navigate('/')}>Go to Login</Button>
      </div>
    </div>
  );
};

export default AuthCallback;
