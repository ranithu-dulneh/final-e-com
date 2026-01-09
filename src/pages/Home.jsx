import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import ProductGallery from "../components/ProductGallery";
import Navbar from "../components/Navbar";
import { db } from "../firebase";
import { ref, query, limitToFirst, get } from "firebase/database";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(ref(db, "products"), limitToFirst(4));
        const snapshot = await get(q);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const productsData = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setFeaturedProducts(productsData);
        } else {
            setFeaturedProducts([]);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="text-center mb-16">
          <span className="text-gold-600 uppercase tracking-widest text-sm font-medium">Curated Selection</span>
          <h2 className="text-3xl md:text-4xl font-serif mt-2 mb-4 text-gray-900">Featured Collections</h2>
          <div className="w-24 h-1 bg-gold-400 mx-auto" />
        </div>

        <ProductGallery products={featuredProducts} />
      </main>

      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h3 className="font-serif text-2xl mb-4">ZAFAIR</h3>
            <p className="text-gray-400 text-sm mb-8">Elevating luxury, one piece at a time.</p>
            <div className="text-xs text-gray-600 uppercase tracking-widest">
                © {new Date().getFullYear()} ZAFAIR. All rights reserved.
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
