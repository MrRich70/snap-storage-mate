
import React from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

interface UploadProgressProps {
  uploads: Array<{
    id: string;
    fileName: string;
    progress: number;
    status: string;
    bytesUploaded: number;
    totalBytes: number;
    error?: string;
  }>;
  onRetry: (uploadId: string) => void;
  onCancel: (uploadId: string) => void;
  onClearCompleted: () => void;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  uploads,
  onRetry,
  onCancel,
  onClearCompleted
}) => {
  if (uploads.length === 0) {
    return null;
  }

  const hasCompleted = uploads.some(u => u.status === 'completed' || u.status === 'error');
  
  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-96 overflow-y-auto bg-background border rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium">Uploads</h3>
        {hasCompleted && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearCompleted}
            className="h-7 px-2"
          >
            Clear Completed
          </Button>
        )}
      </div>
      
      <div className="p-2 space-y-3">
        {uploads.map((upload) => (
          <div key={upload.id} className="bg-muted/30 rounded-md p-2">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium truncate max-w-[180px]" title={upload.fileName}>
                {upload.fileName}
              </div>
              <div className="flex items-center gap-1">
                {upload.status === 'error' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onRetry(upload.id)}
                    title="Retry upload"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
                
                {upload.status !== 'completed' && (
                  <Button
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onCancel(upload.id)}
                    title="Cancel upload"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="mb-1">
              <Progress value={upload.progress} className="h-2" />
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                {upload.status === 'uploading' && (
                  <span>Uploading...</span>
                )}
                {upload.status === 'completed' && (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Completed</span>
                  </>
                )}
                {upload.status === 'error' && (
                  <>
                    <AlertTriangle className="h-3 w-3 text-destructive" />
                    <span>{upload.error || 'Failed'}</span>
                  </>
                )}
                {upload.status === 'paused' && (
                  <span>Paused</span>
                )}
              </div>
              
              <div>
                {Math.round(upload.bytesUploaded / 1024)}KB / {Math.round(upload.totalBytes / 1024)}KB
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadProgress;
