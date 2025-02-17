import { cn } from "@/lib/utils";
import { useProductTheme } from "@/hooks/useProductTheme";
import { ProductTheme, ProductPageConfig } from "@/types/product-theme";

// Tipos para as variantes de cores
type ColorVariant = "default" | "primary" | "secondary" | "accent";

// Interface para as props do componente
interface AdmProductStylesProps {
  variant?: ColorVariant;
  className?: string;
  pageType: 'list' | 'details' | 'form';
}

// Componente que exporta as configurações de estilo
export const AdmProductStyles = ({ variant = "default", className, pageType }: AdmProductStylesProps) => {
  const { theme, config, isLoading } = useProductTheme(pageType);

  if (isLoading || !theme || !config) {
    return {
      backgroundPrimary: "bg-gray-100 dark:bg-gray-800",
      backgroundSecondary: "bg-gray-200 dark:bg-gray-700",
      backgroundMuted: "bg-gray-300 dark:bg-gray-600",
      priceRegular: "text-gray-900 dark:text-gray-100",
      priceDiscount: "text-red-500 dark:text-red-400",
      priceOld: "text-gray-500 dark:text-gray-400 line-through",
      borderLight: "border-gray-200 dark:border-gray-700",
      borderMedium: "border-gray-300 dark:border-gray-600",
      borderDark: "border-gray-400 dark:border-gray-500",
      textPrimary: "text-gray-900 dark:text-gray-100",
      textSecondary: "text-gray-700 dark:text-gray-300",
      textMuted: "text-gray-500 dark:text-gray-400",
      cardBase: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md",
      buttonPrimary: "bg-blue-500 text-white",
      buttonSecondary: "bg-green-500 text-white",
      variant: "",
      className: className || "",
      config: {
        container_padding: "4",
        container_max_width: "2xl",
        grid_columns: "1",
        card_shadow: "md",
        image_aspect_ratio: "square",
        font_size_title: "xl",
        font_size_price: "2xl",
        spacing: "4",
      },
    };
  }

  // Configurações base de cores para produtos usando o tema do banco de dados
  const baseStyles = {
    // Backgrounds
    backgroundPrimary: `bg-[${theme.background_primary}] dark:bg-[${theme.dark_background_primary}]`,
    backgroundSecondary: `bg-[${theme.background_secondary}] dark:bg-[${theme.dark_background_secondary}]`,
    backgroundMuted: `bg-[${theme.background_muted}] dark:bg-[${theme.dark_background_muted}]`,
    
    // Preços
    priceRegular: `text-[${theme.price_regular}]`,
    priceDiscount: `text-[${theme.price_discount}]`,
    priceOld: `text-[${theme.price_old}] line-through`,
    
    // Bordas
    borderLight: `border-[${theme.border_light}] dark:border-[${theme.dark_border_light}]`,
    borderMedium: `border-[${theme.border_medium}] dark:border-[${theme.dark_border_medium}]`,
    borderDark: `border-[${theme.border_dark}] dark:border-[${theme.dark_border_dark}]`,
    
    // Textos
    textPrimary: `text-[${theme.text_primary}] dark:text-[${theme.dark_text_primary}]`,
    textSecondary: `text-[${theme.text_secondary}] dark:text-[${theme.dark_text_secondary}]`,
    textMuted: `text-[${theme.text_muted}] dark:text-[${theme.dark_text_muted}]`,

    // Cards
    cardBase: `bg-[${theme.background_primary}] dark:bg-[${theme.dark_background_primary}] border-[${theme.border_light}] dark:border-[${theme.dark_border_light}] rounded-lg shadow-${config.card_shadow}`,
    
    // Botões
    buttonPrimary: `bg-[${theme.button_primary_bg}] text-[${theme.button_primary_text}]`,
    buttonSecondary: `bg-[${theme.button_secondary_bg}] text-[${theme.button_secondary_text}]`,
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
      `bg-gradient-to-r from-[${theme.button_primary_bg}] to-[${theme.dark_button_primary_bg}]`,
      "text-white"
    ),
  };

  return {
    ...baseStyles,
    variant: variantStyles[variant],
    className: cn(variantStyles[variant], className),
    config, // Retorna também as configurações da página
  };
};

// Configurações específicas para cada tipo de página
export const ProductListStyles = {
  container: "container mx-auto px-4 py-8",
  header: "flex justify-between items-center mb-6",
  grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
  card: "rounded-lg shadow-md overflow-hidden",
  image: "aspect-square object-cover w-full",
  content: "p-4",
  title: "text-xl font-semibold mb-2",
  price: "text-2xl font-bold text-primary",
};

export const ProductDetailsStyles = {
  container: "container mx-auto px-4 py-8",
  header: "mb-6",
  gallery: "rounded-lg p-4 mb-6",
  image: "aspect-square object-cover w-full",
  content: "p-4",
  title: "text-2xl font-bold mb-4",
  price: "text-3xl font-bold text-primary mb-4",
  description: "text-gray-700 dark:text-gray-300 mb-4",
};

export const ProductFormStyles = {
  container: "container mx-auto px-4 py-8 max-w-2xl",
  form: "space-y-6",
  section: "rounded-lg shadow-sm p-6",
  label: "block text-sm font-medium text-gray-700 dark:text-gray-300",
  input: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
  textarea: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
  button: "bg-primary text-white rounded-md py-2 px-4 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50",
};

export default AdmProductStyles;
