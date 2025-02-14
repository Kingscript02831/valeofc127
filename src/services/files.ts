
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "../integrations/supabase/client";
import type { FileInfo } from "../types/places";

const BUCKET_NAME = 'uploads';

export async function uploadFile(file: File): Promise<FileInfo> {
  // Gera um nome único para o arquivo
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Faz o upload do arquivo
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  // Obtém a URL pública do arquivo
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  // Insere o registro do arquivo no banco
  const { data: fileData, error: insertError } = await supabase
    .from('files')
    .insert({
      path: filePath,
      metadata: {
        size: file.size,
        mimetype: file.type,
        name: file.name
      }
    })
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  return {
    id: fileData.id,
    path: filePath,
    url: publicUrl,
    metadata: {
      size: file.size,
      mimetype: file.type,
      name: file.name
    }
  };
}

export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    throw error;
  }
}
