import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { id, title, price, originalPrice, imageUrl, category, reviews } = product;

  let averageRating = 0;
  let reviewCount = 0;
  if (reviews) {
      const reviewArray = Object.values(reviews);
      reviewCount = reviewArray.length;
      if (reviewCount > 0) {
          const sum = reviewArray.reduce((acc, curr) => acc + (curr.rating || 0), 0);
          averageRating = sum / reviewCount;
      }
  }
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fallback image logic
  let displayImages = ["https://placehold.co/400x400?text=ZAFAIR"];
  if (Array.isArray(imageUrl) && imageUrl.length > 0) {
      displayImages = imageUrl;
  } else if (typeof imageUrl === 'string' && imageUrl) {
      const split = imageUrl.split(',').map(s => s.trim()).filter(Boolean);
      if (split.length > 0) {
          displayImages = split;
      }
  }

  useEffect(() => {
      let interval;
      if (isHovered && displayImages.length > 1) {
          interval = setInterval(() => {
              setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
          }, 1000); // Change image every 1 second
      } else {
          setCurrentImageIndex(0); // Reset on mouse leave
      }
      return () => clearInterval(interval);
  }, [isHovered, displayImages.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link to={`/product/${id}`} className="block">
          <div
          className="group relative flex flex-col items-center bg-white p-2 sm:p-4 rounded-lg transition-all duration-300 hover:shadow-xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          >
        <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden mb-4 rounded-md">
            {originalPrice && <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 uppercase tracking-wider z-10 shadow-sm">SALE</div>}
            <AnimatePresence initial={false}>
                <motion.img
                    key={currentImageIndex}
                    src={displayImages[currentImageIndex]}
                    alt={title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, scale: isHovered ? 1.05 : 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ opacity: { duration: 0.3 }, scale: { duration: 0.7, ease: "easeInOut" } }}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </AnimatePresence>
            {/* Overlay */}
            <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

            {/* Action Button */}
            <button className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 bg-white/90 backdrop-blur-sm text-black py-2 md:py-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 font-medium tracking-wide shadow-md hover:bg-black hover:text-white uppercase text-xs md:text-sm">
              View Details
            </button>
        </div>

          <div className="text-center space-y-1.5 w-full">
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest">{category}</p>
              <h3 className="text-sm sm:text-lg font-serif text-gray-900 line-clamp-1">{title}</h3>

              {reviewCount > 0 && (
                  <div className="flex items-center gap-1 justify-center mt-1">
                      <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                  key={star}
                                  size={12}
                                  className={star <= Math.round(averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"}
                              />
                          ))}
                      </div>
                      <span className="text-[10px] text-gray-500">({reviewCount})</span>
                  </div>
              )}

              <p className="text-gold-600 font-medium text-xs sm:text-base">
                {originalPrice && (
                  <span className="text-gray-400 line-through mr-1 sm:mr-2 text-[10px] sm:text-sm">
                    Rs. {parseFloat(originalPrice).toFixed(2)}
                  </span>
                )}
                Rs. {parseFloat(price).toFixed(2)}
              </p>
          </div>
          </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
