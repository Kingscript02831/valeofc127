import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SystemSettings() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSystemUpdate = async () => {
    setIsLoading(true);
    try {
      // Implementar lógica de atualização do sistema
      toast.success('Sistema atualizado com sucesso');
    } catch (error) {
      console.error('Error updating system:', error);
      toast.error('Erro ao atualizar sistema');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Configurações do Sistema</h2>
        <Button 
          onClick={handleSystemUpdate}
          disabled={isLoading}
        >
          {isLoading ? 'Atualizando...' : 'Atualizar Sistema'}
        </Button>
      </div>
    </div>
  );
}
