import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { megaMenus } from "@/data/menu";
import { cn } from "@/lib/utils";

const Header = () => {
  const { count, openCart } = useCart();
  const { count: wishCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close all panels on route change
  useEffect(() => {
    setActiveMenu(null);
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  // Body scroll lock for drawers
  useEffect(() => {
    const lock = mobileOpen || activeMenu !== null;
    document.body.style.overflow = lock ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen, activeMenu]);

  // Esc closes everything
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMenu(null);
        setMobileOpen(false);
        setSearchOpen(false);
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
  };
  const leaveMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActiveMenu(null), 120);
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
      <span className="mx-[1px] inline-block h-1.5 w-1.5 rounded-full bg-accent" />
      t
    </Link>
  );

  return (
    <>
      <header className="sticky top-0 z-header w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        {/* Top bar */}
        <div className="container-page flex h-14 items-center justify-between gap-4 lg:h-16">
          {/* Mobile menu */}
          <button
            type="button"
            aria-label="Open menu"
            className="lg:hidden p-2 -ml-2 text-foreground/70 hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo (mobile = center, desktop = left) */}
          <div className="flex-1 flex justify-center lg:flex-none lg:justify-start">
            <Logo />
          </div>

          {/* Desktop nav */}
          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label="Primary"
            onMouseLeave={leaveMenu}
          >
            {megaMenus.map((m) => {
              const isActive = activeMenu === m.id;
              return (
                <div
                  key={m.id}
                  className="relative"
                  onMouseEnter={() => enterMenu(m.id)}
                >
                  <Link
                    to={m.to}
                    className={cn(
                      "group inline-flex items-center gap-1 px-3 py-2 text-[12px] font-medium uppercase tracking-[0.18em] transition-colors",
                      m.accent ? "text-accent" : isActive ? "text-foreground" : "text-foreground/65 hover:text-foreground",
                    )}
                    onClick={() => setActiveMenu(null)}
                  >
                    <span className="relative">
                      {m.label}
                      <span
                        className={cn(
                          "absolute -bottom-1 left-0 right-0 h-px origin-center scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100",
                          isActive && "scale-x-100",
                        )}
                      />
                    </span>
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" aria-label="Search" className="h-9 w-9 text-foreground/70 hover:text-foreground" onClick={() => setSearchOpen((s) => !s)}>
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Account" className="hidden sm:inline-flex h-9 w-9 text-foreground/70 hover:text-foreground">
              <User className="h-4 w-4" />
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Wishlist" className="relative h-9 w-9 text-foreground/70 hover:text-foreground">
              <Link to="/wishlist">
                <Heart className="h-4 w-4" />
                {wishCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                    {wishCount}
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" aria-label="Cart" onClick={openCart} className="relative h-9 w-9 text-foreground/70 hover:text-foreground">
              <ShoppingBag className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                  {count}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Mega-menu panel (desktop) */}
        <div
          className={cn(
            "absolute left-0 right-0 top-full hidden lg:block border-b border-border bg-background shadow-soft transition-all duration-200 origin-top",
            activeMenu ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1 pointer-events-none",
          )}
          onMouseEnter={() => activeMenu && enterMenu(activeMenu)}
          onMouseLeave={leaveMenu}
        >
          {megaMenus.map((m) => {
            if (m.id !== activeMenu) return null;
            return (
              <div key={m.id} className="container-page py-10">
                <div className={cn("grid gap-10", m.feature ? "grid-cols-[1fr_320px]" : "grid-cols-1")}>
                  <div className={cn("grid gap-10", `grid-cols-${Math.min(m.columns.length, 4)}`)}>
                    {m.columns.map((col) => (
                      <div key={col.heading}>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-4 pb-2 border-b border-border">
                          {col.heading}
                        </p>
                        <ul className="space-y-2.5">
                          {col.links.map((l) => (
                            <li key={l.label}>
                              <Link
                                to={l.to}
                                className="group inline-flex items-center text-[13px] text-foreground/75 hover:text-foreground transition-colors"
                                onClick={() => setActiveMenu(null)}
                              >
                                <span className="transition-transform duration-200 group-hover:translate-x-1">{l.label}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {m.feature && (
                    <Link
                      to={m.feature.to}
                      className="group relative block overflow-hidden rounded-sm bg-secondary aspect-[4/5]"
                      onClick={() => setActiveMenu(null)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/15 to-foreground/30" />
                      <div className="absolute inset-0 p-5 flex flex-col justify-end text-background">
                        <p className="text-[10px] uppercase tracking-[0.25em] opacity-80">Featured</p>
                        <h4 className="mt-1 font-serif text-2xl">{m.feature.title}</h4>
                        <p className="mt-1 text-xs opacity-90">{m.feature.copy}</p>
                        <p className="mt-3 text-[11px] uppercase tracking-widest underline-offset-4 group-hover:underline">
                          {m.feature.cta} →
                        </p>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-border bg-background animate-fade-up">
            <form onSubmit={submitSearch} className="container-page flex items-center gap-3 py-3">
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
          </div>
        )}
      </header>

      {/* Mobile drawer */}
      <div
        onClick={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-0 z-overlay bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-drawer h-full w-[85%] max-w-[340px] bg-background flex flex-col lg:hidden shadow-card",
          "transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <Logo onClick={() => setMobileOpen(false)} />
          <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-5 py-4">
          {megaMenus.map((m) => {
            const open = mobileExpanded === m.id;
            return (
              <div key={m.id} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => setMobileExpanded(open ? null : m.id)}
                  className={cn(
                    "flex items-center justify-between w-full py-4 text-sm font-medium uppercase tracking-[0.15em]",
                    m.accent ? "text-accent" : "text-foreground",
                  )}
                  aria-expanded={open}
                >
                  {m.label}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
                </button>
                {open && (
                  <div className="pb-4 pl-2 space-y-3 animate-fade-up">
                    {m.columns.map((col) => (
                      <div key={col.heading}>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">{col.heading}</p>
                        <ul className="space-y-2">
                          {col.links.map((l) => (
                            <li key={l.label}>
                              <Link to={l.to} onClick={() => setMobileOpen(false)} className="block py-1 text-sm text-foreground/75 hover:text-foreground">
                                {l.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-border space-y-2">
          <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm text-foreground/75 hover:text-foreground">
            <Heart className="h-4 w-4" /> Wishlist {wishCount > 0 && `(${wishCount})`}
          </Link>
          <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm text-foreground/75 hover:text-foreground">
            <User className="h-4 w-4" /> Admin
          </Link>
          <p className="pt-2 text-[10px] text-muted-foreground tracking-wide">Made in Cambodia · Natural fibers</p>
        </div>
      </aside>
    </>
  );
};

export default Header;
