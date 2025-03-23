
import React, { forwardRef } from 'react';

interface FileUploaderProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploader = forwardRef<HTMLInputElement, FileUploaderProps>(
  ({ onChange }, ref) => {
    return (
      <input
        type="file"
        ref={ref}
        onChange={onChange}
        className="hidden"
        accept="image/*"
        multiple
      />
    );
  }
);

FileUploader.displayName = "FileUploader";

export default FileUploader;
