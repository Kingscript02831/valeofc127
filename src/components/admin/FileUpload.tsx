
import React, { useCallback } from 'react';
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Upload } from 'lucide-react';
import type { FileMetadata } from "../../types/files";

interface FileUploadProps {
  onFileSelect: (metadata: FileMetadata) => void;
  accept?: string;
  currentValue?: FileMetadata;
  buttonText?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  accept = "image/*,video/*",
  currentValue,
  buttonText = "Upload File"
}) => {
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { uploadFile } = await import('../../utils/uploadFile');
      const metadata = await uploadFile(file);
      onFileSelect(metadata);
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Error uploading file");
    }
  }, [onFileSelect]);

  return (
    <div className="flex flex-col gap-2">
      {currentValue && (
        <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
          {currentValue.type === 'video' ? (
            <video src={currentValue.url} className="w-full h-full object-contain" controls />
          ) : (
            <img src={currentValue.url} alt={currentValue.name} className="w-full h-full object-contain" />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
            {currentValue.name}
          </div>
        </div>
      )}
      <Button 
        type="button" 
        variant="outline"
        className="w-full"
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <Upload className="w-4 h-4 mr-2" />
        {buttonText}
      </Button>
      <input
        id="fileInput"
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />
    </div>
  );
}
