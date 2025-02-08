
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const NavConfigTab = () => {
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
          <CardTitle>Configuração da Navegação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Logo (Texto)</label>
            <Input
              type="text"
              value={config?.navbar_logo_text || ''}
              placeholder="Texto do logo"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Logo (Imagem URL)</label>
            <Input
              type="text"
              value={config?.navbar_logo_image || ''}
              placeholder="URL da imagem do logo"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Facebook</label>
            <Input
              type="text"
              value={config?.navbar_social_facebook || ''}
              placeholder="URL do Facebook"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Instagram</label>
            <Input
              type="text"
              value={config?.navbar_social_instagram || ''}
              placeholder="URL do Instagram"
            />
          </div>

          <Button className="w-full">Salvar Alterações</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NavConfigTab;
