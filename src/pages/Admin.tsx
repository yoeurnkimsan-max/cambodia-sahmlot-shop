import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, ImagePlus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Product,
  Category,
  loadAdminProducts,
  saveAdminProducts,
} from "@/data/products";
import { emitProductsUpdated } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "new", label: "New Arrivals" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "essentials", label: "Essentials" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const BADGES = ["", "New", "Bestseller", "Limited", "Sale"] as const;

const productSchema = z
  .object({
    name: z.string().min(2, "Name is too short").max(80),
    collection: z.string().min(2, "Collection required"),
    price: z.coerce.number().positive("Price must be > 0"),
    compareAt: z.coerce.number().optional().or(z.literal("")).transform((v) => (v === "" || v === undefined ? undefined : Number(v))),
    description: z.string().min(10, "Description should be at least 10 characters"),
    detailsRaw: z.string().min(3, "Add at least one detail"),
    categories: z.array(z.enum(["new", "men", "women", "essentials"])).min(1, "Pick at least one category"),
    sizes: z.array(z.string()).min(1, "Pick at least one size"),
    colorsRaw: z
      .string()
      .min(3, "Add at least one color (e.g. White:#F5F2EA)")
      .refine((v) => v.split(",").every((c) => /^[^:]+:#?[0-9a-fA-F]{3,8}$/.test(c.trim())), {
        message: "Use format Name:#hex, comma separated",
      }),
    image: z.string().min(5, "Image is required"),
    badge: z.enum(BADGES).optional(),
  })
  .refine((d) => !d.compareAt || d.compareAt > d.price, {
    path: ["compareAt"],
    message: "Compare price must be greater than price",
  });

type ProductForm = z.input<typeof productSchema>;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const Admin = () => {
  const [items, setItems] = useState<Product[]>(() => loadAdminProducts());
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      collection: "Daily Essentials",
      price: 0,
      compareAt: "" as unknown as number,
      description: "",
      detailsRaw: "100% combed cotton, 220gsm\nPre-shrunk\nMade in Phnom Penh",
      categories: ["new"],
      sizes: ["S", "M", "L"],
      colorsRaw: "White:#F5F2EA, Black:#1B1A18",
      image: "",
      badge: "New",
    },
  });

  const watchImage = watch("image");
  useEffect(() => {
    setImagePreview(watchImage || null);
  }, [watchImage]);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setValue("image", reader.result as string, { shouldValidate: true });
    reader.readAsDataURL(file);
  };

  const onSubmit = handleSubmit((data) => {
    const colors = data.colorsRaw.split(",").map((c) => {
      const [name, hex] = c.split(":").map((s) => s.trim());
      return { name, hex: hex.startsWith("#") ? hex : `#${hex}` };
    });
    const details = data.detailsRaw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    const product: Product = {
      id: `admin-${Date.now()}`,
      slug: slugify(data.name) + "-" + Math.random().toString(36).slice(2, 6),
      name: data.name,
      collection: data.collection,
      price: Number(data.price),
      compareAt: data.compareAt ? Number(data.compareAt) : undefined,
      description: data.description,
      details,
      categories: data.categories,
      sizes: data.sizes,
      colors,
      image: data.image,
      badge: data.badge && data.badge !== "" ? (data.badge as Product["badge"]) : undefined,
    };

    const next = [product, ...items];
    setItems(next);
    saveAdminProducts(next);
    emitProductsUpdated();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3500);
    reset();
  });

  const removeProduct = (id: string) => {
    const next = items.filter((p) => p.id !== id);
    setItems(next);
    saveAdminProducts(next);
    emitProductsUpdated();
  };

  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-page py-10 lg:py-14 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Admin</p>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl">Product Manager</h1>
            <p className="mt-2 text-muted-foreground max-w-xl text-sm">
              Add new products to your catalog. Saved locally in your browser — no backend needed.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" /> {items.length} admin product{items.length === 1 ? "" : "s"}
            </span>
            <Button asChild variant="outline" className="rounded-none">
              <Link to="/shop">View Shop</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-page py-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* FORM */}
        <form onSubmit={onSubmit} className="space-y-8" noValidate>
          {success && (
            <div className="flex items-center gap-3 border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              Product added — visible now in the shop.
            </div>
          )}

          <Field label="Product name" error={errors.name?.message}>
            <input
              {...register("name")}
              placeholder="Essential Cotton Tee — White"
              className="input-base"
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Collection" error={errors.collection?.message}>
              <input {...register("collection")} placeholder="Daily Essentials" className="input-base" />
            </Field>
            <Field label="Badge (optional)" error={errors.badge?.message}>
              <select {...register("badge")} className="input-base">
                {BADGES.map((b) => (
                  <option key={b || "none"} value={b}>{b || "— None —"}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Price (USD)" error={errors.price?.message}>
              <input type="number" step="0.01" min="0" {...register("price")} className="input-base" />
            </Field>
            <Field label="Compare-at price (optional)" error={errors.compareAt?.message as string}>
              <input type="number" step="0.01" min="0" {...register("compareAt")} className="input-base" placeholder="44.00" />
            </Field>
          </div>

          <Field label="Description" error={errors.description?.message}>
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Tell the story behind the product…"
              className="input-base resize-y"
            />
          </Field>

          <Field label="Details (one per line)" error={errors.detailsRaw?.message}>
            <textarea {...register("detailsRaw")} rows={4} className="input-base resize-y" />
          </Field>

          <Field label="Categories" error={errors.categories?.message as string}>
            <Controller
              control={control}
              name="categories"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => {
                    const active = field.value?.includes(c.value);
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => {
                          const v = field.value || [];
                          field.onChange(active ? v.filter((x) => x !== c.value) : [...v, c.value]);
                        }}
                        className={cn(
                          "px-4 py-2 text-sm border transition-colors",
                          active ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground",
                        )}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </Field>

          <Field label="Available sizes" error={errors.sizes?.message as string}>
            <Controller
              control={control}
              name="sizes"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((s) => {
                    const active = field.value?.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          const v = field.value || [];
                          field.onChange(active ? v.filter((x) => x !== s) : [...v, s]);
                        }}
                        className={cn(
                          "h-10 w-12 text-sm border transition-colors",
                          active ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground",
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </Field>

          <Field
            label="Colors (Name:#hex, comma separated)"
            error={errors.colorsRaw?.message}
            hint="e.g. White:#F5F2EA, Black:#1B1A18, Sage:#8AA17B"
          >
            <input {...register("colorsRaw")} className="input-base" />
            <ColorPreview value={watch("colorsRaw")} />
          </Field>

          <Field label="Product image" error={errors.image?.message}>
            <ImageUpload
              preview={imagePreview}
              onFile={handleFileUpload}
              onUrl={(url) => setValue("image", url, { shouldValidate: true })}
              urlValue={watchImage}
            />
          </Field>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
            <Button type="submit" size="lg" disabled={isSubmitting} className="rounded-none">
              {isSubmitting ? "Saving..." : "Add Product"}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => reset()} className="rounded-none">
              Reset Form
            </Button>
          </div>
        </form>

        {/* LIST */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-serif text-xl mb-4">Recently added</h2>
          {items.length === 0 ? (
            <div className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No admin products yet. Add your first one.
            </div>
          ) : (
            <ul className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {items.map((p) => (
                <li key={p.id} className="flex gap-3 border border-border p-3 bg-card">
                  <img src={p.image} alt={p.name} className="h-16 w-14 object-cover rounded-sm" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.collection} · ${p.price.toFixed(2)}</p>
                    <Link to={`/product/${p.slug}`} className="text-xs underline underline-offset-2 hover:text-accent">
                      View on storefront
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProduct(p.id)}
                    className="self-start text-muted-foreground hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>
    </>
  );
};

/* ---------- Subcomponents ---------- */

const Field = ({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-sm font-medium uppercase tracking-widest mb-2">{label}</label>
    {children}
    {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
  </div>
);

const ColorPreview = ({ value }: { value?: string }) => {
  if (!value) return null;
  const swatches = value
    .split(",")
    .map((c) => c.trim())
    .filter((c) => /^[^:]+:#?[0-9a-fA-F]{3,8}$/.test(c))
    .map((c) => {
      const [name, hex] = c.split(":");
      return { name: name.trim(), hex: hex.startsWith("#") ? hex : `#${hex}` };
    });
  if (swatches.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-3">
      {swatches.map((s) => (
        <div key={s.name} className="flex items-center gap-2 text-xs">
          <span className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: s.hex }} />
          <span>{s.name}</span>
        </div>
      ))}
    </div>
  );
};

const ImageUpload = ({
  preview,
  onFile,
  onUrl,
  urlValue,
}: {
  preview: string | null;
  onFile: (f: File) => void;
  onUrl: (url: string) => void;
  urlValue?: string;
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        <label className="flex flex-1 cursor-pointer flex-col items-center justify-center border border-dashed border-border bg-secondary/30 p-6 text-center hover:border-foreground transition-colors">
          <ImagePlus className="h-6 w-6 text-muted-foreground" />
          <span className="mt-2 text-sm font-medium">Click to upload</span>
          <span className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 2MB</span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
          />
        </label>
        {preview && (
          <div className="h-32 w-28 overflow-hidden rounded-sm border border-border bg-secondary">
            <img src={preview} alt="preview" className="h-full w-full object-cover" />
          </div>
        )}
      </div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground">or paste image URL</div>
      <input
        type="url"
        placeholder="https://…"
        value={urlValue?.startsWith("data:") ? "" : urlValue || ""}
        onChange={(e) => onUrl(e.target.value)}
        className="input-base"
      />
    </div>
  );
};

export default Admin;