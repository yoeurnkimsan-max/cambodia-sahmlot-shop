import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, X, ArrowRight, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";

const FREE_SHIP = 35;

const CartDrawer = () => {
  const { isOpen, closeCart, openCart, itemsDetailed, updateQuantity, removeItem, subtotal, count } = useCart();

  const remaining = Math.max(0, FREE_SHIP - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIP) * 100);

  return (
    <Sheet open={isOpen} onOpenChange={(o) => (o ? openCart() : closeCart())}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-serif text-xl tracking-tight">
            Your Bag <span className="text-muted-foreground tabular-nums">({count})</span>
          </h2>
          <button onClick={closeCart} aria-label="Close cart" className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Free-ship progress */}
        {itemsDetailed.length > 0 && (
          <div className="border-b border-border px-5 py-3 bg-secondary/40">
            <div className="flex items-center gap-2 text-xs">
              <Truck className="h-3.5 w-3.5 text-foreground/70" />
              {remaining > 0 ? (
                <p className="text-muted-foreground">
                  Add <span className="font-semibold text-foreground tabular-nums">${remaining.toFixed(2)}</span> for free shipping
                </p>
              ) : (
                <p className="text-foreground font-medium">You unlocked free shipping ✓</p>
              )}
            </div>
            <Progress value={progress} className="mt-2 h-1" />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {itemsDetailed.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex h-full flex-col items-center justify-center text-center"
            >
              <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary text-muted-foreground">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <p className="mt-5 font-serif text-xl">Your bag is empty</p>
              <p className="mt-1.5 text-sm text-muted-foreground">Discover our latest essentials.</p>
              <Button asChild className="mt-6 rounded-full px-6 h-11" onClick={closeCart}>
                <Link to="/shop">Shop Now <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
              </Button>
            </motion.div>
          ) : (
            <ul className="space-y-5">
              <AnimatePresence initial={false}>
                {itemsDetailed.map((item) => (
                  <motion.li
                    key={`${item.productId}-${item.size}-${item.color}`}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0, marginBottom: -20 }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    className="flex gap-4"
                  >
                    <Link
                      to={`/product/${item.product.slug}`}
                      onClick={closeCart}
                      className="block w-20 shrink-0 overflow-hidden rounded-lg bg-secondary"
                    >
                      <img src={item.product.image} alt={item.product.name} className="h-24 w-20 object-cover" loading="lazy" />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-sm">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.color} · Size {item.size}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.size, item.color)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Remove"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center rounded-full border border-border overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                            className="grid h-8 w-8 place-items-center hover:bg-secondary transition-colors"
                            aria-label="Decrease"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                            className="grid h-8 w-8 place-items-center hover:bg-secondary transition-colors"
                            aria-label="Increase"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="font-semibold tabular-nums">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {/* Footer */}
        {itemsDetailed.length > 0 && (
          <div className="border-t border-border p-5 space-y-4 bg-background">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold tabular-nums">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
            <Button asChild className="w-full rounded-full h-12 text-[12px] tracking-[0.16em] uppercase" size="lg" onClick={closeCart}>
              <Link to="/checkout">Checkout — ${subtotal.toFixed(2)}</Link>
            </Button>
            <button onClick={closeCart} className="w-full text-center text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors">
              Continue Shopping
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;