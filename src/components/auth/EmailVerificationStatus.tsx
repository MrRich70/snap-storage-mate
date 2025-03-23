
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface EmailVerificationStatusProps {
  status: 'success' | 'error';
  message: string;
  isAuthenticated: boolean;
}

const EmailVerificationStatus: React.FC<EmailVerificationStatusProps> = ({ 
  status, 
  message, 
  isAuthenticated 
}) => {
  const navigate = useNavigate();
  
  const redirectText = isAuthenticated 
    ? "You will be redirected to your dashboard in a few seconds." 
    : "You will be redirected to the login page in a few seconds.";
  
  const buttonText = isAuthenticated ? "Go to Dashboard" : "Login Now";
  const buttonAction = () => navigate(isAuthenticated ? '/dashboard' : '/');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <Card className="w-full max-w-md mx-auto animate-zoom-in">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {status === 'success' ? 'Email Verified' : 'Verification Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className={status === 'success' ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-red-500 bg-red-50 dark:bg-red-950/20"}>
            {status === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            <AlertTitle className={status === 'success' ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}>
              {status === 'success' ? 'Success' : 'Error'}
            </AlertTitle>
            <AlertDescription className={status === 'success' ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
              {message}
            </AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">{redirectText}</p>
            <Button onClick={buttonAction}>{buttonText}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerificationStatus;
