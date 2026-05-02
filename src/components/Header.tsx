import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { megaMenus } from "@/data/menu";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const Header = () => {
  const { count, openCart } = useCart();
  const { count: wishCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Active route detection
  const routeActiveId = (() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("cat");
    const collection = params.get("collection");
    const q = params.get("q");
    if (location.pathname !== "/shop") return null;
    if (q === "sale") return "sale";
    if (cat === "new") return "new";
    if (cat === "men") return "men";
    if (cat === "women") return "women";
    if (collection) return "collections";
    return "clothing";
  })();

  // Sticky shrink on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on route change
  useEffect(() => {
    setActiveMenu(null);
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  // Body scroll lock for mega-menu
  useEffect(() => {
    document.body.style.overflow = activeMenu ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeMenu]);

  // Esc closes everything
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMenu(null);
        setMobileOpen(false);
        setSearchOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const enterMenu = (id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(id);
    setHoverId(id);
  };
  const leaveMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setActiveMenu(null);
      setHoverId(null);
    }, 140);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setQuery("");
  };

  const Logo = ({ onClick }: { onClick?: () => void }) => (
    <Link
      to="/"
      onClick={onClick}
      className="font-serif text-xl font-semibold tracking-tight inline-flex items-center"
      aria-label="Sahmlot home"
    >
      Sahml
      <span className="mx-[2px] inline-block h-1.5 w-1.5 rounded-full bg-foreground" />
      t
    </Link>
  );

  const indicatorTarget = hoverId ?? routeActiveId;
  const activeMega = megaMenus.find((m) => m.id === activeMenu);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-header w-full border-b transition-all duration-300",
          scrolled
            ? "border-border glass shadow-soft"
            : "border-transparent bg-background",
        )}
      >
        <div
          className={cn(
            "container-page flex items-center justify-between gap-4 transition-[height] duration-300",
            scrolled ? "h-14" : "h-16 lg:h-[68px]",
          )}
        >
          {/* Left: mobile menu + logo */}
          <div className="flex items-center gap-3 lg:gap-6">
            <button
              type="button"
              aria-label="Open menu"
              className="lg:hidden -ml-1.5 p-2 text-foreground/70 hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo />
          </div>

          {/* Center desktop nav */}
          <nav
            className="hidden lg:flex items-center"
            aria-label="Primary"
            onMouseLeave={leaveMenu}
          >
            {megaMenus.map((m) => {
              const isActive = indicatorTarget === m.id;
              return (
                <div
                  key={m.id}
                  className="relative"
                  onMouseEnter={() => enterMenu(m.id)}
                  onFocus={() => enterMenu(m.id)}
                >
                  <Link
                    to={m.to}
                    onClick={() => setActiveMenu(null)}
                    aria-current={routeActiveId === m.id ? "page" : undefined}
                    className={cn(
                      "relative inline-flex items-center gap-1 px-3 py-2 text-[12.5px] font-medium uppercase tracking-[0.16em] transition-colors duration-200",
                      m.accent
                        ? "text-foreground"
                        : isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {/* Sliding pill background */}
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        aria-hidden
                        className="absolute inset-0 -z-0 rounded-full bg-secondary"
                        transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.6 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1">
                      {m.label}
                      {m.columns.length > 0 && (
                        <ChevronDown
                          className={cn(
                            "h-3 w-3 transition-transform duration-300",
                            activeMenu === m.id ? "rotate-180" : "",
                          )}
                          aria-hidden="true"
                        />
                      )}
                      {m.accent && (
                        <span className="ml-1 inline-block h-1 w-1 rounded-full bg-destructive animate-pulse" />
                      )}
                    </span>
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setSearchOpen((s) => !s)}
              aria-label="Search"
              className="hidden sm:inline-flex items-center gap-2 h-9 px-3 mr-1 text-xs text-muted-foreground border border-border rounded-full hover:text-foreground hover:border-foreground/40 transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="tracking-wide">Search</span>
              <kbd className="ml-2 hidden md:inline-flex items-center gap-0.5 rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                ⌘K
              </kbd>
            </button>
            <Button
              variant="ghost" size="icon" aria-label="Search"
              className="sm:hidden h-9 w-9 text-foreground/70 hover:text-foreground"
              onClick={() => setSearchOpen((s) => !s)}
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Account" className="hidden sm:inline-flex h-9 w-9 text-foreground/70 hover:text-foreground">
              <User className="h-4 w-4" />
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Wishlist" className="relative h-9 w-9 text-foreground/70 hover:text-foreground">
              <Link to="/wishlist">
                <Heart className="h-4 w-4" />
                <AnimatePresence>
                  {wishCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 18 }}
                      className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-foreground text-[10px] font-semibold text-background"
                    >
                      {wishCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </Button>
            <Button
              variant="ghost" size="icon" aria-label="Cart" onClick={openCart}
              className="relative h-9 w-9 text-foreground/70 hover:text-foreground"
            >
              <ShoppingBag className="h-4 w-4" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-foreground text-[10px] font-semibold text-background"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* Mega-menu panel */}
        <AnimatePresence>
          {activeMega && (
            <motion.div
              key={activeMega.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease }}
              className="absolute left-0 right-0 top-full hidden lg:block border-b border-border bg-background shadow-pop"
              onMouseEnter={() => enterMenu(activeMega.id)}
              onMouseLeave={leaveMenu}
            >
              <div className="container-page py-10">
                <div className={cn("grid gap-12", activeMega.feature ? "lg:grid-cols-[1fr_360px]" : "grid-cols-1")}>
                  <div
                    className="grid gap-x-10 gap-y-8"
                    style={{ gridTemplateColumns: `repeat(${Math.min(activeMega.columns.length, 4)}, minmax(0, 1fr))` }}
                  >
                    {activeMega.columns.map((col, idx) => (
                      <motion.div
                        key={col.heading}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.06 + idx * 0.05, duration: 0.32, ease }}
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground mb-4">
                          {col.heading}
                        </p>
                        <ul className="space-y-0.5">
                          {col.links.map((l) => (
                            <li key={l.label}>
                              <Link
                                to={l.to}
                                className="group inline-flex items-center gap-2 py-1.5 text-[13.5px] text-foreground/80 hover:text-foreground transition-colors"
                                onClick={() => setActiveMenu(null)}
                              >
                                <span className="story-link">{l.label}</span>
                                {l.tag && (
                                  <span
                                    className={cn(
                                      "rounded-full px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-[0.14em]",
                                      l.tag === "new"
                                        ? "bg-foreground text-background"
                                        : "bg-destructive/10 text-destructive",
                                    )}
                                  >
                                    {l.tag}
                                  </span>
                                )}
                                <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-60 group-hover:translate-x-0" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>

                  {activeMega.feature && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.16, duration: 0.4, ease }}
                    >
                      <Link
                        to={activeMega.feature.to}
                        onClick={() => setActiveMenu(null)}
                        className="group relative block overflow-hidden rounded-xl bg-secondary aspect-[5/6]"
                      >
                        <img
                          src={activeMega.feature.image}
                          alt={activeMega.feature.title}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/15 to-transparent" />
                        <div className="absolute inset-0 p-6 flex flex-col justify-end text-background">
                          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-background/15 backdrop-blur px-2.5 py-1 text-[10px] uppercase tracking-[0.22em]">
                            <span className="h-1 w-1 rounded-full bg-background" />
                            Featured
                          </span>
                          <h4 className="mt-3 font-serif text-2xl leading-tight">{activeMega.feature.title}</h4>
                          <p className="mt-1.5 text-xs opacity-90 leading-relaxed">{activeMega.feature.copy}</p>
                          <p className="mt-4 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] font-medium">
                            {activeMega.feature.cta}
                            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease }}
              className="overflow-hidden border-t border-border bg-background"
            >
              <form onSubmit={submitSearch} className="container-page flex items-center gap-3 py-3.5">
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search shirts, polos, linen…"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  aria-label="Search products"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close search">
                  <X className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile drawer (shadcn Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[88%] max-w-[380px] p-0 flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <Logo onClick={() => setMobileOpen(false)} />
          </div>
          <nav className="flex-1 overflow-y-auto px-2 py-2">
            <Accordion type="single" collapsible className="w-full">
              {megaMenus.map((m) => {
                const isRouteActive = routeActiveId === m.id;
                return (
                  <AccordionItem key={m.id} value={m.id} className="border-border">
                    <AccordionTrigger className="px-3 py-4 text-sm font-medium uppercase tracking-[0.16em] hover:no-underline">
                      <span className="flex items-center gap-2.5">
                        <span className={cn("h-1.5 w-1.5 rounded-full transition-all", isRouteActive ? "bg-foreground scale-100" : "bg-foreground/30 scale-75")} />
                        {m.label}
                        {m.accent && <span className="ml-1 inline-block h-1 w-1 rounded-full bg-destructive animate-pulse" />}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pl-4 pr-2 pb-4">
                      <div className="space-y-4">
                        {m.columns.map((col) => (
                          <div key={col.heading}>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground mb-2">{col.heading}</p>
                            <ul className="space-y-0.5 border-l border-border pl-3">
                              {col.links.map((l) => (
                                <li key={l.label}>
                                  <Link
                                    to={l.to}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-2 py-1.5 text-sm text-foreground/80 hover:text-foreground"
                                  >
                                    {l.label}
                                    {l.tag && (
                                      <span className={cn("rounded-full px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-wider", l.tag === "new" ? "bg-foreground text-background" : "bg-destructive/10 text-destructive")}>
                                        {l.tag}
                                      </span>
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </nav>
          <div className="border-t border-border p-4 flex flex-col gap-2 text-xs text-muted-foreground">
            <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-1.5 hover:text-foreground"><Heart className="h-4 w-4" /> Wishlist</Link>
            <button className="flex items-center gap-2 py-1.5 hover:text-foreground text-left"><User className="h-4 w-4" /> Account</button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Header;