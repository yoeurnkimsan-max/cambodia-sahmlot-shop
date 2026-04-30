import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Package, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroModel from "@/assets/hero-model.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-warm">
      <div className="container-page grid gap-10 lg:grid-cols-2 lg:gap-16 py-16 lg:py-24 items-center">
        {/* TEXT */}
        <div className="order-2 lg:order-1 max-w-xl animate-fade-up">
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            <span className="h-px w-8 bg-foreground/40" />
            Resort '25 — New Collection
          </p>
          <h1 className="mt-6 font-serif text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-balance">
            Wear less.
            <br />
            <span className="italic text-accent">Say more.</span>
          </h1>
          <p className="mt-6 max-w-md text-base text-muted-foreground leading-relaxed">
            Natural-fiber tees and shirts, cut clean and built to last. Designed and made in our Phnom Penh atelier.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-none px-8 text-[11px] tracking-[0.22em] uppercase">
              <Link to="/shop?cat=new">
                Shop New In <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-none px-8 text-[11px] tracking-[0.22em] uppercase">
              <Link to="/shop">Browse All</Link>
            </Button>
          </div>
          <ul className="mt-10 grid grid-cols-3 gap-4 max-w-md text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <li className="flex items-center gap-2"><Leaf className="h-3.5 w-3.5 text-accent" /> Natural fibers</li>
            <li className="flex items-center gap-2"><Package className="h-3.5 w-3.5 text-accent" /> Free $35+</li>
            <li className="flex items-center gap-2"><RotateCcw className="h-3.5 w-3.5 text-accent" /> 14-day returns</li>
          </ul>
        </div>

        {/* IMAGE */}
        <div className="order-1 lg:order-2 relative">
          <div className="relative aspect-[4/5] max-h-[680px] overflow-hidden rounded-sm bg-secondary">
            <img
              src={heroModel}
              alt="Model wearing the Sahmlot linen shirt in cream"
              width={1024}
              height={1280}
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-[260px] bg-background/95 backdrop-blur p-4 shadow-soft">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Now in stores</p>
              <p className="mt-1 font-serif text-base">Linen Camp Shirt — Sand</p>
              <Link
                to="/product/linen-camp-shirt-sand"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline"
              >
                Shop the look <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
