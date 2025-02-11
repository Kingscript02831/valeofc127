import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "../integrations/supabase/types";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { updateMetaTags } from "../utils/updateMetaTags";
import Navbar2 from "../components/Navbar2";
import SubNav2 from "../components/SubNav2";
import { usePermissions } from "../hooks/usePermissions";
import { useNavigate } from "react-router-dom";

type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];

const Admin = () => {
  const { isLoading, hasPermission } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !hasPermission('admin_news')) {
      toast.error("Você não tem permissão para acessar esta página");
      navigate('/');
    }
  }, [isLoading, hasPermission, navigate]);

  const [config, setConfig] = useState<SiteConfig>({
    id: "",
    theme_name: "light",
    primary_color: "#1A1F2C",
    secondary_color: "#D6BCFA",
    background_color: "#FFFFFF",
    text_color: "#1A1F2C",
    navbar_color: "#D6BCFA",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    navbar_logo_type: "text",
    navbar_logo_text: "VALEOFC",
    navbar_logo_image: null,
    navbar_social_facebook: null,
    navbar_social_instagram: null,
    language: "pt-BR",
    enable_dark_mode: false,
    enable_weather: false,
    header_alerts: [],
    navigation_links: [],
    font_size: "medium",
    footer_primary_color: "#1A1F2C",
    footer_secondary_color: "#D6BCFA",
    footer_text_color: "#FFFFFF",
    footer_contact_email: null,
    footer_contact_phone: null,
    footer_address: null,
    footer_address_cep: null,
    footer_social_facebook: null,
    footer_social_instagram: null,
    footer_schedule: null,
    footer_copyright_text: "© 2025 VALEOFC. Todos os direitos reservados.",
    meta_title: 'vale-news-hub',
    meta_description: 'Lovable Generated Project',
    meta_author: 'Lovable',
    meta_image: '/og-image.png',
    button_primary_color: "#9b87f5",
    button_secondary_color: "#7E69AB",
    bottom_nav_primary_color: "#1A1F2C",
    bottom_nav_secondary_color: "#D6BCFA",
    bottom_nav_text_color: "#FFFFFF",
    bottom_nav_icon_color: "#FFFFFF",
    high_contrast: false,
    location_lat: null,
    location_lng: null,
    location_city: null,
    location_state: null,
    location_country: null,
    weather_api_key: null,
    version: 1,
    login_text_color: "#1A1F2C",
    signup_text_color: "#1A1F2C"
  });

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        toast.error("Sessão expirada. Por favor, faça login novamente.");
        navigate('/login');
        return;
      }

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
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
      toast.error("Erro ao carregar configurações");
    }
  };

  const handleConfigUpdate = async () => {
    try {
      const { error } = await supabase
        .from("site_configuration")
        .update(config)
        .eq("id", config.id);

      if (error) throw error;

      // Update meta tags after successful database update
      updateMetaTags(
        config.meta_title,
        config.meta_description,
        config.meta_author,
        config.meta_image
      );

      toast.success("Configurações atualizadas com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao atualizar configurações");
    }
  };

  useEffect(() => {
    if (config) {
      // Update meta tags when configuration is initially loaded
      updateMetaTags(
        config.meta_title,
        config.meta_description,
        config.meta_author,
        config.meta_image
      );
    }
  }, [config]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasPermission('admin_news')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar2 />
      <SubNav2 />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Painel De Configurações</h1>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList>
            <TabsTrigger value="config">Navbar</TabsTrigger>
            <TabsTrigger value="footer">Rodapé</TabsTrigger>
            <TabsTrigger value="bottom-nav">Barra</TabsTrigger>
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="login">Login/Registro</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Cores dos Botões</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="button_primary_color">Cor Primária do Botão</Label>
                  <div className="flex gap-2">
                    <Input
                      id="button_primary_color"
                      type="color"
                      value={config.button_primary_color}
                      onChange={(e) => setConfig({ ...config, button_primary_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.button_primary_color}
                      onChange={(e) => setConfig({ ...config, button_primary_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="button_secondary_color">Cor Secundária do Botão</Label>
                  <div className="flex gap-2">
                    <Input
                      id="button_secondary_color"
                      type="color"
                      value={config.button_secondary_color}
                      onChange={(e) => setConfig({ ...config, button_secondary_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.button_secondary_color}
                      onChange={(e) => setConfig({ ...config, button_secondary_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Logo da Navbar</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="navbar_logo_type">Tipo de Logo</Label>
                  <div className="flex gap-4">
                    <Button
                      variant={config.navbar_logo_type === "text" ? "default" : "outline"}
                      onClick={() => setConfig({ ...config, navbar_logo_type: "text" })}
                    >
                      Texto
                    </Button>
                    <Button
                      variant={config.navbar_logo_type === "image" ? "default" : "outline"}
                      onClick={() => setConfig({ ...config, navbar_logo_type: "image" })}
                    >
                      Imagem
                    </Button>
                  </div>
                </div>

                {config.navbar_logo_type === "text" ? (
                  <div>
                    <Label htmlFor="logo_text">Texto da Logo</Label>
                    <Input
                      id="logo_text"
                      value={config.navbar_logo_text || ""}
                      onChange={(e) => setConfig({ ...config, navbar_logo_text: e.target.value })}
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="logo_image">Link da Imagem da Logo</Label>
                    <Input
                      id="logo_image"
                      value={config.navbar_logo_image || ""}
                      onChange={(e) => setConfig({ ...config, navbar_logo_image: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Redes Sociais da Navbar</h2>
              <div>
                <Label htmlFor="navbar_social_facebook">Link do Facebook</Label>
                <Input
                  id="navbar_social_facebook"
                  type="url"
                  value={config.navbar_social_facebook || ""}
                  onChange={(e) => setConfig({ ...config, navbar_social_facebook: e.target.value })}
                  placeholder="https://facebook.com/sua-pagina"
                />
              </div>
              <div>
                <Label htmlFor="navbar_social_instagram">Link do Instagram</Label>
                <Input
                  id="navbar_social_instagram"
                  type="url"
                  value={config.navbar_social_instagram || ""}
                  onChange={(e) => setConfig({ ...config, navbar_social_instagram: e.target.value })}
                  placeholder="https://instagram.com/seu-perfil"
                />
              </div>
            </div>

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
            </div>

            <div className="flex justify-end">
              <Button onClick={handleConfigUpdate}>
                Salvar Configurações
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="footer" className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Cores do Rodapé</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="footer_primary_color">Cor Primária do Rodapé</Label>
                  <div className="flex gap-2">
                    <Input
                      id="footer_primary_color"
                      type="color"
                      value={config.footer_primary_color}
                      onChange={(e) => setConfig({ ...config, footer_primary_color: e.target.value })}
                    />
                    <Input
                      type="text"
                      value={config.footer_primary_color}
                      onChange={(e) => setConfig({ ...config, footer_primary_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="footer_secondary_color">Cor Secundária do Rodapé</Label>
                  <div className="flex gap-2">
                    <Input
                      id="footer_secondary_color"
                      type="color"
                      value={config.footer_secondary_color}
                      onChange={(e) => setConfig({ ...config, footer_secondary_color: e.target.value })}
                    />
                    <Input
                      type="text"
                      value={config.footer_secondary_color}
                      onChange={(e) => setConfig({ ...config, footer_secondary_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="footer_text_color">Cor do Texto do Rodapé</Label>
                  <div className="flex gap-2">
                    <Input
                      id="footer_text_color"
                      type="color"
                      value={config.footer_text_color}
                      onChange={(e) => setConfig({ ...config, footer_text_color: e.target.value })}
                    />
                    <Input
                      type="text"
                      value={config.footer_text_color}
                      onChange={(e) => setConfig({ ...config, footer_text_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Informações de Contato</h2>
              
              <div>
                <Label htmlFor="footer_contact_email">Email de Contato</Label>
                <Input
                  id="footer_contact_email"
                  type="email"
                  value={config.footer_contact_email || ""}
                  onChange={(e) => setConfig({ ...config, footer_contact_email: e.target.value })}
                  placeholder="contato@exemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="footer_contact_phone">Telefone de Contato</Label>
                <Input
                  id="footer_contact_phone"
                  type="tel"
                  value={config.footer_contact_phone || ""}
                  onChange={(e) => setConfig({ ...config, footer_contact_phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <Label htmlFor="footer_address">Endereço</Label>
                <Input
                  id="footer_address"
                  value={config.footer_address || ""}
                  onChange={(e) => setConfig({ ...config, footer_address: e.target.value })}
                  placeholder="Rua Exemplo, 123 - Bairro"
                />
              </div>

              <div>
                <Label htmlFor="footer_address_cep">CEP</Label>
                <Input
                  id="footer_address_cep"
                  value={config.footer_address_cep || ""}
                  onChange={(e) => setConfig({ ...config, footer_address_cep: e.target.value })}
                  placeholder="00000-000"
                />
              </div>

              <div>
                <Label htmlFor="footer_schedule">Horário de Funcionamento</Label>
                <Input
                  id="footer_schedule"
                  value={config.footer_schedule || ""}
                  onChange={(e) => setConfig({ ...config, footer_schedule: e.target.value })}
                  placeholder="Segunda a Sexta, 9h às 18h"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Redes Sociais</h2>
              
              <div>
                <Label htmlFor="nav_social_facebook">Link do Facebook</Label>
                <Input
                  id="nav_social_facebook"
                  type="url"
                  value={config.footer_social_facebook || ""}
                  onChange={(e) => setConfig({ ...config, footer_social_facebook: e.target.value })}
                  placeholder="https://facebook.com/sua-pagina"
                />
              </div>

              <div>
                <Label htmlFor="nav_social_instagram">Link do Instagram</Label>
                <Input
                  id="nav_social_instagram"
                  type="url"
                  value={config.footer_social_instagram || ""}
                  onChange={(e) => setConfig({ ...config, footer_social_instagram: e.target.value })}
                  placeholder="https://instagram.com/seu-perfil"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Texto de Copyright</h2>
              <div>
                <Label htmlFor="footer_copyright_text">Texto de Copyright</Label>
                <Input
                  id="footer_copyright_text"
                  value={config.footer_copyright_text || ""}
                  onChange={(e) =>
                    setConfig({ ...config, footer_copyright_text: e.target.value })
                  }
                  placeholder="© 2025 VALEOFC. Todos os direitos reservados."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleConfigUpdate}>
                Salvar Configurações 
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="bottom-nav" className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Configurações da Barra Inferior</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="bottom_nav_primary_color">Cor Primária do Fundo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bottom_nav_primary_color"
                      type="color"
                      value={config.bottom_nav_primary_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_primary_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.bottom_nav_primary_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_primary_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bottom_nav_secondary_color">Cor Secundária do Fundo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bottom_nav_secondary_color"
                      type="color"
                      value={config.bottom_nav_secondary_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_secondary_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.bottom_nav_secondary_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_secondary_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bottom_nav_text_color">Cor do Texto</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bottom_nav_text_color"
                      type="color"
                      value={config.bottom_nav_text_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_text_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.bottom_nav_text_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_text_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bottom_nav_icon_color">Cor dos Ícones</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bottom_nav_icon_color"
                      type="color"
                      value={config.bottom_nav_icon_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_icon_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.bottom_nav_icon_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_icon_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleConfigUpdate}>
                Salvar Configurações
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="general" className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Cores dos Textos de Autenticação</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="login_text_color">Cor do Texto "Conecte-se"</Label>
                  <div className="flex gap-2">
                    <Input
                      id="login_text_color"
                      type="color"
                      value={config.login_text_color}
                      onChange={(e) => setConfig({ ...config, login_text_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.login_text_color}
                      onChange={(e) => setConfig({ ...config, login_text_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup_text_color">Cor do Texto "Inscreva-se"</Label>
                  <div className="flex gap-2">
                    <Input
                      id="signup_text_color"
                      type="color"
                      value={config.signup_text_color}
                      onChange={(e) => setConfig({ ...config, signup_text_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.signup_text_color}
                      onChange={(e) => setConfig({ ...config, signup_text_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Configurações Meta Tags</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="meta_title">Título da Página</Label>
                  <Input
                    id="meta_title"
                    value={config.meta_title || ""}
                    onChange={(e) => setConfig({ ...config, meta_title: e.target.value })}
                    placeholder="vale-news-hub"
                  />
                </div>

                <div>
                  <Label htmlFor="meta_description">Descrição da Página</Label>
                  <Textarea
                    id="meta_description"
                    value={config.meta_description || ""}
                    onChange={(e) => setConfig({ ...config, meta_description: e.target.value })}
                    placeholder="Descrição do seu site"
                  />
                </div>

                <div>
                  <Label htmlFor="meta_author">Autor</Label>
                  <Input
                    id="meta_author"
                    value={config.meta_author || ""}
                    onChange={(e) => setConfig({ ...config, meta_author: e.target.value })}
                    placeholder="Nome do autor"
                  />
                </div>

                <div>
                  <Label htmlFor="meta_image">Link da Imagem de Compartilhamento (OG Image)</Label>
                  <Input
                    id="meta_image"
                    value={config.meta_image || ""}
                    onChange={(e) => setConfig({ ...config, meta_image: e.target.value })}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Esta imagem será exibida quando o site for compartilhado em redes sociais
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Configurações Gerais</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="theme_name">Tema</Label>
                  <select
                    id="theme_name"
                    className="w-full border border-gray-300 rounded-md p-2"
                    value={config.theme_name}
                    onChange={(e) => setConfig({ ...config, theme_name: e.target.value })}
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <select
                    id="language"
                    className="w-full border border-gray-300 rounded-md p-2"
                    value={config.language || "pt-BR"}
                    onChange={(e) => setConfig({ ...config, language: e.target.value })}
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="font_size">Tamanho da Fonte</Label>
                  <select
                    id="font_size"
                    className="w-full border border-gray-300 rounded-md p-2"
                    value={config.font_size || "medium"}
                    onChange={(e) => setConfig({ ...config, font_size: e.target.value })}
                  >
                    <option value="small">Pequeno</option>
                    <option value="medium">Médio</option>
                    <option value="large">Grande</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enable_dark_mode"
                    checked={config.enable_dark_mode || false}
                    onChange={(e) => setConfig({ ...config, enable_dark_mode: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="enable_dark_mode">Habilitar Modo Escuro</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="high_contrast"
                    checked={config.high_contrast || false}
                    onChange={(e) => setConfig({ ...config, high_contrast: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="high_contrast">Alto Contraste</Label>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Configurações de Localização</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="location_city">Cidade</Label>
                  <Input
                    id="location_city"
                    value={config.location_city || ""}
                    onChange={(e) => setConfig({ ...config, location_city: e.target.value })}
                    placeholder="São Paulo"
                  />
                </div>

                <div>
                  <Label htmlFor="location_state">Estado</Label>
                  <Input
                    id="location_state"
                    value={config.location_state || ""}
                    onChange={(e) => setConfig({ ...config, location_state: e.target.value })}
                    placeholder="SP"
                  />
                </div>

                <div>
                  <Label htmlFor="location_country">País</Label>
                  <Input
                    id="location_country"
                    value={config.location_country || ""}
                    onChange={(e) => setConfig({ ...config, location_country: e.target.value })}
                    placeholder="BR"
                  />
                </div>

                <div>
                  <Label htmlFor="location_lat">Latitude</Label>
                  <Input
                    id="location_lat"
                    type="number"
                    step="0.000001"
                    value={config.location_lat || ""}
                    onChange={(e) => setConfig({ ...config, location_lat: parseFloat(e.target.value) })}
                    placeholder="-23.5505"
                  />
                </div>

                <div>
                  <Label htmlFor="location_lng">Longitude</Label>
                  <Input
                    id="location_lng"
                    type="number"
                    step="0.000001"
                    value={config.location_lng || ""}
                    onChange={(e) => setConfig({ ...config, location_lng: parseFloat(e.target.value) })}
                    placeholder="-46.6333"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Configurações do Clima</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enable_weather"
                    checked={config.enable_weather || false}
                    onChange={(e) => setConfig({ ...config, enable_weather: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="enable_weather">Habilitar Previsão do Tempo</Label>
                </div>

                <div>
                  <Label htmlFor="weather_api_key">Chave da API do Clima</Label>
                  <Input
                    id="weather_api_key"
                    type="password"
                    value={config.weather_api_key || ""}
                    onChange={(e) => setConfig({ ...config, weather_api_key: e.target.value })}
                    placeholder="Sua chave da API do clima"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Esta chave é necessária para acessar os dados de previsão do tempo
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleConfigUpdate}>
                Salvar Configurações
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="login" className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Cores dos Textos de Autenticação</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="login_text_color">Cor do Texto "Conecte-se"</Label>
                  <div className="flex gap-2">
                    <Input
                      id="login_text_color"
                      type="color"
                      value={config.login_text_color}
                      onChange={(e) => setConfig({ ...config, login_text_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.login_text_color}
                      onChange={(e) => setConfig({ ...config, login_text_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup_text_color">Cor do Texto "Inscreva-se"</Label>
                  <div className="flex gap-2">
                    <Input
                      id="signup_text_color"
                      type="color"
                      value={config.signup_text_color}
                      onChange={(e) => setConfig({ ...config, signup_text_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.signup_text_color}
                      onChange={(e) => setConfig({ ...config, signup_text_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleConfigUpdate}>
                Salvar Configurações
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
