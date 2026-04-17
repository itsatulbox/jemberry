export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export type DeliveryMethod = "shipping" | "pickup";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  main_image: string | null;
  selectedVariant?: string | null;
  variantPrice?: number | null;
  selectedAddon?: string | null;
  addonPrice?: number | null;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  address: string;
  city: string;
  country: string | null;
  delivery_method: DeliveryMethod;
  total_amount: number;
  shipping_cost: number;
  status: OrderStatus;
  items: OrderItem[];
  created_at: string;
}
