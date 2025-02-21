
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const BasicInfoUpdateInterval = () => {
  const { toast } = useToast();
  const [days, setDays] = useState<string>("");

  const updateIntervalMutation = useMutation({
    mutationFn: async (days: number) => {
      const { data: configData, error: fetchError } = await supabase
        .from('site_configuration')
        .select('id')
        .limit(1)
        .single();
      
      if (fetchError) throw fetchError;
      if (!configData?.id) throw new Error('No configuration found');

      const { data, error } = await supabase
        .from('site_configuration')
        .update({ basic_info_update_interval: days })
        .eq('id', configData.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Configuração atualizada",
        description: "O intervalo de atualização foi modificado com sucesso",
      });
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
    if (!days) return;
    updateIntervalMutation.mutate(Number(days));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Intervalo para atualização de informações básicas</h2>
      <form onSubmit={handleSubmit} className="flex gap-4">
        <Input
          type="number"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          placeholder="Dias"
          className="max-w-[200px]"
        />
        <Button type="submit">Salvar</Button>
      </form>
    </div>
  );
};
