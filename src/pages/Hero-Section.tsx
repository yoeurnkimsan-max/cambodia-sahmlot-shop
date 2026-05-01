import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Package, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/image-hero.png";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[90vh] lg:min-h-[720px] w-full">
        <img
          src={heroImg}
          alt="Models wearing Sahmlot tees"
          className="absolute inset-0 h-full w-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        {/* Main content */}
        <div className="relative h-full min-h-[90vh] lg:min-h-[720px] flex items-end">
          <div className="w-full flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 px-6 sm:px-12 lg:px-20 pb-12">
            {/* Left — headline */}
            <div className="max-w-sm">
              <p className="text-[9px] uppercase tracking-[0.45em] text-white/35 mb-5">
                New Collection — 2026
              </p>
              <h1 className="font-serif text-6xl sm:text-7xl lg:text-8xl font-light leading-[0.88] tracking-tight text-white">
                Wear<br />less.<br />
                <em className="italic not-italic text-amber-300">Say more.</em>
              </h1>
            </div>

            {/* Right — desc + CTA */}
            <div className="flex flex-col items-start lg:items-end gap-5 max-w-xs lg:text-right">
              <p className="text-xs text-white/45 leading-relaxed font-light">
                Natural fiber tees and shirts, cut clean and built to last. Made in Cambodia.
              </p>
              <div className="flex gap-3">
                <Button asChild size="lg"
                  className="rounded-none bg-white text-black hover:bg-white/90 text-[9px] tracking-[0.25em] uppercase px-8 font-normal">
                  <Link to="/shop?cat=new">Shop Now <ArrowRight className="ml-2 h-3 w-3" /></Link>
                </Button>
                <Button asChild variant="ghost" size="lg"
                  className="rounded-none border border-white/25 text-white/65 hover:bg-white/10 text-[9px] tracking-[0.25em] uppercase px-8 font-normal">
                  <Link to="/shop">Browse All</Link>
                </Button>
              </div>
              <div className="flex items-center text-white gap-4 border-t border-white/10 pt-3 w-full lg:justify-end">
                <span className="text-[8px] uppercase tracking-widest text-white/28 inline-flex items-center gap-1.5">
                  <Leaf className="h-3 w-3" /> Natural fibers
                </span>
                <span className="w-px h-3 bg-white/15" />
                <span className="text-[8px] uppercase tracking-widest text-white/28 inline-flex items-center gap-1.5">
                  <Package className="h-3 w-3" /> Free ship $35+
                </span>
                <span className="w-px h-3 bg-white/15" />
                <span className="text-[8px] uppercase tracking-widest text-white/28 inline-flex items-center gap-1.5">
                  <RotateCcw className="h-3 w-3" /> 14-day returns
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
