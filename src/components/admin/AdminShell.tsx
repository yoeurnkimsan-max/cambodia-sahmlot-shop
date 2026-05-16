import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, ShoppingBag, Package, Users, Settings as SettingsIcon, ExternalLink, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminSection = "dashboard" | "orders" | "products" | "customers" | "settings";

const NAV: { id: AdminSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "products", label: "Products", icon: Package },
  { id: "customers", label: "Customers", icon: Users },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export const AdminShell = ({
  active,
  onChange,
  children,
  badges,
}: {
  active: AdminSection;
  onChange: (s: AdminSection) => void;
  children: ReactNode;
  badges?: Partial<Record<AdminSection, number>>;
}) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary/30">
      <div className="container-page grid gap-8 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-4">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-foreground text-background">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Sahmlot</p>
                <p className="text-sm font-semibold">Admin</p>
              </div>
            </div>
            <nav className="flex flex-col gap-1 p-2">
              {NAV.map((n) => {
                const Icon = n.icon;
                const isActive = active === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => onChange(n.id)}
                    className={cn(
                      "relative flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="admin-pill"
                        className="absolute inset-0 rounded-md bg-secondary"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {n.label}
                    </span>
                    {badges?.[n.id] ? (
                      <span className="relative ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-[10px] font-medium text-background">
                        {badges[n.id]}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-border p-3">
              <Link
                to="/"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <ExternalLink className="h-3.5 w-3.5" /> View storefront
              </Link>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
