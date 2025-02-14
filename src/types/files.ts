
export interface FileMetadata {
  id: string;
  name: string;
  location: string;
  url: string;
  type: 'image' | 'video';
  size?: number;
  createdAt: string;
}
