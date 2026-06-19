export type UserRole = "customer" | "owner";

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
};

export type Restaurant = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  image_url: string | null;
  delivery_fee: number;
  min_order_amount: number;
  rating: number;
};

export type Menu = {
  id: number;
  restaurant_id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
};

// 장바구니 한 줄 (클라이언트 상태 / localStorage)
export type CartItem = {
  menuId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  options?: string; // 옵션/요청 (예: "덜 맵게")
};

export type OrderType = "delivery" | "takeout";

// 주문 내역 목록용 요약
export type OrderSummary = {
  id: number;
  restaurant_id: number;
  restaurant_name: string;
  order_type: string;
  total_amount: number;
  status: string;
  address: string;
  request: string | null;
  created_at: string;
  item_count: number;
};

// 주문 상세 (주문 + 주문상세 줄)
export type OrderItem = {
  menu_name: string;
  unit_price: number;
  quantity: number;
  options: string | null;
};

export type OrderDetail = OrderSummary & { items: OrderItem[] };

export type Review = {
  id: number;
  user_name: string;
  rating: number;
  content: string;
  created_at: string;
};
