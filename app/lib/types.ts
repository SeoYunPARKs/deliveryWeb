export type SessionUser = { id: number; email: string; name: string };

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
};

// 주문 내역 목록용 요약
export type OrderSummary = {
  id: number;
  restaurant_id: number;
  restaurant_name: string;
  total_amount: number;
  status: string;
  address: string;
  created_at: string;
  item_count: number;
};

// 주문 상세 (주문 + 주문상세 줄)
export type OrderItem = {
  menu_name: string;
  unit_price: number;
  quantity: number;
};

export type OrderDetail = OrderSummary & { items: OrderItem[] };
