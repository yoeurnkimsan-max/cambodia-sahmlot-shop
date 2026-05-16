import { useMemo, useState } from "react";
import { Search, Mail, Phone, MapPin } from "lucide-react";
import { useOrders } from "@/context/OrdersContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type CustomerRow = {
  email: string;
  name: string;
  phone: string;
  city: string;
  country: string;
  orderCount: number;
  totalSpent: number;
  lastOrder: string;
  orderIds: string[];
};

export const AdminCustomers = () => {
  const { orders } = useOrders();
  const [q, setQ] = useState("");
  const [viewing, setViewing] = useState<CustomerRow | null>(null);

  const customers = useMemo<CustomerRow[]>(() => {
    const map = new Map<string, CustomerRow>();
    orders.forEach((o) => {
      const key = o.customer.email.toLowerCase();
      const cur = map.get(key) || {
        email: o.customer.email,
        name: `${o.customer.firstName} ${o.customer.lastName}`,
        phone: o.customer.phone,
        city: o.customer.city,
        country: o.customer.country,
        orderCount: 0,
        totalSpent: 0,
        lastOrder: o.createdAt,
        orderIds: [],
      };
      cur.orderCount += 1;
      if (o.status !== "cancelled") cur.totalSpent += o.total;
      if (new Date(o.createdAt) > new Date(cur.lastOrder)) cur.lastOrder = o.createdAt;
      cur.orderIds.push(o.id);
      map.set(key, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const filtered = customers.filter((c) => !q || `${c.name} ${c.email} ${c.city}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">People</p>
        <h1 className="mt-2 font-serif text-3xl">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">{customers.length} unique · derived from orders</p>
      </header>

      <div className="border border-border bg-card p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers…"
            className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 && (
          <p className="col-span-full p-10 text-center text-sm text-muted-foreground">No customers yet.</p>
        )}
        {filtered.map((c) => (
          <button key={c.email} onClick={() => setViewing(c)} className="text-left border border-border bg-card p-4 hover:border-foreground transition-colors">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-foreground text-background text-sm font-semibold">
                {c.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">{c.email}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Orders</p>
                <p className="text-sm font-semibold">{c.orderCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Spent</p>
                <p className="text-sm font-semibold tabular-nums">${c.totalSpent.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last</p>
                <p className="text-sm font-semibold">{new Date(c.lastOrder).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-lg">
          {viewing && (
            <>
              <DialogHeader><DialogTitle>{viewing.name}</DialogTitle></DialogHeader>
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {viewing.email}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {viewing.phone}</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {viewing.city}, {viewing.country}</p>
                <div className="grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
                  <div><p className="text-xs text-muted-foreground">Orders</p><p className="text-lg font-semibold">{viewing.orderCount}</p></div>
                  <div><p className="text-xs text-muted-foreground">Lifetime</p><p className="text-lg font-semibold">${viewing.totalSpent.toFixed(2)}</p></div>
                  <div><p className="text-xs text-muted-foreground">AOV</p><p className="text-lg font-semibold">${(viewing.totalSpent / Math.max(1, viewing.orderCount)).toFixed(2)}</p></div>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Order history</p>
                  <ul className="space-y-1 text-xs">
                    {orders.filter((o) => viewing.orderIds.includes(o.id)).map((o) => (
                      <li key={o.id} className="flex items-center justify-between">
                        <span className="font-mono">{o.code}</span>
                        <Badge variant="secondary" className="rounded-full capitalize">{o.status}</Badge>
                        <span className="tabular-nums">${o.total.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
