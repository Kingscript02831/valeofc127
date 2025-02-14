
import { supabase } from "../integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export async function uploadFile(file: File, bucket: string = 'uploads'): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `lovable-uploads/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function uploadMultipleFiles(files: File[], bucket: string = 'uploads'): Promise<string[]> {
  const uploadPromises = Array.from(files).map(file => uploadFile(file, bucket));
  return Promise.all(uploadPromises);
}
