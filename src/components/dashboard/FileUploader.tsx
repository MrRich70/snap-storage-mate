
import React, { forwardRef } from 'react';

interface FileUploaderProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  multiple?: boolean;
}

const FileUploader = forwardRef<HTMLInputElement, FileUploaderProps>(
  ({ onChange, accept = "image/*", multiple = true }, ref) => {
    return (
      <input
        type="file"
        ref={ref}
        onChange={onChange}
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
