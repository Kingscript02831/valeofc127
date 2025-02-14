
import { ChangeEvent, useRef } from "react";
import { Button } from "./button";
import { ImagePlus, Trash } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  currentImageUrl?: string | null;
  accept?: string;
  multiple?: boolean;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  currentImageUrl,
  accept = "image/*",
  multiple = false,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
      />

      <div className="flex flex-col items-center gap-4">
        {currentImageUrl ? (
          <div className="relative">
            <img
              src={currentImageUrl}
              alt="Preview"
              className="w-40 h-40 object-cover rounded-lg"
            />
            {onFileRemove && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2"
                onClick={onFileRemove}
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div
            className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
            onClick={handleClick}
          >
            <ImagePlus className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <Button type="button" onClick={handleClick}>
          {currentImageUrl ? "Trocar imagem" : "Selecionar imagem"}
        </Button>
      </div>
    </div>
  );
}
