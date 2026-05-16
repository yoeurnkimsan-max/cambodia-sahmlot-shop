import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Search, ImagePlus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Product, Category, loadAdminProducts, saveAdminProducts, products as catalog,
} from "@/data/products";
import { emitProductsUpdated } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "new", label: "New" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "essentials", label: "Essentials" },
  { value: "accessories", label: "Accessories" },
  { value: "outerwear", label: "Outerwear" },
  { value: "bottoms", label: "Bottoms" },
];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const BADGES = ["", "New", "Bestseller", "Limited", "Sale"] as const;

const schema = z
  .object({
    name: z.string().min(2, "Name is too short").max(80),
    collection: z.string().min(2, "Collection required"),
    price: z.coerce.number().positive("Price must be > 0"),
    compareAt: z.coerce.number().optional().or(z.literal("")).transform((v) => (v === "" || v === undefined ? undefined : Number(v))),
    stock: z.coerce.number().min(0).optional().or(z.literal("")).transform((v) => (v === "" || v === undefined ? undefined : Number(v))),
    description: z.string().min(10, "Add at least 10 characters"),
    detailsRaw: z.string().min(3, "Add at least one detail"),
    categories: z.array(z.enum(["new", "men", "women", "essentials", "accessories", "outerwear", "bottoms"])).min(1, "Pick at least one"),
    sizes: z.array(z.string()).min(1, "Pick at least one size"),
    colorsRaw: z.string().min(3).refine((v) => v.split(",").every((c) => /^[^:]+:#?[0-9a-fA-F]{3,8}$/.test(c.trim())), { message: "Use Name:#hex, comma separated" }),
    image: z.string().min(5, "Image required"),
    badge: z.enum(BADGES).optional(),
  })
  .refine((d) => !d.compareAt || d.compareAt > d.price, { path: ["compareAt"], message: "Must be greater than price" });

type Form = z.input<typeof schema>;

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const blankDefaults: Form = {
  name: "", collection: "Daily Essentials", price: 0, compareAt: "" as unknown as number,
  stock: "" as unknown as number, description: "",
  detailsRaw: "100% combed cotton, 220gsm\nPre-shrunk\nMade in Phnom Penh",
  categories: ["new"], sizes: ["S", "M", "L"],
  colorsRaw: "White:#F5F2EA, Black:#1B1A18", image: "", badge: "New",
};

export const AdminProducts = () => {
  const [items, setItems] = useState<Product[]>(() => loadAdminProducts());
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Category | "all">("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const all = useMemo(() => [...items, ...catalog], [items]);
  const filtered = useMemo(() => {
    return all.filter((p) => {
      if (filter !== "all" && !p.categories.includes(filter)) return false;
      if (!q) return true;
      return `${p.name} ${p.collection} ${p.sku || ""}`.toLowerCase().includes(q.toLowerCase());
    });
  }, [all, q, filter]);

  const persist = (next: Product[]) => {
    setItems(next);
    saveAdminProducts(next);
    emitProductsUpdated();
  };

  const openCreate = () => { setEditing(null); setOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setOpen(true); };

  const remove = (p: Product) => {
    if (!p.id.startsWith("admin-")) {
      alert("Catalog products can be edited but only admin-added products can be deleted.");
      return;
    }
    if (!confirm(`Delete "${p.name}"?`)) return;
    persist(items.filter((i) => i.id !== p.id));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Catalog</p>
          <h1 className="mt-2 font-serif text-3xl">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{all.length} total · {items.length} admin-added</p>
        </div>
        <Button onClick={openCreate} className="rounded-md"><Plus className="h-4 w-4" /> New product</Button>
      </header>

      <div className="flex flex-wrap items-center gap-2 border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…"
            className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {(["all", ...CATEGORIES.map((c) => c.value)] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c as Category | "all")}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs capitalize transition-colors",
                filter === c ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary",
              )}
            >{c}</button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Collection</th>
                <th className="px-4 py-3 text-left">Categories</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No products match.</td></tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="h-12 w-10 rounded-sm object-cover bg-secondary" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.sku || p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.collection}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.categories.slice(0, 3).map((c) => (
                        <Badge key={c} variant="secondary" className="text-[10px] capitalize rounded-full">{c}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className="font-semibold">${p.price.toFixed(2)}</span>
                    {p.compareAt && <span className="ml-1 text-xs text-muted-foreground line-through">${p.compareAt.toFixed(2)}</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-xs">
                    {p.stock === 0 ? <span className="text-destructive">Sold out</span> : <span>{p.stock ?? "—"}</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={() => openEdit(p)} className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(p)} className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProductFormDialog
        key={editing?.id || "new"}
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onSave={(p) => {
          if (editing && editing.id.startsWith("admin-")) {
            persist(items.map((i) => (i.id === editing.id ? p : i)));
          } else {
            persist([p, ...items]);
          }
          setOpen(false);
        }}
      />
    </div>
  );
};

const ProductFormDialog = ({
  open, onOpenChange, editing, onSave,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  editing: Product | null;
  onSave: (p: Product) => void;
}) => {
  const defaults: Form = useMemo(() => {
    if (!editing) return blankDefaults;
    return {
      name: editing.name,
      collection: editing.collection,
      price: editing.price,
      compareAt: (editing.compareAt ?? "") as unknown as number,
      stock: (editing.stock ?? "") as unknown as number,
      description: editing.description,
      detailsRaw: editing.details.join("\n"),
      categories: editing.categories,
      sizes: editing.sizes,
      colorsRaw: editing.colors.map((c) => `${c.name}:${c.hex}`).join(", "),
      image: editing.image,
      badge: (editing.badge ?? "") as Form["badge"],
    };
  }, [editing]);

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<Form>({ resolver: zodResolver(schema), defaultValues: defaults });

  useEffect(() => { reset(defaults); }, [defaults, reset]);

  const watchImage = watch("image");

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setValue("image", reader.result as string, { shouldValidate: true });
    reader.readAsDataURL(file);
  };

  const submit = handleSubmit((data) => {
    const colors = data.colorsRaw.split(",").map((c) => {
      const [name, hex] = c.split(":").map((s) => s.trim());
      return { name, hex: hex.startsWith("#") ? hex : `#${hex}` };
    });
    const details = data.detailsRaw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

    const product: Product = {
      id: editing?.id?.startsWith("admin-") ? editing.id : `admin-${Date.now()}`,
      slug: editing?.slug || `${slugify(data.name)}-${Math.random().toString(36).slice(2, 6)}`,
      name: data.name,
      collection: data.collection,
      price: Number(data.price),
      compareAt: data.compareAt ? Number(data.compareAt) : undefined,
      stock: data.stock === undefined || data.stock === ("" as unknown as number) ? editing?.stock : Number(data.stock),
      description: data.description,
      details,
      categories: data.categories,
      sizes: data.sizes,
      colors,
      image: data.image,
      badge: data.badge ? (data.badge as Product["badge"]) : undefined,
      sku: editing?.sku,
      rating: editing?.rating,
      reviewCount: editing?.reviewCount,
      tags: editing?.tags,
    };
    onSave(product);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {editing ? `Edit · ${editing.name}` : "New product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" error={errors.name?.message}>
              <input {...register("name")} className="input-field" />
            </Field>
            <Field label="Collection" error={errors.collection?.message}>
              <input {...register("collection")} className="input-field" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price" error={errors.price?.message}>
              <input type="number" step="0.01" {...register("price")} className="input-field" />
            </Field>
            <Field label="Compare-at" error={errors.compareAt?.message as string}>
              <input type="number" step="0.01" {...register("compareAt")} className="input-field" />
            </Field>
            <Field label="Stock" error={errors.stock?.message as string}>
              <input type="number" step="1" {...register("stock")} className="input-field" />
            </Field>
          </div>

          <Field label="Description" error={errors.description?.message}>
            <textarea rows={3} {...register("description")} className="input-field resize-y" />
          </Field>

          <Field label="Details (one per line)" error={errors.detailsRaw?.message}>
            <textarea rows={3} {...register("detailsRaw")} className="input-field resize-y" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Categories" error={errors.categories?.message as string}>
              <Controller control={control} name="categories" render={({ field }) => (
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => {
                    const active = field.value?.includes(c.value);
                    return (
                      <button key={c.value} type="button" onClick={() => {
                        const v = field.value || [];
                        field.onChange(active ? v.filter((x) => x !== c.value) : [...v, c.value]);
                      }} className={cn("rounded-full border px-3 py-1 text-xs transition", active ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground")}>{c.label}</button>
                    );
                  })}
                </div>
              )} />
            </Field>
            <Field label="Sizes" error={errors.sizes?.message as string}>
              <Controller control={control} name="sizes" render={({ field }) => (
                <div className="flex flex-wrap gap-1.5">
                  {SIZES.map((s) => {
                    const active = field.value?.includes(s);
                    return (
                      <button key={s} type="button" onClick={() => {
                        const v = field.value || [];
                        field.onChange(active ? v.filter((x) => x !== s) : [...v, s]);
                      }} className={cn("h-9 w-11 border text-xs transition", active ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground")}>{s}</button>
                    );
                  })}
                </div>
              )} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Colors (Name:#hex)" error={errors.colorsRaw?.message}>
              <input {...register("colorsRaw")} className="input-field" />
            </Field>
            <Field label="Badge" error={errors.badge?.message}>
              <select {...register("badge")} className="input-field">
                {BADGES.map((b) => <option key={b || "none"} value={b}>{b || "— None —"}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Image" error={errors.image?.message}>
            <div className="flex items-start gap-3">
              <label className="flex flex-1 cursor-pointer flex-col items-center justify-center border border-dashed border-border bg-secondary/30 p-4 text-center hover:border-foreground transition-colors rounded-md">
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
                <span className="mt-2 text-xs font-medium">Click to upload</span>
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => {
                  const f = e.target.files?.[0]; if (f) handleFile(f);
                }} />
              </label>
              {watchImage && (
                <div className="h-24 w-20 overflow-hidden rounded-sm border border-border bg-secondary">
                  <img src={watchImage} alt="" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
            <input type="url" placeholder="…or paste image URL"
              value={watchImage?.startsWith("data:") ? "" : (watchImage || "")}
              onChange={(e) => setValue("image", e.target.value, { shouldValidate: true })}
              className="input-field mt-2" />
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{editing ? "Save changes" : "Create product"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
    {children}
    {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
  </div>
);
