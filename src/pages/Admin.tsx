
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Settings, Share2, Bell, Users } from "lucide-react";

const Admin = () => {
  const handleClearCache = () => {
    // Limpar cache do aplicativo
    localStorage.clear();
    toast.success("Cache limpo com sucesso!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Painel Administrativo
          </h2>
          <p className="mt-2 text-gray-600">
            Gerencie as configurações do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Configurações Gerais */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Configurações Gerais</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Gerencie as configurações básicas do sistema
            </p>
            <Button onClick={handleClearCache} variant="outline" className="w-full">
              Limpar Cache
            </Button>
          </Card>

          {/* Compartilhamento */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Share2 className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Compartilhamento</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Configure as opções de compartilhamento
            </p>
            <Button variant="outline" className="w-full">
              Configurar Redes Sociais
            </Button>
          </Card>

          {/* Notificações */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Notificações</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Gerencie as configurações de notificações
            </p>
            <Button variant="outline" className="w-full">
              Configurar Notificações
            </Button>
          </Card>

          {/* Usuários */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Usuários</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Gerencie os usuários do sistema
            </p>
            <Button variant="outline" className="w-full">
              Gerenciar Usuários
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
