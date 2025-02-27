
export interface SiteConfiguration {
  id: number;
  created_at: string;
  navbar_color: string;
  primary_color: string;
  text_color: string;
  navbar_logo_type: 'text' | 'image';
  navbar_logo_image?: string;
  navbar_title?: string;
  navbar_social_facebook?: string;
  navbar_social_instagram?: string;
  login_text_color?: string;
  signup_text_color?: string;
  button_secondary_color?: string;
  button_color?: string;
  bottom_nav_primary_color?: string;
  bottom_nav_secondary_color?: string;
  bottom_nav_icon_color?: string;
  bottom_nav_text_color?: string;
  pwa_install_message?: string;
  favorite_heart_color?: string;
  buy_button_color?: string;
  buy_button_text?: string;
  whatsapp_message?: string;
}
