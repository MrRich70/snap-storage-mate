
import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center">
        <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin-slow"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingState;
