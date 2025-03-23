
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import EmailVerificationStatus from '@/components/auth/EmailVerificationStatus';
import PasswordResetForm from '@/components/auth/PasswordResetForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';

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
        setVerificationMessage('Your email has been successfully verified!');
        
        if (isAuthenticated) {
          // If user is already logged in (auto-login)
          setTimeout(() => navigate('/dashboard'), 4000);
        } else {
          // If not logged in, redirect to login page
          setTimeout(() => navigate('/'), 4000);
        }
      } catch (error: any) {
        console.error('Error handling auth callback:', error);
        setVerificationStatus('error');
        setVerificationMessage('Failed to verify your email. Please try again or contact support.');
        
        if (isAuthenticated) {
          // If user is already logged in (auto-login)
          setTimeout(() => navigate('/dashboard'), 4000);
        } else {
          // If not logged in, redirect to login page
          setTimeout(() => navigate('/'), 4000);
        }
      } finally {
        setIsProcessing(false);
      }
    };
    
    handleAuthCallback();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, navigate, isAuthenticated]);
  
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
        <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
        <p className="mb-4">You'll be redirected to your dashboard shortly.</p>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    </div>
  );
};

export default AuthCallback;
