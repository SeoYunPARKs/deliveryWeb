"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import type { CartItem } from "@/app/lib/types";

type RestaurantMeta = {
  id: number;
  name: string;
  deliveryFee: number;
  minOrderAmount: number;
};

type CartState = {
  restaurantId: number | null;
  restaurantName: string | null;
  deliveryFee: number;
  minOrderAmount: number;
  items: CartItem[];
};

type CartContextValue = CartState & {
  itemCount: number;
  subtotal: number;
  total: number;
  hydrated: boolean;
  addItem: (restaurant: RestaurantMeta, item: CartItem) => void;
  increment: (menuId: number) => void;
  decrement: (menuId: number) => void;
  removeItem: (menuId: number) => void;
  clearCart: () => void;
};

const EMPTY: CartState = {
  restaurantId: null,
  restaurantName: null,
  deliveryFee: 0,
  minOrderAmount: 0,
  items: [],
};

const STORAGE_KEY = "matna-cart";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // 최초 마운트 시 localStorage 에서 복원
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw) as CartState);
    } catch {
      // 무시
    }
    setHydrated(true);
  }, []);

  // 변경 시 localStorage 에 저장
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const addItem = useCallback((restaurant: RestaurantMeta, item: CartItem) => {
    const prev = stateRef.current;
    // 다른 식당의 메뉴를 담으면 장바구니를 비우고 교체 (배달앱 일반 규칙)
    if (prev.restaurantId !== null && prev.restaurantId !== restaurant.id) {
      const ok = window.confirm(
        `장바구니에 '${prev.restaurantName}' 메뉴가 있습니다.\n비우고 '${restaurant.name}' 메뉴를 담을까요?`,
      );
      if (!ok) return;
      setState({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        deliveryFee: restaurant.deliveryFee,
        minOrderAmount: restaurant.minOrderAmount,
        items: [item],
      });
      return;
    }
    setState((p) => {
      const existing = p.items.find((i) => i.menuId === item.menuId);
      const items = existing
        ? p.items.map((i) =>
            i.menuId === item.menuId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i,
          )
        : [...p.items, item];
      return {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        deliveryFee: restaurant.deliveryFee,
        minOrderAmount: restaurant.minOrderAmount,
        items,
      };
    });
  }, []);

  const increment = useCallback((menuId: number) => {
    setState((p) => ({
      ...p,
      items: p.items.map((i) =>
        i.menuId === menuId ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    }));
  }, []);

  const decrement = useCallback((menuId: number) => {
    setState((p) => {
      const items = p.items
        .map((i) => (i.menuId === menuId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0);
      return items.length === 0 ? EMPTY : { ...p, items };
    });
  }, []);

  const removeItem = useCallback((menuId: number) => {
    setState((p) => {
      const items = p.items.filter((i) => i.menuId !== menuId);
      return items.length === 0 ? EMPTY : { ...p, items };
    });
  }, []);

  const clearCart = useCallback(() => setState(EMPTY), []);

  const itemCount = state.items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + (state.items.length > 0 ? state.deliveryFee : 0);

  return (
    <CartContext.Provider
      value={{
        ...state,
        itemCount,
        subtotal,
        total,
        hydrated,
        addItem,
        increment,
        decrement,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
