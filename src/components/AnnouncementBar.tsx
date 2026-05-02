import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Truck } from "lucide-react";

const messages = [
  "Free shipping across Cambodia on orders over $35",
  "New Resort '25 — now in stores",
  "Easy 14-day returns · Made in Phnom Penh",
  "Use code SAHM10 for 10% off your first order",
];

const AnnouncementBar = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % messages.length), 4500);
    return () => clearInterval(t);
  }, []);

  const go = (n: number) => setI(((n % messages.length) + messages.length) % messages.length);

  return (
    <div className="relative z-announcement bg-foreground text-background">
      <div className="container-page flex h-9 items-center justify-between gap-3 text-[11px] tracking-[0.14em] uppercase">
        <button
          aria-label="Previous announcement"
          onClick={() => go(i - 1)}
          className="hidden sm:grid h-6 w-6 place-items-center rounded-full text-background/60 hover:text-background transition-colors"
        >
          <ChevronLeft className="h-3 w-3" />
        </button>

        <div className="relative flex-1 h-9 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={i}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center gap-2 text-center"
            >
              <Truck className="h-3 w-3 opacity-70" aria-hidden="true" />
              <span className="truncate">{messages[i]}</span>
            </motion.p>
          </AnimatePresence>
        </div>

        <button
          aria-label="Next announcement"
          onClick={() => go(i + 1)}
          className="hidden sm:grid h-6 w-6 place-items-center rounded-full text-background/60 hover:text-background transition-colors"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;