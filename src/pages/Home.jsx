import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import ProductGallery from "../components/ProductGallery";
import HorizontalScrollGallery from "../components/HorizontalScrollGallery";
import Navbar from "../components/Navbar";
import { db } from "../firebase";
import { ref, get } from "firebase/database";

import womensBanner from "../assets/womens_banner.png";
import mensBanner from "../assets/mens_banner.png";
import { useScrollRestoration } from "../hooks/useScrollRestoration";

const Home = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [womensCategories, setWomensCategories] = useState([]);
  const [mensCategories, setMensCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useScrollRestoration("home", !loading);

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        const snapshot = await get(ref(db, "products"));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const productsData = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));

          setNewArrivals(productsData.filter(p => p.isNewArrival));
          setBestSellers(productsData.filter(p => p.isBestSeller));
        } else {
            setNewArrivals([]);
            setBestSellers([]);
        }

        const catSnapshot = await get(ref(db, "settings/categories"));
        if (catSnapshot.exists()) {
            const data = catSnapshot.val();
            const cats = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            setWomensCategories(cats.filter(c => (c.mainCategory || "Womens") === "Womens"));
            setMensCategories(cats.filter(c => c.mainCategory === "Mens"));
        } else {
            setWomensCategories([]);
            setMensCategories([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />

      <main className="flex-grow w-full pb-20 overflow-x-hidden">
        {newArrivals.length > 0 && (
            <HorizontalScrollGallery
              products={newArrivals}
              title="New Arrivals"
              subtitle="Fresh Designs"
            />
        )}

                {bestSellers.length > 0 && (
            <HorizontalScrollGallery
              products={bestSellers}
              title="Best Sellers"
              subtitle="Most Loved"
            />
        )}

        {womensCategories.length > 0 && (
            <HorizontalScrollGallery
              categories={womensCategories}
              title="Womens Collection"
              subtitle="Elegance Redefined"
              bannerImage={womensBanner}
              bannerText="Womens collection"
              bannerLink="/shop"
            />
        )}

        {mensCategories.length > 0 && (
            <HorizontalScrollGallery
              categories={mensCategories}
              title="Mens Collection"
              subtitle="Refined Masculinity"
              bannerImage={mensBanner}
              bannerText="Mens collection"
              bannerLink="/shop"
            />
        )}
      </main>

      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h3 className="font-serif text-2xl mb-4">ZAFIRA</h3>
            <p className="text-gray-400 text-sm mb-8">Elevating luxury, one piece at a time.</p>
            <div className="text-xs text-gray-600 uppercase tracking-widest">
                © {new Date().getFullYear()} ZAFIRA. All rights reserved.
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
