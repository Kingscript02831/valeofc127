
export interface ProductTheme {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  
  // Backgrounds
  background_primary: string;
  background_secondary: string;
  background_muted: string;
  
  // Preços
  price_regular: string;
  price_discount: string;
  price_old: string;
  
  // Bordas
  border_light: string;
  border_medium: string;
  border_dark: string;
  
  // Textos
  text_primary: string;
  text_secondary: string;
  text_muted: string;
  
  // Botões
  button_primary_bg: string;
  button_primary_text: string;
  button_secondary_bg: string;
  button_secondary_text: string;
  
  // Dark Mode
  dark_background_primary: string;
  dark_background_secondary: string;
  dark_background_muted: string;
  dark_text_primary: string;
  dark_text_secondary: string;
  dark_text_muted: string;
  dark_border_light: string;
  dark_border_medium: string;
  dark_border_dark: string;
  dark_button_primary_bg: string;
  dark_button_primary_text: string;
  dark_button_secondary_bg: string;
  dark_button_secondary_text: string;
}

export interface ProductPageConfig {
  id: string;
  page_type: 'list' | 'details' | 'form';
  theme_id: string;
  created_at: string;
  updated_at: string;
  
  container_padding: string;
  container_max_width: string;
  grid_columns: string;
  card_shadow: string;
  image_aspect_ratio: string;
  font_size_title: string;
  font_size_price: string;
  spacing: string;
}
