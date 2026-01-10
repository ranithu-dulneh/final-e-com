import { useState } from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { id, title, price, imageUrl, category } = product;
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
    <Link to={`/product/${id}`} className="block">
        <div
        className="group relative flex flex-col items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        >
        <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden mb-4">
            <img
            src={displayImage}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-700 ease-in-out ${isHovered ? 'scale-105' : 'scale-100'}`}
            />
            {/* Overlay or buttons can go here on hover */}
            <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        </div>

        <div className="text-center space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-widest">{category}</p>
            <h3 className="text-lg font-serif text-gray-900">{title}</h3>
            <p className="text-gold-600 font-medium">Rs. {parseFloat(price).toFixed(2)}</p>
        </div>
        </div>
    </Link>
  );
};

export default ProductCard;
