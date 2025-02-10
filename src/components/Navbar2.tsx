
import { useSiteConfig } from "../hooks/useSiteConfig";

const Navbar2 = () => {
  const { data: config, isLoading, isError } = useSiteConfig();

  if (isLoading) {
    return (
      <nav className="w-full fixed top-0 z-50 h-16 animate-pulse bg-gray-200" />
    );
  }

  if (isError || !config) {
    return (
      <nav className="w-full fixed top-0 z-50 h-16 bg-gray-800">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <span className="text-white">Painel Geral</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full fixed top-0 z-50 shadow-md"
         style={{ 
           background: `linear-gradient(to right, ${config.navbar_color}, ${config.primary_color})`,
           borderColor: `${config.primary_color}20`
         }}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a 
            href="/admin" 
            className="flex items-center space-x-2 transform transition duration-300 hover:scale-105"
          >
            {config.navbar_logo_type === 'image' && config.navbar_logo_image ? (
              <img 
                src={config.navbar_logo_image} 
                alt="Logo" 
                className="h-12 w-12 rounded-full object-cover border-2 transition-transform duration-300 hover:scale-110"
                style={{ 
                  borderColor: config.text_color,
                }}
              />
            ) : (
              <span 
                className="text-3xl font-bold tracking-tighter px-6 py-3 rounded-full"
                style={{ 
                  color: config.text_color,
                  backgroundColor: `${config.primary_color}20`
                }}
              >
                Painel Geral
              </span>
            )}
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar2;
