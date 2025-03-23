
import { uploadFile } from './fileOperations';

const uploads = new Map();

export const getUploadProgress = () => {
  return Array.from(uploads.values());
};

export const startUpload = (id, file, folderId, isSharedStorage = false) => {
  uploads.set(id, {
    id,
    filename: file.name,
    progress: 0,
    status: 'uploading'
  });
  
  // Simulate upload progress
  const interval = setInterval(() => {
    const upload = uploads.get(id);
    if (!upload || upload.status !== 'uploading') {
      clearInterval(interval);
      return;
    }
    
    if (upload.progress < 95) {
      uploads.set(id, {
        ...upload,
        progress: upload.progress + 5
      });
    } else if (upload.progress < 100) {
      uploads.set(id, {
        ...upload,
        progress: 100,
        status: 'processing'
      });
      
      // Finish the upload after a short "processing" time
      setTimeout(() => {
        uploads.set(id, {
          ...uploads.get(id),
          status: 'completed'
        });
      }, 500);
      
      clearInterval(interval);
    }
  }, 200);
  
  return id;
};

export const retryUpload = async (id, file, folderId, isSharedStorage = false) => {
  const upload = uploads.get(id);
  if (!upload) {
    throw new Error('Upload not found');
  }
  
  uploads.set(id, {
    ...upload,
    progress: 0,
    status: 'uploading'
  });
  
  try {
    await uploadFile(file, folderId, isSharedStorage);
    
    uploads.set(id, {
      ...uploads.get(id),
      progress: 100,
      status: 'completed'
    });
    
    return true;
  } catch (error) {
    uploads.set(id, {
      ...uploads.get(id),
      status: 'failed'
    });
    
    throw error;
  }
};

export const cancelUpload = (id) => {
  const upload = uploads.get(id);
  if (!upload) return;
  
  uploads.set(id, {
    ...upload,
    status: 'cancelled'
  });
};

export const clearCompletedUploads = () => {
  for (const [id, upload] of uploads.entries()) {
    if (upload.status === 'completed' || upload.status === 'cancelled') {
      uploads.delete(id);
    }
  }
};
