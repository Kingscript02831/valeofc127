
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LocationsManagement() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLocationAdd = async () => {
    setIsLoading(true);
    try {
      // Implementar lógica de adição de localização
      toast.success('Localização adicionada com sucesso');
    } catch (error) {
      console.error('Error adding location:', error);
      toast.error('Erro ao adicionar localização');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gerenciamento de Localizações</h2>
        <Button 
          onClick={handleLocationAdd}
          disabled={isLoading}
        >
          {isLoading ? 'Adicionando...' : 'Adicionar Localização'}
        </Button>
      </div>
    </div>
  );
}
