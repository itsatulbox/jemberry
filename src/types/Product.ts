export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  main_image: string | null;
  images: string[];
  created_at: string;
}

export type ProductInsert = Omit<Product, "id" | "created_at">;

export type ProductUpdate = Partial<ProductInsert>;
