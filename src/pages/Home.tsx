import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, Package, RotateCcw, Shield, Sparkles, Star } from "lucide-react";
import categoryWomen from "@/assets/category-women.jpg";
import categoryMen from "@/assets/category-men.jpg";
import categoryEssentials from "@/assets/category-essentials.jpg";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import HeroSection from "@/components/HeroSection";
import QuickViewModal from "@/components/QuickViewModal";
import RecentlyViewed from "@/components/RecentlyViewed";
import MotionInView from "@/components/MotionInView";
import { Button } from "@/components/ui/button";
import { Product } from "@/data/products";

const ease = [0.16, 1, 0.3, 1] as const;

const SectionHeader = ({
  eyebrow,
  title,
  href,
  cta = "View all",
}: { eyebrow: string; title: string; href?: string; cta?: string }) => (
  <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
    <MotionInView>
      <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-[44px] tracking-[-0.02em]">{title}</h2>
    </MotionInView>
    {href && (
      <MotionInView delay={0.1}>
        <Link
          to={href}
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </MotionInView>
    )}
  </div>
);

const Home = () => {
  const products = useProducts();
  const [quickView, setQuickView] = useState<Product | null>(null);
  const featured = products.slice(0, 4);
  const newIn = products.filter((p) => p.categories.includes("new")).slice(0, 8);

  return (
    <>
      <HeroSection />

      {/* Trust strip */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container-page grid grid-cols-2 md:grid-cols-4 gap-y-6 py-8 text-center">
          {[
            { Icon: Package, label: "Free shipping $35+" },
            { Icon: RotateCcw, label: "14-day easy returns" },
            { Icon: Shield, label: "Quality guaranteed" },
            { Icon: Leaf, label: "Natural fibers" },
          ].map(({ Icon, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05, ease }}
              className="flex items-center justify-center gap-2.5 text-xs uppercase tracking-[0.18em] text-muted-foreground"
            >
              <Icon className="h-3.5 w-3.5 text-foreground/70" />
              {label}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-page py-20 lg:py-28">
        <SectionHeader eyebrow="Shop by category" title="Find your fit" href="/shop" cta="All categories" />
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {[
            { img: categoryMen, label: "Men", href: "/shop?cat=men", count: "32 styles" },
            { img: categoryWomen, label: "Women", href: "/shop?cat=women", count: "28 styles" },
            { img: categoryEssentials, label: "Essentials", href: "/shop?cat=essentials", count: "18 styles" },
          ].map((c, i) => (
            <MotionInView key={c.label} delay={i * 0.08}>
              <Link
                to={c.href}
                className="group relative block overflow-hidden rounded-2xl bg-secondary aspect-[3/4]"
              >
                <img
                  src={c.img}
                  alt={c.label}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-background flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] opacity-75">{c.count}</p>
                    <h3 className="mt-1 font-serif text-3xl tracking-tight">{c.label}</h3>
                  </div>
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-background text-foreground transition-transform duration-300 group-hover:rotate-[-45deg]">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </MotionInView>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="container-page py-20 lg:py-28 border-t border-border">
        <SectionHeader eyebrow="Bestsellers" title="Loved by everyone" href="/shop" />
        <div className="grid gap-x-4 gap-y-12 grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <MotionInView key={p.id} delay={i * 0.06}>
              <ProductCard product={p} onQuickView={setQuickView} />
            </MotionInView>
          ))}
        </div>
      </section>

      {/* EDITORIAL */}
      <section className="bg-secondary/50 py-20 lg:py-28 border-y border-border">
        <div className="container-page grid gap-12 lg:gap-16 lg:grid-cols-2 lg:items-center">
          <MotionInView className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <img src={categoryEssentials} alt="Stack of folded shirts" loading="lazy" className="h-full w-full object-cover" />
          </MotionInView>
          <MotionInView delay={0.1}>
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground inline-flex items-center gap-2">
              <Sparkles className="h-3 w-3" /> The Sahmlot way
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl tracking-[-0.02em] text-balance">
              Made nearby. <span className="text-muted-foreground">Made well. Made to last.</span>
            </h2>
            <p className="mt-5 max-w-lg text-muted-foreground leading-relaxed">
              Every Sahmlot piece is cut and sewn in our Phnom Penh atelier. We work with mill partners across the region
              to source natural fibers — Belgian linen, Cambodian-grown cotton, organic dyes — then build small,
              considered collections that wear in beautifully.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
              {[
                { Icon: Shield, label: "Quality guarantee" },
                { Icon: Leaf, label: "Natural fibers" },
                { Icon: Package, label: "Local production" },
                { Icon: RotateCcw, label: "Easy returns" },
              ].map(({ Icon, label }) => (
                <li key={label} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-4 w-4 text-foreground/70" />
                  {label}
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-8 rounded-full px-7 h-12 text-[12px] tracking-[0.18em] uppercase">
              <Link to="/about">Read our story <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
            </Button>
          </MotionInView>
        </div>
      </section>

      {/* NEW IN */}
      <section className="container-page py-20 lg:py-28">
        <SectionHeader eyebrow="Just dropped" title="New arrivals" href="/shop?cat=new" cta="See all new" />
        <div className="grid gap-x-4 gap-y-12 grid-cols-2 lg:grid-cols-4">
          {newIn.slice(0, 4).map((p, i) => (
            <MotionInView key={p.id} delay={i * 0.06}>
              <ProductCard product={p} onQuickView={setQuickView} />
            </MotionInView>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="border-t border-border py-20 lg:py-28 bg-secondary/30">
        <div className="container-page max-w-3xl text-center">
          <MotionInView>
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Loved by 12,000+ customers</p>
            <div className="mt-4 flex justify-center gap-0.5 text-foreground">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-foreground" />
              ))}
            </div>
            <blockquote className="mt-6 font-serif text-2xl sm:text-3xl lg:text-4xl leading-snug tracking-[-0.01em] text-balance">
              "The fit, the fabric, the finish — Sahmlot has become my entire weekend wardrobe."
            </blockquote>
            <p className="mt-6 text-sm text-muted-foreground">— Sokha P., Phnom Penh</p>
          </MotionInView>
        </div>
      </section>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
      <RecentlyViewed />
    </>
  );
};

export default Home;