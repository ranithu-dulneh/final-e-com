import ProductCard from "./ProductCard";

const ProductGallery = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 font-light text-lg">Our collection is currently being curated. Please check back soon.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 lg:gap-x-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGallery;
