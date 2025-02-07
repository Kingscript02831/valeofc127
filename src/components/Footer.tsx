
import { Mail, MapPin, Phone, Clock, Facebook, Instagram } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
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

  if (!config) return null;

  const footerStyle = {
    background: `linear-gradient(to right, ${config.footer_primary_color}, ${config.footer_secondary_color})`,
    color: config.footer_text_color,
  };

  return (
    <footer className="py-12" style={footerStyle}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Contato */}
          {(config.footer_contact_email || config.footer_contact_phone) && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold uppercase tracking-wider mb-4 border-l-4 border-accent pl-3">
                Contato
              </h3>
              <div className="space-y-3">
                {config.footer_contact_email && (
                  <div className="flex items-center gap-3 hover:text-accent transition-colors">
                    <Mail className="h-5 w-5 flex-shrink-0" />
                    <span>{config.footer_contact_email}</span>
                  </div>
                )}
                {config.footer_contact_phone && (
                  <div className="flex items-center gap-3 hover:text-accent transition-colors">
                    <Phone className="h-5 w-5 flex-shrink-0" />
                    <span>{config.footer_contact_phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Endereço */}
          {(config.footer_address || config.footer_address_cep) && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold uppercase tracking-wider mb-4 border-l-4 border-accent pl-3">
                Endereço
              </h3>
              <div className="space-y-3">
                {config.footer_address && (
                  <div className="flex items-center gap-3 hover:text-accent transition-colors">
                    <MapPin className="h-5 w-5 flex-shrink-0" />
                    <span>{config.footer_address}</span>
                  </div>
                )}
                {config.footer_address_cep && (
                  <div className="flex items-center gap-3 hover:text-accent transition-colors ml-8">
                    <span>CEP: {config.footer_address_cep}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Horário */}
          {config.footer_schedule && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold uppercase tracking-wider mb-4 border-l-4 border-accent pl-3">
                Horário
              </h3>
              <div className="flex items-center gap-3 hover:text-accent transition-colors">
                <Clock className="h-5 w-5 flex-shrink-0" />
                <span>{config.footer_schedule}</span>
              </div>
            </div>
          )}

          {/* Redes Sociais */}
          {(config.footer_social_facebook || config.footer_social_instagram) && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold uppercase tracking-wider mb-4 border-l-4 border-accent pl-3">
                Redes Sociais
              </h3>
              <div className="flex gap-4">
                {config.footer_social_facebook && (
                  <a
                    href={config.footer_social_facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/10 hover:bg-accent transition-colors"
                  >
                    <Facebook className="h-6 w-6" />
                  </a>
                )}
                {config.footer_social_instagram && (
                  <a
                    href={config.footer_social_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/10 hover:bg-accent transition-colors"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className="pt-8 mt-8 border-t border-white/20 text-center">
          <p className="text-sm" style={{ color: config.footer_text_color }}>
            &copy; 2025 VALEOFC. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
