import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ProductGallery from "../components/ProductGallery";
import { db } from "../firebase";
import { ref, get } from "firebase/database";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await get(ref(db, 'products'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const productsData = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setProducts(productsData);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-off-white">
      <Navbar />

      <div className="bg-white py-16 border-b border-gray-100">
         <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-serif text-gray-900 mb-4">The Collection</h1>
            <p className="text-gray-500 max-w-2xl mx-auto font-light">Explore our complete range of exquisite jewelry and gifts.</p>
         </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
         {loading ? (
             <div className="flex justify-center items-center h-64">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
             </div>
         ) : (
             <ProductGallery products={products} />
         )}
      </main>

      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h3 className="font-serif text-2xl mb-4">ZAFAIR</h3>
            <div className="text-xs text-gray-600 uppercase tracking-widest">
                © {new Date().getFullYear()} ZAFAIR. All rights reserved.
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Shop;
