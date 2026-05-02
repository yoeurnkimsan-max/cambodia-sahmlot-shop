import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Instagram, Facebook, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const cols: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "New Arrivals", to: "/shop?cat=new" },
      { label: "Men", to: "/shop?cat=men" },
      { label: "Women", to: "/shop?cat=women" },
      { label: "Essentials", to: "/shop?cat=essentials" },
      { label: "All Products", to: "/shop" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Shipping & Delivery", to: "#" },
      { label: "Returns & Exchanges", to: "#" },
      { label: "Size Guide", to: "#" },
      { label: "Care Guide", to: "#" },
      { label: "Contact Us", to: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Journal", to: "#" },
      { label: "Stockists", to: "#" },
      { label: "Admin", to: "/admin" },
    ],
  },
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setDone(true);
    setTimeout(() => { setDone(false); setEmail(""); }, 2400);
  };

  return (
    <footer className="mt-24 border-t border-border bg-background">
      {/* Newsletter band */}
      <div className="border-b border-border">
        <div className="container-page grid gap-10 py-14 lg:py-20 md:grid-cols-[1.2fr_1fr] items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Newsletter</p>
            <h3 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight text-balance">
              First looks. First drops.<br />
              <span className="text-muted-foreground">Straight to your inbox.</span>
            </h3>
          </div>
          <form onSubmit={submit} className="w-full">
            <div className="relative flex items-stretch border border-border rounded-full overflow-hidden focus-within:border-foreground transition-colors">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="your@email.com"
                className="flex-1 bg-transparent px-5 py-3.5 text-sm outline-none placeholder:text-muted-foreground"
                aria-label="Email address"
              />
              <button
                type="submit"
                className={cn(
                  "inline-flex items-center gap-2 px-5 sm:px-6 m-1 rounded-full text-xs uppercase tracking-[0.18em] font-medium transition-all",
                  done ? "bg-foreground text-background" : "bg-foreground text-background hover:opacity-90",
                )}
              >
                {done ? (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="inline-flex items-center gap-2"
                  >
                    <Check className="h-3.5 w-3.5" /> Subscribed
                  </motion.span>
                ) : (
                  <>Subscribe <ArrowRight className="h-3.5 w-3.5" /></>
                )}
              </button>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              By subscribing you agree to our privacy policy. Unsubscribe anytime.
            </p>
          </form>
        </div>
      </div>

      {/* Link columns */}
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-sm">
          <Link to="/" className="font-serif text-2xl font-semibold tracking-tight inline-flex items-center">
            Sahml
            <span className="mx-[2px] inline-block h-1.5 w-1.5 rounded-full bg-foreground" />
            t
          </Link>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Modern Cambodian fashion. Premium shirts and essentials, designed in Phnom Penh and made to last.
          </p>
          <div className="mt-6 flex items-center gap-2">
            {[
              { Icon: Instagram, label: "Instagram" },
              { Icon: Facebook, label: "Facebook" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-[11px] uppercase tracking-[0.28em] font-semibold mb-5">{c.title}</h4>
            <ul className="space-y-2.5 text-sm">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-muted-foreground hover:text-foreground story-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container-page flex flex-col md:flex-row items-start md:items-center justify-between gap-3 py-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Sahmlot Apparel Co. — Made in Phnom Penh.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;