
import { User } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

interface ProfileAvatarProps {
  avatarUrl: string | null | undefined;
}

export const ProfileAvatar = ({ avatarUrl }: ProfileAvatarProps) => {
  const { toast } = useToast();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const imgElement = e.target as HTMLImageElement;
    console.error("Erro ao carregar a imagem do avatar:", {
      urlTentada: imgElement.src,
      urlOriginal: avatarUrl,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-cache',
      }
    });

    toast({
      title: "Erro ao carregar imagem",
      description: "Por favor, verifique se:\n1. O link do Dropbox está correto\n2. A imagem é pública\n3. O link é de compartilhamento",
      variant: "destructive",
    });
  };

  if (!avatarUrl) {
    return (
      <div className="w-24 h-24 rounded-full bg-gray-800 ring-2 ring-gray-700 flex items-center justify-center">
        <User className="w-12 h-12 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-gray-700">
      <img
        src={avatarUrl}
        alt="Avatar"
        className="w-full h-full object-cover"
        onError={handleImageError}
        onLoad={() => {
          console.log("Imagem carregada com sucesso:", {
            url: avatarUrl
          });
        }}
        crossOrigin="anonymous"
      />
    </div>
  );
};
