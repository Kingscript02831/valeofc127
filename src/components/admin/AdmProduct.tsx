
import { cn } from "@/lib/utils";

// Tipos para as variantes de cores
type ColorVariant = "default" | "primary" | "secondary" | "accent";

// Interface para as props do componente
interface AdmProductStylesProps {
  variant?: ColorVariant;
  className?: string;
}

// Componente que exporta as configurações de estilo
export const AdmProductStyles = ({ variant = "default", className }: AdmProductStylesProps) => {
  // Configurações base de cores para produtos
  const baseStyles = {
    // Backgrounds
    backgroundPrimary: "bg-white dark:bg-[#222222]",
    backgroundSecondary: "bg-[#F1F0FB] dark:bg-[#1A1F2C]",
    backgroundMuted: "bg-[#eee] dark:bg-[#2A2A2A]",
    
    // Preços
    priceRegular: "text-[#9b87f5] dark:text-[#a594f8]",
    priceDiscount: "text-[#F97316] dark:text-[#ff8534]",
    priceOld: "text-[#8E9196] line-through",
    
    // Bordas
    borderLight: "border-[#C8C8C9] dark:border-[#3A3A3A]",
    borderMedium: "border-[#9F9EA1] dark:border-[#4A4A4A]",
    borderDark: "border-[#403E43] dark:border-[#5A5A5A]",
    
    // Textos
    textPrimary: "text-[#1A1F2C] dark:text-white",
    textSecondary: "text-[#403E43] dark:text-[#B0B0B0]",
    textMuted: "text-[#8E9196] dark:text-[#808080]",

    // Cards
    cardBase: "bg-white dark:bg-[#1A1F2C] border border-[#C8C8C9] dark:border-[#3A3A3A] rounded-lg shadow-sm",
    
    // Hover States
    hoverBackground: "hover:bg-[#F1F0FB] dark:hover:bg-[#2A2F3C]",
    hoverBorder: "hover:border-[#9b87f5] dark:hover:border-[#a594f8]",
    
    // Status
    statusNew: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    statusUsed: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
    
    // Forms
    inputBackground: "bg-white dark:bg-[#2A2F3C]",
    inputBorder: "border-[#C8C8C9] dark:border-[#3A3A3A] focus:border-[#9b87f5] dark:focus:border-[#a594f8]",
    inputText: "text-[#1A1F2C] dark:text-white",
    
    // Botões
    buttonPrimary: "bg-[#9b87f5] hover:bg-[#8674e4] text-white",
    buttonSecondary: "bg-[#F1F0FB] hover:bg-[#E1E0EB] text-[#1A1F2C] dark:bg-[#2A2F3C] dark:hover:bg-[#3A3F4C] dark:text-white",
    buttonOutline: "border border-[#9b87f5] text-[#9b87f5] hover:bg-[#9b87f5] hover:text-white dark:border-[#a594f8] dark:text-[#a594f8] dark:hover:bg-[#a594f8]",
  };

  // Classes CSS específicas para cada variante
  const variantStyles: Record<ColorVariant, string> = {
    default: cn(
      baseStyles.backgroundPrimary,
      baseStyles.textPrimary
    ),
    primary: cn(
      baseStyles.backgroundSecondary,
      baseStyles.textPrimary
    ),
    secondary: cn(
      baseStyles.backgroundMuted,
      baseStyles.textSecondary
    ),
    accent: cn(
      "bg-gradient-to-r from-[#9b87f5] to-[#a594f8]",
      "text-white"
    ),
  };

  return {
    // Retorna todas as configurações de estilo
    ...baseStyles,
    variant: variantStyles[variant],
    className: cn(variantStyles[variant], className),
  };
};

// Exemplos de uso para diferentes páginas

// Página de Lista de Produtos
export const ProductListStyles = {
  container: "container mx-auto px-4 py-8",
  header: "flex justify-between items-center mb-6",
  grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
  card: "bg-white dark:bg-[#1A1F2C] rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md",
  imageContainer: "aspect-square relative overflow-hidden",
  image: "object-cover w-full h-full",
  content: "p-4",
  title: "text-lg font-semibold text-[#1A1F2C] dark:text-white truncate",
  price: "text-xl font-bold text-[#9b87f5] dark:text-[#a594f8] mt-2",
  location: "text-sm text-[#8E9196] dark:text-[#808080] mt-1",
};

// Página de Detalhes do Produto
export const ProductDetailsStyles = {
  container: "container mx-auto px-4 py-8",
  header: "mb-6",
  gallery: "bg-[#F1F0FB] dark:bg-[#2A2F3C] rounded-lg p-4 mb-6",
  info: "space-y-6",
  title: "text-2xl font-bold text-[#1A1F2C] dark:text-white",
  price: "text-3xl font-bold text-[#9b87f5] dark:text-[#a594f8]",
  description: "text-[#403E43] dark:text-[#B0B0B0] whitespace-pre-line",
  sellerCard: "bg-white dark:bg-[#1A1F2C] border border-[#C8C8C9] dark:border-[#3A3A3A] rounded-lg p-4",
};

// Página de Adicionar/Editar Produto
export const ProductFormStyles = {
  container: "container mx-auto px-4 py-8 max-w-2xl",
  form: "space-y-6",
  section: "bg-white dark:bg-[#1A1F2C] rounded-lg shadow-sm p-6",
  label: "block text-sm font-medium text-[#403E43] dark:text-[#B0B0B0] mb-2",
  input: "w-full bg-white dark:bg-[#2A2F3C] border border-[#C8C8C9] dark:border-[#3A3A3A] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#9b87f5] dark:focus:ring-[#a594f8]",
  textarea: "w-full bg-white dark:bg-[#2A2F3C] border border-[#C8C8C9] dark:border-[#3A3A3A] rounded-md p-2 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#9b87f5] dark:focus:ring-[#a594f8]",
  select: "w-full bg-white dark:bg-[#2A2F3C] border border-[#C8C8C9] dark:border-[#3A3A3A] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#9b87f5] dark:focus:ring-[#a594f8]",
  button: {
    primary: "w-full bg-[#9b87f5] hover:bg-[#8674e4] text-white py-3 rounded-md font-medium transition-colors",
    secondary: "w-full bg-[#F1F0FB] hover:bg-[#E1E0EB] text-[#1A1F2C] dark:bg-[#2A2F3C] dark:hover:bg-[#3A3F4C] dark:text-white py-3 rounded-md font-medium transition-colors",
  },
};

export default AdmProductStyles;
