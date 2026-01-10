import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { ref, push, set, get, remove, update } from "firebase/database";
import { Trash2, Edit2, LogOut, Package, ShoppingBag, Truck, Check, X, Search } from "lucide-react";

const AdminPanel = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("inventory"); // 'inventory' or 'orders'

  // Products State
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [variantsInput, setVariantsInput] = useState("");
  const [instructions, setInstructions] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
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

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const snapshot = await get(ref(db, 'orders'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const ordersData = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(ordersData);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchProducts();
    } else {
      fetchOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
        setFilteredProducts(products);
    } else {
        const query = searchTerm.toLowerCase();
        const filtered = products.filter(product =>
            product.title.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );
        setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !price || !category) return;

    setUploading(true);

    // Process images: split by comma, trim whitespace, and filter empty strings
    let imageUrl = editMode ? products.find(p => p.id === editingId)?.imageUrl : "";
    if (imageUrlInput) {
        const urls = imageUrlInput.split(',').map(url => url.trim()).filter(url => url.length > 0);
        imageUrl = urls.length === 1 ? urls[0] : urls;
    }

    // Process variants
    let variants = [];
    if (variantsInput) {
        variants = variantsInput.split(',').map(v => v.trim()).filter(v => v.length > 0);
    }

    try {
      const productData = {
        title,
        price,
        description,
        category,
        instructions,
        imageUrl: imageUrl || "",
        variants: variants
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
    setVariantsInput("");
    setInstructions("");
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
    setInstructions(product.instructions || "");

    // Handle variants population
    if (Array.isArray(product.variants)) {
        setVariantsInput(product.variants.join(', '));
    } else {
        setVariantsInput("");
    }

    // Handle image URL population
    if (Array.isArray(product.imageUrl)) {
        setImageUrlInput(product.imageUrl.join(', '));
    } else {
        setImageUrlInput(product.imageUrl || "");
    }

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

  const handleOrderAction = async (orderId, action, currentTracking = "") => {
    if (action === 'delete') {
      if (window.confirm("Are you sure you want to delete this order?")) {
        try {
          await remove(ref(db, `orders/${orderId}`));
          fetchOrders();
        } catch (error) {
          console.error("Error deleting order:", error);
        }
      }
    } else if (action === 'confirm') {
      try {
        await update(ref(db, `orders/${orderId}`), {
          status: 'Confirmed',
          updatedAt: new Date().toISOString()
        });
        fetchOrders();
      } catch (error) {
        console.error("Error confirming order:", error);
      }
    } else if (action === 'shipping') {
      const tracking = window.prompt("Enter tracking information / notes:", currentTracking || "");
      if (tracking !== null) {
        try {
          await update(ref(db, `orders/${orderId}`), {
            status: 'Shipped',
            trackingInfo: tracking,
            updatedAt: new Date().toISOString()
          });
          fetchOrders();
        } catch (error) {
          console.error("Error updating shipping:", error);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-off-white">
      <div className="bg-black text-white px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-8">
            <h1 className="text-xl font-serif">ZAFIAR Admin</h1>
            <nav className="flex gap-4">
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`flex items-center gap-2 text-sm uppercase tracking-widest ${activeTab === 'inventory' ? 'text-gold-500 font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                    <Package size={16} /> Inventory
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center gap-2 text-sm uppercase tracking-widest ${activeTab === 'orders' ? 'text-gold-500 font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                    <ShoppingBag size={16} /> Orders
                </button>
            </nav>
        </div>
        <button onClick={logout} className="flex items-center gap-2 hover:text-gold-500 transition-colors">
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {activeTab === 'inventory' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.)</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Variants</label>
                <input
                  type="text"
                  value={variantsInput}
                  onChange={(e) => setVariantsInput(e.target.value)}
                  placeholder="e.g. Gold, Silver, Rose Gold (Comma separated)"
                  className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Enter available variants separated by commas.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructions to Use</label>
                <textarea
                  rows="3"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                  placeholder="Care instructions, usage guide, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Images (URLs)</label>
                <textarea
                  rows="3"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Enter direct image URLs here, separated by commas for multiple images."
                  className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none text-sm font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">Paste direct links to images. Comma separate for slider.</p>
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
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b pb-4 gap-4">
                    <h2 className="text-xl font-serif">Inventory ({products.length})</h2>
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search inventory..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gold-500"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                    </div>
                </div>

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
                                {filteredProducts.map((product) => {
                                    // Handle array or string image for preview
                                    let previewImage = "https://placehold.co/100x100";
                                    if (Array.isArray(product.imageUrl) && product.imageUrl.length > 0) {
                                        previewImage = product.imageUrl[0];
                                    } else if (typeof product.imageUrl === 'string' && product.imageUrl) {
                                        previewImage = product.imageUrl;
                                    }

                                    return (
                                    <tr key={product.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <img className="h-10 w-10 object-cover" src={previewImage} alt="" />
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
                                            Rs. {product.price}
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
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
      </div>
      ) : (
            // Orders View
            <div className="bg-white p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-serif mb-6 border-b pb-2">Orders ({orders.length})</h2>
                {loadingOrders ? (
                    <p className="text-center text-gray-500">Loading orders...</p>
                ) : orders.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No orders found.</p>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="border border-gray-200 p-6 rounded-sm">
                                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4 pb-4 border-b border-gray-100">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-serif text-lg font-bold">Order #{order.id.slice(-6)}</h3>
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                                                order.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOrderAction(order.id, 'confirm')}
                                            disabled={order.status !== 'Pending'}
                                            className="px-3 py-2 bg-green-600 text-white text-xs uppercase tracking-widest hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                                        >
                                            <Check size={14} /> Confirm
                                        </button>
                                        <button
                                            onClick={() => handleOrderAction(order.id, 'shipping', order.trackingInfo)}
                                            className="px-3 py-2 bg-blue-600 text-white text-xs uppercase tracking-widest hover:bg-blue-700 flex items-center gap-1"
                                        >
                                            <Truck size={14} /> Update Shipping
                                        </button>
                                        <button
                                            onClick={() => handleOrderAction(order.id, 'delete')}
                                            className="px-3 py-2 bg-red-600 text-white text-xs uppercase tracking-widest hover:bg-red-700 flex items-center gap-1"
                                        >
                                            <X size={14} /> Delete
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Customer Info */}
                                    <div>
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Customer Details</h4>
                                        <div className="text-sm text-gray-800 space-y-1">
                                            <p><span className="font-medium">Name:</span> {order.customer.name}</p>
                                            <p><span className="font-medium">Phone (WA):</span>
                                              <a
                                                href={`https://wa.me/${order.customer.phone1.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                                  `Hello ${order.customer.name}, regarding your order #${order.id.slice(-6)} on ZAFIAR.\n\nItems:\n${order.items.map(i => `- ${i.title} (${i.selectedVariant || 'Std'}) x${i.quantity}`).join('\n')}\n\nTotal: Rs. ${parseFloat(order.totalAmount).toFixed(2)}\n\nStatus: ${order.status}`
                                                )}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-green-600 hover:underline ml-1"
                                              >
                                                {order.customer.phone1} (Chat)
                                              </a>
                                            </p>
                                            {order.customer.phone2 && <p><span className="font-medium">Phone 2:</span> {order.customer.phone2}</p>}
                                            <p><span className="font-medium">Address:</span> {order.customer.address}, {order.customer.city}</p>
                                            <p><span className="font-medium">Payment:</span> {order.paymentMethod.toUpperCase()}</p>
                                        </div>
                                        {order.trackingInfo && (
                                            <div className="mt-4 bg-blue-50 p-3 text-sm text-blue-800 border border-blue-100">
                                                <span className="font-bold">Tracking Info:</span> {order.trackingInfo}
                                            </div>
                                        )}
                                    </div>

                                    {/* Items */}
                                    <div>
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Items</h4>
                                        <div className="space-y-3">
                                            {order.items && order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-start text-sm">
                                                    <div>
                                                        <p className="font-medium">{item.title}</p>
                                                        <p className="text-gray-500 text-xs">Variant: {item.selectedVariant || 'Default'} | Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-medium">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                            ))}
                                            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
                                                <span>Total</span>
                                                <span>Rs. {parseFloat(order.totalAmount).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
      )}
    </div>
    </div>
  );
};

export default AdminPanel;
