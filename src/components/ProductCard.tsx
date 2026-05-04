import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, GitCompareArrows, Heart, Star } from "lucide-react";
import { Product } from "@/data/products";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";
import { cn } from "@/lib/utils";

type Props = {
  product: Product;
  onQuickView?: (product: Product) => void;
  view?: "grid" | "list";
};

const ProductCard = ({ product, onQuickView, view = "grid" }: Props) => {
  const { has, toggle } = useWishlist();
  const { has: inCompare, toggle: toggleCompare } = useCompare();
  const [activeColor, setActiveColor] = useState(product.colors[0]?.name);
  const liked = has(product.id);
  const comparing = inCompare(product.id);

  const discountPct = product.compareAt
    ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
    : 0;

  const lowStock = typeof product.stock === "number" && product.stock > 0 && product.stock <= 10;
  const soldOut = product.stock === 0;

  if (view === "list") {
    return (
      <article className="group flex gap-5 border-b border-border pb-6 last:border-b-0">
        <Link to={`/product/${product.slug}`} className="relative block w-40 sm:w-56 shrink-0 overflow-hidden rounded-xl bg-secondary aspect-[4/5]">
          <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
          {discountPct > 0 && (
            <span className="absolute left-2 top-2 rounded-full bg-foreground text-background px-2 py-0.5 text-[10px] font-semibold tracking-wide">-{discountPct}%</span>
          )}
        </Link>
        <div className="flex-1 min-w-0 flex flex-col">
          <p className="text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground">{product.collection}</p>
          <h3 className="mt-1 font-serif text-lg sm:text-xl tracking-tight">
            <Link to={`/product/${product.slug}`} className="hover:opacity-70 transition-opacity">{product.name}</Link>
          </h3>
          {product.rating != null && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
              <span className="font-medium text-foreground tabular-nums">{product.rating.toFixed(1)}</span>
              <span>({product.reviewCount})</span>
            </div>
          )}
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2 max-w-prose">{product.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {product.compareAt ? (
              <>
                <span className="text-base font-semibold tabular-nums text-destructive">${product.price.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground line-through tabular-nums">${product.compareAt.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-base font-semibold tabular-nums">${product.price.toFixed(2)}</span>
            )}
            {lowStock && <span className="text-[10px] uppercase tracking-[0.18em] text-destructive font-semibold">Only {product.stock} left</span>}
            {soldOut && <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">Sold out</span>}
          </div>
          <div className="mt-auto pt-4 flex items-center gap-2">
            {onQuickView && (
              <button onClick={() => onQuickView(product)} className="text-[11px] uppercase tracking-[0.18em] font-semibold underline underline-offset-4 hover:opacity-70">Quick view</button>
            )}
            <button onClick={() => toggle(product.id)} className={cn("ml-auto grid h-9 w-9 place-items-center rounded-full border", liked ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground")}>
              <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group block">
      <div className="relative overflow-hidden bg-secondary aspect-[4/5] rounded-xl">
        <Link to={`/product/${product.slug}`} aria-label={product.name} className="block h-full w-full">
          <motion.img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={800}
            height={1000}
            initial={false}
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full object-cover"
          />
        </Link>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badge && (
            <span
              className={cn(
                "px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] rounded-full",
                product.badge === "Sale" ? "bg-destructive text-destructive-foreground"
                  : product.badge === "New" ? "bg-foreground text-background"
                  : "bg-background/95 text-foreground border border-border",
              )}
            >
              {product.badge}
            </span>
          )}
          {discountPct > 0 && (
            <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] rounded-full bg-foreground text-background">
              -{discountPct}%
            </span>
          )}
          {lowStock && (
            <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] rounded-full bg-destructive/10 text-destructive border border-destructive/20">
              Only {product.stock} left
            </span>
          )}
          {soldOut && (
            <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] rounded-full bg-muted text-muted-foreground">
              Sold out
            </span>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); toggle(product.id); }}
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
            className="grid h-9 w-9 place-items-center rounded-full bg-background/95 text-foreground/70 hover:text-foreground transition-all shadow-soft hover:scale-110 backdrop-blur"
          >
            <Heart className={cn("h-4 w-4 transition-all", liked && "fill-foreground text-foreground")} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); toggleCompare(product.id); }}
            aria-label={comparing ? "Remove from compare" : "Add to compare"}
            aria-pressed={comparing}
            className={cn(
              "grid h-9 w-9 place-items-center rounded-full transition-all shadow-soft hover:scale-110 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 duration-300 backdrop-blur",
              comparing ? "bg-foreground text-background" : "bg-background/95 text-foreground/70 hover:text-foreground",
            )}
          >
            <GitCompareArrows className="h-4 w-4" />
          </button>
        </div>

        {/* Quick view */}
        {onQuickView && (
          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onQuickView(product); }}
              className="inline-flex w-full items-center justify-center gap-2 bg-foreground py-3 rounded-full text-[11px] font-semibold uppercase tracking-[0.16em] text-background hover:bg-foreground/90 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" /> Quick view
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground">{product.collection}</p>
          <h3 className="mt-1 truncate font-serif text-[15px] font-medium tracking-tight">
            <Link to={`/product/${product.slug}`} className="hover:opacity-70 transition-opacity">{product.name}</Link>
          </h3>
          {product.rating != null && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Star className="h-3 w-3 fill-foreground text-foreground" />
              <span className="text-foreground font-medium tabular-nums">{product.rating.toFixed(1)}</span>
              <span className="opacity-70">({product.reviewCount})</span>
            </div>
          )}
          <div className="mt-2.5 flex gap-1.5">
            {product.colors.slice(0, 5).map((c) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                onMouseEnter={() => setActiveColor(c.name)}
                onClick={(e) => { e.preventDefault(); setActiveColor(c.name); }}
                className={cn(
                  "h-3.5 w-3.5 rounded-full ring-offset-background transition-all",
                  activeColor === c.name
                    ? "ring-1 ring-offset-2 ring-foreground scale-110"
                    : "ring-1 ring-border",
                )}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
        <div className="text-right shrink-0">
          {product.compareAt ? (
            <>
              <p className="text-sm font-semibold text-destructive tabular-nums">${product.price.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground line-through tabular-nums">${product.compareAt.toFixed(2)}</p>
            </>
          ) : (
            <p className="text-sm font-semibold tabular-nums">${product.price.toFixed(2)}</p>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;