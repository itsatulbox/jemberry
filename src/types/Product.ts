export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  main_image: string | null;
  images: string[];
  stock: number;
  variants: ProductVariant[];
  created_at: string;
}

export type ProductInsert = Omit<Product, "id" | "created_at" | "variants">;

export type ProductUpdate = Partial<ProductInsert>;

export type CartItem = Product & {
  quantity: number;
  selectedVariant?: string | null;
  variantPrice?: number | null;
};
