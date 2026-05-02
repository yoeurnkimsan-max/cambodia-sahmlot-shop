import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Category, categoryMeta, collections, Product } from "@/data/products";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import QuickViewModal from "@/components/QuickViewModal";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import FilterDrawer, { FilterState, defaultFilters } from "@/components/FilterDrawer";

const allCats: { value: Category | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: categoryMeta.new.label },
  { value: "men", label: categoryMeta.men.label },
  { value: "women", label: categoryMeta.women.label },
  { value: "essentials", label: categoryMeta.essentials.label },
];

const Shop = () => {
  const products = useProducts();
  const [params, setParams] = useSearchParams();
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const cat = (params.get("cat") as Category | null) || "all";
  const q = params.get("q")?.toLowerCase().trim() || "";
  const collection = params.get("collection")?.toLowerCase() || "";

  // Build facets from full catalog so options stay stable.
  const facets = useMemo(() => {
    const sizesSet = new Set<string>();
    const colorsMap = new Map<string, string>();
    const badgesSet = new Set<string>();
    let priceMin = Infinity;
    let priceMax = 0;
    products.forEach((p) => {
      p.sizes.forEach((s) => sizesSet.add(s));
      p.colors.forEach((c) => colorsMap.set(c.name, c.hex));
      if (p.badge) badgesSet.add(p.badge);
      priceMin = Math.min(priceMin, Math.floor(p.price));
      priceMax = Math.max(priceMax, Math.ceil(p.price));
    });
    if (!isFinite(priceMin)) priceMin = 0;
    return {
      priceMin,
      priceMax,
      sizes: Array.from(sizesSet),
      colors: Array.from(colorsMap.entries()).map(([name, hex]) => ({ name, hex })),
      categories: [
        { value: "men", label: "Men" },
        { value: "women", label: "Women" },
        { value: "essentials", label: "Essentials" },
        { value: "new", label: "New" },
      ],
      badges: Array.from(badgesSet),
    };
  }, [products]);

  const [filters, setFilters] = useState<FilterState>(() => defaultFilters(100));

  // Once products load, ensure price range matches catalog max.
  useMemo(() => {
    setFilters((f) =>
      f.price[1] === 100 || f.price[1] < facets.priceMax
        ? { ...f, price: [facets.priceMin, facets.priceMax] }
        : f,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facets.priceMax, facets.priceMin]);

  const filtered = useMemo(() => {
    let list = products.slice();
    if (cat !== "all") list = list.filter((p) => p.categories.includes(cat as Category));
    if (collection) {
      const target = collections.find((c) => c.slug === collection);
      if (target) list = list.filter((p) => p.collection === target.name);
    }
    if (q) {
      const tokens = q.split(/\s+/).filter(Boolean);
      list = list.filter((p) => {
        const hay = `${p.name} ${p.collection} ${p.description} ${p.badge ?? ""}`.toLowerCase();
        return tokens.every((t) => hay.includes(t));
      });
    }
    // Drawer filters
    list = list.filter((p) => p.price >= filters.price[0] && p.price <= filters.price[1]);
    if (filters.sizes.length) list = list.filter((p) => p.sizes.some((s) => filters.sizes.includes(s)));
    if (filters.colors.length) list = list.filter((p) => p.colors.some((c) => filters.colors.includes(c.name)));
    if (filters.categories.length)
      list = list.filter((p) => p.categories.some((c) => filters.categories.includes(c)));
    if (filters.badges.length) list = list.filter((p) => p.badge && filters.badges.includes(p.badge));

    switch (filters.sort) {
      case "price-low": list.sort((a, b) => a.price - b.price); break;
      case "price-high": list.sort((a, b) => b.price - a.price); break;
      case "discount-high":
        list.sort((a, b) => discount(b) - discount(a)); break;
      case "discount-low":
        list.sort((a, b) => discount(a) - discount(b)); break;
      case "new":
        list.sort((a, b) => Number(b.badge === "New") - Number(a.badge === "New")); break;
    }
    return list;
  }, [cat, q, collection, filters, products]);

  const setCat = (value: string) => {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete("cat"); else next.set("cat", value);
    setParams(next, { replace: true });
  };

  const clearFilter = (key: string) => {
    const next = new URLSearchParams(params);
    next.delete(key);
    setParams(next, { replace: true });
  };

  const activeFilterCount =
    (filters.sort !== "recommend" ? 1 : 0) +
    (filters.price[0] !== facets.priceMin || filters.price[1] !== facets.priceMax ? 1 : 0) +
    filters.sizes.length +
    filters.colors.length +
    filters.categories.length +
    filters.badges.length;

  const collectionLabel = collection ? collections.find((c) => c.slug === collection)?.name : null;
  const heading = cat !== "all" ? categoryMeta[cat as Category]?.label : collectionLabel || "All Products";
  const subheading = cat !== "all"
    ? categoryMeta[cat as Category]?.description
    : collectionLabel
      ? collections.find((c) => c.slug === collection)?.tagline
      : "Every Sahmlot piece, in one place.";

  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-page py-12 lg:py-16">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Shop</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{heading}</h1>
          <p className="mt-2 text-muted-foreground max-w-xl">{subheading}</p>

          {/* Active filters */}
          {(q || collection) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              {q && (
                <button onClick={() => clearFilter("q")} className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1 hover:border-foreground">
                  Search: <span className="font-semibold">{q}</span> <X className="h-3 w-3" />
                </button>
              )}
              {collectionLabel && (
                <button onClick={() => clearFilter("collection")} className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1 hover:border-foreground">
                  Collection: <span className="font-semibold">{collectionLabel}</span> <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="hidden md:flex items-center gap-1 overflow-x-auto">
            {allCats.map((c) => (
              <button
                key={c.value}
                onClick={() => setCat(c.value)}
                className={cn(
                  "px-4 py-2 text-sm font-medium uppercase tracking-wide transition-colors",
                  cat === c.value
                    ? "bg-foreground text-background rounded-full"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-sm ml-auto">
            <span className="text-muted-foreground tabular-nums">{filtered.length} Items</span>
            <button
              onClick={() => setDrawerOpen(true)}
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 border border-foreground bg-background text-foreground text-xs uppercase tracking-[0.2em] font-medium hover:bg-foreground hover:text-background transition-all duration-300"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
              {activeFilterCount > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px] font-bold px-1.5 group-hover:bg-background group-hover:text-foreground transition-colors">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile category strip */}
        <div className="md:hidden flex gap-2 py-4 overflow-x-auto -mx-4 px-4 border-b border-border">
          {allCats.map((c) => (
            <button
              key={c.value}
              onClick={() => setCat(c.value)}
              className={cn(
                "shrink-0 px-4 py-1.5 text-xs uppercase tracking-wider rounded-full border transition-all",
                cat === c.value ? "bg-foreground text-background border-foreground" : "border-border",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <h2 className="font-serif text-2xl">Nothing matches yet</h2>
            <p className="mt-2 text-muted-foreground">Try a different filter or clear your search.</p>
            <Button
              onClick={() => { setParams({}, { replace: true }); setFilters(defaultFilters(facets.priceMax)); }}
              className="mt-6 rounded-none"
            >
              Reset filters
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-x-4 gap-y-10 grid-cols-2 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onQuickView={setQuickView} />
            ))}
          </div>
        )}
      </section>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        value={filters}
        onApply={setFilters}
        facets={facets}
        resultCount={filtered.length}
      />
    </>
  );
};

const discount = (p: Product) =>
  p.compareAt && p.compareAt > p.price ? (p.compareAt - p.price) / p.compareAt : 0;

export default Shop;
