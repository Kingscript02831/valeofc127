import { Mail, MapPin, Phone, Clock, Facebook, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-primary to-[#1a365d] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold uppercase tracking-wider mb-4 border-l-4 border-accent pl-3">
              Contato
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 hover:text-accent transition-colors">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span>contato@valenoticias.com</span>
              </div>
              <div className="flex items-center gap-3 hover:text-accent transition-colors">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span>(11) 9999-9999</span>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold uppercase tracking-wider mb-4 border-l-4 border-accent pl-3">
              Endereço
            </h3>
            <div className="flex items-center gap-3 hover:text-accent transition-colors">
              <MapPin className="h-5 w-5 flex-shrink-0" />
              <span>Av. Principal, 1000 - Centro</span>
            </div>
          </div>

          {/* Horário */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold uppercase tracking-wider mb-4 border-l-4 border-accent pl-3">
              Horário
            </h3>
            <div className="flex items-center gap-3 hover:text-accent transition-colors">
              <Clock className="h-5 w-5 flex-shrink-0" />
              <span>Seg-Sex: 9h às 18h</span>
            </div>
          </div>

          {/* Redes Sociais */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold uppercase tracking-wider mb-4 border-l-4 border-accent pl-3">
              Redes Sociais
            </h3>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-accent transition-colors"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-accent transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 mt-8 border-t border-white/20 text-center">
          <p className="text-sm text-white/80">
            &copy; 2025 VALEOFC. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
