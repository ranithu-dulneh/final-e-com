import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative bg-off-white overflow-hidden min-h-[80vh] flex items-center justify-center">
      <div className="absolute inset-0 z-0 opacity-10 pattern-grid-lg text-gray-300" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        <h1 className="text-4xl md:text-6xl font-serif text-black tracking-tight mb-6 animate-fade-in-up">
          Timeless Elegance &<br/>
          <span className="text-gold-600 italic">Exquisite Luxury</span>
        </h1>

        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 font-light mb-10 animate-fade-in-up animation-delay-200">
          Discover our exclusive collection of hand-crafted jewelry and premium gifts.
          Designed for those who appreciate the finer things in life.
        </p>

        <div className="flex justify-center gap-4 animate-fade-in-up animation-delay-400">
          <Link
            to="/shop"
            className="px-8 py-4 bg-black text-white text-sm uppercase tracking-widest hover:bg-gold-600 transition-colors duration-300"
          >
            Shop Collection
          </Link>
          <Link
             to="/about"
             className="px-8 py-4 border border-black text-black text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-colors duration-300"
          >
             Our Story
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
