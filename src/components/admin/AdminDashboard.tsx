import { useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, ArrowUpRight } from "lucide-react";
import { useOrders, OrderStatus } from "@/context/OrdersContext";
import { useProducts } from "@/hooks/useProducts";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
  processing: "bg-blue-100 text-blue-900 dark:bg-blue-500/15 dark:text-blue-200",
  shipped: "bg-violet-100 text-violet-900 dark:bg-violet-500/15 dark:text-violet-200",
  delivered: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200",
  cancelled: "bg-rose-100 text-rose-900 dark:bg-rose-500/15 dark:text-rose-200",
};

const StatCard = ({
  label, value, hint, icon: Icon, trend, i = 0,
}: { label: string; value: string; hint?: string; icon: typeof DollarSign; trend?: string; i?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
    className="group relative overflow-hidden border border-border bg-card p-5"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="grid h-9 w-9 place-items-center rounded-md bg-secondary text-foreground">
        <Icon className="h-4 w-4" />
      </div>
    </div>
    {trend && (
      <div className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
        <TrendingUp className="h-3 w-3" /> {trend}
      </div>
    )}
  </motion.div>
);

export const AdminDashboard = ({ onJumpToOrders }: { onJumpToOrders: () => void }) => {
  const { orders } = useOrders();
  const products = useProducts();

  const stats = useMemo(() => {
    const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
    const customers = new Set(orders.map((o) => o.customer.email.toLowerCase())).size;
    const pending = orders.filter((o) => o.status === "pending" || o.status === "processing").length;
    return { revenue, customers, pending };
  }, [orders]);

  const recent = orders.slice(0, 6);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; image: string; qty: number; revenue: number }>();
    orders.forEach((o) =>
      o.items.forEach((i) => {
        const cur = map.get(i.productId) || { name: i.name, image: i.image, qty: 0, revenue: 0 };
        cur.qty += i.quantity;
        cur.revenue += i.price * i.quantity;
        if (!cur.image && i.image) cur.image = i.image;
        map.set(i.productId, cur);
      }),
    );
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Overview</p>
        <h1 className="mt-2 font-serif text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">A live snapshot of your store performance.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard i={0} label="Revenue" value={`$${stats.revenue.toFixed(2)}`} hint="All-time, excl. cancelled" icon={DollarSign} trend="+12.4% vs last week" />
        <StatCard i={1} label="Orders" value={String(orders.length)} hint={`${stats.pending} need attention`} icon={ShoppingBag} trend="+3 today" />
        <StatCard i={2} label="Customers" value={String(stats.customers)} hint="Unique emails" icon={Users} trend="+2 new" />
        <StatCard i={3} label="Products" value={String(products.length)} hint="Live catalog" icon={Package} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Recent orders</h2>
            <button onClick={onJumpToOrders} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          </header>
          <div className="divide-y divide-border">
            {recent.length === 0 && (
              <p className="p-6 text-sm text-muted-foreground">No orders yet.</p>
            )}
            {recent.map((o) => (
              <div key={o.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted-foreground">{o.code}</p>
                  <p className="truncate font-medium">{o.customer.firstName} {o.customer.lastName}</p>
                </div>
                <Badge className={cn("rounded-full font-medium capitalize", STATUS_TONE[o.status])} variant="secondary">
                  {o.status}
                </Badge>
                <p className="font-semibold tabular-nums">${o.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-border bg-card">
          <header className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Top products</h2>
          </header>
          <div className="divide-y divide-border">
            {topProducts.length === 0 && (
              <p className="p-6 text-sm text-muted-foreground">Sell something to see rankings.</p>
            )}
            {topProducts.map((p, idx) => (
              <div key={p.name} className="flex items-center gap-3 px-5 py-3">
                <span className="w-4 text-xs text-muted-foreground tabular-nums">{idx + 1}</span>
                {p.image ? (
                  <img src={p.image} alt={p.name} className="h-10 w-9 rounded-sm object-cover bg-secondary" />
                ) : (
                  <div className="h-10 w-9 rounded-sm bg-secondary" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.qty} sold</p>
                </div>
                <p className="text-sm font-semibold tabular-nums">${p.revenue.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
