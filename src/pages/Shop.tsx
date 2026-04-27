import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { products, Category, categoryMeta } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Alphabetical" },
];

const allCats: { value: Category | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: categoryMeta.new.label },
  { value: "men", label: categoryMeta.men.label },
  { value: "women", label: categoryMeta.women.label },
  { value: "essentials", label: categoryMeta.essentials.label },
];

const Shop = () => {
  const [params, setParams] = useSearchParams();
  const cat = (params.get("cat") as Category | null) || "all";
  const q = params.get("q")?.toLowerCase() || "";
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = products.slice();
    if (cat !== "all") list = list.filter((p) => p.categories.includes(cat as Category));
    if (q) list = list.filter((p) => `${p.name} ${p.collection}`.toLowerCase().includes(q));
    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "name": list.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return list;
  }, [cat, q, sort]);

  const setCat = (value: string) => {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete("cat");
    else next.set("cat", value);
    setParams(next, { replace: true });
  };

  const heading = cat !== "all" ? categoryMeta[cat as Category]?.label : "All Products";
  const subheading = cat !== "all" ? categoryMeta[cat as Category]?.description : "Every Sahmlot piece, in one place.";

  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-page py-12 lg:py-16">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Shop</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{heading}</h1>
          <p className="mt-2 text-muted-foreground max-w-xl">{subheading}</p>
          {q && <p className="mt-3 text-sm">Showing results for <span className="font-semibold">"{q}"</span></p>}
        </div>
      </section>

      <section className="container-page py-8">
        {/* Toolbar */}
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
          <button
            className="md:hidden inline-flex items-center gap-2 text-sm font-medium"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{filtered.length} items</span>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none border border-border bg-background py-2 pl-3 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4" />
            </div>
          </div>
        </div>

        {filtersOpen && (
          <div className="md:hidden flex flex-wrap gap-2 py-4 border-b border-border">
            {allCats.map((c) => (
              <button
                key={c.value}
                onClick={() => { setCat(c.value); setFiltersOpen(false); }}
                className={cn(
                  "px-4 py-2 text-sm rounded-full border",
                  cat === c.value ? "bg-foreground text-background border-foreground" : "border-border",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <h2 className="font-serif text-2xl">Nothing here yet</h2>
            <p className="mt-2 text-muted-foreground">Try a different filter or check back soon.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-x-4 gap-y-10 grid-cols-2 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default Shop;