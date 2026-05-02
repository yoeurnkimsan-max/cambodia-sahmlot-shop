import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { ChevronDown, Minus, Plus, Truck, RotateCcw, Shield, Heart } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import RecentlyViewed from "@/components/RecentlyViewed";
import MotionInView from "@/components/MotionInView";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";
import NotFound from "./NotFound";

const ProductDetail = () => {
  const { slug } = useParams();
  const products = useProducts();
  const product = useMemo(() => products.find((p) => p.slug === slug), [slug, products]);
  const { addItem } = useCart();
  const { push } = useRecentlyViewed();
  const { has, toggle } = useWishlist();
  const [color, setColor] = useState(product?.colors[0]?.name ?? "");
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [openSection, setOpenSection] = useState<string | null>("details");
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => { if (product) push(product.id); }, [product, push]);

  if (!product) return <NotFound />;

  const related = products.filter((p) => p.id !== product.id).slice(0, 4);
  const liked = has(product.id);
  const gallery = [product.image, product.image, product.image];

  const handleAdd = () => {
    if (!size) {
      setOpenSection("size-guide");
      return;
    }
    addItem({ productId: product.id, color, size, quantity: qty });
  };

  return (
    <>
      <section className="container-page py-8 lg:py-12">
        <nav className="text-xs text-muted-foreground mb-8 flex items-center gap-1.5">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span className="opacity-50">/</span>
          <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <span className="opacity-50">/</span>
          <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
            <div className="hidden sm:flex flex-col gap-3">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "aspect-square overflow-hidden rounded-lg bg-secondary transition-all",
                    activeImage === i ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : "ring-1 ring-border hover:ring-foreground/40",
                  )}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
            <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-secondary relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={gallery[activeImage]}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Info */}
          <div className="relative z-base lg:sticky lg:top-28 lg:self-start">
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">{product.collection}</p>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-[40px] tracking-[-0.02em]">{product.name}</h1>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl font-semibold tabular-nums">${product.price.toFixed(2)}</span>
              {product.compareAt && (
                <span className="text-base text-muted-foreground line-through tabular-nums">${product.compareAt.toFixed(2)}</span>
              )}
              {product.compareAt && (
                <span className="rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[10.5px] uppercase tracking-[0.16em] font-semibold">
                  Save ${(product.compareAt - product.price).toFixed(2)}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Tax included. Shipping at checkout.</p>

            <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">{product.description}</p>

            {/* Color */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">Color: <span className="text-muted-foreground normal-case tracking-normal font-normal">{color}</span></p>
              </div>
              <div className="mt-3 flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    aria-label={c.name}
                    className={cn(
                      "h-10 w-10 rounded-full ring-offset-background transition-all hover:scale-105",
                      color === c.name ? "ring-2 ring-foreground ring-offset-2" : "ring-1 ring-border",
                    )}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">Size</p>
                <button className="text-xs underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors">Size Guide</button>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={cn(
                      "h-11 rounded-lg border text-sm font-medium transition-all hover:-translate-y-0.5",
                      size === s
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {!size && <p className="mt-2 text-xs text-muted-foreground">Please select a size</p>}
            </div>

            {/* Qty + Add */}
            <div className="mt-6 flex items-stretch gap-3">
              <div className="flex items-center rounded-full border border-border overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-12 w-12 place-items-center hover:bg-secondary transition-colors" aria-label="Decrease">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-medium tabular-nums">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="grid h-12 w-12 place-items-center hover:bg-secondary transition-colors" aria-label="Increase">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button onClick={handleAdd} size="lg" className="flex-1 rounded-full h-12 text-[12px] uppercase tracking-[0.18em]">
                Add to bag — ${(product.price * qty).toFixed(2)}
              </Button>
              <button
                onClick={() => toggle(product.id)}
                aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                className={cn(
                  "grid h-12 w-12 place-items-center rounded-full border transition-all",
                  liked ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground",
                )}
              >
                <Heart className={cn("h-4 w-4", liked && "fill-current")} />
              </button>
            </div>

            {/* Perks */}
            <ul className="mt-6 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
              <li className="flex flex-col items-center gap-2 rounded-xl border border-border p-3.5 text-center">
                <Truck className="h-4 w-4 text-foreground/70" /> Free shipping $35+
              </li>
              <li className="flex flex-col items-center gap-2 rounded-xl border border-border p-3.5 text-center">
                <RotateCcw className="h-4 w-4 text-foreground/70" /> 14-day returns
              </li>
              <li className="flex flex-col items-center gap-2 rounded-xl border border-border p-3.5 text-center">
                <Shield className="h-4 w-4 text-foreground/70" /> Quality guaranteed
              </li>
            </ul>

            {/* Accordions */}
            <div className="mt-8 divide-y divide-border border-y border-border">
              {[
                { id: "details", label: "Details & Materials", body: (
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {product.details.map((d) => <li key={d}>{d}</li>)}
                  </ul>
                )},
                { id: "shipping", label: "Shipping & Returns", body: (
                  <p className="text-sm text-muted-foreground">Free standard shipping across Cambodia on orders over $35. International shipping available at checkout. Returns accepted within 14 days of delivery in original condition.</p>
                )},
                { id: "care", label: "Care", body: (
                  <p className="text-sm text-muted-foreground">Machine wash cold with similar colors. Tumble dry low or hang to dry. Do not bleach. Iron on medium heat if needed.</p>
                )},
              ].map((s) => (
                <div key={s.id}>
                  <button
                    className="flex w-full items-center justify-between py-4 text-left text-[11px] font-semibold uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
                    onClick={() => setOpenSection(openSection === s.id ? null : s.id)}
                  >
                    {s.label}
                    <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", openSection === s.id && "rotate-180")} />
                  </button>
                  <AnimatePresence initial={false}>
                    {openSection === s.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pb-5">{s.body}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16 lg:py-24 border-t border-border mt-12">
        <MotionInView>
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Discover more</p>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl tracking-[-0.02em] mb-10">You may also like</h2>
        </MotionInView>
        <div className="grid gap-x-4 gap-y-12 grid-cols-2 lg:grid-cols-4">
          {related.map((p, i) => (
            <MotionInView key={p.id} delay={i * 0.06}>
              <ProductCard product={p} />
            </MotionInView>
          ))}
        </div>
      </section>

      <RecentlyViewed excludeId={product.id} />
    </>
  );
};

export default ProductDetail;