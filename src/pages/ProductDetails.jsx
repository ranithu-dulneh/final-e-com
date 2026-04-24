import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { ShoppingBag, CreditCard, ChevronLeft, ChevronRight, Truck, RefreshCw, ShieldCheck } from "lucide-react";
import { useCart } from "../context/CartContext";

// Helper function to format dates
const getEstimatedDeliveryDate = (days) => {
  const date = new Date();
  // Add working days (simple approach, skip weekends)
  let addedDays = 0;
  while (addedDays < days) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      addedDays++;
    }
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variants, setVariants] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const snapshot = await get(ref(db, `products/${id}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setProduct(data);

          // Parse images: handle if it's already an array or a comma-separated string
          let imgList = [];
          if (Array.isArray(data.imageUrl)) {
             imgList = data.imageUrl;
          } else if (typeof data.imageUrl === 'string') {
             imgList = data.imageUrl.split(',').map(url => url.trim()).filter(url => url);
          }

          // Fallback if no images found
          if (imgList.length === 0) {
             imgList = ["https://placehold.co/600x600?text=No+Image"];
          }

          setImages(imgList);

          // Handle variants
          if (Array.isArray(data.variantsList)) {
             setVariants(data.variantsList);
          } else if (Array.isArray(data.variants)) {
             setVariants(data.variants.map(v => ({ name: v, price: data.price, specifications: "" })));
          } else {
             setVariants([]);
          }
        } else {
          console.error("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecommendedProducts = async () => {
      try {
        const recommendedRef = ref(db, 'settings/recommendedProducts');
        const recommendedSnapshot = await get(recommendedRef);
        if (recommendedSnapshot.exists()) {
          const productIds = recommendedSnapshot.val() || [];
          const productsData = [];
          for (const prodId of productIds) {
            const prodSnapshot = await get(ref(db, `products/${prodId}`));
            if (prodSnapshot.exists() && prodSnapshot.val().isVisible) {
              productsData.push({ id: prodId, ...prodSnapshot.val() });
            }
          }
          setRecommendedProducts(productsData);
        }
      } catch (error) {
        console.error("Error fetching recommended products:", error);
      }
    };

    fetchProductData();
    fetchRecommendedProducts();
  }, [id]);

  useEffect(() => {
    if (selectedVariant && selectedVariant.imageUrl) {
      const url = selectedVariant.imageUrl;
      // Check if image is already in the list
      const index = images.findIndex((img) => img === url);

      if (index !== -1) {
        setCurrentImageIndex(index);
      } else {
        // Add to the front of the list and set as current
        setImages((prev) => [url, ...prev]);
        setCurrentImageIndex(0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant]);

  const handleAddToCart = () => {
    if (variants.length > 0 && !selectedVariant) {
      alert("Please select a variant option.");
      return;
    }
    // Update product price & image if a variant is selected
    const productToAdd = { ...product };
    if (selectedVariant && selectedVariant.price) {
        productToAdd.price = selectedVariant.price;
    }
    if (selectedVariant && selectedVariant.imageUrl) {
        productToAdd.imageUrl = [selectedVariant.imageUrl];
    }
    addToCart(productToAdd, selectedVariant);
    alert("Item added to cart!");
  };

  const handleBuyNow = () => {
     if (variants.length > 0 && !selectedVariant) {
      alert("Please select a variant option.");
      return;
    }
    const productToAdd = { ...product };
    if (selectedVariant && selectedVariant.price) {
        productToAdd.price = selectedVariant.price;
    }
    if (selectedVariant && selectedVariant.imageUrl) {
        productToAdd.imageUrl = [selectedVariant.imageUrl];
    }
    addToCart(productToAdd, selectedVariant);
    navigate("/checkout");
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-off-white flex flex-col justify-center items-center">
        <h2 className="text-2xl font-serif text-gray-900 mb-4">Product Not Found</h2>
        <Link to="/shop" className="text-gold-600 hover:text-gold-700 underline">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Image Slider Section */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 overflow-hidden rounded-sm group">
              <img
                src={images[currentImageIndex]}
                alt={product.title}
                className="w-full h-full object-cover"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-gray-800"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-gray-800"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-20 h-20 flex-shrink-0 overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx ? 'border-gold-600' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-8">
            <div>
              <p className="text-sm text-gold-600 uppercase tracking-widest font-medium mb-2">{product.category}</p>
              <h1 className="text-4xl font-serif text-gray-900 mb-2">{product.title}</h1>
              <p className="text-2xl text-gray-500 font-light">
                Rs. {selectedVariant && selectedVariant.price
                    ? parseFloat(selectedVariant.price).toFixed(2)
                    : parseFloat(product.price).toFixed(2)}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
              <button onClick={handleBuyNow} className="flex-1 bg-black text-white py-4 px-6 uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                <CreditCard size={18} /> Buy Now
              </button>
              <button onClick={handleAddToCart} className="flex-1 border border-black text-black py-4 px-6 uppercase tracking-widest hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2">
                <ShoppingBag size={18} /> Add to Cart
              </button>
            </div>

            <div className="prose prose-sm text-gray-600">
              <h3 className="text-gray-900 font-serif text-lg mb-2">Description</h3>
              <p className="whitespace-pre-line">{product.description}</p>
            </div>

            {/* Variants Selection */}
            {variants.length > 0 && (
                <div>
                    <h3 className="text-gray-900 font-serif text-sm mb-3">Select Option</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {variants.map((variant, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedVariant(variant)}
                                className={`px-4 py-2 text-sm border transition-colors ${
                                    selectedVariant === variant
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-700 border-gray-300 hover:border-black"
                                }`}
                            >
                                {variant.name}
                            </button>
                        ))}
                    </div>
                    {selectedVariant && selectedVariant.specifications && (
                        <p className="text-sm text-gray-500 italic mt-2">
                            Specifications: {selectedVariant.specifications}
                        </p>
                    )}
                </div>
            )}

            {/* Our Commitments */}
            {product.commitments && (
                <div className="border border-gray-100 rounded-sm bg-gray-50 p-4 space-y-3">
                    {product.commitments.freeShipping && (
                        <div className="flex items-start gap-3">
                            <Truck className="text-gold-600 mt-0.5" size={20} />
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">Free Shipping</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    Delivery will be done {getEstimatedDeliveryDate(product.commitments.shippingMinDays || 7)} - {getEstimatedDeliveryDate(product.commitments.shippingMaxDays || 14)}
                                </p>
                            </div>
                        </div>
                    )}

                    {product.commitments.freeRefund && (
                        <div className="flex items-start gap-3">
                            <RefreshCw className="text-gold-600 mt-0.5" size={20} />
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">Free Refund Policy</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    Refund if item not delivered in {product.commitments.refundDays || 14} days.
                                </p>
                            </div>
                        </div>
                    )}

                    {product.commitments.certifiedOriginal && (
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="text-gold-600 mt-0.5" size={20} />
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">Certified Original Items</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    100% authentic and certified products.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {product.instructions && (
              <div className="bg-white p-6 border border-gray-100 rounded-sm">
                <h3 className="text-gray-900 font-serif text-lg mb-3">Instructions & Care</h3>
                <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">{product.instructions}</p>
              </div>
            )}


          </div>

        </div>
      </main>


      {/* Recommended Products */}
      {recommendedProducts.length > 0 && (
        <section className="bg-white py-16 mt-12 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-serif text-center mb-10">Recommended Products</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {recommendedProducts.map(product => (
                        <div key={product.id} className="w-full">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
      )}

      <footer className="bg-black text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h3 className="font-serif text-2xl mb-4">ZAFIRA</h3>
            <div className="text-xs text-gray-600 uppercase tracking-widest">
                © {new Date().getFullYear()} ZAFAIR. All rights reserved.
            </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetails;
