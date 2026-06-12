import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const HorizontalScrollGallery = ({ products, title, subtitle, bannerImage, bannerText, bannerLink = "/shop" }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="w-full my-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
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
      </div>

            {bannerImage && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <Link to={bannerLink} className="block relative w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden group">
             <img src={bannerImage} alt={bannerText} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
             <div className="absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:bg-black/40 flex flex-col items-center justify-center p-6 text-center">
                 <h3 className="text-white font-serif text-3xl md:text-5xl mb-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">{bannerText}</h3>
                 <div className="flex items-center text-white text-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <span>Shop Now</span>
                     <ArrowRight size={20} className="ml-2" />
                 </div>
             </div>
          </Link>
        </div>
      )}

      <div className="relative w-full">
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-8">


          {products.slice(0, 10).map((product) => (
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
