
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AuthForm from '@/components/AuthForm';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <header className="p-6">
        <h1 className="text-2xl font-bold tracking-tight animate-fade-in">SnapStore</h1>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 animate-slide-up">
            <h2 className="text-4xl font-bold tracking-tight">
              Securely store and organize your images
            </h2>
            <p className="text-lg text-muted-foreground">
              Upload, organize, and access your images from anywhere with our 
              simple and elegant storage solution.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Secure cloud storage for your images
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Create folders to keep everything organized
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Access your files from any device
              </li>
            </ul>
          </div>
          
          <div className="animate-slide-up animation-delay-200">
            <AuthForm />
          </div>
        </div>
      </main>
      
      <footer className="p-6 text-center text-sm text-muted-foreground animate-fade-in animation-delay-400">
        <p>© {new Date().getFullYear()} SnapStore. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
