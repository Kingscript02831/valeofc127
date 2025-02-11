
export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  end_time?: string;
  location?: string;
  maps_url?: string;
  entrance_fee?: string;
  created_at: string;
  updated_at: string;
  button_color?: string;
  button_secondary_color?: string;
  video_url?: string;
  category_id?: string;
  image?: string;
  images?: string[];
  social_media?: Record<string, any>;
  owner_name?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  categories?: {
    id: string;
    name: string;
  };
}
