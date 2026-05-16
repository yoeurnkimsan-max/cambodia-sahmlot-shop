import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/context/OrdersContext";
import { loadAdminProducts, saveAdminProducts } from "@/data/products";
import { emitProductsUpdated } from "@/hooks/useProducts";
import { Download, Upload, AlertTriangle } from "lucide-react";

export const AdminSettings = () => {
  const { orders, clearAll } = useOrders();
  const [storeName, setStoreName] = useState(() => localStorage.getItem("sahmlot.settings.name") || "Sahmlot");
  const [currency, setCurrency] = useState(() => localStorage.getItem("sahmlot.settings.currency") || "USD");
  const [supportEmail, setSupportEmail] = useState(() => localStorage.getItem("sahmlot.settings.email") || "hello@sahmlot.com");
  const [saved, setSaved] = useState(false);

  const save = () => {
    localStorage.setItem("sahmlot.settings.name", storeName);
    localStorage.setItem("sahmlot.settings.currency", currency);
    localStorage.setItem("sahmlot.settings.email", supportEmail);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportData = () => {
    const data = { orders, products: loadAdminProducts(), exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `sahmlot-backup-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (Array.isArray(data.products)) {
          saveAdminProducts(data.products);
          emitProductsUpdated();
        }
        if (Array.isArray(data.orders)) {
          localStorage.setItem("sahmlot.orders.v1", JSON.stringify(data.orders));
          window.location.reload();
        }
      } catch {
        alert("Invalid backup file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Configuration</p>
        <h1 className="mt-2 font-serif text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage store details and your local data.</p>
      </header>

      <section className="border border-border bg-card p-6 space-y-4 max-w-2xl">
        <h2 className="font-semibold text-sm">Store</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Store name</label>
            <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-field">
              <option>USD</option><option>EUR</option><option>KHR</option><option>THB</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Support email</label>
            <input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="input-field" />
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={save}>Save changes</Button>
          {saved && <span className="text-xs text-emerald-600">Saved</span>}
        </div>
      </section>

      <section className="border border-border bg-card p-6 space-y-4 max-w-2xl">
        <h2 className="font-semibold text-sm">Data</h2>
        <p className="text-xs text-muted-foreground">Export your products and orders, or restore from a backup file.</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={exportData}><Download className="h-4 w-4" /> Export backup</Button>
          <label className="inline-flex items-center gap-2 cursor-pointer rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 h-10 text-sm font-medium">
            <Upload className="h-4 w-4" /> Import backup
            <input type="file" accept="application/json" className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f); }} />
          </label>
        </div>
      </section>

      <section className="border border-destructive/40 bg-destructive/5 p-6 space-y-3 max-w-2xl">
        <h2 className="flex items-center gap-2 font-semibold text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" /> Danger zone
        </h2>
        <p className="text-xs text-muted-foreground">Permanently delete all orders from local storage. This cannot be undone.</p>
        <Button variant="destructive" onClick={() => { if (confirm("Delete ALL orders?")) clearAll(); }}>
          Clear all orders
        </Button>
      </section>
    </div>
  );
};
