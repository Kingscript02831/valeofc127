
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const SystemImages = () => {
  const { toast } = useToast();
  const [logo, setLogo] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);

  const updateImagesMutation = useMutation({
    mutationFn: async ({ logo, banner }: { logo?: File; banner?: File }) => {
      const { data: configData, error: fetchError } = await supabase
        .from('site_configuration')
        .select('id')
        .limit(1)
        .single();
      
      if (fetchError) throw fetchError;
      if (!configData?.id) throw new Error('No configuration found');

      const updates: any = {};

      if (logo) {
        const { data: logoData, error: logoError } = await supabase.storage
          .from('uploads')
          .upload(`system/${Date.now()}-${logo.name}`, logo);
        if (logoError) throw logoError;
        updates.logo_url = logoData.path;
      }

      if (banner) {
        const { data: bannerData, error: bannerError } = await supabase.storage
          .from('uploads')
          .upload(`system/${Date.now()}-${banner.name}`, banner);
        if (bannerError) throw bannerError;
        updates.banner_url = bannerData.path;
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('site_configuration')
          .update(updates)
          .eq('id', configData.id)
          .single();

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Imagens atualizadas",
        description: "As imagens do sistema foram atualizadas com sucesso",
      });
      setLogo(null);
      setBanner(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar imagens",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logo && !banner) return;
    updateImagesMutation.mutate({ logo, banner });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Imagens do Sistema</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block">Logo do Sistema</label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files?.[0] || null)}
          />
        </div>
        <div className="space-y-2">
          <label className="block">Banner do Sistema</label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setBanner(e.target.files?.[0] || null)}
          />
        </div>
        <Button type="submit">Salvar Imagens</Button>
      </form>
    </div>
  );
};
