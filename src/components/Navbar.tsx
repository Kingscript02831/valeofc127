Aqui está uma versão aprimorada do Navbar com melhorias visuais e de UX, mantendo as funculdades originais:

```tsx
import { Share2, Facebook, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const handleShare = async () => {
    try {
      await navigator.share({
        title: "Vale Notícias",
        url: window.location.href,
      });
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-primary to-primary-dark border-b border-primary/30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo aprimorada com detalhes de profundidade */}
          <a 
            href="/" 
            className="flex items-center space-x-2 transform transition-all duration-300 hover:scale-105 group"
            role="link"
            aria-label="Ir para página inicial"
          >
            <div className="relative">
              <span className="text-2xl font-bold text-white tracking-tighter bg-accent/20 px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-300 group-hover:bg-accent/30 group-hover:shadow-md">
                VALEOFC
                <span className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              </span>
            </div>
          </a>

          {/* Container de ícones com melhor espaçamento e feedback */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-white/90 hover:text-white hover:bg-accent/20 rounded-full p-2 transition-all duration-300 ease-out hover:scale-110 active:scale-95"
              aria-label="Compartilhar"
              role="button"
            >
              <Share2 className="h-6 w-6" strokeWidth={2.5} />
            </Button>

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/90 hover:text-white p-2 rounded-full hover:bg-accent/20 transition-all duration-300 ease-out hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Visite nosso Facebook"
              role="link"
            >
              <Facebook className="h-6 w-6" strokeWidth={2.5} />
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/90 hover:text-white p-2 rounded-full hover:bg-accent/20 transition-all duration-300 ease-out hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Visite nosso Instagram"
              role="link"
            >
              <Instagram className="h-6 w-6" strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
```

Principais melhorias:

1. **Acessibilidade**
   - Adicionado `role` attributes
   - Melhores `aria-label` descritivos
   - Foco visível com `focus:ring`

2. **Feedback Visual**
   - Efeito `active:scale-95` para clique
   - Gradiente sutil no logo
   - `backdrop-blur-sm` para efeito de vidro fosco
   - Transições mais suaves e consistentes

3. **Design**
   - Sombra mais pronunciada (`shadow-2xl`)
   - Borda mais suave (`border-primary/30`)
   - Efeito de profundidade no logo com gradiente
   - Espaçamento responsivo nos ícones

4. **Responsividade**
   - Espaçamento adaptável (`space-x-2 sm:space-x-4`)
   - Melhor escalonamento em dispositivos móveis

5. **Interatividade**
   - Efeito de clique mais pronunciado
   - Estados hover/focus/active mais definidos
   - Efeito de grupo no logo para interação unificada

6. **Performance**
   - `pointer-events-none` em elementos decorativos
   - `backdrop-blur` otimizado para GPU

Essas alterações mantêm todas as funções originais enquanto melhoram a experiência do usuário e a qualidade visual do componente.
