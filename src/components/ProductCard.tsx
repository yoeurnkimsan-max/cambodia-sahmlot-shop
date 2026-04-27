import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { cn } from "@/lib/utils";

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block animate-fade-up"
    >
      <div className="relative overflow-hidden bg-secondary aspect-[4/5] rounded-sm">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={800}
          height={1000}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.badge && (
          <span
            className={cn(
              "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest",
              product.badge === "Sale"
                ? "bg-accent text-accent-foreground"
                : product.badge === "New"
                  ? "bg-foreground text-background"
                  : "bg-background/90 text-foreground",
            )}
          >
            {product.badge}
          </span>
        )}
        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="rounded-full bg-foreground py-2.5 text-center text-xs font-semibold uppercase tracking-widest text-background">
            Quick view
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{product.collection}</p>
          <h3 className="mt-1 truncate font-serif text-base font-medium">{product.name}</h3>
          <div className="mt-1.5 flex gap-1.5">
            {product.colors.slice(0, 4).map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="h-3 w-3 rounded-full border border-border"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
        <div className="text-right">
          {product.compareAt ? (
            <>
              <p className="text-sm font-semibold text-accent">${product.price.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground line-through">${product.compareAt.toFixed(2)}</p>
            </>
          ) : (
            <p className="text-sm font-semibold">${product.price.toFixed(2)}</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;