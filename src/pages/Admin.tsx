import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];

const Admin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<SiteConfig>({
    id: "",
    theme_name: "light",
    primary_color: "#1A1F2C",
    secondary_color: "#D6BCFA",
    background_color: "#FFFFFF",
    text_color: "#1A1F2C",
    navbar_color: "#D6BCFA",
    footer_color: "#F1F0FB",
    accent_color: "#8B5CF6",
    title_color: "#1A1F2C",
    numbers_color: "#1A1F2C",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  useEffect(() => {
    checkSession();
    if (isAuthenticated) {
      fetchConfiguration();
    }
  }, [isAuthenticated]);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  };

  const fetchConfiguration = async () => {
    const { data, error } = await supabase
      .from("site_configuration")
      .select("*")
      .single();

    if (error) {
      toast.error("Erro ao carregar configurações");
      return;
    }

    if (data) {
      setConfig(data);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: adminCheck, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", email)
        .single();

      if (adminError || !adminCheck) {
        await supabase.auth.signOut();
        throw new Error("Usuário não autorizado");
      }

      setIsAuthenticated(true);
      toast.success("Login realizado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    navigate("/admin");
  };

  const handleConfigUpdate = async () => {
    try {
      const { error } = await supabase
        .from("site_configuration")
        .update(config)
        .eq("id", config.id);

      if (error) throw error;

      toast.success("Configurações atualizadas com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao atualizar configurações");
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <p>Carregando...</p>
    </div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Painel Administrativo
            </h2>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configurações do Site</h1>
          <Button onClick={handleLogout} variant="outline">
            Sair
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="primary_color">Cor Primária</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={config.primary_color}
                  onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                />
                <Input
                  type="text"
                  value={config.primary_color}
                  onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="secondary_color">Cor Secundária</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary_color"
                  type="color"
                  value={config.secondary_color}
                  onChange={(e) => setConfig({ ...config, secondary_color: e.target.value })}
                />
                <Input
                  type="text"
                  value={config.secondary_color}
                  onChange={(e) => setConfig({ ...config, secondary_color: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="background_color">Cor de Fundo</Label>
              <div className="flex gap-2">
                <Input
                  id="background_color"
                  type="color"
                  value={config.background_color}
                  onChange={(e) => setConfig({ ...config, background_color: e.target.value })}
                />
                <Input
                  type="text"
                  value={config.background_color}
                  onChange={(e) => setConfig({ ...config, background_color: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="text_color">Cor do Texto</Label>
              <div className="flex gap-2">
                <Input
                  id="text_color"
                  type="color"
                  value={config.text_color}
                  onChange={(e) => setConfig({ ...config, text_color: e.target.value })}
                />
                <Input
                  type="text"
                  value={config.text_color}
                  onChange={(e) => setConfig({ ...config, text_color: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="navbar_color">Cor da Navbar</Label>
              <div className="flex gap-2">
                <Input
                  id="navbar_color"
                  type="color"
                  value={config.navbar_color}
                  onChange={(e) => setConfig({ ...config, navbar_color: e.target.value })}
                />
                <Input
                  type="text"
                  value={config.navbar_color}
                  onChange={(e) => setConfig({ ...config, navbar_color: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="footer_color">Cor do Rodapé</Label>
              <div className="flex gap-2">
                <Input
                  id="footer_color"
                  type="color"
                  value={config.footer_color}
                  onChange={(e) => setConfig({ ...config, footer_color: e.target.value })}
                />
                <Input
                  type="text"
                  value={config.footer_color}
                  onChange={(e) => setConfig({ ...config, footer_color: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="accent_color">Cor de Destaque</Label>
              <div className="flex gap-2">
                <Input
                  id="accent_color"
                  type="color"
                  value={config.accent_color}
                  onChange={(e) => setConfig({ ...config, accent_color: e.target.value })}
                />
                <Input
                  type="text"
                  value={config.accent_color}
                  onChange={(e) => setConfig({ ...config, accent_color: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title_color">Cor dos Títulos</Label>
              <div className="flex gap-2">
                <Input
                  id="title_color"
                  type="color"
                  value={config.title_color}
                  onChange={(e) => setConfig({ ...config, title_color: e.target.value })}
                />
                <Input
                  type="text"
                  value={config.title_color}
                  onChange={(e) => setConfig({ ...config, title_color: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="numbers_color">Cor dos Números</Label>
              <div className="flex gap-2">
                <Input
                  id="numbers_color"
                  type="color"
                  value={config.numbers_color}
                  onChange={(e) => setConfig({ ...config, numbers_color: e.target.value })}
                />
                <Input
                  type="text"
                  value={config.numbers_color}
                  onChange={(e) => setConfig({ ...config, numbers_color: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleConfigUpdate}>
              Salvar Configurações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;