import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { ref, get, push, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { ShoppingBag, CreditCard, ChevronLeft, ChevronRight, Truck, RefreshCw, ShieldCheck, Star } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

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
  const { currentUser } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variants, setVariants] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  // Review state
  const [hasPurchased, setHasPurchased] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(4);
  const [selectedReviewImage, setSelectedReviewImage] = useState(null);

  useEffect(() => {
    if (currentUser && currentUser.displayName) {
      setReviewName(currentUser.displayName);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const snapshot = await get(ref(db, `products/${id}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setProduct({ id, ...data });

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

          fetchRecommendedProducts(data);
        } else {
          console.error("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecommendedProducts = async (currentProduct) => {
      try {
        const productsSnapshot = await get(ref(db, 'products'));
        if (productsSnapshot.exists()) {
          const allProductsData = productsSnapshot.val();
          const allProducts = Object.keys(allProductsData).map(key => ({
            id: key,
            ...allProductsData[key]
          })).filter(p => p.id !== id && p.isVisible !== false);

          const currentTitleWords = currentProduct.title.toLowerCase().split(/\s+/);
          const genericWords = ["necklace", "necklaces", "bracelet", "bracelets", "ring", "rings", "earring", "earrings", "watch", "watches", "pendant", "set", "gold", "silver", "diamond", "chain"];
          const keyWords = currentTitleWords.filter(w => !genericWords.includes(w) && w.length > 2);

          let scoredProducts = allProducts.map(p => {
             let score = 0;
             const pTitleLower = p.title.toLowerCase();

             // 1. Check for shared key words in title
             let sharedKeyWords = 0;
             for (const word of keyWords) {
                 if (pTitleLower.includes(word)) {
                     sharedKeyWords++;
                 }
             }
             score += (sharedKeyWords * 10); // high weight for same name/collection

             // 2. Check for same category
             if (p.category === currentProduct.category) {
                 score += 5;
             }

             // 3. Same main category
             if (p.mainCategory === currentProduct.mainCategory) {
                 score += 2;
             }

             return { ...p, _score: score };
          });

          // Filter products that have at least some relevance (score > 0)
          scoredProducts = scoredProducts.filter(p => p._score > 0);

          // Sort by score descending, then randomly to mix things up a bit for ties
          scoredProducts.sort((a, b) => b._score - a._score || Math.random() - 0.5);

          setRecommendedProducts(scoredProducts.slice(0, 8));
        }
      } catch (error) {
        console.error("Error fetching recommended products:", error);
      }
    };

    fetchProductData();
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

  // Check if user has purchased the item
  useEffect(() => {
    if (currentUser && product) {
      const checkPurchase = async () => {
        try {
          const ordersRef = ref(db, 'orders');
          // Fetch all orders and filter client-side to capture orders missing userId but having matching email
          const snapshot = await get(ordersRef);
          if (snapshot.exists()) {
            const ordersData = snapshot.val();
            const purchased = Object.values(ordersData).some(order => {
               const isUserOrder = order.userId === currentUser.uid || (currentUser.email && order.customer && order.customer.email === currentUser.email);
               if (!isUserOrder) return false;

               return order.status === 'Delivered' &&
                      order.items &&
                      order.items.some(item => item.id === product.id || item.id === id || item.title === product.title);
            });
            setHasPurchased(purchased);
          }
        } catch (error) {
          console.error("Error checking user orders:", error);
        }
      };
      checkPurchase();

      if (product.reviews) {
          const reviewed = Object.values(product.reviews).some(rev => rev.userId === currentUser.uid);
          setUserHasReviewed(reviewed);
      }
    }
  }, [currentUser, product, id]);

  const handleReviewImageChange = (e) => {
    if (e.target.files) {
      setReviewImages(Array.from(e.target.files));
    }
  };

  const submitReview = async () => {
    if (!reviewRating || !currentUser) return;
    setIsSubmittingReview(true);
    try {
        const imageUrls = [];
        if (reviewImages.length > 0) {
            for (let i = 0; i < reviewImages.length; i++) {
                const file = reviewImages[i];
                const imageRef = storageRef(storage, `reviews/${id}/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(imageRef, file);
                const url = await getDownloadURL(snapshot.ref);
                imageUrls.push(url);
            }
        }

        const newReviewRef = push(ref(db, `products/${id}/reviews`));
        const newReview = {
            userId: currentUser.uid,
            userName: reviewName.trim() || "Customer",
            rating: reviewRating,
            comment: reviewComment,
            images: imageUrls,
            createdAt: new Date().toISOString()
        };
        await set(newReviewRef, newReview);

        // Update local product state
        setProduct(prev => ({
            ...prev,
            reviews: {
                ...(prev.reviews || {}),
                [newReviewRef.key]: newReview
            }
        }));
        setUserHasReviewed(true);
        setReviewRating(0);
        setReviewComment("");
    } catch (error) {
        console.error("Error submitting review:", error);
        alert("Failed to submit review. Please try again.");
    } finally {
        setIsSubmittingReview(false);
    }
  };

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
      {selectedReviewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedReviewImage(null)}>
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={(e) => { e.stopPropagation(); setSelectedReviewImage(null); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <img src={selectedReviewImage} alt="Review Full" className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
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
              <div className="flex items-center gap-3">
                  {product.originalPrice && (!selectedVariant || !selectedVariant.price) && (
                      <span className="text-xl text-gray-400 line-through font-light">
                          Rs. {parseFloat(product.originalPrice).toFixed(2)}
                      </span>
                  )}
                  <p className="text-2xl text-gray-900 font-medium">
                    Rs. {selectedVariant && selectedVariant.price
                        ? parseFloat(selectedVariant.price).toFixed(2)
                        : parseFloat(product.price).toFixed(2)}
                  </p>
              </div>
              {product.estimatedShippingDate && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-sm border border-gray-100 inline-flex">
                      <Truck size={16} className="text-gold-600" />
                      <span>Estimated Shipping: <span className="font-medium text-gray-900">{product.estimatedShippingDate}</span></span>
                  </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
              <button onClick={handleBuyNow} className="flex-1 bg-black text-white py-4 px-6 uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                <CreditCard size={18} /> Buy Now
              </button>
              <button onClick={handleAddToCart} className="flex-1 border border-black text-black py-4 px-6 uppercase tracking-widest hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2">
                <ShoppingBag size={18} /> Add to Cart
              </button>
            </div>

            <div className="mt-12 space-y-12">
              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-xl font-serif text-gray-900 mb-6">Description</h3>
                <div className="prose prose-sm text-gray-600 whitespace-pre-line">
                  {product.description}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-xl font-serif text-gray-900 mb-6">Customer Reviews {product.reviews ? `(${Object.keys(product.reviews).length})` : "(0)"}</h3>
                <div className="space-y-6">
                   {/* List of reviews */}
                   {product.reviews && Object.values(product.reviews).length > 0 ? (
                       <div className="space-y-4">
                           {Object.values(product.reviews)
                             .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                             .slice(0, visibleReviewsCount)
                             .map((review, idx) => (
                               <div key={idx} className="border-b border-gray-100 pb-4">
                                   <div className="flex items-center gap-2 mb-1">
                                       <div className="flex">
                                           {[1,2,3,4,5].map(star => (
                                               <Star key={star} size={14} className={star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-300"} />
                                           ))}
                                       </div>
                                       <span className="font-medium text-sm text-gray-900">{review.userName || "Customer"}</span>
                                       <span className="text-xs text-gray-500 ml-auto">{new Date(review.createdAt).toLocaleDateString()}</span>
                                   </div>
                                   <p className="text-gray-600 text-sm mt-2">{review.comment}</p>
                                   {review.images && review.images.length > 0 && (
                                       <div className="flex gap-2 mt-3 overflow-x-auto">
                                           {review.images.map((imgUrl, imgIdx) => (
                                               <img
                                                 key={imgIdx}
                                                 src={imgUrl}
                                                 alt="Review"
                                                 className="w-20 h-20 object-cover border border-gray-200 cursor-pointer hover:opacity-90"
                                                 onClick={() => setSelectedReviewImage(imgUrl)}
                                               />
                                           ))}
                                       </div>
                                   )}
                               </div>
                           ))}
                           {Object.values(product.reviews).length > visibleReviewsCount && (
                               <div className="text-center pt-2">
                                   <button
                                     onClick={() => setVisibleReviewsCount(Object.values(product.reviews).length)}
                                     className="text-sm font-medium text-gray-700 underline hover:text-black transition-colors"
                                   >
                                       View all {Object.values(product.reviews).length} reviews
                                   </button>
                               </div>
                           )}
                       </div>
                   ) : (
                       <p className="text-sm text-gray-500">No reviews yet.</p>
                   )}

                   {/* Review Form */}
                   {currentUser ? (
                       hasPurchased ? (
                           !userHasReviewed ? (
                               <div className="mt-8 bg-gray-50 p-6 rounded-sm">
                                   <h4 className="font-serif text-lg text-gray-900 mb-4">Write a Review</h4>
                                   <div className="mb-4">
                                       <label className="block text-sm text-gray-700 mb-1">Your Name</label>
                                       <input
                                           type="text"
                                           className="w-full border border-gray-200 p-2 rounded-sm text-sm focus:outline-none focus:border-gray-500 bg-white"
                                           placeholder="Enter your name to be published"
                                           value={reviewName}
                                           onChange={(e) => setReviewName(e.target.value)}
                                       />
                                   </div>
                                   <div className="flex items-center gap-2 mb-4">
                                       <span className="text-sm text-gray-700">Your Rating:</span>
                                       <div className="flex cursor-pointer">
                                           {[1,2,3,4,5].map(star => (
                                               <Star
                                                   key={star}
                                                   size={20}
                                                   onClick={() => setReviewRating(star)}
                                                   className={star <= reviewRating ? "text-yellow-400 fill-current" : "text-gray-300 hover:text-yellow-200"}
                                               />
                                           ))}
                                       </div>
                                   </div>
                                   <textarea
                                       className="w-full border border-gray-200 p-3 rounded-sm text-sm focus:outline-none focus:border-gray-500 mb-4 bg-white"
                                       rows="3"
                                       placeholder="Share your thoughts about this product..."
                                       value={reviewComment}
                                       onChange={(e) => setReviewComment(e.target.value)}
                                   ></textarea>
                                   <div className="mb-4">
                                       <label className="block text-sm text-gray-700 mb-1">Add Photos (optional)</label>
                                       <input
                                           type="file"
                                           multiple
                                           accept="image/*"
                                           onChange={handleReviewImageChange}
                                           className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                       />
                                       {reviewImages.length > 0 && (
                                           <div className="mt-2 text-xs text-gray-500">
                                               {reviewImages.length} image(s) selected
                                           </div>
                                       )}
                                   </div>
                                   <button
                                       onClick={submitReview}
                                       disabled={isSubmittingReview || reviewRating === 0 || !reviewName.trim()}
                                       className="bg-black text-white px-6 py-2 text-sm uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50"
                                   >
                                       {isSubmittingReview ? "Submitting..." : "Submit Review"}
                                   </button>
                               </div>
                           ) : (
                               <div className="mt-6 bg-gray-50 p-4 text-sm text-gray-600 rounded-sm">You have already reviewed this product.</div>
                           )
                       ) : (
                           <div className="mt-6 bg-gray-50 p-4 text-sm text-gray-600 rounded-sm">You can leave a review after purchasing this product.</div>
                       )
                   ) : (
                       <div className="mt-6 bg-gray-50 p-4 text-sm text-gray-600 rounded-sm">Please <Link to="/profile" className="text-gold-600 underline">sign in</Link> to leave a review.</div>
                   )}
                </div>
              </div>
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
