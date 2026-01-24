export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  main_image: string | null;
  images: string[];
  stock: number;
  created_at: string;
}

export type ProductInsert = Omit<Product, "id" | "created_at">;

export type ProductUpdate = Partial<ProductInsert>;

export type CartItem = Product & { quantity: number };
