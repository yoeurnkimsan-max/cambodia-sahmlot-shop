import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Instagram } from "lucide-react";
import look1 from "@/assets/look-1.jpg";
import look2 from "@/assets/look-2.jpg";
import look3 from "@/assets/look-3.jpg";
import look4 from "@/assets/look-4.jpg";

const ease = [0.16, 1, 0.3, 1] as const;

const looks = [
  { img: look1, handle: "@sen_bunroth", piece: "Coconut Day Tee", to: "/shop?q=tee" },
  { img: look2, handle: "@porxchhay", piece: "Striped Cafe Polo", to: "/shop?q=polo" },
  { img: look3, handle: "@mengo_71", piece: "Golden Waves L/S", to: "/shop?q=knit" },
  { img: look4, handle: "@chenda.k", piece: "Atelier Linen Shirt", to: "/shop?q=linen" },
];

const LookbookSection = () => (
  <section className="border-t border-border py-20 lg:py-28">
    <div className="container-page text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease }}
      >
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          <Instagram className="h-3 w-3" /> #SAHMLOTLOOKS
        </p>
        <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-[44px] tracking-[-0.02em]">
          Real people. Real fashion.
        </h2>
        <p className="mt-2.5 text-[13px] sm:text-sm text-muted-foreground">
          Tap any look to shop it. Tag <span className="text-foreground">@sahmlot</span> to be featured.
        </p>
      </motion.div>
    </div>

    <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 px-2 sm:px-4">
      {looks.map((l, i) => (
        <motion.div
          key={l.handle}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: i * 0.06, ease }}
        >
          <Link
            to={l.to}
            className="group relative block overflow-hidden rounded-xl bg-secondary aspect-[3/4]"
          >
            <img
              src={l.img}
              alt={`Customer wearing ${l.piece}`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
            />
            {/* Bottom gradient + handle */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/65 to-transparent" />
            <span className="absolute bottom-3 left-3 text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-background/90">
              {l.handle}
            </span>

            {/* Shop chip — fades in on hover */}
            <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 text-[11px] font-medium text-foreground shadow-md">
                <ShoppingBag className="h-3 w-3" /> Shop the look
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  </section>
);

export default LookbookSection;