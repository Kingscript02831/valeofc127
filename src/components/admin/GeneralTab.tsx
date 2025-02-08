
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const GeneralTab = () => {
  const { data: config } = useQuery({
    queryKey: ['site_configuration'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_configuration')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Cor Primária</label>
            <Input
              type="color"
              value={config?.primary_color || '#000000'}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Cor do Texto</label>
            <Input
              type="color"
              value={config?.text_color || '#000000'}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Cor de Destaque</label>
            <Input
              type="color"
              value={config?.accent_color || '#000000'}
              className="h-10"
            />
          </div>

          <Button className="w-full">Salvar Alterações</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralTab;
