import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const { id, title, price, originalPrice, imageUrl, category } = product;
  const [isHovered, setIsHovered] = useState(false);

  // Fallback image logic
  let displayImage = "https://placehold.co/400x400?text=ZAFAIR";
  if (Array.isArray(imageUrl) && imageUrl.length > 0) {
      displayImage = imageUrl[0];
  } else if (typeof imageUrl === 'string' && imageUrl) {
      // If it's a comma separated string, take the first one
      const split = imageUrl.split(',');
      if (split.length > 0 && split[0].trim()) {
          displayImage = split[0].trim();
      }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Link to={`/product/${id}`} className="block">
          <div
          className="group relative flex flex-col items-center bg-white p-4 rounded-lg transition-all duration-300 hover:shadow-xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          >
        <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden mb-4 rounded-md">
            <img
            src={displayImage}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-700 ease-in-out ${isHovered ? 'scale-105' : 'scale-100'}`}
            />
            {/* Overlay */}
            <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

            {/* Action Button */}
            <button className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 bg-white text-black py-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 font-medium tracking-wide shadow-md hover:bg-black hover:text-white uppercase text-sm">
              View Details
            </button>
        </div>

          <div className="text-center space-y-1.5 w-full">
              <p className="text-xs text-gray-500 uppercase tracking-widest">{category}</p>
              <h3 className="text-lg font-serif text-gray-900 line-clamp-1">{title}</h3>
              <p className="text-gold-600 font-medium">
                {originalPrice && (
                  <span className="text-gray-400 line-through mr-2 text-sm">
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
