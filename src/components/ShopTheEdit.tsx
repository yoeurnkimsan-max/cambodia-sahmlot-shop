import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import editBestsellers from "@/assets/edit-bestsellers.jpg";
import editGraphicTees from "@/assets/edit-graphic-tees.jpg";
import editOuterwear from "@/assets/edit-outerwear.jpg";
import editResort from "@/assets/menu-resort.jpg";

const ease = [0.16, 1, 0.3, 1] as const;

const tiles = [
  { title: "Best Sellers", to: "/shop?sort=popular", img: editBestsellers, eyebrow: "Most loved" },
  { title: "Graphic Tees", to: "/shop?q=tee", img: editGraphicTees, eyebrow: "Print + form" },
  { title: "Outerwear", to: "/shop?cat=outerwear", img: editOuterwear, eyebrow: "Layer up" },
  { title: "Resort '25", to: "/shop?collection=resort-25", img: editResort, eyebrow: "Limited drop" },
];

const ShopTheEdit = () => (
  <section className="container-page py-20 lg:py-28 border-t border-border">
    <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Shop the edit</p>
        <h2 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-[44px] tracking-[-0.02em]">
          Curated for this week
        </h2>
      </div>
      <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5">
        Browse all <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      {tiles.map((t, i) => (
        <motion.div
          key={t.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: i * 0.06, ease }}
        >
          <Link
            to={t.to}
            className="group relative block overflow-hidden rounded-2xl bg-secondary aspect-[4/3] sm:aspect-[16/10]"
          >
            <img
              src={t.img}
              alt={t.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-background">
              <p className="text-[10px] uppercase tracking-[0.32em] opacity-80">{t.eyebrow}</p>
              <div className="mt-1.5 flex items-end justify-between gap-4">
                <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-[-0.01em] leading-none">
                  {t.title}
                </h3>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-background text-foreground transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  </section>
);

export default ShopTheEdit;