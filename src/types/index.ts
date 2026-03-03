export type UserRole = 'client' | 'admin';
export type OrderStatus = 'pending' | 'completed';
export type MaterialType = 'Standard Matte' | 'Premium Matte' | 'Vinyl';

export const MATERIAL_PRICES: Record<MaterialType, number> = {
  'Standard Matte': 30,
  'Premium Matte': 45,
  'Vinyl': 60,
};

export interface Profile {
  id: string;
  client_id: number;
  email: string;
  role: UserRole;
  total_orders: number;
  total_spent: number;
  discount_percentage: number;
  is_deleted: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  client_id: number;
  user_id: string;
  user_email: string;
  width: number;
  height: number;
  material: MaterialType;
  base_price: number;
  discount_applied: number;
  large_format_fee: number;
  final_price: number;
  status: OrderStatus;
  file_url: string;
  file_size: number;
  created_at: string;
}

export const LOYALTY_TIERS = [
  { orders: 30, discount: 15, label: 'Tier 3' },
  { orders: 15, discount: 10, label: 'Tier 2' },
  { orders: 5, discount: 5, label: 'Tier 1' },
];
