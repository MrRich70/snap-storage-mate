
// Types for storage operations
export interface Folder {
  id: string;
  name: string;
  createdAt: string;
  parentId: string | null;
}

export interface ImageFile {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  size: number;
  type: string;
  folderId: string;
  createdAt: string;
  updatedAt: string;
}
