
import { useState } from "react";
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
} from "@/components/ui/";
import { toast } from "@/components/ui/use-toast";

interface ColorConfig {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  sentMessage: string;
  receivedMessage: string;
  inputBackground: string;
}

const defaultColors: ColorConfig = {
  primary: "#1A1F2C",
  secondary: "#9b87f5",
  background: "#0B141A",
  text: "#FFFFFF",
  sentMessage: "#005C4B",
  receivedMessage: "#202C33",
  inputBackground: "#2A3942"
};

export default function GeralChat() {
  const [colors, setColors] = useState<ColorConfig>(defaultColors);

  const handleColorChange = (key: keyof ColorConfig, value: string) => {
    setColors(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Aqui você pode implementar a lógica para salvar as cores
    localStorage.setItem('chatColors', JSON.stringify(colors));
    toast({
      title: "Configurações salvas",
      description: "As cores do chat foram atualizadas com sucesso.",
    });
  };

  const handleReset = () => {
    setColors(defaultColors);
    localStorage.removeItem('chatColors');
    toast({
      title: "Cores resetadas",
      description: "As cores do chat foram restauradas para o padrão.",
    });
  };

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
                        value={colors.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="w-full h-10 cursor-pointer"
                      />
                      <span className="text-sm">{colors.primary}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Cor Secundária (Gradiente Fim)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.secondary}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="w-full h-10 cursor-pointer"
                      />
                      <span className="text-sm">{colors.secondary}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Cor de Fundo</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.background}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="w-full h-10 cursor-pointer"
                      />
                      <span className="text-sm">{colors.background}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Cor do Texto</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.text}
                        onChange={(e) => handleColorChange('text', e.target.value)}
                        className="w-full h-10 cursor-pointer"
                      />
                      <span className="text-sm">{colors.text}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Cor das Mensagens Enviadas</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.sentMessage}
                        onChange={(e) => handleColorChange('sentMessage', e.target.value)}
                        className="w-full h-10 cursor-pointer"
                      />
                      <span className="text-sm">{colors.sentMessage}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Cor das Mensagens Recebidas</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.receivedMessage}
                        onChange={(e) => handleColorChange('receivedMessage', e.target.value)}
                        className="w-full h-10 cursor-pointer"
                      />
                      <span className="text-sm">{colors.receivedMessage}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Cor de Fundo do Input</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.inputBackground}
                        onChange={(e) => handleColorChange('inputBackground', e.target.value)}
                        className="w-full h-10 cursor-pointer"
                      />
                      <span className="text-sm">{colors.inputBackground}</span>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div
                  className="mt-6 p-4 rounded-lg"
                  style={{ backgroundColor: colors.background }}
                >
                  <div className="space-y-4">
                    <div
                      className="max-w-[80%] ml-auto p-3 rounded-lg"
                      style={{ backgroundColor: colors.sentMessage }}
                    >
                      <p style={{ color: colors.text }}>
                        Mensagem enviada de exemplo
                      </p>
                    </div>
                    <div
                      className="max-w-[80%] p-3 rounded-lg"
                      style={{ backgroundColor: colors.receivedMessage }}
                    >
                      <p style={{ color: colors.text }}>
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
