import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SiteConfig, useSiteConfig } from '@/hooks/useSiteConfig';

const AdminSistema = () => {
  const { toast } = useToast();
  const [updateIntervalDays, setUpdateIntervalDays] = useState<number | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data: siteConfig, isLoading, isError, error } = useSiteConfig();

  useEffect(() => {
    if (siteConfig) {
      setUpdateIntervalDays(siteConfig.basic_info_update_interval);
    }
  }, [siteConfig]);

  const handleUpdateInterval = async () => {
    const { data, error } = await supabase
      .from('site_configuration')
      .update({ basic_info_update_interval: updateIntervalDays })
      .eq('id', siteConfig?.id);

    if (error) {
      toast({
        title: "Erro ao atualizar configuração",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Configuração atualizada",
      description: "O intervalo de atualização foi modificado com sucesso.",
    });
    queryClient.invalidateQueries(['site-configuration']);
  };

  if (isLoading) return <div>Carregando...</div>;
  if (isError) return <div>Erro: {error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Sistema</CardTitle>
          <CardDescription>
            Gerencie as configurações gerais do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="updateInterval">
              Intervalo de atualização de informações básicas (dias):
            </Label>
            <Input
              id="updateInterval"
              type="number"
              value={updateIntervalDays !== undefined ? updateIntervalDays.toString() : ''}
              onChange={(e) => setUpdateIntervalDays(Number(e.target.value))}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpdateInterval}>
            Atualizar Intervalo
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminSistema;
