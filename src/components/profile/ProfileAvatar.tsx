
import { User } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useEffect, useState } from "react";

interface ProfileAvatarProps {
  avatarUrl: string | null | undefined;
}

export const ProfileAvatar = ({ avatarUrl }: ProfileAvatarProps) => {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    if (avatarUrl) {
      try {
        // Remove qualquer parâmetro da URL original
        const baseUrl = avatarUrl.split('?')[0];
        
        // Converte para URL direta do Dropbox
        let directUrl = baseUrl;
        
        if (baseUrl.includes('www.dropbox.com')) {
          if (baseUrl.includes('/s/')) {
            directUrl = baseUrl.replace('www.dropbox.com/s/', 'dl.dropboxusercontent.com/s/');
          } else if (baseUrl.includes('/scl/')) {
            directUrl = baseUrl.replace('www.dropbox.com/scl/', 'dl.dropboxusercontent.com/scl/');
          }
          // Adiciona parâmetro raw=1 apenas se for URL do Dropbox
          directUrl = `${directUrl}?raw=1`;
        }
        
        console.log('URL original:', avatarUrl);
        console.log('URL convertida:', directUrl);
        
        setImageUrl(directUrl);
      } catch (error) {
        console.error('Erro ao processar URL:', error);
        setImageUrl(avatarUrl);
      }
    }
  }, [avatarUrl]);

  const handleImageError = () => {
    console.error("Erro ao carregar imagem:", {
      urlOriginal: avatarUrl,
      urlProcessada: imageUrl
    });

    toast({
      title: "Erro ao carregar imagem",
      description: "Verifique se:\n1. O link do Dropbox está correto\n2. A imagem é pública\n3. O link é de compartilhamento",
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
        src={imageUrl}
        alt="Avatar"
        className="w-full h-full object-cover"
        onError={handleImageError}
        onLoad={() => console.log("Imagem carregada com sucesso!")}
      />
    </div>
  );
};
