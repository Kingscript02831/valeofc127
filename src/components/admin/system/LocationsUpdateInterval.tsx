
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type { Database } from "@/types/supabase";

type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];

export const LocationsUpdateInterval = () => {
  const { toast } = useToast();
  const [interval, setInterval] = useState<string>("");

  // Fetch current configuration
  const { data: config, isLoading } = useQuery({
    queryKey: ['site-configuration'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_configuration')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as SiteConfig;
    },
  });

  // Update interval mutation
  const updateIntervalMutation = useMutation({
    mutationFn: async (days: number) => {
      const { data: configData, error: fetchError } = await supabase
        .from('site_configuration')
        .select('id')
        .limit(1)
        .single();
      
      if (fetchError) throw fetchError;
      if (!configData?.id) throw new Error('Nenhuma configuração encontrada');

      const { error } = await supabase
        .from('site_configuration')
        .update({ locations_update_interval: days })
        .eq('id', configData.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Configuração atualizada",
        description: "O intervalo de atualização de localizações foi modificado com sucesso",
      });
      setInterval("");
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar configuração",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interval) return;
    updateIntervalMutation.mutate(Number(interval));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Intervalo para Atualização de Localizações</h2>
      <form onSubmit={handleSubmit} className="flex gap-4 items-center">
        <div className="space-y-2">
          <Input
            type="number"
            min="1"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            placeholder="Dias"
            className="max-w-[200px]"
          />
          <p className="text-sm text-muted-foreground">
            Atual: {config?.locations_update_interval || 'Não definido'} dias
          </p>
        </div>
        <Button 
          type="submit"
          disabled={updateIntervalMutation.isPending}
        >
          {updateIntervalMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar'
          )}
        </Button>
      </form>
    </div>
  );
};
