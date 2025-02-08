
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FooterTab = () => {
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
          <CardTitle>Configuração do Rodapé</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Texto de Copyright</label>
            <Input
              type="text"
              value={config?.footer_copyright_text || ''}
              placeholder="Texto de copyright"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email de Contato</label>
            <Input
              type="email"
              value={config?.footer_contact_email || ''}
              placeholder="Email de contato"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Telefone</label>
            <Input
              type="tel"
              value={config?.footer_contact_phone || ''}
              placeholder="Telefone de contato"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Endereço</label>
            <Input
              type="text"
              value={config?.footer_address || ''}
              placeholder="Endereço"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">CEP</label>
            <Input
              type="text"
              value={config?.footer_address_cep || ''}
              placeholder="CEP"
            />
          </div>

          <Button className="w-full">Salvar Alterações</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FooterTab;
