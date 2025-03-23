
// Generate a resumable upload key - combination of file metadata to identify the same file
export const getResumeKey = (file: File, folderId: string): string => {
  return `${folderId}:${file.name}:${file.size}:${file.lastModified}`;
};

// Check if we have a resumable upload in progress
export const getResumableUploadData = (file: File, folderId: string) => {
  const resumeKey = getResumeKey(file, folderId);
  const storedData = localStorage.getItem(`upload:${resumeKey}`);
  
  if (storedData) {
    try {
      return JSON.parse(storedData);
    } catch (e) {
      console.error('Failed to parse resumable upload data', e);
      localStorage.removeItem(`upload:${resumeKey}`);
    }
  }
  
  return null;
};

// Save resumable upload data
export const saveResumableUploadData = (
  file: File, 
  folderId: string, 
  uploadId: string, 
  bytesUploaded: number
) => {
  const resumeKey = getResumeKey(file, folderId);
  const dataToSave = {
    uploadId,
    bytesUploaded,
    timestamp: Date.now()
  };
  
  localStorage.setItem(`upload:${resumeKey}`, JSON.stringify(dataToSave));
};

// Clear resumable upload data after completion
export const clearResumableUploadData = (file: File, folderId: string) => {
  const resumeKey = getResumeKey(file, folderId);
  localStorage.removeItem(`upload:${resumeKey}`);
};

// Track the upload progress manually
export const createProgressHandler = (
  uploadId: string,
  start: number,
  chunkSize: number,
  totalSize: number,
  updateProgressFn: (id: string, updates: any) => void
) => {
  return (progress: { count?: number; loaded?: number; total?: number }) => {
    if (progress.loaded && progress.total) {
      const chunkProgress = progress.loaded / progress.total;
      const overallBytesUploaded = start + Math.round(chunkSize * chunkProgress);
      const overallProgress = Math.round((overallBytesUploaded / totalSize) * 100);
      
      updateProgressFn(uploadId, { 
        progress: overallProgress, 
        bytesUploaded: overallBytesUploaded
      });
    }
  };
};
