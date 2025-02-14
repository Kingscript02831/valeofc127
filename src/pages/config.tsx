import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { supabase } from '../integrations/supabase/client';
import type { Database } from '../integrations/supabase/types';

const ConfigPage = () => {
  const [siteConfig, setSiteConfig] = useState<Database['public']['Tables']['site_configuration']['Row'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSiteConfig();
  }, []);

  const fetchSiteConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_configuration')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      setSiteConfig(data);
    } catch (error) {
      console.error('Error fetching site configuration:', error);
      toast.error('Erro ao carregar configurações do site');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setSiteConfig((prevConfig) => ({
      ...prevConfig,
      [name]: type === 'checkbox' ? checked : value,
    } as Database['public']['Tables']['site_configuration']['Row']));
  };

  const handleSubmit = async (siteConfig: Database['public']['Tables']['site_configuration']['Row']) => {
    try {
      const { data, error } = await supabase
        .from('site_configuration')
        .update({
          ...siteConfig,
          updated_at: new Date().toISOString()
        })
        .eq('id', siteConfig.id);

      if (error) throw error;
      toast.success('Configurações atualizadas com sucesso!');
      window.location.reload();
    } catch (error) {
      console.error('Error updating site configuration:', error);
      toast.error('Erro ao atualizar configurações');
    }
  };

  if (loading) {
    return <div>Carregando configurações...</div>;
  }

  if (!siteConfig) {
    return <div>Nenhuma configuração encontrada.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Configurações do Site</h1>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(siteConfig);
      }} className="space-y-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="general">
            <AccordionTrigger>Geral</AccordionTrigger>
            <AccordionContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="theme_name">Nome do Tema</Label>
                  <Input
                    type="text"
                    id="theme_name"
                    name="theme_name"
                    value={siteConfig.theme_name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="version">Versão</Label>
                  <Input
                    type="number"
                    id="version"
                    name="version"
                    value={siteConfig.version || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <Input
                    type="text"
                    id="language"
                    name="language"
                    value={siteConfig.language || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="colors">
            <AccordionTrigger>Cores</AccordionTrigger>
            <AccordionContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary_color">Cor Primária</Label>
                  <Input
                    type="color"
                    id="primary_color"
                    name="primary_color"
                    value={siteConfig.primary_color}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="secondary_color">Cor Secundária</Label>
                  <Input
                    type="color"
                    id="secondary_color"
                    name="secondary_color"
                    value={siteConfig.secondary_color}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="text_color">Cor do Texto</Label>
                  <Input
                    type="color"
                    id="text_color"
                    name="text_color"
                    value={siteConfig.text_color}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="background_color">Cor de Fundo</Label>
                  <Input
                    type="color"
                    id="background_color"
                    name="background_color"
                    value={siteConfig.background_color}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="navbar">
            <AccordionTrigger>Navbar</AccordionTrigger>
            <AccordionContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="navbar_color">Cor da Navbar</Label>
                  <Input
                    type="color"
                    id="navbar_color"
                    name="navbar_color"
                    value={siteConfig.navbar_color}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="navbar_logo_type">Tipo de Logo da Navbar</Label>
                  <Select value={siteConfig.navbar_logo_type} onValueChange={(value) => {
                    setSiteConfig((prevConfig) => ({
                      ...prevConfig,
                      navbar_logo_type: value,
                    } as Database['public']['Tables']['site_configuration']['Row']));
                  }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o tipo de logo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Imagem</SelectItem>
                      <SelectItem value="text">Texto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {siteConfig.navbar_logo_type === 'image' && (
                  <div>
                    <Label htmlFor="navbar_logo_image">URL da Imagem do Logo</Label>
                    <Input
                      type="text"
                      id="navbar_logo_image"
                      name="navbar_logo_image"
                      value={siteConfig.navbar_logo_image || ''}
                      onChange={handleChange}
                    />
                  </div>
                )}
                {siteConfig.navbar_logo_type === 'text' && (
                  <div>
                    <Label htmlFor="navbar_logo_text">Texto do Logo</Label>
                    <Input
                      type="text"
                      id="navbar_logo_text"
                      name="navbar_logo_text"
                      value={siteConfig.navbar_logo_text || ''}
                      onChange={handleChange}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="navbar_social_facebook">Facebook</Label>
                  <Input
                    type="url"
                    id="navbar_social_facebook"
                    name="navbar_social_facebook"
                    value={siteConfig.navbar_social_facebook || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="navbar_social_instagram">Instagram</Label>
                  <Input
                    type="url"
                    id="navbar_social_instagram"
                    name="navbar_social_instagram"
                    value={siteConfig.navbar_social_instagram || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="bottomNav">
            <AccordionTrigger>Bottom Navigation</AccordionTrigger>
            <AccordionContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bottom_nav_primary_color">Cor Primária</Label>
                  <Input
                    type="color"
                    id="bottom_nav_primary_color"
                    name="bottom_nav_primary_color"
                    value={siteConfig.bottom_nav_primary_color}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="bottom_nav_secondary_color">Cor Secundária</Label>
                  <Input
                    type="color"
                    id="bottom_nav_secondary_color"
                    name="bottom_nav_secondary_color"
                    value={siteConfig.bottom_nav_secondary_color}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="bottom_nav_text_color">Cor do Texto</Label>
                  <Input
                    type="color"
                    id="bottom_nav_text_color"
                    name="bottom_nav_text_color"
                    value={siteConfig.bottom_nav_text_color}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="bottom_nav_icon_color">Cor do Ícone</Label>
                  <Input
                    type="color"
                    id="bottom_nav_icon_color"
                    name="bottom_nav_icon_color"
                    value={siteConfig.bottom_nav_icon_color}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="footer">
            <AccordionTrigger>Footer</AccordionTrigger>
            <AccordionContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="footer_primary_color">Cor Primária</Label>
                  <Input
                    type="color"
                    id="footer_primary_color"
                    name="footer_primary_color"
                    value={siteConfig.footer_primary_color}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="footer_secondary_color">Cor Secundária</Label>
                  <Input
                    type="color"
                    id="footer_secondary_color"
                    name="footer_secondary_color"
                    value={siteConfig.footer_secondary_color}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="footer_text_color">Cor do Texto</Label>
                  <Input
                    type="color"
                    id="footer_text_color"
                    name="footer_text_color"
                    value={siteConfig.footer_text_color}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="footer_copyright_text">Texto de Copyright</Label>
                  <Input
                    type="text"
                    id="footer_copyright_text"
                    name="footer_copyright_text"
                    value={siteConfig.footer_copyright_text || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="footer_address">Endereço</Label>
                  <Input
                    type="text"
                    id="footer_address"
                    name="footer_address"
                    value={siteConfig.footer_address || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="footer_address_cep">CEP</Label>
                  <Input
                    type="text"
                    id="footer_address_cep"
                    name="footer_address_cep"
                    value={siteConfig.footer_address_cep || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="footer_contact_email">Email de Contato</Label>
                  <Input
                    type="email"
                    id="footer_contact_email"
                    name="footer_contact_email"
                    value={siteConfig.footer_contact_email || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="footer_contact_phone">Telefone de Contato</Label>
                  <Input
                    type="tel"
                    id="footer_contact_phone"
                    name="footer_contact_phone"
                    value={siteConfig.footer_contact_phone || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="footer_schedule">Horário de Funcionamento</Label>
                  <Input
                    type="text"
                    id="footer_schedule"
                    name="footer_schedule"
                    value={siteConfig.footer_schedule || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="footer_social_facebook">Facebook</Label>
                  <Input
                    type="url"
                    id="footer_social_facebook"
                    name="footer_social_facebook"
                    value={siteConfig.footer_social_facebook || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="footer_social_instagram">Instagram</Label>
                  <Input
                    type="url"
                    id="footer_social_instagram"
                    name="footer_social_instagram"
                    value={siteConfig.footer_social_instagram || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="location">
            <AccordionTrigger>Localização</AccordionTrigger>
            <AccordionContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location_city">Cidade</Label>
                  <Input
                    type="text"
                    id="location_city"
                    name="location_city"
                    value={siteConfig.location_city || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="location_state">Estado</Label>
                  <Input
                    type="text"
                    id="location_state"
                    name="location_state"
                    value={siteConfig.location_state || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="location_country">País</Label>
                  <Input
                    type="text"
                    id="location_country"
                    name="location_country"
                    value={siteConfig.location_country || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="location_lat">Latitude</Label>
                  <Input
                    type="number"
                    id="location_lat"
                    name="location_lat"
                    value={siteConfig.location_lat || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="location_lng">Longitude</Label>
                  <Input
                    type="number"
                    id="location_lng"
                    name="location_lng"
                    value={siteConfig.location_lng || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="meta">
            <AccordionTrigger>Meta Tags</AccordionTrigger>
            <AccordionContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meta_author">Autor</Label>
                  <Input
                    type="text"
                    id="meta_author"
                    name="meta_author"
                    value={siteConfig.meta_author || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="meta_description">Descrição</Label>
                  <Textarea
                    id="meta_description"
                    name="meta_description"
                    value={siteConfig.meta_description || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="meta_title">Título</Label>
                  <Input
                    type="text"
                    id="meta_title"
                    name="meta_title"
                    value={siteConfig.meta_title || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="meta_image">Imagem</Label>
                  <Input
                    type="text"
                    id="meta_image"
                    name="meta_image"
                    value={siteConfig.meta_image || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="login_signup">
            <AccordionTrigger>Login / Signup</AccordionTrigger>
            <AccordionContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="login_text_color">Cor do Texto (Login)</Label>
                  <Input
                    type="color"
                    id="login_text_color"
                    name="login_text_color"
                    value={siteConfig.login_text_color || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="signup_text_color">Cor do Texto (Signup)</Label>
                  <Input
                    type="color"
                    id="signup_text_color"
                    name="signup_text_color"
                    value={siteConfig.signup_text_color || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="additional_settings">
            <AccordionTrigger>Configurações Adicionais</AccordionTrigger>
            <AccordionContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="enable_dark_mode">Modo Escuro</Label>
                  <Checkbox
                    id="enable_dark_mode"
                    name="enable_dark_mode"
                    checked={siteConfig.enable_dark_mode || false}
                    onCheckedChange={(checked) => {
                      setSiteConfig((prevConfig) => ({
                        ...prevConfig,
                        enable_dark_mode: checked,
                      } as Database['public']['Tables']['site_configuration']['Row']));
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="enable_weather">Mostrar clima</Label>
                  <Checkbox
                    id="enable_weather"
                    name="enable_weather"
                    checked={siteConfig.enable_weather || false}
                    onCheckedChange={(checked) => {
                      setSiteConfig((prevConfig) => ({
                        ...prevConfig,
                        enable_weather: checked,
                      } as Database['public']['Tables']['site_configuration']['Row']));
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="high_contrast">Alto Contraste</Label>
                  <Checkbox
                    id="high_contrast"
                    name="high_contrast"
                    checked={siteConfig.high_contrast || false}
                    onCheckedChange={(checked) => {
                      setSiteConfig((prevConfig) => ({
                        ...prevConfig,
                        high_contrast: checked,
                      } as Database['public']['Tables']['site_configuration']['Row']));
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="font_size">Tamanho da Fonte</Label>
                  <Input
                    type="text"
                    id="font_size"
                    name="font_size"
                    value={siteConfig.font_size || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="weather_api_key">Chave da API do Clima</Label>
                  <Input
                    type="text"
                    id="weather_api_key"
                    name="weather_api_key"
                    value={siteConfig.weather_api_key || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button type="submit">Salvar Configurações</Button>
      </form>
    </div>
  );
};

export default ConfigPage;
