import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/shop", label: "Shop All" },
  { to: "/shop?cat=new", label: "New In" },
  { to: "/shop?cat=men", label: "Men" },
  { to: "/shop?cat=women", label: "Women" },
  { to: "/shop?cat=essentials", label: "Essentials" },
  { to: "/about", label: "Our Story" },
];

const Header = () => {
  const { count, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-20">
        <button
          aria-label="Open menu"
          className="lg:hidden -ml-2 p-2"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" className="flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight">
          <span className="inline-block h-2 w-2 rounded-full bg-accent" />
          Sahmlot
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/shop"}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium tracking-wide transition-colors hover:text-accent",
                  isActive ? "text-foreground" : "text-foreground/75",
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen((s) => !s)}>
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Account" className="hidden sm:inline-flex">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Cart" onClick={openCart} className="relative">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                {count}
              </span>
            )}
          </Button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border bg-background animate-fade-up">
          <form onSubmit={submitSearch} className="container-page flex items-center gap-3 py-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shirts, polos, linen…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-opacity",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      >
        <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
        <aside
          className={cn(
            "absolute left-0 top-0 h-full w-[82%] max-w-sm bg-background shadow-card transition-transform",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-border p-5">
            <span className="font-serif text-xl">Sahmlot</span>
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col p-4">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setMobileOpen(false)}
                className="py-3 px-2 text-base font-medium border-b border-border/60 hover:text-accent"
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="p-5 mt-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Customer Care</p>
            <p className="text-sm text-muted-foreground">+855 23 555 0188</p>
            <p className="text-sm text-muted-foreground">hello@sahmlot.com.kh</p>
          </div>
        </aside>
      </div>
    </header>
  );
};

export default Header;