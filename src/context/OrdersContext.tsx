import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
};

export type OrderCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal: string;
  country: string;
};

export type Order = {
  id: string;
  code: string;
  createdAt: string;
  status: OrderStatus;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentLast4?: string;
  notes?: string;
};

type Ctx = {
  orders: Order[];
  addOrder: (o: Omit<Order, "id" | "code" | "createdAt" | "status">) => Order;
  updateStatus: (id: string, status: OrderStatus) => void;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  removeOrder: (id: string) => void;
  clearAll: () => void;
};

const OrdersContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "sahmlot.orders.v1";

const seed = (): Order[] => {
  const now = Date.now();
  const day = 86400000;
  return [
    {
      id: "ord-seed-1",
      code: "SHM-10421",
      createdAt: new Date(now - day * 1).toISOString(),
      status: "processing",
      customer: { firstName: "Sokha", lastName: "Chan", email: "sokha.chan@example.com", phone: "+855 12 345 678", address: "St. 240, BKK1", city: "Phnom Penh", postal: "12000", country: "Cambodia" },
      items: [{ productId: "p-001", name: "Essential Cotton Tee — White", image: "", price: 18, size: "M", color: "White", quantity: 2 }],
      subtotal: 36, shipping: 0, total: 36, paymentLast4: "4242",
    },
    {
      id: "ord-seed-2",
      code: "SHM-10422",
      createdAt: new Date(now - day * 2).toISOString(),
      status: "shipped",
      customer: { firstName: "Mealea", lastName: "Pich", email: "mealea@example.com", phone: "+855 17 222 999", address: "St. 51", city: "Siem Reap", postal: "17000", country: "Cambodia" },
      items: [{ productId: "p-002", name: "Oversized Tee — Midnight Black", image: "", price: 22, size: "L", color: "Black", quantity: 1 }],
      subtotal: 22, shipping: 4, total: 26, paymentLast4: "1881",
    },
    {
      id: "ord-seed-3",
      code: "SHM-10423",
      createdAt: new Date(now - day * 4).toISOString(),
      status: "delivered",
      customer: { firstName: "Davy", lastName: "Lim", email: "davy.lim@example.com", phone: "+855 96 555 121", address: "St. 271", city: "Phnom Penh", postal: "12000", country: "Cambodia" },
      items: [
        { productId: "p-003", name: "Linen Crew — Sand", image: "", price: 32, size: "M", color: "Sand", quantity: 1 },
        { productId: "p-005", name: "Graphic Tee — Sage", image: "", price: 24, size: "S", color: "Sage", quantity: 2 },
      ],
      subtotal: 80, shipping: 0, total: 80, paymentLast4: "0007",
    },
    {
      id: "ord-seed-4",
      code: "SHM-10424",
      createdAt: new Date(now - day * 6).toISOString(),
      status: "pending",
      customer: { firstName: "Nita", lastName: "Sok", email: "nita.sok@example.com", phone: "+855 70 111 222", address: "St. 63", city: "Phnom Penh", postal: "12000", country: "Cambodia" },
      items: [{ productId: "p-004", name: "Navy Polo Knit", image: "", price: 38, size: "M", color: "Navy", quantity: 1 }],
      subtotal: 38, shipping: 4, total: 42,
    },
    {
      id: "ord-seed-5",
      code: "SHM-10425",
      createdAt: new Date(now - day * 9).toISOString(),
      status: "cancelled",
      customer: { firstName: "Rotha", lastName: "Heng", email: "rotha@example.com", phone: "+855 12 999 111", address: "St. 178", city: "Phnom Penh", postal: "12000", country: "Cambodia" },
      items: [{ productId: "p-007", name: "Cream Knit Crewneck", image: "", price: 52, size: "L", color: "Cream", quantity: 1 }],
      subtotal: 52, shipping: 0, total: 52,
    },
  ];
};

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
      const s = seed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      return s;
    } catch {
      return seed();
    }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(orders)); } catch { /* ignore */ }
  }, [orders]);

  const addOrder: Ctx["addOrder"] = (o) => {
    const order: Order = {
      ...o,
      id: `ord-${Date.now()}`,
      code: `SHM-${10500 + Math.floor(Math.random() * 8999)}`,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    setOrders((prev) => [order, ...prev]);
    return order;
  };

  const updateStatus = (id: string, status: OrderStatus) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

  const updateOrder = (id: string, patch: Partial<Order>) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));

  const removeOrder = (id: string) => setOrders((prev) => prev.filter((o) => o.id !== id));
  const clearAll = () => setOrders([]);

  const value = useMemo(() => ({ orders, addOrder, updateStatus, updateOrder, removeOrder, clearAll }), [orders]);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
};

export const useOrders = () => {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
};
