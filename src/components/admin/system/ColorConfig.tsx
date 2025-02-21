
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const ColorConfig = () => {
  const { toast } = useToast();
  const [primaryColor, setPrimaryColor] = useState("");
  const [navbarColor, setNavbarColor] = useState("");

  const updateColorsMutation = useMutation({
    mutationFn: async ({ primary, navbar }: { primary: string; navbar: string }) => {
      const { data: configData, error: fetchError } = await supabase
        .from('site_configuration')
        .select('id')
        .limit(1)
        .single();
      
      if (fetchError) throw fetchError;
      if (!configData?.id) throw new Error('No configuration found');

      const { data, error } = await supabase
        .from('site_configuration')
        .update({
          primary_color: primary,
          navbar_color: navbar,
        })
        .eq('id', configData.id)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Cores atualizadas",
        description: "As cores do sistema foram atualizadas com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar cores",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryColor || !navbarColor) return;
    updateColorsMutation.mutate({
      primary: primaryColor,
      navbar: navbarColor,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Cores do Sistema</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4 items-center">
          <Input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-20"
          />
          <span>Cor Primária</span>
        </div>
        <div className="flex gap-4 items-center">
          <Input
            type="color"
            value={navbarColor}
            onChange={(e) => setNavbarColor(e.target.value)}
            className="w-20"
          />
          <span>Cor da Barra de Navegação</span>
        </div>
        <Button type="submit">Salvar Cores</Button>
      </form>
    </div>
  );
};
