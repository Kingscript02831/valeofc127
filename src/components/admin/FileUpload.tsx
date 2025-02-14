
import React, { useCallback } from 'react';
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (url: string) => void;
  accept?: string;
  currentValue?: string;
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
      const url = await uploadFile(file);
      onFileSelect(url);
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
          {currentValue.includes('video') ? (
            <video src={currentValue} className="w-full h-full object-contain" controls />
          ) : (
            <img src={currentValue} alt="Preview" className="w-full h-full object-contain" />
          )}
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
