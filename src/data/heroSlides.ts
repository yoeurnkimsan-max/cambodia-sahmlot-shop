/**
 * HERO SLIDES — central CMS for the homepage hero.
 *
 * To add an event (e.g. Khmer New Year, Pchum Ben, Black Friday, a product drop),
 * just add a new object to the `heroSlides` array. Optionally set `startsAt` /
 * `endsAt` (ISO date strings) to auto-show the slide only during that window.
 *
 * Active slides auto-rotate every `AUTOPLAY_MS` ms. If only one slide is active,
 * the slider becomes a static hero.
 */
import heroModel from "@/assets/hero-model.jpg";
import heroKhmerNewYear from "@/assets/hero-khmer-newyear.jpg";
import heroSale from "@/assets/hero-sale.jpg";

export type HeroTheme = "warm" | "festive" | "dark" | "light";

export type HeroSlide = {
  id: string;
  /** Optional small label above the headline, e.g. "Resort '25" or "Limited Time" */
  eyebrow?: string;
  /** Main headline. Wrap an italic accent in <em>...</em> for emphasis. */
  headline: string;
  /** Italic accent that renders below the headline in the brand accent color. */
  accent?: string;
  /** Short paragraph under the headline (1–2 sentences). */
  description: string;
  /** Hero image displayed in the right-hand column (portrait, ~4:5 aspect). */
  image: string;
  imageAlt: string;
  /** Floating callout card on the image (optional). */
  callout?: {
    label: string;     // small uppercase tag, e.g. "Now in stores"
    title: string;     // line under it, e.g. "Linen Camp Shirt"
    href: string;      // where the "Shop the look" link goes
    cta?: string;      // defaults to "Shop the look"
  };
  /** Primary CTA button. */
  primaryCta: { label: string; href: string };
  /** Optional secondary (outline) CTA. */
  secondaryCta?: { label: string; href: string };
  /** Visual theme — controls background, text and accent colors. */
  theme?: HeroTheme;
  /** Optional countdown — displays a live timer. ISO date string. */
  endsAt?: string;
  /** Auto-show the slide only between these dates (ISO). Both optional. */
  startsAt?: string;
  /** Optional badge in the eyebrow row (e.g. "-30% OFF" pill). */
  badge?: string;
};

/** How long each slide stays on screen, in milliseconds. */
export const AUTOPLAY_MS = 6500;

export const heroSlides: HeroSlide[] = [
  // 1) Default brand hero — always on
  {
    id: "resort-25",
    eyebrow: "Resort '25 — New Collection",
    headline: "Wear less.",
    accent: "Say more.",
    description:
      "Natural-fiber tees and shirts, cut clean and built to last. Designed and made in our Phnom Penh atelier.",
    image: heroModel,
    imageAlt: "Model wearing the Sahmlot linen shirt in cream",
    callout: {
      label: "Now in stores",
      title: "Linen Camp Shirt — Sand",
      href: "/product/linen-camp-shirt-sand",
    },
    primaryCta: { label: "Shop New In", href: "/shop?cat=new" },
    secondaryCta: { label: "Browse All", href: "/shop" },
    theme: "warm",
  },

  // 2) EXAMPLE EVENT — Khmer New Year (Choul Chnam Thmey)
  // Edit the dates each year. Slide auto-shows only during that window.
  {
    id: "khmer-new-year-2026",
    eyebrow: "Choul Chnam Thmey · Khmer New Year",
    badge: "Festival Edit",
    headline: "Sour Sdey",
    accent: "Chnam Thmey.",
    description:
      "Celebrate the Khmer New Year with our festival edit — soft linens, festive tones, and gifts ready to wrap.",
    image: heroKhmerNewYear,
    imageAlt: "Model wearing Sahmlot linen with traditional Khmer sampot",
    callout: {
      label: "Festival Gifting",
      title: "Free wrapping on $50+",
      href: "/shop?collection=resort-25",
      cta: "Shop the edit",
    },
    primaryCta: { label: "Shop Festival Edit", href: "/shop?collection=resort-25" },
    secondaryCta: { label: "Gift Guide", href: "/shop?cat=new" },
    theme: "festive",
    startsAt: "2026-04-10T00:00:00+07:00",
    endsAt: "2026-04-17T23:59:59+07:00",
  },

  // 3) EXAMPLE EVENT — Limited-time sale with live countdown
  {
    id: "weekend-sale",
    eyebrow: "Limited Time",
    badge: "−30% OFF",
    headline: "The Weekend",
    accent: "Sale.",
    description:
      "Up to 30% off select tees, shirts and knits. Ends Sunday midnight — while sizes last.",
    image: heroSale,
    imageAlt: "Model wearing oversized black tee under spotlight",
    primaryCta: { label: "Shop Sale", href: "/shop?q=sale" },
    secondaryCta: { label: "View All", href: "/shop" },
    theme: "dark",
    endsAt: "2026-05-04T23:59:59+07:00",
  },
];

/** Returns slides currently active based on startsAt / endsAt. */
export const getActiveSlides = (now: Date = new Date()): HeroSlide[] => {
  const active = heroSlides.filter((s) => {
    if (s.startsAt && new Date(s.startsAt) > now) return false;
    if (s.endsAt && new Date(s.endsAt) < now) return false;
    return true;
  });
  return active.length > 0 ? active : [heroSlides[0]];
};
