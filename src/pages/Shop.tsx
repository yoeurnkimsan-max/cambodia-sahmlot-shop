import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Category, categoryMeta, collections, Product } from "@/data/products";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import QuickViewModal from "@/components/QuickViewModal";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, LayoutGrid, List, SlidersHorizontal, X, ChevronRight as Chevron } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import FilterDrawer, { FilterState, defaultFilters } from "@/components/FilterDrawer";

const allCats: { value: Category | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: categoryMeta.new.label },
  { value: "men", label: categoryMeta.men.label },
  { value: "women", label: categoryMeta.women.label },
  { value: "essentials", label: categoryMeta.essentials.label },
  { value: "outerwear", label: categoryMeta.outerwear.label },
  { value: "bottoms", label: categoryMeta.bottoms.label },
  { value: "accessories", label: categoryMeta.accessories.label },
];

const PER_PAGE_OPTIONS = [12, 24, 48];

const Shop = () => {
  const products = useProducts();
  const [params, setParams] = useSearchParams();
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [perPage, setPerPage] = useState<number>(24);
  const [page, setPage] = useState(1);

  const cat = (params.get("cat") as Category | null) || "all";
  const q = params.get("q")?.toLowerCase().trim() || "";
  const collection = params.get("collection")?.toLowerCase() || "";
  const sortParam = params.get("sort") || "";

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
        { value: "outerwear", label: "Outerwear" },
        { value: "bottoms", label: "Bottoms" },
        { value: "accessories", label: "Accessories" },
      ],
      badges: Array.from(badgesSet),
    };
  }, [products]);

  const [filters, setFilters] = useState<FilterState>(() => defaultFilters(100));

  // Sync sort from URL when present
  useEffect(() => {
    if (sortParam && sortParam !== filters.sort) {
      setFilters((f) => ({ ...f, sort: sortParam }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortParam]);

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
      case "rating":
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      case "popular":
        list.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0)); break;
    }
    return list;
  }, [cat, q, collection, filters, products]);

  // Reset to page 1 when filters/cat/perPage change
  useEffect(() => { setPage(1); }, [cat, q, collection, filters, perPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = useMemo(
    () => filtered.slice((page - 1) * perPage, page * perPage),
    [filtered, page, perPage],
  );

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
      {/* Compact breadcrumb header */}
      <section className="border-b border-border bg-background">
        <div className="container-page pt-6 pb-5">
          <motion.nav
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
          >
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Chevron className="h-3 w-3 opacity-60" />
            <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            {cat !== "all" && (
              <>
                <Chevron className="h-3 w-3 opacity-60" />
                <span className="text-foreground">{heading}</span>
              </>
            )}
          </motion.nav>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="font-serif text-[28px] sm:text-[32px] tracking-[-0.02em] leading-none">{heading}</h1>
              <p className="mt-1.5 text-[13px] text-muted-foreground">{subheading}</p>
            </motion.div>
            <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground tabular-nums">{filtered.length} items</span>
          </div>

          {(q || collection) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {q && (
                <button onClick={() => clearFilter("q")} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 hover:border-foreground transition-colors">
                  Search: <span className="font-semibold">{q}</span> <X className="h-3 w-3" />
                </button>
              )}
              {collectionLabel && (
                <button onClick={() => clearFilter("collection")} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 hover:border-foreground transition-colors">
                  Collection: <span className="font-semibold">{collectionLabel}</span> <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Sticky toolbar */}
      <section className="container-page pt-4">
        <div className="sticky top-[64px] z-20 -mx-4 px-4 sm:mx-0 sm:px-0 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-border">
          <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="hidden md:flex items-center gap-1 overflow-x-auto">
            {allCats.map((c) => (
              <button
                key={c.value}
                onClick={() => setCat(c.value)}
                className={cn(
                  "relative px-3.5 py-1.5 text-[12px] font-medium uppercase tracking-[0.18em] transition-colors rounded-full",
                  cat === c.value
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2.5 text-sm ml-auto">
            <div className="hidden sm:flex items-center gap-1 border border-border rounded-full p-0.5">
              <button
                onClick={() => setView("grid")}
                aria-label="Grid view"
                className={cn("grid h-8 w-8 place-items-center rounded-full transition-colors", view === "grid" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
              ><LayoutGrid className="h-3.5 w-3.5" /></button>
              <button
                onClick={() => setView("list")}
                aria-label="List view"
                className={cn("grid h-8 w-8 place-items-center rounded-full transition-colors", view === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
              ><List className="h-3.5 w-3.5" /></button>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>Show</span>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="bg-transparent border border-border rounded-full px-2.5 py-1 text-[11px] focus:outline-none focus:border-foreground tabular-nums cursor-pointer"
              >
                {PER_PAGE_OPTIONS.map((n) => (<option key={n} value={n}>{n}</option>))}
              </select>
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="group relative inline-flex items-center gap-2 rounded-full px-4 py-2 border border-foreground bg-background text-foreground text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-foreground hover:text-background transition-all duration-300"
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
        </div>

        {/* Mobile category strip */}
        <div className="md:hidden flex gap-2 py-3 overflow-x-auto -mx-4 px-4 border-b border-border">
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
          <>
            {view === "grid" ? (
              <div className="mt-8 grid gap-x-4 gap-y-10 grid-cols-2 lg:grid-cols-4">
                {paged.map((p) => (
                  <ProductCard key={p.id} product={p} onQuickView={setQuickView} />
                ))}
              </div>
            ) : (
              <div className="mt-8 flex flex-col gap-6">
                {paged.map((p) => (
                  <ProductCard key={p.id} product={p} onQuickView={setQuickView} view="list" />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="grid h-10 w-10 place-items-center rounded-full border border-border disabled:opacity-40 hover:border-foreground transition-colors"
                  aria-label="Previous page"
                ><ChevronLeft className="h-4 w-4" /></button>
                {pageNumbers(page, totalPages).map((n, i) =>
                  n === "…" ? (
                    <span key={`g-${i}`} className="px-2 text-muted-foreground">…</span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(n as number)}
                      className={cn(
                        "h-10 min-w-10 px-3 rounded-full text-sm tabular-nums transition-colors",
                        page === n
                          ? "bg-foreground text-background"
                          : "border border-border hover:border-foreground",
                      )}
                    >{n}</button>
                  ),
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="grid h-10 w-10 place-items-center rounded-full border border-border disabled:opacity-40 hover:border-foreground transition-colors"
                  aria-label="Next page"
                ><ChevronRight className="h-4 w-4" /></button>
              </nav>
            )}

            <p className="mt-6 text-center text-xs text-muted-foreground tabular-nums">
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
            </p>
          </>
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

function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}

export default Shop;
