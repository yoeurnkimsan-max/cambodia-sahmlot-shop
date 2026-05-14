import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Leaf, Package, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AUTOPLAY_MS, getActiveSlides, HeroSlide, HeroTheme } from "@/data/heroSlides";

const ease = [0.16, 1, 0.3, 1] as const;

/* ---------- Minimal theme tokens (Vercel-like, restrained) ---------- */
const themes: Record<HeroTheme, {
  section: string;
  eyebrow: string;
  headline: string;
  accent: string;
  description: string;
  perks: string;
  perkIcon: string;
  primary: string;
  secondary: string;
  badge: string;
  dot: string;
  dotActive: string;
  arrow: string;
  countdownLabel: string;
  countdownValue: string;
  callout: string;
}> = {
  warm: {
    section: "bg-background text-foreground",
    eyebrow: "text-muted-foreground",
    headline: "text-foreground",
    accent: "text-foreground/55",
    description: "text-muted-foreground",
    perks: "text-muted-foreground",
    perkIcon: "text-foreground/70",
    primary: "",
    secondary: "",
    badge: "bg-foreground text-background",
    dot: "bg-foreground/20",
    dotActive: "bg-foreground",
    arrow: "bg-background/80 text-foreground hover:bg-background border border-border",
    countdownLabel: "text-muted-foreground",
    countdownValue: "text-foreground border-border",
    callout: "bg-background/95 text-foreground border border-border",
  },
  festive: {
    section: "bg-[hsl(14_75%_52%)] text-white",
    eyebrow: "text-white/70",
    headline: "text-white",
    accent: "text-[hsl(45_85%_75%)]",
    description: "text-white/80",
    perks: "text-white/70",
    perkIcon: "text-[hsl(45_85%_75%)]",
    primary: "bg-white text-[hsl(14_50%_22%)] hover:bg-white/95",
    secondary: "border-white/40 text-white hover:bg-white/10",
    badge: "bg-[hsl(45_85%_75%)] text-[hsl(14_50%_22%)]",
    dot: "bg-white/30",
    dotActive: "bg-white",
    arrow: "bg-white/15 text-white hover:bg-white/25",
    countdownLabel: "text-white/70",
    countdownValue: "text-white border-white/30",
    callout: "bg-white text-[hsl(14_50%_22%)]",
  },
  dark: {
    section: "bg-[hsl(222_18%_6%)] text-white",
    eyebrow: "text-white/55",
    headline: "text-white",
    accent: "text-white/55",
    description: "text-white/65",
    perks: "text-white/55",
    perkIcon: "text-white/75",
    primary: "bg-white text-[hsl(222_18%_6%)] hover:bg-white/95",
    secondary: "border-white/25 text-white hover:bg-white/10",
    badge: "bg-white text-[hsl(222_18%_6%)]",
    dot: "bg-white/20",
    dotActive: "bg-white",
    arrow: "bg-white/10 text-white hover:bg-white/20",
    countdownLabel: "text-white/55",
    countdownValue: "text-white border-white/25",
    callout: "bg-[hsl(222_18%_8%)] text-white border border-white/15",
  },
  light: {
    section: "bg-secondary/60 text-foreground",
    eyebrow: "text-muted-foreground",
    headline: "text-foreground",
    accent: "text-foreground/55",
    description: "text-muted-foreground",
    perks: "text-muted-foreground",
    perkIcon: "text-foreground/70",
    primary: "",
    secondary: "",
    badge: "bg-foreground text-background",
    dot: "bg-foreground/20",
    dotActive: "bg-foreground",
    arrow: "bg-background text-foreground hover:bg-background/80 border border-border",
    countdownLabel: "text-muted-foreground",
    countdownValue: "text-foreground border-border",
    callout: "bg-background border border-border text-foreground",
  },
};

/* ---------- Countdown ---------- */
const useCountdown = (target?: string) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, [target]);
  if (!target) return null;
  const diff = Math.max(0, new Date(target).getTime() - now);
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff % 86_400_000) / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1000),
    ended: diff === 0,
  };
};

const Countdown = ({ target, theme }: { target: string; theme: typeof themes[HeroTheme] }) => {
  const t = useCountdown(target);
  if (!t || t.ended) return null;
  const cell = (n: number, l: string) => (
    <div className="text-center">
      <div className={cn("min-w-[48px] rounded-md border px-2.5 py-2 font-serif text-xl leading-none tabular-nums", theme.countdownValue)}>
        {String(n).padStart(2, "0")}
      </div>
      <p className={cn("mt-1.5 text-[9.5px] uppercase tracking-[0.22em]", theme.countdownLabel)}>{l}</p>
    </div>
  );
  return (
    <div className="mt-7 flex items-end gap-2">
      {cell(t.d, "Days")}{cell(t.h, "Hrs")}{cell(t.m, "Min")}{cell(t.s, "Sec")}
    </div>
  );
};

/* ---------- Single slide ---------- */
const Slide = ({ slide }: { slide: HeroSlide }) => {
  const t = themes[slide.theme ?? "warm"];
  return (
    <div className={cn("relative overflow-hidden", t.section)}>
      <div className="container-page grid gap-10 lg:grid-cols-2 lg:gap-20 py-16 lg:py-24 items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="order-2 lg:order-1 max-w-xl"
        >
          {(slide.eyebrow || slide.badge) && (
            <div className="flex flex-wrap items-center gap-3">
              {slide.badge && (
                <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em]", t.badge)}>
                  {slide.badge}
                </span>
              )}
              {slide.eyebrow && (
                <p className={cn("inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em]", t.eyebrow)}>
                  <span className="h-px w-7 bg-current opacity-40" />
                  {slide.eyebrow}
                </p>
              )}
            </div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease }}
            className={cn("mt-6 font-serif text-[2.75rem] sm:text-6xl lg:text-7xl leading-[0.98] tracking-[-0.02em] text-balance", t.headline)}
          >
            {slide.headline}
            {slide.accent && (
              <>
                <br />
                <span className={cn("italic font-light", t.accent)}>{slide.accent}</span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18, duration: 0.5 }}
            className={cn("mt-6 max-w-md text-[15px] leading-relaxed", t.description)}
          >
            {slide.description}
          </motion.p>

          {slide.endsAt && <Countdown target={slide.endsAt} theme={t} />}

          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.5, ease }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button asChild size="lg" className={cn("rounded-full px-7 h-12 text-[12px] tracking-[0.18em] uppercase", t.primary)}>
              <Link to={slide.primaryCta.href}>
                {slide.primaryCta.label} <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
            {slide.secondaryCta && (
              <Button asChild variant="outline" size="lg" className={cn("rounded-full px-7 h-12 text-[12px] tracking-[0.18em] uppercase", t.secondary)}>
                <Link to={slide.secondaryCta.href}>{slide.secondaryCta.label}</Link>
              </Button>
            )}
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.36, duration: 0.5 }}
            className={cn("mt-10 grid grid-cols-3 gap-4 max-w-md text-[10.5px] uppercase tracking-[0.16em]", t.perks)}
          >
            <li className="flex items-center gap-2"><Leaf className={cn("h-3.5 w-3.5", t.perkIcon)} /> Natural fibers</li>
            <li className="flex items-center gap-2"><Package className={cn("h-3.5 w-3.5", t.perkIcon)} /> Free $35+</li>
            <li className="flex items-center gap-2"><RotateCcw className={cn("h-3.5 w-3.5", t.perkIcon)} /> 14-day returns</li>
          </motion.ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease }}
          className="order-1 lg:order-2 relative"
        >
          <div className="relative aspect-[4/5] max-h-[680px] overflow-hidden rounded-2xl bg-secondary">
            <img
              src={slide.image}
              alt={slide.imageAlt}
              width={1024}
              height={1280}
              className="h-full w-full object-cover"
            />
            {slide.callout && (
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.55, ease }}
                className={cn("absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-[260px] backdrop-blur p-4 rounded-xl shadow-soft", t.callout)}
              >
                <p className="text-[10px] uppercase tracking-[0.22em] opacity-70">{slide.callout.label}</p>
                <p className="mt-1 font-serif text-base">{slide.callout.title}</p>
                <Link to={slide.callout.href} className="mt-2 inline-flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline">
                  {slide.callout.cta ?? "Shop the look"} <ArrowRight className="h-3 w-3" />
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/* ---------- Slider ---------- */
const HeroSection = () => {
  const slides = useMemo(() => getActiveSlides(), []);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStart = useRef<number | null>(null);

  const go = (next: number) => setIndex(((next % slides.length) + slides.length) % slides.length);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [slides.length, paused, index]);

  const t = themes[slides[index].theme ?? "warm"];
  const single = slides.length === 1;

  return (
    <section
      className="relative"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStart.current == null) return;
        const dx = e.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(dx) > 50) (dx < 0 ? () => go(index + 1) : () => go(index - 1))();
        touchStart.current = null;
      }}
    >
      <div className="relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slides[index].id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <Slide slide={slides[index]} />
          </motion.div>
        </AnimatePresence>
      </div>

      {!single && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            className={cn("hidden md:grid absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 place-items-center rounded-full backdrop-blur transition-colors", t.arrow)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            className={cn("hidden md:grid absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 place-items-center rounded-full backdrop-blur transition-colors", t.arrow)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className="group relative h-1 w-8 overflow-hidden rounded-full"
              >
                <span className={cn("absolute inset-0 transition-colors", i === index ? t.dotActive : t.dot)} />
                {i === index && !paused && (
                  <span
                    key={`progress-${index}`}
                    className={cn("absolute inset-y-0 left-0 origin-left", t.dotActive)}
                    style={{ animation: `hero-progress ${AUTOPLAY_MS}ms linear forwards` }}
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}

      <style>{`@keyframes hero-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
    </section>
  );
};

export default HeroSection;