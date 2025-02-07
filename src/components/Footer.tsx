import { Mail, MapPin, Phone, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                contato@valenoticias.com
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                (11) 9999-9999
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Endereço</h3>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Av. Principal, 1000 - Centro
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Horário</h3>
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Seg-Sex: 9h às 18h
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Redes Sociais</h3>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <p>&copy; 2025 VALE NOTÍCIAS. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;