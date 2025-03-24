
import React, { forwardRef } from 'react';

interface FileUploaderProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  multiple?: boolean;
}

const FileUploader = forwardRef<HTMLInputElement, FileUploaderProps>(
  ({ onChange, accept = "image/*", multiple = true }, ref) => {
    // Prevent default behavior both here and in the parent handler
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault(); // Prevent default behavior
      e.stopPropagation(); // Stop event propagation
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
