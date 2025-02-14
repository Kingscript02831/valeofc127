
import { v4 as uuidv4 } from 'uuid';
import type { FileMetadata } from "../types/files";

export async function uploadFile(file: File, bucket: string = 'uploads'): Promise<FileMetadata> {
  const fileId = uuidv4();
  const fileExt = file.name.split('.').pop();
  const fileName = `${fileId}.${fileExt}`;
  const filePath = `lovable-uploads/${fileName}`;

  // Convert File to Base64
  const reader = new FileReader();
  const fileBase64 = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Save file to public folder
  const publicUrl = `/${filePath}`;

  // Create metadata
  const metadata: FileMetadata = {
    id: fileId,
    name: file.name,
    location: filePath,
    url: publicUrl,
    type: file.type.startsWith('image/') ? 'image' : 'video',
    size: file.size,
    createdAt: new Date().toISOString()
  };

  // Save the base64 data to localStorage for demo purposes
  // In a real app, you would send this to your backend
  try {
    const existingFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
    existingFiles.push({ ...metadata, data: fileBase64 });
    localStorage.setItem('uploadedFiles', JSON.stringify(existingFiles));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }

  return metadata;
}

export async function uploadMultipleFiles(files: File[], bucket: string = 'uploads'): Promise<FileMetadata[]> {
  const uploadPromises = Array.from(files).map(file => uploadFile(file, bucket));
  return Promise.all(uploadPromises);
}
