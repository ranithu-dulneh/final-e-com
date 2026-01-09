import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { ref, push, set, get, remove, update } from "firebase/database";
import { Trash2, Edit2, LogOut } from "lucide-react";

const AdminPanel = () => {
  const { logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !price || !category) return;

    setUploading(true);
    let imageUrl = editMode ? products.find(p => p.id === editingId)?.imageUrl : "";
    if (imageUrlInput) {
        imageUrl = imageUrlInput;
    }

    try {
      const productData = {
        title,
        price,
        description,
        category,
        imageUrl: imageUrl || "",
      };

      if (editMode) {
        await update(ref(db, `products/${editingId}`), {
          ...productData,
          updatedAt: new Date().toISOString()
        });
      } else {
        const newDocRef = push(ref(db, 'products'));
        await set(newDocRef, {
          ...productData,
          createdAt: new Date().toISOString()
        });
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      if (error.message.includes("PERMISSION_DENIED")) {
        alert("Permission Denied: You do not have access to write to the database. Please check your Firebase Database Rules in the console.");
      } else {
        alert("Error saving product: " + error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setPrice("");
    setDescription("");
    setCategory("");
    setImageUrlInput("");
    setEditMode(false);
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setEditMode(true);
    setEditingId(product.id);
    setTitle(product.title);
    setPrice(product.price);
    setDescription(product.description);
    setCategory(product.category);
    setImageUrlInput(product.imageUrl || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await remove(ref(db, `products/${id}`));
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-off-white">
      <div className="bg-black text-white px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-serif">ZAFAIR Admin</h1>
        <button onClick={logout} className="flex items-center gap-2 hover:text-gold-500 transition-colors">
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Add/Edit Product Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 shadow-sm border border-gray-100 sticky top-8">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h2 className="text-xl font-serif">{editMode ? 'Edit Product' : 'Add New Product'}</h2>
              {editMode && (
                <button onClick={resetForm} className="text-sm text-gray-500 hover:text-black">
                  Cancel
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                      placeholder="e.g. Necklace"
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image URL</label>
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-gold-600 text-white py-3 uppercase tracking-widest hover:bg-gold-700 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                {uploading ? 'Processing...' : (editMode ? 'Update Product' : 'Add Product')}
              </button>
            </form>
          </div>
        </div>

        {/* Product List */}
        <div className="lg:col-span-2">
            <div className="bg-white p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-serif mb-6 border-b pb-2">Inventory ({products.length})</h2>
                {loading ? (
                    <p className="text-center text-gray-500">Loading inventory...</p>
                ) : products.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No products found. Add your first item.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <img className="h-10 w-10 object-cover" src={product.imageUrl || "https://placehold.co/100x100"} alt="" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{product.title}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${product.price}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="text-indigo-600 hover:text-indigo-900 ml-4"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-red-600 hover:text-red-900 ml-4"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
