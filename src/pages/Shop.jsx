import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ProductGallery from "../components/ProductGallery";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
import { Search } from "lucide-react";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
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
          setFilteredProducts(productsData);

          // Extract unique categories
          const uniqueCategories = ["All", ...new Set(productsData.map(p => p.category).filter(Boolean))];
          setCategories(uniqueCategories);
        } else {
          setProducts([]);
          setFilteredProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(product =>
            product.title.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  return (
    <div className="min-h-screen flex flex-col bg-off-white">
      <Navbar />

      <div className="bg-white py-16 border-b border-gray-100">
         <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-serif text-gray-900 mb-4">The Collection</h1>
            <p className="text-gray-500 max-w-2xl mx-auto font-light">Explore our complete range of exquisite jewelry and gifts.</p>

            <div className="max-w-4xl mx-auto mt-8 flex flex-col items-center gap-6">
                {/* Category Filter */}
                {categories.length > 1 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {categories.map((category, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          selectedCategory === category
                            ? "bg-black text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}

                {/* Search Bar */}
                <div className="w-full max-w-md relative">
                    <input
                        type="text"
                        placeholder="Search for jewelry..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:border-gold-500 transition-colors text-sm tracking-wide shadow-sm"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
            </div>
         </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
         {loading ? (
             <div className="flex justify-center items-center h-64">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
             </div>
         ) : (
             <>
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No products found matching "{searchQuery}".</p>
                    </div>
                ) : (
                    <ProductGallery products={filteredProducts} />
                )}
             </>
         )}
      </main>

      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h3 className="font-serif text-2xl mb-4">ZAFIRA</h3>
            <div className="text-xs text-gray-600 uppercase tracking-widest">
                © {new Date().getFullYear()} ZAFIRA. All rights reserved.
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Shop;
