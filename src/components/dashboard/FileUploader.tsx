
import React, { forwardRef } from 'react';

interface FileUploaderProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  multiple?: boolean;
}

const FileUploader = forwardRef<HTMLInputElement, FileUploaderProps>(
  ({ onChange, accept = "image/*", multiple = true }, ref) => {
    // Create a handler that prevents default behavior before calling onChange
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault(); // Prevent default form submission
      onChange(e);
    };
    
    return (
      <input
        type="file"
        ref={ref}
        onChange={handleChange}
        className="hidden"
        accept={accept}
        multiple={multiple}
        data-testid="file-uploader"
      />
    );
  }
);

FileUploader.displayName = "FileUploader";

export default FileUploader;
