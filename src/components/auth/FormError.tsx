
import React from 'react';

interface FormErrorProps {
  error: string | null;
}

const FormError: React.FC<FormErrorProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
      {error}
    </div>
  );
};

export default FormError;
