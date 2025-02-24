
export interface SiteConfiguration {
  id: number;
  created_at: string;
  navbar_color: string;
  primary_color: string;
  text_color: string;
  navbar_logo_type: 'text' | 'image';
  navbar_logo_image?: string;
  navbar_logo_text?: string;
  navbar_title_color?: string;
  navbar_social_facebook?: string;
  navbar_social_instagram?: string;
}
