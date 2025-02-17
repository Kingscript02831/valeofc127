
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  condition: string;
  location_name?: string;
  created_at: string;
}

export interface ProductWithDistance extends Product {
  distance?: number;
}
