
import { supabase } from "../integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import type { FileMetadata } from "../types/files";

export async function uploadFile(file: File, bucket: string = 'uploads'): Promise<FileMetadata> {
  const fileId = uuidv4();
  const fileExt = file.name.split('.').pop();
  const fileName = `${fileId}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  const metadata: FileMetadata = {
    id: fileId,
    name: file.name,
    location: filePath,
    url: data.publicUrl,
    type: file.type.startsWith('image/') ? 'image' : 'video',
    size: file.size,
    createdAt: new Date().toISOString()
  };

  return metadata;
}

export async function uploadMultipleFiles(files: File[], bucket: string = 'uploads'): Promise<FileMetadata[]> {
  const uploadPromises = Array.from(files).map(file => uploadFile(file, bucket));
  return Promise.all(uploadPromises);
}
