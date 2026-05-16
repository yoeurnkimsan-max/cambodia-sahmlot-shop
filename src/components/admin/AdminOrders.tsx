import { useMemo, useState } from "react";
import { Search, Eye, Trash2, Filter } from "lucide-react";
import { Order, OrderStatus, useOrders } from "@/context/OrdersContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_TONE: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
  processing: "bg-blue-100 text-blue-900 dark:bg-blue-500/15 dark:text-blue-200",
  shipped: "bg-violet-100 text-violet-900 dark:bg-violet-500/15 dark:text-violet-200",
  delivered: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200",
  cancelled: "bg-rose-100 text-rose-900 dark:bg-rose-500/15 dark:text-rose-200",
};

export const AdminOrders = () => {
  const { orders, updateStatus, removeOrder } = useOrders();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [viewing, setViewing] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!q) return true;
      const hay = `${o.code} ${o.customer.firstName} ${o.customer.lastName} ${o.customer.email}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [orders, q, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    STATUSES.forEach((s) => (c[s] = orders.filter((o) => o.status === s).length));
    return c;
  }, [orders]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Sales</p>
          <h1 className="mt-2 font-serif text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">{orders.length} total · {counts.pending || 0} pending · {counts.processing || 0} processing</p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by code, name, or email…"
            className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {(["all", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs capitalize transition-colors",
                filter === s ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary",
              )}
            >
              {s} <span className="ml-1 text-[10px] opacity-70">{counts[s] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No orders match.</td></tr>
              )}
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{o.code}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.customer.firstName} {o.customer.lastName}</p>
                    <p className="text-xs text-muted-foreground">{o.customer.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-xs">{o.items.reduce((s, i) => s + i.quantity, 0)} pcs</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">${o.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v as OrderStatus)}>
                      <SelectTrigger className={cn("h-8 w-[130px] rounded-full border-0 px-3 text-xs capitalize", STATUS_TONE[o.status])}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => setViewing(o)}
                        className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                        aria-label="View"
                      ><Eye className="h-4 w-4" /></button>
                      <button
                        onClick={() => { if (confirm(`Delete order ${o.code}?`)) removeOrder(o.id); }}
                        className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Delete"
                      ><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-2xl">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  Order <span className="font-mono text-base text-muted-foreground">{viewing.code}</span>
                  <Badge className={cn("rounded-full capitalize", STATUS_TONE[viewing.status])} variant="secondary">{viewing.status}</Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Customer</p>
                  <p className="font-medium">{viewing.customer.firstName} {viewing.customer.lastName}</p>
                  <p className="text-muted-foreground">{viewing.customer.email}</p>
                  <p className="text-muted-foreground">{viewing.customer.phone}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Ship to</p>
                  <p>{viewing.customer.address}</p>
                  <p>{viewing.customer.city}, {viewing.customer.postal}</p>
                  <p>{viewing.customer.country}</p>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Items</p>
                <ul className="space-y-3">
                  {viewing.items.map((i, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm">
                      {i.image ? <img src={i.image} className="h-12 w-10 rounded-sm object-cover bg-secondary" alt="" /> : <div className="h-12 w-10 rounded-sm bg-secondary" />}
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{i.name}</p>
                        <p className="text-xs text-muted-foreground">{i.color} · {i.size} · ×{i.quantity}</p>
                      </div>
                      <p className="tabular-nums font-medium">${(i.price * i.quantity).toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-border pt-4 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${viewing.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{viewing.shipping === 0 ? "Free" : `$${viewing.shipping.toFixed(2)}`}</span></div>
                <div className="flex justify-between border-t border-border pt-2 font-semibold"><span>Total</span><span>${viewing.total.toFixed(2)}</span></div>
                {viewing.paymentLast4 && <p className="pt-2 text-xs text-muted-foreground">Paid with card ending in •••• {viewing.paymentLast4}</p>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
