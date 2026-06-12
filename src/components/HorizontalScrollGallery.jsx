import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { motion } from "framer-motion";

const HorizontalScrollGallery = ({ products, categories, title, subtitle, bannerImage, bannerText, bannerLink = "/shop" }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -344 : 344;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const hasProducts = products && products.length > 0;
  const hasCategories = categories && categories.length > 0;

  if (!hasProducts && !hasCategories) return null;

  return (
    <div className="w-full my-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        {!bannerImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          {subtitle && (
            <span className="text-gold-600 uppercase tracking-widest text-sm font-medium">
              {subtitle}
            </span>
          )}
          {title && (
            <h2 className="text-3xl md:text-4xl font-serif mt-2 mb-4 text-gray-900">
              {title}
            </h2>
          )}
          <div className="w-24 h-1 bg-gold-400 mx-auto" />
        </motion.div>
      )}
      </div>

            {bannerImage && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <Link to={bannerLink} className="block relative w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden group">
             <img src={bannerImage} alt={bannerText} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
             <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:bg-black/50 flex flex-col items-center justify-center p-6 text-center">
                 {subtitle && (
                    <span className="text-gold-400 uppercase tracking-widest text-sm md:text-base font-medium mb-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      {subtitle}
                    </span>
                 )}
                 <h3 className="text-white font-serif text-3xl md:text-5xl translate-y-2 group-hover:translate-y-0 transition-transform duration-300">{bannerText}</h3>

                 <div className="absolute bottom-6 right-6 flex items-center text-white/70 hover:text-white transition-colors duration-300 text-sm md:text-base font-medium">
                     <span className="tracking-widest uppercase">Shop More</span>
                     <ArrowRight size={18} className="ml-2" />
                 </div>
             </div>
          </Link>
        </div>
      )}

      <div className="relative w-full max-w-7xl mx-auto group/gallery">
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 md:left-4 top-[calc(50%-2rem)] z-10 w-12 h-12 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-300 backdrop-blur-sm border border-gray-200 hidden md:flex"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 md:right-4 top-[calc(50%-2rem)] z-10 w-12 h-12 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-300 backdrop-blur-sm border border-gray-200 hidden md:flex"
        >
          <ChevronRight size={24} />
        </button>

        <div ref={scrollRef} className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 px-4 sm:px-6 lg:px-8 pb-8">

          {hasCategories && categories.map((cat) => (
            <div key={cat.id || cat.name} className="snap-start shrink-0 w-[160px] sm:w-[200px]">
              <Link
                to="/shop"
                state={{ selectedMainCategory: cat.mainCategory || "Womens", selectedSecondaryCategory: cat.name }}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group h-full"
              >
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="w-24 h-24 object-cover rounded-full mb-4 shadow-sm group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                    <span className="text-gray-400 text-xs uppercase tracking-widest">{cat.name.substring(0, 2)}</span>
                  </div>
                )}
                <span className="font-serif text-lg text-gray-900 text-center">{cat.name}</span>
              </Link>
            </div>
          ))}

          {hasProducts && products.slice(0, 10).map((product) => (
            <div key={product.id} className="snap-start shrink-0 w-[280px] sm:w-[320px]">
              <ProductCard product={product} />
            </div>
          ))}

          <div className="snap-start shrink-0 w-[280px] sm:w-[320px] flex items-center justify-center p-4">
            <Link
              to="/shop"
              className="flex flex-col items-center justify-center w-full aspect-[4/5] bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 mb-4 text-gold-500">
                <ArrowRight size={24} />
              </div>
              <span className="font-serif text-lg text-gray-900 group-hover:text-gold-600 transition-colors">
                Shop More
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalScrollGallery;
