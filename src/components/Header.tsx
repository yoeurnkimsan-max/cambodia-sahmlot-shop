import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  Menu, Search, ShoppingBag, User, X, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import FocusTrap from "focus-trap-react";

// Types
interface DropdownItem {
  heading: string;
  items: string[];
}

interface DropdownData {
  title: string;
  columns: DropdownItem[];
}

// Dropdown data structure with heading property on all columns
const dropdownData: Record<string, DropdownData> = {
  newIn: {
    title: "New In",
    columns: [
      {
        heading: "New Arrivals",
        items: ["All", "New In Top", "New In Bottom", "New In Outerwear", "New In Shoes", "New In Accessories"]
      }
    ]
  },
  clothing: {
    title: "Clothing",
    columns: [
      {
        heading: "Clothing",
        items: ["All", "T-shirts", "Blazers & Jackets", "Hoodies & Sweatshirts", "Shorts"]
      },
      {
        heading: "Shop By Style",
        items: ["All", "Polo Shirts", "Vests & Cardigans", "Jeans & Trousers", "Underwear"]
      },
      {
        heading: "Best Sellers",
        items: ["Best Sellers", "Casual", "Office Wear"]
      }
    ]
  },
  accessories: {
    title: "Accessories",
    columns: [
      {
        heading: "Accessories",
        items: ["All", "Caps & Hats", "Socks", "Bags", "Glasses", "Merchandise"]
      }
    ]
  },
  shoes: {
    title: "Shoes",
    columns: [
      {
        heading: "Footwear",
        items: ["All", "Sandals", "Sneakers", "Loafers", "Boots"]
      }
    ]
  },
  collections: {
    title: "Collections",
    columns: [
      {
        heading: "Featured",
        items: ["All", "Urban Getaway", "Urban Executive", "Checkmate In Motion", "Invasion Of Identity", "Summer 2026", "Fiery Energy", "Back To Business", "Post Modern Academy"]
      }
    ]
  }
};

const simpleNav = [
  { to: "/shop?cat=men", label: "MEN" },
  { to: "/shop?cat=women", label: "WOMEN" },
];

// Placeholder image - replace with your actual default image
const DEFAULT_IMAGE = "https://zand.sgp1.cdn.digitaloceanspaces.com/catalog/products/2026-02/21226011580/PTAK9376.jpg";

// Reusable dropdown component
interface DropdownItemComponentProps {
  id: string;
  data: DropdownData;
  isClothing?: boolean;
  openDropdown: string | null;
  onDropdownEnter: (dropdown: string) => void;
  onDropdownLeave: () => void;
  renderDropdownContent: (data: DropdownData, isClothing: boolean) => React.ReactNode;
}

const DropdownItemComponent: React.FC<DropdownItemComponentProps> = ({
  id,
  data,
  isClothing = false,
  openDropdown,
  onDropdownEnter,
  onDropdownLeave,
  renderDropdownContent
}) => {
  const isOpen = openDropdown === id;

  return (
    <div
      className="relative"
      onMouseEnter={() => onDropdownEnter(id)}
      onMouseLeave={onDropdownLeave}
    >
      <button
        className={cn(
          "flex items-center gap-1 text-[13px] font-light tracking-[0.08em] transition-colors py-3 cursor-pointer",
          isOpen ? "text-black" : "text-gray-500 hover:text-black"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {data.title}
        <ChevronDown className={cn(
          "h-3 w-3 transition-all duration-300",
          isOpen && "rotate-180"
        )} />
      </button>

      <div
        className={cn(
          "fixed left-0 right-0 top-[6.5rem] transition-all duration-300 z-50",
          isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2 pointer-events-none"
        )}
        aria-hidden={!isOpen}
      >
        <div className="w-full bg-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.15)] border-t border-gray-100">
          <div className="container-page py-8">
            {renderDropdownContent(data, isClothing)}
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  const { count, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [itemsVisible, setItemsVisible] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileDropdownsOpen, setMobileDropdownsOpen] = useState<Record<string, boolean>>({});

  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isMounted = useRef(false);

  const navigate = useNavigate();
  const location = useLocation();

  const toggleMobileDropdown = useCallback((key: string) => {
    setMobileDropdownsOpen(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Animation timing for mobile menu items
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (mobileOpen) {
      timerRef.current = setTimeout(() => setItemsVisible(true), 120);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      setItemsVisible(false);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [mobileOpen]);

  // Close dropdowns and mobile menu on route change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const submitSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  }, [query, navigate]);

  const handleDropdownEnter = useCallback((dropdown: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setOpenDropdown(dropdown);
  }, []);

  const handleDropdownLeave = useCallback(() => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, dropdown: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpenDropdown(openDropdown === dropdown ? null : dropdown);
    }
  }, [openDropdown]);

  const isActive = useCallback((path: string) => {
    const searchParams = new URLSearchParams(location.search);
    if (path.includes("cat=men")) {
      return searchParams.get("cat") === "men";
    }
    if (path.includes("cat=women")) {
      return searchParams.get("cat") === "women";
    }
    return false;
  }, [location.search]);

  // Reusable dropdown content renderer
  const renderDropdownContent = useCallback((data: DropdownData, isClothing: boolean = false) => {
    if (isClothing) {
      return (
        <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto">
          {data.columns.map((col, idx) => (
            <div key={idx} className="space-y-4">
              {col.heading && col.heading !== "" && (
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <span className="w-0.5 h-3 bg-amber-400 rounded-full" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                    {col.heading}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {col.items.map((item) => (
                  <Link
                    key={item}
                    to={`/shop?category=${item.toLowerCase().replace(/ /g, "-")}`}
                    className="flex items-center gap-3 text-[13px] text-gray-600 hover:text-black transition-all duration-200 group/link"
                    onClick={() => setOpenDropdown(null)}
                  >
                    <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-100 flex-shrink-0 ring-1 ring-gray-200 group-hover/link:ring-amber-400 transition-all duration-300">
                      <img
                        src={DEFAULT_IMAGE}
                        alt={item}
                        className="w-full h-full object-cover object-top group-hover/link:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <span className="group-hover/link:translate-x-1 transition-transform duration-200">{item}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex justify-center">
        {data.columns.map((col, idx) => (
          <div key={idx} className="min-w-[280px]">
            {col.heading && col.heading !== "" && (
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                <span className="w-0.5 h-3 bg-amber-400 rounded-full" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                  {col.heading}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {col.items.map((item) => (
                <Link
                  key={item}
                  to={`/shop?category=${item.toLowerCase().replace(/ /g, "-")}`}
                  className="flex items-center gap-3 text-[13px] text-gray-600 hover:text-black transition-all duration-200 group/link"
                  onClick={() => setOpenDropdown(null)}
                >
                  <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-100 flex-shrink-0 ring-1 ring-gray-200 group-hover/link:ring-amber-400 transition-all duration-300">
                    <img
                      src={DEFAULT_IMAGE}
                      alt={item}
                      className="w-full h-full object-cover object-top group-hover/link:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <span className="group-hover/link:translate-x-1 transition-transform duration-200">{item}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }, []);

  // Memoized dropdown content to prevent unnecessary re-renders
  const memoizedRenderDropdownContent = useMemo(
    () => renderDropdownContent,
    [renderDropdownContent]
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white">
        <div className="container-page flex h-14 items-center justify-between lg:h-auto lg:flex-col lg:py-0">

          {/* Top row */}
          <div className="flex w-full items-center justify-between lg:h-[60px]">
            {/* MEN / WOMEN - Left side */}
            <div className="hidden lg:flex lg:items-center lg:gap-6">
              {simpleNav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "text-[12px] font-bold tracking-[0.15em] uppercase transition-all duration-200 py-1.5 cursor-pointer",
                    isActive(n.to)
                      ? "text-black border-b-2 border-black"
                      : "text-gray-500 hover:text-black hover:border-b-2 hover:border-gray-300"
                  )}
                >
                  {n.label}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              aria-label="Open menu"
              className="lg:hidden -ml-1 p-2 text-gray-600 hover:text-black transition-colors cursor-pointer"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo - Center */}
            <Link
              to="/"
              className="flex items-center font-serif text-lg font-semibold tracking-tight lg:text-xl cursor-pointer"
              aria-label="Home"
            >
              Sahml
              <span className="inline-block h-2 w-2 rounded-full border-2 border-amber-400 ml-0.5" />
              t
            </Link>

            {/* Right side icons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Search"
                className="h-8 w-8 text-gray-500 hover:text-black cursor-pointer"
                onClick={() => setSearchOpen(s => !s)}
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Account"
                className="hidden sm:inline-flex h-8 w-8 text-gray-500 hover:text-black cursor-pointer"
              >
                <User className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Cart"
                onClick={openCart}
                className="relative h-8 w-8 text-gray-500 hover:text-black cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                {count > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-amber-400 text-[9px] font-semibold text-black"
                    aria-label={`${count} items in cart`}
                  >
                    {count}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Bottom nav - Desktop dropdowns */}
          <nav
            className="hidden lg:flex w-full items-center justify-center gap-10 relative"
            aria-label="Main navigation"
          >
            <DropdownItemComponent
              id="newIn"
              data={dropdownData.newIn}
              openDropdown={openDropdown}
              onDropdownEnter={handleDropdownEnter}
              onDropdownLeave={handleDropdownLeave}
              renderDropdownContent={memoizedRenderDropdownContent}
            />

            <DropdownItemComponent
              id="clothing"
              data={dropdownData.clothing}
              isClothing={true}
              openDropdown={openDropdown}
              onDropdownEnter={handleDropdownEnter}
              onDropdownLeave={handleDropdownLeave}
              renderDropdownContent={memoizedRenderDropdownContent}
            />

            <DropdownItemComponent
              id="accessories"
              data={dropdownData.accessories}
              openDropdown={openDropdown}
              onDropdownEnter={handleDropdownEnter}
              onDropdownLeave={handleDropdownLeave}
              renderDropdownContent={memoizedRenderDropdownContent}
            />

            <DropdownItemComponent
              id="shoes"
              data={dropdownData.shoes}
              openDropdown={openDropdown}
              onDropdownEnter={handleDropdownEnter}
              onDropdownLeave={handleDropdownLeave}
              renderDropdownContent={memoizedRenderDropdownContent}
            />

            <DropdownItemComponent
              id="collections"
              data={dropdownData.collections}
              openDropdown={openDropdown}
              onDropdownEnter={handleDropdownEnter}
              onDropdownLeave={handleDropdownLeave}
              renderDropdownContent={memoizedRenderDropdownContent}
            />
          </nav>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div
            className="border-t border-gray-100 bg-white animate-in slide-in-from-top-1 duration-200"
            role="search"
          >
            <form onSubmit={submitSearch} className="container-page flex items-center gap-3 py-3">
              <Search className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-transparent text-sm font-light outline-none placeholder:text-gray-400"
                aria-label="Search products"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-gray-400 hover:text-black transition-colors cursor-pointer"
                aria-label="Close search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile menu backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-500 lg:hidden",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      {/* Mobile menu drawer with focus trap */}
      <FocusTrap active={mobileOpen}>
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 h-full w-[85%] max-w-[320px] bg-white flex flex-col lg:hidden",
            "transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
            "shadow-2xl",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          aria-label="Mobile navigation menu"
          aria-hidden={!mobileOpen}
          aria-modal={mobileOpen}
          role={mobileOpen ? "dialog" : undefined}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="font-serif text-base font-semibold tracking-tight flex items-center cursor-pointer"
              aria-label="Home"
            >
              Sahml
              <span className="inline-block h-2 w-2 rounded-full border-2 border-amber-400 ml-0.5" />
              t
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="p-1.5 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav
            className="flex-1 overflow-y-auto px-5 pt-5 pb-4"
            aria-label="Mobile navigation"
          >
            <div className="flex gap-6 mb-6 pb-3 border-b border-gray-100">
              <Link
                to="/shop?cat=men"
                onClick={() => setMobileOpen(false)}
                className="text-[15px] font-bold uppercase tracking-wide text-gray-600 hover:text-black cursor-pointer"
              >
                MEN
              </Link>
              <Link
                to="/shop?cat=women"
                onClick={() => setMobileOpen(false)}
                className="text-[15px] font-bold uppercase tracking-wide text-gray-600 hover:text-black cursor-pointer"
              >
                WOMEN
              </Link>
            </div>

            {Object.entries(dropdownData).map(([key, data], idx) => {
              const isOpen = mobileDropdownsOpen[key] || false;
              return (
                <div
                  key={key}
                  className="border-b border-gray-100 py-2"
                  style={{
                    opacity: itemsVisible ? 1 : 0,
                    transform: itemsVisible ? "translateX(0)" : "translateX(-10px)",
                    transition: `opacity 0.3s ease ${idx * 60}ms, transform 0.3s ease ${idx * 60}ms`,
                  }}
                >
                  <button
                    onClick={() => toggleMobileDropdown(key)}
                    className="flex items-center justify-between w-full py-3 text-[14px] font-light text-gray-700 cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    {data.title}
                    {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                  {isOpen && (
                    <div className="ml-3 pb-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {data.columns.map((col, colIdx) => (
                        <div key={colIdx}>
                          {col.heading && col.heading !== "" && (
                            <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-gray-400 mt-2 mb-1">
                              {col.heading}
                            </p>
                          )}
                          {col.items.map((item) => (
                            <Link
                              key={item}
                              to={`/shop?category=${item.toLowerCase().replace(/ /g, "-")}`}
                              onClick={() => setMobileOpen(false)}
                              className="block py-2 text-[13px] text-gray-500 hover:text-black transition-colors pl-2 cursor-pointer"
                            >
                              {item}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="px-5 py-4 border-t border-gray-100 space-y-3">
            <p className="text-[9px] text-gray-300 font-light tracking-wide text-center">
              Made in Cambodia · Natural fibers
            </p>
          </div>
        </aside>
      </FocusTrap>
    </>
  );
};

export default Header;
