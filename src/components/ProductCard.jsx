import { useState } from 'react';

const ProductCard = ({ product }) => {
  const { title, price, imageUrl, category } = product;
  const [isHovered, setIsHovered] = useState(false);

  // Fallback image if imageUrl is empty or fails
  const displayImage = imageUrl || "https://placehold.co/400x400?text=ZAFAIR";

  return (
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
        <p className="text-gold-600 font-medium">${parseFloat(price).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
