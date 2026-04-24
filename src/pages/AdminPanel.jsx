import DashboardMetrics from "../components/admin/DashboardMetrics";
import { BarChart2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { ref, push, set, get, remove, update } from "firebase/database";
import { Trash2, Edit2, LogOut, Package, ShoppingBag, Truck, Check, X, Search, Settings, Save, MessageCircle, UploadCloud } from "lucide-react";

const STATUSES = [
  "Pending",
  "Order confirmed",
  "Dispatched",
  "Arrived at the destination",
  "Out for delivery",
  "Delivered"
];

const formatPhoneNumber = (phone) => {
  // Remove non-numeric characters
  let cleanPhone = phone.replace(/[^0-9]/g, '');

  // Remove leading 0 if present
  if (cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.substring(1);
  }

  // Add 94 prefix if not present (assuming Sri Lankan numbers)
  if (!cleanPhone.startsWith('94')) {
    cleanPhone = '94' + cleanPhone;
  }

  return cleanPhone;
};

const getWhatsAppMessage = (status, order, tracking) => {
  const name = order.customer.name;
  const id = order.id.slice(-6);
  const trackInfo = tracking || "N/A";

  switch(status) {
    case "Order confirmed": {
      const items = order.items.map(i => i.title).join(', ');
      const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      const deliveryMethod = "Courier Service";
      const paymentMethod = order.paymentMethod === 'cod' ? 'Cash On Delivery' : 'Bank Deposit';

      return `Hi ${name},

Thank you for your order! This message is to confirm that we have received your request for the ${items}.
Here are your order details:

     ⭕Order Confirmed: ${time}
     ⭕Total Amount: Rs. ${parseFloat(order.totalAmount).toLocaleString()}
     ⭕Delivery Fee: ${order.deliveryCharge}
     ⭕Delivery Method: ${deliveryMethod}
     ⭕Payment Method: ${paymentMethod}
     ⭕Tracking No.: ${trackInfo}

Thank you for shopping with us!

zafira.vercel.app`;
    }
    case "Dispatched":
      return `Hello ${name}, your order #${id} has been dispatched. Tracking No: ${trackInfo}. You can track your package.`;
    case "Arrived at the destination":
      return `Hello ${name}, your order #${id} has arrived at the destination hub.`;
    case "Out for delivery":
      return `Hello ${name}, your order #${id} is out for delivery today! Please be ready to receive it.`;
    case "Delivered":
      return `Hello ${name}, your order #${id} has been delivered. Thank you for shopping with ZAFIRA!`;
    default:
      return `Hello ${name}, there is an update on your order #${id}. Current Status: ${status}.`;
  }
};

const AdminPanel = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard"); // 'inventory', 'orders', 'settings'

  // Settings State
  const [codCharge, setCodCharge] = useState("");
  const [bankCharge, setBankCharge] = useState("");
  const [loadingSettings, setLoadingSettings] = useState(false);

  // Products State
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState({}); // Stores local edits for orders { id: { status, tracking } }

  // Form State
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [shippingCostCod, setShippingCostCod] = useState("");
  const [shippingCostBank, setShippingCostBank] = useState("");
  const [description, setDescription] = useState("");
  const [mainCategory, setMainCategory] = useState("Womens");
  const [category, setCategory] = useState(""); // This will be used as Secondary Category
  const [subCategory, setSubCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Structured Variants
  const [variantsList, setVariantsList] = useState([]);

  // Commitments
  const [commitments, setCommitments] = useState({
    freeShipping: false,
    shippingMinDays: 7,
    shippingMaxDays: 14,
    freeRefund: false,
    refundDays: 14,
    certifiedOriginal: false
  });

  // Allowed Payments
  const [allowedPayments, setAllowedPayments] = useState({
    cod: true,
    bank: true,
    online: true
  });

  const [instructions, setInstructions] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleAddVariant = () => {
    setVariantsList([...variantsList, { name: "", price: "", specifications: "", imageUrl: "" }]);
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variantsList];
    newVariants[index][field] = value;
    setVariantsList(newVariants);
  };

  const handleRemoveVariant = (index) => {
    const newVariants = [...variantsList];
    newVariants.splice(index, 1);
    setVariantsList(newVariants);
  };

  const handleCommitmentChange = (field, value) => {
    setCommitments(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field, value) => {
    setAllowedPayments(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/uploadImage", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();

      // Append the new URL to the existing ones
      setImageUrlInput(prev => prev ? `${prev}, ${data.url}` : data.url);
      alert("Image uploaded successfully and URL added!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading image: " + error.message);
    } finally {
      setFileUploading(false);
      // Clear the file input
      e.target.value = null;
    }
  };

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

        // Initialize local state for edits
        const initialUpdates = {};
        ordersData.forEach(order => {
            initialUpdates[order.id] = {
                status: order.status || "Pending",
                tracking: order.trackingInfo || ""
            };
        });
        setOrderUpdates(initialUpdates);

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
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'settings') {
      fetchSettings();
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
    // Remove empty ones
    const finalVariants = variantsList.filter(v => v.name.trim() !== "");

    const finalCategory = category === "Other" ? customCategory : category;

    try {
      const productData = {
        title,
        price,
        shippingCostCod: shippingCostCod || 0,
        shippingCostBank: shippingCostBank || 0,
        description,
        mainCategory,
        category: finalCategory,
        subCategory,
        instructions,
        imageUrl: imageUrl || "",
        variantsList: finalVariants,
        commitments: commitments,
        allowedPayments: allowedPayments,
        couponCode: couponCode || "",
        couponDiscount: couponDiscount || 0
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

  const fetchSettings = async () => {
    setLoadingSettings(true);
    try {
      const snapshot = await get(ref(db, 'settings/deliveryCharges'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        setCodCharge(data.cod || "");
        setBankCharge(data.bankDeposit || "");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoadingSettings(true);
    try {
      await update(ref(db, 'settings/deliveryCharges'), {
        cod: Number(codCharge),
        bankDeposit: Number(bankCharge)
      });
      alert("Delivery charges updated successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings.");
    } finally {
      setLoadingSettings(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setPrice("");
    setShippingCostCod("");
    setShippingCostBank("");
    setDescription("");
    setMainCategory("Womens");
    setCategory("");
    setSubCategory("");
    setCustomCategory("");
    setImageUrlInput("");
    setVariantsList([]);
    setCommitments({
      freeShipping: false,
      shippingMinDays: 7,
      shippingMaxDays: 14,
      freeRefund: false,
      refundDays: 14,
      certifiedOriginal: false
    });
    setAllowedPayments({
      cod: true,
      bank: true,
      online: true
    });
    setInstructions("");
    setCouponCode("");
    setCouponDiscount("");
    setEditMode(false);
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setEditMode(true);
    setEditingId(product.id);
    setTitle(product.title);
    setPrice(product.price);
    setShippingCostCod(product.shippingCostCod || "");
    setShippingCostBank(product.shippingCostBank || "");
    setDescription(product.description);

    setMainCategory(product.mainCategory || "Womens");
    setSubCategory(product.subCategory || "");

    // Check if category is one of the predefined ones
    const predefinedCategories = ["Necklace", "Bracelets", "Earrings"];
    if (predefinedCategories.includes(product.category)) {
        setCategory(product.category);
        setCustomCategory("");
    } else {
        setCategory("Other");
        setCustomCategory(product.category);
    }

    setInstructions(product.instructions || "");

    // Handle variants population (migrate old format if needed)
    if (Array.isArray(product.variantsList)) {
        setVariantsList(product.variantsList);
    } else if (Array.isArray(product.variants)) {
        // Convert old flat array to object array
        setVariantsList(product.variants.map(v => ({ name: v, price: product.price, specifications: "", imageUrl: "" })));
    } else {
        setVariantsList([]);
    }

    // Handle commitments
    if (product.commitments) {
        setCommitments(product.commitments);
    } else {
        setCommitments({
          freeShipping: false,
          shippingMinDays: 7,
          shippingMaxDays: 14,
          freeRefund: false,
          refundDays: 14,
          certifiedOriginal: false
        });
    }

    // Handle payments
    if (product.allowedPayments) {
        setAllowedPayments(product.allowedPayments);
    } else {
        setAllowedPayments({ cod: true, bank: true, online: true });
    }

    // Handle image URL population
    if (Array.isArray(product.imageUrl)) {
        setImageUrlInput(product.imageUrl.join(', '));
    } else {
        setImageUrlInput(product.imageUrl || "");
    }

    setCouponCode(product.couponCode || "");
    setCouponDiscount(product.couponDiscount || "");

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

  const handleUpdateChange = (orderId, field, value) => {
    setOrderUpdates(prev => ({
        ...prev,
        [orderId]: {
            ...prev[orderId],
            [field]: value
        }
    }));
  };

  const handleUpdateOrder = async (orderId) => {
      const updates = orderUpdates[orderId];
      if (!updates) return;

      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      if (window.confirm(`Update order #${orderId.slice(-6)} status to "${updates.status}" and notify customer?`)) {
          try {
              await update(ref(db, `orders/${orderId}`), {
                  status: updates.status,
                  trackingInfo: updates.tracking,
                  updatedAt: new Date().toISOString()
              });

              // Construct WhatsApp Message
              const message = getWhatsAppMessage(updates.status, order, updates.tracking);
              const phone = formatPhoneNumber(order.customer.phone1);
              const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

              // Open WhatsApp
              window.open(url, '_blank');

              fetchOrders();
          } catch (error) {
              console.error("Error updating order:", error);
              alert("Failed to update order.");
          }
      }
  };

  const handleDeleteOrder = async (orderId) => {
      if (window.confirm("Are you sure you want to delete this order?")) {
        try {
          await remove(ref(db, `orders/${orderId}`));
          fetchOrders();
        } catch (error) {
          console.error("Error deleting order:", error);
        }
      }
  };

  return (
    <div className="min-h-screen bg-off-white">
      <div className="bg-black text-white px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-8">
            <h1 className="text-xl font-serif">ZAFIRA Admin</h1>
            <nav className="flex gap-4">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center gap-2 text-sm uppercase tracking-widest ${activeTab === 'dashboard' ? 'text-gold-500 font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                    <BarChart2 size={16} /> Dashboard
                </button>

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
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-2 text-sm uppercase tracking-widest ${activeTab === 'settings' ? 'text-gold-500 font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                    <Settings size={16} /> Settings
                </button>
            </nav>
        </div>
        <button onClick={logout} className="flex items-center gap-2 hover:text-gold-500 transition-colors">
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {activeTab === 'dashboard' ? (
          <div>
            <h2 className="text-2xl font-serif mb-6 text-gray-900">Analytics Dashboard</h2>
            <DashboardMetrics />
          </div>
        ) : activeTab === 'inventory' ? (
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">COD Shipping (Rs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={shippingCostCod}
                      onChange={(e) => setShippingCostCod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Shipping (Rs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={shippingCostBank}
                      onChange={(e) => setShippingCostBank(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Main Category</label>
                    <select
                      required
                      value={mainCategory}
                      onChange={(e) => setMainCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none bg-white"
                    >
                        <option value="Womens">Womens</option>
                        <option value="Mens">Mens</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Category</label>
                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none bg-white"
                    >
                        <option value="">Select Category</option>
                        <option value="Necklace">Necklace</option>
                        <option value="Bracelets">Bracelets</option>
                        <option value="Earrings">Earrings</option>
                        <option value="Other">Add New...</option>
                    </select>
                  </div>
                  {category === "Other" ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Secondary Category</label>
                        <input
                          type="text"
                          required
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                          placeholder="e.g. Watches"
                        />
                      </div>
                  ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category (Optional)</label>
                        <input
                          type="text"
                          value={subCategory}
                          onChange={(e) => setSubCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                          placeholder="e.g. Shirts"
                        />
                      </div>
                  )}
                  {category === "Other" && (
                      <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category (Optional)</label>
                        <input
                          type="text"
                          value={subCategory}
                          onChange={(e) => setSubCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                          placeholder="e.g. Shirts"
                        />
                      </div>
                  )}
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
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">Variants</label>
                    <button type="button" onClick={handleAddVariant} className="text-xs text-gold-600 hover:text-gold-700 border border-gold-600 px-2 py-1">
                        + Add Variant
                    </button>
                </div>

                {variantsList.map((variant, index) => (
                    <div key={index} className="mb-4 p-4 border border-gray-200 bg-gray-50 relative">
                        <button type="button" onClick={() => handleRemoveVariant(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                            <X size={16} />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2 pr-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={variant.name}
                                    onChange={(e) => handleVariantChange(index, "name", e.target.value)}
                                    placeholder="e.g. Gold"
                                    className="w-full px-2 py-1 text-sm border border-gray-300 focus:border-gold-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Price (Rs.)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={variant.price}
                                    onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                                    placeholder="e.g. 5000"
                                    className="w-full px-2 py-1 text-sm border border-gray-300 focus:border-gold-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Specifications</label>
                                <input
                                    type="text"
                                    value={variant.specifications}
                                    onChange={(e) => handleVariantChange(index, "specifications", e.target.value)}
                                    placeholder="e.g. 18k Gold Plated, 20g"
                                    className="w-full px-2 py-1 text-sm border border-gray-300 focus:border-gold-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Variant Image URL (Optional)</label>
                                <input
                                    type="text"
                                    value={variant.imageUrl || ""}
                                    onChange={(e) => handleVariantChange(index, "imageUrl", e.target.value)}
                                    placeholder="e.g. https://example.com/image.jpg"
                                    className="w-full px-2 py-1 text-sm border border-gray-300 focus:border-gold-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                ))}
                {variantsList.length === 0 && (
                    <p className="text-xs text-gray-400 mt-1 italic">No variants added. Product will use the base price.</p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Our Commitments</h3>

                  <div className="space-y-3">
                      <div className="flex items-start">
                          <input
                              type="checkbox"
                              id="freeShipping"
                              checked={commitments.freeShipping}
                              onChange={(e) => handleCommitmentChange("freeShipping", e.target.checked)}
                              className="mt-1"
                          />
                          <div className="ml-2">
                              <label htmlFor="freeShipping" className="text-sm text-gray-800">Free Shipping</label>
                              {commitments.freeShipping && (
                                  <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-gray-500">Est. delivery:</span>
                                      <input
                                          type="number"
                                          value={commitments.shippingMinDays}
                                          onChange={(e) => handleCommitmentChange("shippingMinDays", parseInt(e.target.value) || 0)}
                                          className="w-16 px-1 py-1 text-xs border border-gray-300"
                                      />
                                      <span className="text-xs text-gray-500">to</span>
                                      <input
                                          type="number"
                                          value={commitments.shippingMaxDays}
                                          onChange={(e) => handleCommitmentChange("shippingMaxDays", parseInt(e.target.value) || 0)}
                                          className="w-16 px-1 py-1 text-xs border border-gray-300"
                                      />
                                      <span className="text-xs text-gray-500">working days</span>
                                  </div>
                              )}
                          </div>
                      </div>

                      <div className="flex items-start">
                          <input
                              type="checkbox"
                              id="freeRefund"
                              checked={commitments.freeRefund}
                              onChange={(e) => handleCommitmentChange("freeRefund", e.target.checked)}
                              className="mt-1"
                          />
                          <div className="ml-2">
                              <label htmlFor="freeRefund" className="text-sm text-gray-800">Free Refund Policy</label>
                              {commitments.freeRefund && (
                                  <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-gray-500">Refund if item not delivered in</span>
                                      <input
                                          type="number"
                                          value={commitments.refundDays}
                                          onChange={(e) => handleCommitmentChange("refundDays", parseInt(e.target.value) || 0)}
                                          className="w-16 px-1 py-1 text-xs border border-gray-300"
                                      />
                                      <span className="text-xs text-gray-500">days</span>
                                  </div>
                              )}
                          </div>
                      </div>

                      <div className="flex items-center">
                          <input
                              type="checkbox"
                              id="certifiedOriginal"
                              checked={commitments.certifiedOriginal}
                              onChange={(e) => handleCommitmentChange("certifiedOriginal", e.target.checked)}
                          />
                          <label htmlFor="certifiedOriginal" className="ml-2 text-sm text-gray-800">Certified Original Items</label>
                      </div>
                  </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Allowed Payment Methods</h3>
                  <div className="flex flex-wrap gap-4">
                      <label className="flex items-center">
                          <input
                              type="checkbox"
                              checked={allowedPayments.cod}
                              onChange={(e) => handlePaymentChange("cod", e.target.checked)}
                          />
                          <span className="ml-2 text-sm text-gray-800">Cash on Delivery</span>
                      </label>
                      <label className="flex items-center">
                          <input
                              type="checkbox"
                              checked={allowedPayments.bank}
                              onChange={(e) => handlePaymentChange("bank", e.target.checked)}
                          />
                          <span className="ml-2 text-sm text-gray-800">Bank Deposit</span>
                      </label>
                      <label className="flex items-center">
                          <input
                              type="checkbox"
                              checked={allowedPayments.online}
                              onChange={(e) => handlePaymentChange("online", e.target.checked)}
                          />
                          <span className="ml-2 text-sm text-gray-800">Online Payments</span>
                      </label>
                  </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>

                {/* File Upload Option */}
                <div className="mb-3 p-4 border border-dashed border-gray-300 rounded-md bg-gray-50 flex flex-col items-center justify-center">
                    <UploadCloud className="text-gray-400 mb-2" size={24} />
                    <label className="cursor-pointer bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-sm shadow-sm transition-colors mb-2">
                        {fileUploading ? "Uploading to Cloud..." : "Upload Image to Cloud Storage"}
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={fileUploading}
                        />
                    </label>
                    <p className="text-xs text-gray-500 text-center">
                        Upload an image directly from your computer.<br/>
                        The URL will be automatically added below.
                    </p>
                </div>

                <div className="flex items-center mb-2">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="px-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">OR manually enter URLs</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <textarea
                  rows="3"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Enter direct image URLs here, separated by commas for multiple images."
                  className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none text-sm font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">Direct links will be used to display the image. Comma separate for slider.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code (Optional)</label>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="e.g. SAVE10"
                      className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount (Rs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={couponDiscount}
                      onChange={(e) => setCouponDiscount(e.target.value)}
                      placeholder="e.g. 100"
                      className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                    />
                  </div>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category (Main/Sec/Sub)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipping (COD / Bank)</th>
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
                                                {product.mainCategory || "Womens"} &gt; {product.category} {product.subCategory ? `> ${product.subCategory}` : ''}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            Rs. {product.price}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            Rs. {product.shippingCostCod || 0} / Rs. {product.shippingCostBank || 0}
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
      ) : activeTab === 'orders' ? (
            // Orders View
            <div className="bg-white p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-serif mb-6 border-b pb-2">Orders ({orders.length})</h2>
                {loadingOrders ? (
                    <p className="text-center text-gray-500">Loading orders...</p>
                ) : orders.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No orders found.</p>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const updates = orderUpdates[order.id] || { status: order.status, tracking: order.trackingInfo || "" };

                            return (
                            <div key={order.id} className="border border-gray-200 p-6 rounded-sm">
                                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4 pb-4 border-b border-gray-100">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-serif text-lg font-bold">Order #{order.id.slice(-6)}</h3>
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                                                order.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Shipped' || order.status === 'Dispatched' ? 'bg-blue-100 text-blue-800' :
                                                order.status === 'Delivered' ? 'bg-gray-800 text-white' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-2 items-end">
                                        <button
                                            onClick={() => handleDeleteOrder(order.id)}
                                            className="px-3 py-2 text-red-600 hover:text-red-800 text-xs uppercase tracking-widest flex items-center gap-1"
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
                                                href={`https://wa.me/${formatPhoneNumber(order.customer.phone1)}?text=${encodeURIComponent(
                                                  `Hello ${order.customer.name}, regarding your order #${order.id.slice(-6)} on ZAFIRA.`
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

                                            {order.trackingInfo && (
                                                <div className="mt-2 text-blue-600">
                                                    <span className="font-medium">Current Tracking:</span> {order.trackingInfo}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Management & Items */}
                                    <div>
                                        <div className="bg-gray-50 p-4 border border-gray-200 mb-4 rounded-sm">
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Update Status & Notify</h4>

                                            <div className="grid grid-cols-1 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                                                    <select
                                                        value={updates.status}
                                                        onChange={(e) => handleUpdateChange(order.id, 'status', e.target.value)}
                                                        className="w-full text-sm border-gray-300 rounded-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 p-2 border"
                                                    >
                                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Tracking No.</label>
                                                    <input
                                                        type="text"
                                                        value={updates.tracking}
                                                        onChange={(e) => handleUpdateChange(order.id, 'tracking', e.target.value)}
                                                        placeholder="Enter tracking info"
                                                        className="w-full text-sm border-gray-300 rounded-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 p-2 border"
                                                    />
                                                </div>

                                                <button
                                                    onClick={() => handleUpdateOrder(order.id)}
                                                    className="w-full mt-2 bg-green-600 text-white py-2 px-4 rounded-sm hover:bg-green-700 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                                                >
                                                    <MessageCircle size={16} /> Update & Open WhatsApp
                                                </button>
                                            </div>
                                        </div>

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
                                            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base border-gray-100 pt-1">
                                                <span>Total</span>
                                                <span>Rs. {parseFloat(order.totalAmount).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )})}
                    </div>
                )}
            </div>
      ) : activeTab === 'settings' ? (
        // Settings View
        <div className="bg-white p-6 shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <h2 className="text-xl font-serif mb-6 border-b pb-2">Delivery Charges</h2>
            <form onSubmit={handleSaveSettings} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cash on Delivery Charge (Rs.)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={codCharge}
                      onChange={(e) => setCodCharge(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Deposit Charge (Rs.)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={bankCharge}
                      onChange={(e) => setBankCharge(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loadingSettings}
                    className="w-full bg-black text-white py-3 uppercase tracking-widest hover:bg-gold-600 transition-colors disabled:opacity-50"
                >
                    {loadingSettings ? 'Saving...' : 'Update Charges'}
                </button>
            </form>
        </div>
      ) : null}
    </div>
    </div>
  );
};

export default AdminPanel;
