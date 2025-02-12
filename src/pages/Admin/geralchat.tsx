
import { useEffect, useState } from "react";
import { 
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ColorConfig {
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  sent_message_color: string;
  received_message_color: string;
  input_background_color: string;
}

const defaultColors: ColorConfig = {
  primary_color: "#1A1F2C",
  secondary_color: "#9b87f5",
  background_color: "#0B141A",
  text_color: "#FFFFFF",
  sent_message_color: "#005C4B",
  received_message_color: "#202C33",
  input_background_color: "#2A3942"
};

export default function GeralChat() {
  const [colors, setColors] = useState<ColorConfig>(defaultColors);

  const { data: chatConfig, isLoading } = useQuery({
    queryKey: ['chat-configuration'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_configuration')
        .select('*')
        .single();

      if (error) throw error;
      return data as ColorConfig;
    }
  });

  useEffect(() => {
    if (chatConfig) {
      setColors(chatConfig);
    }
  }, [chatConfig]);

  const handleColorChange = (key: keyof ColorConfig, value: string) => {
    setColors(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('chat_configuration')
        .update(colors)
        .neq('id', null);

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "As cores do chat foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      });
    }
  };

  const handleReset = async () => {
    try {
      const { error } = await supabase
        .from('chat_configuration')
        .update(defaultColors)
        .neq('id', null);

      if (error) throw error;

      setColors(defaultColors);
      toast({
        title: "Cores resetadas",
        description: "As cores do chat foram restauradas para o padrão.",
      });
    } catch (error) {
      toast({
        title: "Erro ao resetar",
        description: "Ocorreu um erro ao resetar as configurações.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Chat</CardTitle>
            <CardDescription>Carregando configurações...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Chat</CardTitle>
          <CardDescription>
            Personalize as cores do seu chat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="colors">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="colors">Chat Cor</TabsTrigger>
            </TabsList>
            <TabsContent value="colors">
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium">Cor Primária (Gradiente Início)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.primary_color}
                        onChange={(e) => handleColorChange('primary_color', e.target.value)}
                        className="w-full h-10 cursor-pointer"
                      />
                      <span className="text-sm">{colors.primary_color}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Cor Secundária (Gradiente Fim)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.secondary_color}
                        onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                        className="w-full h-10 cursor-pointer"
                      />
                      <span className="text-sm">{colors.secondary_color}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Cor de Fundo</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.background_color}
                        onChange={(e) => handleColorChange('background_color', e.target.value)}
                        className="w-full h-10 cursor-pointer"
                      />
                      <span className="text-sm">{colors.background_color}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Cor do Texto</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.text_color}
                        onChange={(e) => handleColorChange('text_color', e.target.value)}
                        className="w-full h-10 cursor-pointer"
                      />
                      <span className="text-sm">{colors.text_color}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Cor das Mensagens Enviadas</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.sent_message_color}
                        onChange={(e) => handleColorChange('sent_message_color', e.target.value)}
                        className="w-full h-10 cursor-pointer"
                      />
                      <span className="text-sm">{colors.sent_message_color}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Cor das Mensagens Recebidas</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.received_message_color}
                        onChange={(e) => handleColorChange('received_message_color', e.target.value)}
                        className="w-full h-10 cursor-pointer"
                      />
                      <span className="text-sm">{colors.received_message_color}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Cor de Fundo do Input</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.input_background_color}
                        onChange={(e) => handleColorChange('input_background_color', e.target.value)}
                        className="w-full h-10 cursor-pointer"
                      />
                      <span className="text-sm">{colors.input_background_color}</span>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div
                  className="mt-6 p-4 rounded-lg"
                  style={{ backgroundColor: colors.background_color }}
                >
                  <div className="space-y-4">
                    <div
                      className="max-w-[80%] ml-auto p-3 rounded-lg"
                      style={{ backgroundColor: colors.sent_message_color }}
                    >
                      <p style={{ color: colors.text_color }}>
                        Mensagem enviada de exemplo
                      </p>
                    </div>
                    <div
                      className="max-w-[80%] p-3 rounded-lg"
                      style={{ backgroundColor: colors.received_message_color }}
                    >
                      <p style={{ color: colors.text_color }}>
                        Mensagem recebida de exemplo
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Restaurar Padrão
          </Button>
          <Button onClick={handleSave}>
            Salvar Alterações
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
