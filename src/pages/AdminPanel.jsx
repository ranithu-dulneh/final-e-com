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
  "Delivered",
  "Returned"
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
  const [activeTab, setActiveTab] = useState("dashboard"); // 'inventory', 'add-product', 'orders', 'settings', 'offers', 'categories'

  // Settings State
  const [codCharge, setCodCharge] = useState("");
  const [bankCharge, setBankCharge] = useState("");
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recSearchTerm, setRecSearchTerm] = useState("");
  const [recSearchResults, setRecSearchResults] = useState([]);

  // Offers State
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("");
  const [seasonalOfferActive, setSeasonalOfferActive] = useState(false);
  const [seasonalOfferTitle, setSeasonalOfferTitle] = useState("");
  const [seasonalOfferDescription, setSeasonalOfferDescription] = useState("");
  const [loadingOffers, setLoadingOffers] = useState(false);

  const [marqueeActive, setMarqueeActive] = useState(false);
  const [marqueeShowFreeShipping, setMarqueeShowFreeShipping] = useState(false);
  const [marqueeShowSeasonal, setMarqueeShowSeasonal] = useState(false);
  const [marqueeCustomText, setMarqueeCustomText] = useState("");

  const [popupActive, setPopupActive] = useState(false);
  const [popupHeading, setPopupHeading] = useState("");
  const [popupDescription, setPopupDescription] = useState("");
  const [popupImageUrl, setPopupImageUrl] = useState("");
  const [popupTargetUrl, setPopupTargetUrl] = useState("");
  const [popupTargetPage, setPopupTargetPage] = useState("All");

  // Categories State
  const [categoriesList, setCategoriesList] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatImage, setNewCatImage] = useState("");
  const [editingCatId, setEditingCatId] = useState(null);

  // Products State
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState({}); // Stores local edits for orders { id: { status, tracking } }
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isWomensCollection, setIsWomensCollection] = useState(false);
  const [isMensCollection, setIsMensCollection] = useState(false);
  const [shippingCostCod, setShippingCostCod] = useState("");
  const [shippingCostBank, setShippingCostBank] = useState("");
  const [estimatedShippingDate, setEstimatedShippingDate] = useState("");
  const [description, setDescription] = useState("");
  const [mainCategory, setMainCategory] = useState("Womens");
  const [category, setCategory] = useState(""); // This will be used as Secondary Category
  const [subCategory, setSubCategory] = useState("");
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
    } else if (activeTab === 'offers') {
      fetchOffers();
    } else if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'add-product') {
      fetchCategories();
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
    if (!title || !price || !category || !estimatedShippingDate) {
        alert("Please fill all mandatory fields including Estimated Shipping Date.");
        return;
    }

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

    const finalCategory = category;

    try {
      const productData = {
        title,
        price,
        originalPrice: originalPrice || "",
        isNewArrival,
        isBestSeller,
        isWomensCollection,
        isMensCollection,
        shippingCostCod: shippingCostCod || 0,
        shippingCostBank: shippingCostBank || 0,
        estimatedShippingDate,
        description,
        mainCategory,
        category: finalCategory.trim(),
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

      const recSnapshot = await get(ref(db, 'settings/recommendedProducts'));
      if (recSnapshot.exists()) {
        setRecommendedProducts(recSnapshot.val() || []);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const snapshot = await get(ref(db, 'settings/categories'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const cats = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setCategoriesList(cats);
      } else {
        setCategoriesList([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;

    setLoadingCategories(true);
    try {
      if (editingCatId) {
        await update(ref(db, `settings/categories/${editingCatId}`), {
          name: newCatName,
          imageUrl: newCatImage
        });
      } else {
        const newRef = push(ref(db, 'settings/categories'));
        await set(newRef, {
          name: newCatName,
          imageUrl: newCatImage
        });
      }
      setNewCatName("");
      setNewCatImage("");
      setEditingCatId(null);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await remove(ref(db, `settings/categories/${id}`));
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  const handleEditCategory = (cat) => {
    setEditingCatId(cat.id);
    setNewCatName(cat.name);
    setNewCatImage(cat.imageUrl || "");
  };

  const fetchOffers = async () => {
    setLoadingOffers(true);
    try {
      const snapshot = await get(ref(db, 'settings/offers'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        setFreeShippingThreshold(data.freeShippingThreshold || "");
        setSeasonalOfferActive(data.seasonalOfferActive || false);
        setSeasonalOfferTitle(data.seasonalOfferTitle || "");
        setSeasonalOfferDescription(data.seasonalOfferDescription || "");

        setMarqueeActive(data.marqueeActive || false);
        setMarqueeShowFreeShipping(data.marqueeShowFreeShipping || false);
        setMarqueeShowSeasonal(data.marqueeShowSeasonal || false);
        setMarqueeCustomText(data.marqueeCustomText || "");

        setPopupActive(data.popupActive || false);
        setPopupHeading(data.popupHeading || "");
        setPopupDescription(data.popupDescription || "");
        setPopupImageUrl(data.popupImageUrl || "");
        setPopupTargetUrl(data.popupTargetUrl || "");
        setPopupTargetPage(data.popupTargetPage || "All");
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoadingOffers(false);
    }
  };

  const handleSaveOffers = async (e) => {
    e.preventDefault();
    setLoadingOffers(true);
    try {
      await update(ref(db, 'settings/offers'), {
        freeShippingThreshold: Number(freeShippingThreshold) || 0,
        seasonalOfferActive,
        seasonalOfferTitle,
        seasonalOfferDescription,
        marqueeActive,
        marqueeShowFreeShipping,
        marqueeShowSeasonal,
        marqueeCustomText,
        popupActive,
        popupHeading,
        popupDescription,
        popupImageUrl,
        popupTargetUrl,
        popupTargetPage
      });
      alert("Offers & Popup updated successfully!");
    } catch (error) {
      console.error("Error saving offers:", error);
      alert("Failed to save offers.");
    } finally {
      setLoadingOffers(false);
    }
  };

  // Search for recommended products
  useEffect(() => {
      if (recSearchTerm.trim() === "") {
          setRecSearchResults([]);
      } else {
          const query = recSearchTerm.toLowerCase();
          const results = products.filter(p =>
              p.title.toLowerCase().includes(query) &&
              !recommendedProducts.includes(p.id)
          ).slice(0, 5); // Limit to 5 results
          setRecSearchResults(results);
      }
  }, [recSearchTerm, products, recommendedProducts]);

  const handleAddRecommended = (product) => {
      if (recommendedProducts.length >= 6) {
          alert("Maximum 6 recommended products allowed.");
          return;
      }
      setRecommendedProducts([...recommendedProducts, product.id]);
      setRecSearchTerm("");
  };

  const handleRemoveRecommended = (idToRemove) => {
      setRecommendedProducts(recommendedProducts.filter(id => id !== idToRemove));
  };

  const handleSaveRecommended = async () => {
      try {
          await set(ref(db, 'settings/recommendedProducts'), recommendedProducts);
          alert("Recommended products saved!");
      } catch (err) {
          console.error(err);
          alert("Failed to save recommended products.");
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
    setOriginalPrice("");
    setIsNewArrival(false);
    setIsBestSeller(false);
    setShippingCostCod("");
    setShippingCostBank("");
    setEstimatedShippingDate("");
    setDescription("");
    setMainCategory("Womens");
    setCategory("");
    setSubCategory("");
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
    setActiveTab('add-product');
    setEditMode(true);
    setEditingId(product.id);
    setTitle(product.title);
    setPrice(product.price);
    setOriginalPrice(product.originalPrice || "");
    setIsNewArrival(product.isNewArrival || false);
    setIsBestSeller(product.isBestSeller || false);
    setIsWomensCollection(product.isWomensCollection || false);
    setIsMensCollection(product.isMensCollection || false);
    setShippingCostCod(product.shippingCostCod || "");
    setShippingCostBank(product.shippingCostBank || "");
    setEstimatedShippingDate(product.estimatedShippingDate || "");
    setDescription(product.description);

    setMainCategory(product.mainCategory || "Womens");
    setSubCategory(product.subCategory || "");
    setCategory(product.category || "");

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
                    onClick={() => { setActiveTab('add-product'); resetForm(); }}
                    className={`flex items-center gap-2 text-sm uppercase tracking-widest ${activeTab === 'add-product' ? 'text-gold-500 font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                    <Package size={16} /> Add Product
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
                <button
                    onClick={() => setActiveTab('offers')}
                    className={`flex items-center gap-2 text-sm uppercase tracking-widest ${activeTab === 'offers' ? 'text-gold-500 font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                    <Check size={16} /> Offers
                </button>
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`flex items-center gap-2 text-sm uppercase tracking-widest ${activeTab === 'categories' ? 'text-gold-500 font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                    <Package size={16} /> Categories
                </button>
                <button
                    onClick={() => setActiveTab('home-settings')}
                    className={`flex items-center gap-2 text-sm uppercase tracking-widest ${activeTab === 'home-settings' ? 'text-gold-500 font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                    <Settings size={16} /> Home Page Settings
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
        ) : activeTab === 'add-product' ? (
          <div className="max-w-3xl mx-auto">
          <div className="bg-white p-6 shadow-sm border border-gray-100">
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

              <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isNewArrival} onChange={e => setIsNewArrival(e.target.checked)} className="rounded-sm border-gray-300 text-gold-500 focus:ring-gold-500"/>
                      <span className="text-sm font-medium text-gray-700">Mark as New Arrival</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isBestSeller} onChange={e => setIsBestSeller(e.target.checked)} className="rounded-sm border-gray-300 text-gold-500 focus:ring-gold-500"/>
                      <span className="text-sm font-medium text-gray-700">Mark as Best Seller</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isWomensCollection} onChange={e => setIsWomensCollection(e.target.checked)} className="rounded-sm border-gray-300 text-gold-500 focus:ring-gold-500"/>
                      <span className="text-sm font-medium text-gray-700">Mark as Womens Collection</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isMensCollection} onChange={e => setIsMensCollection(e.target.checked)} className="rounded-sm border-gray-300 text-gold-500 focus:ring-gold-500"/>
                      <span className="text-sm font-medium text-gray-700">Mark as Mens Collection</span>
                  </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Original Price / Striked Amount (Rs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Shipping Date</label>
                    <input
                      type="text"
                      required
                      value={estimatedShippingDate}
                      onChange={(e) => setEstimatedShippingDate(e.target.value)}
                      placeholder="e.g. 7-14 Days"
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
                        {categoriesList.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                  </div>
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
        ) : activeTab === 'inventory' ? (
          <div>
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
      ) : activeTab === 'orders' ? (
            // Orders View
            <div className="bg-white p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
                    <h2 className="text-xl font-serif">Orders ({orders.length})</h2>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={orderSearchTerm}
                                onChange={(e) => setOrderSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-300 rounded-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none text-sm w-full"
                            />
                        </div>
                        <select
                            value={orderStatusFilter}
                            onChange={(e) => setOrderStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none text-sm bg-white"
                        >
                            <option value="All">All Statuses</option>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                {loadingOrders ? (
                    <p className="text-center text-gray-500">Loading orders...</p>
                ) : orders.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No orders found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.filter(order => {
                                    const matchesSearch = orderSearchTerm === "" ||
                                        order.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                                        order.customer.phone1.includes(orderSearchTerm) ||
                                        order.customer.name.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                                        (order.trackingInfo && order.trackingInfo.toLowerCase().includes(orderSearchTerm.toLowerCase()));
                                    const matchesStatus = orderStatusFilter === "All" || order.status === orderStatusFilter;
                                    return matchesSearch && matchesStatus;
                                }).map((order) => {
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{order.id.slice(-6)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {order.customer.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {order.customer.city}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {order.customer.phone1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                                                    order.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'Shipped' || order.status === 'Dispatched' ? 'bg-blue-100 text-blue-800' :
                                                    order.status === 'Delivered' ? 'bg-gray-800 text-white' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                                                    className="text-indigo-600 hover:text-indigo-900 ml-4"
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }}
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

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-md shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
                            <h3 className="font-serif text-xl font-bold">Order #{selectedOrder.id.slice(-6)} Details</h3>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Customer Info */}
                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3 border-b pb-2">Customer Details</h4>
                                    <div className="text-sm text-gray-800 space-y-2">
                                        <p><span className="font-medium">Name:</span> {selectedOrder.customer.name}</p>
                                        <p><span className="font-medium">Email:</span> {selectedOrder.customer.email || 'N/A'}</p>
                                        <p><span className="font-medium">Phone (WA):</span>
                                            <a
                                            href={`https://wa.me/${formatPhoneNumber(selectedOrder.customer.phone1)}?text=${encodeURIComponent(
                                                `Hello ${selectedOrder.customer.name}, regarding your order #${selectedOrder.id.slice(-6)} on ZAFIRA.`
                                            )}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-green-600 hover:underline ml-1"
                                            >
                                            {selectedOrder.customer.phone1} (Chat)
                                            </a>
                                        </p>
                                        {selectedOrder.customer.phone2 && <p><span className="font-medium">Phone 2:</span> {selectedOrder.customer.phone2}</p>}
                                        <p><span className="font-medium">Address:</span> {selectedOrder.customer.address}, {selectedOrder.customer.city}</p>
                                        <p><span className="font-medium">Payment:</span> {selectedOrder.paymentMethod.toUpperCase()}</p>
                                        <p><span className="font-medium">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>

                                        {selectedOrder.trackingInfo && (
                                            <div className="mt-2 text-blue-600 bg-blue-50 p-2 rounded-sm border border-blue-100">
                                                <span className="font-medium">Current Tracking:</span> {selectedOrder.trackingInfo}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Order Management & Items */}
                                <div>
                                    <div className="bg-gray-50 p-4 border border-gray-200 mb-6 rounded-sm">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Update Status & Notify</h4>

                                        <div className="grid grid-cols-1 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                                                <select
                                                    value={orderUpdates[selectedOrder.id]?.status || selectedOrder.status}
                                                    onChange={(e) => handleUpdateChange(selectedOrder.id, 'status', e.target.value)}
                                                    className="w-full text-sm border-gray-300 rounded-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 p-2 border bg-white"
                                                >
                                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Tracking No.</label>
                                                <input
                                                    type="text"
                                                    value={orderUpdates[selectedOrder.id]?.tracking !== undefined ? orderUpdates[selectedOrder.id].tracking : (selectedOrder.trackingInfo || "")}
                                                    onChange={(e) => handleUpdateChange(selectedOrder.id, 'tracking', e.target.value)}
                                                    placeholder="Enter tracking info"
                                                    className="w-full text-sm border-gray-300 rounded-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 p-2 border"
                                                />
                                            </div>

                                            <button
                                                onClick={() => {
                                                    handleUpdateOrder(selectedOrder.id);
                                                    // optionally update local selectedOrder state to reflect change
                                                    setSelectedOrder({
                                                        ...selectedOrder,
                                                        status: orderUpdates[selectedOrder.id]?.status || selectedOrder.status,
                                                        trackingInfo: orderUpdates[selectedOrder.id]?.tracking !== undefined ? orderUpdates[selectedOrder.id].tracking : selectedOrder.trackingInfo
                                                    });
                                                }}
                                                className="w-full mt-2 bg-green-600 text-white py-2 px-4 rounded-sm hover:bg-green-700 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                                            >
                                                <MessageCircle size={16} /> Update & Open WhatsApp
                                            </button>
                                        </div>
                                    </div>

                                    <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3 border-b pb-2">Items</h4>
                                    <div className="space-y-3">
                                        {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-start text-sm bg-gray-50 p-2 rounded-sm border border-gray-100">
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.title}</p>
                                                    <p className="text-gray-500 text-xs mt-1">Variant: {item.selectedVariant || 'Default'} | Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-medium text-gray-900">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        ))}
                                        <div className="border-t pt-3 mt-4 flex justify-between font-bold text-lg border-gray-200">
                                            <span>Total</span>
                                            <span>Rs. {parseFloat(selectedOrder.totalAmount).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
          </div>
      ) : activeTab === 'offers' ? (
        // Offers View
        <div className="bg-white p-6 shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <h2 className="text-xl font-serif mb-6 border-b pb-2">Manage Offers</h2>
            <form onSubmit={handleSaveOffers} className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Free Shipping Offer</h3>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping for Orders Above (Rs.)</label>
                    <input
                      type="number"
                      min="0"
                      value={freeShippingThreshold}
                      onChange={(e) => setFreeShippingThreshold(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank or 0 to disable.</p>
                    <div className="mt-2 flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="marqueeShowFreeShipping"
                            checked={marqueeShowFreeShipping}
                            onChange={(e) => setMarqueeShowFreeShipping(e.target.checked)}
                            className="rounded-sm border-gray-300 text-gold-500 focus:ring-gold-500"
                        />
                        <label htmlFor="marqueeShowFreeShipping" className="text-sm text-gray-700">Show in Marquee</label>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-800">Seasonal Offer</h3>
                        <label className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={seasonalOfferActive}
                                    onChange={(e) => setSeasonalOfferActive(e.target.checked)}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${seasonalOfferActive ? 'bg-gold-500' : 'bg-gray-300'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${seasonalOfferActive ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                            <span className="ml-3 text-sm text-gray-700 font-medium">Active</span>
                        </label>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Offer Title</label>
                            <input
                              type="text"
                              value={seasonalOfferTitle}
                              onChange={(e) => setSeasonalOfferTitle(e.target.value)}
                              placeholder="e.g. Summer Sale! 20% Off"
                              className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Offer Description</label>
                            <textarea
                              rows="3"
                              value={seasonalOfferDescription}
                              onChange={(e) => setSeasonalOfferDescription(e.target.value)}
                              placeholder="e.g. Use code SUMMER20 at checkout."
                              className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="marqueeShowSeasonal"
                                checked={marqueeShowSeasonal}
                                onChange={(e) => setMarqueeShowSeasonal(e.target.checked)}
                                className="rounded-sm border-gray-300 text-gold-500 focus:ring-gold-500"
                            />
                            <label htmlFor="marqueeShowSeasonal" className="text-sm text-gray-700">Show in Marquee</label>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-800">Announcement Marquee</h3>
                        <label className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={marqueeActive}
                                    onChange={(e) => setMarqueeActive(e.target.checked)}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${marqueeActive ? 'bg-gold-500' : 'bg-gray-300'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${marqueeActive ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                            <span className="ml-3 text-sm text-gray-700 font-medium">Active</span>
                        </label>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Marquee Text</label>
                            <input
                              type="text"
                              value={marqueeCustomText}
                              onChange={(e) => setMarqueeCustomText(e.target.value)}
                              placeholder="e.g. Welcome to our new store! Check out the latest arrivals."
                              className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-800">Promotional Popup Ad</h3>
                        <label className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={popupActive}
                                    onChange={(e) => setPopupActive(e.target.checked)}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${popupActive ? 'bg-gold-500' : 'bg-gray-300'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${popupActive ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                            <span className="ml-3 text-sm text-gray-700 font-medium">Active</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
                            <input
                              type="text"
                              value={popupHeading}
                              onChange={(e) => setPopupHeading(e.target.value)}
                              placeholder="e.g. New Collection Arrived"
                              className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                            <input
                              type="text"
                              value={popupImageUrl}
                              onChange={(e) => setPopupImageUrl(e.target.value)}
                              placeholder="e.g. https://example.com/image.jpg"
                              className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              rows="2"
                              value={popupDescription}
                              onChange={(e) => setPopupDescription(e.target.value)}
                              placeholder="e.g. Get early access to our limited collection."
                              className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target URL (On Click)</label>
                            <input
                              type="text"
                              value={popupTargetUrl}
                              onChange={(e) => setPopupTargetUrl(e.target.value)}
                              placeholder="e.g. /shop, /product/123"
                              className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Show on Page</label>
                            <select
                                value={popupTargetPage}
                                onChange={(e) => setPopupTargetPage(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none bg-white"
                            >
                                <option value="All">All Pages</option>
                                <option value="/">Home Page (/)</option>
                                <option value="/shop">Shop Page (/shop)</option>
                                <option value="/about">About Page (/about)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loadingOffers}
                    className="w-full bg-black text-white py-3 uppercase tracking-widest hover:bg-gold-600 transition-colors disabled:opacity-50"
                >
                    {loadingOffers ? 'Saving...' : 'Save Offers & Popup'}
                </button>
            </form>
        </div>
      ) : activeTab === 'categories' ? (
        // Categories View
        <div className="bg-white p-6 shadow-sm border border-gray-100 max-w-4xl mx-auto">
            <h2 className="text-xl font-serif mb-6 border-b pb-2">Manage Categories</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form */}
                <div className="md:col-span-1">
                    <form onSubmit={handleSaveCategory} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                            <input
                              type="text"
                              required
                              value={newCatName}
                              onChange={(e) => setNewCatName(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                            <input
                              type="text"
                              value={newCatImage}
                              onChange={(e) => setNewCatImage(e.target.value)}
                              placeholder="For future display"
                              className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                          <button
                              type="submit"
                              disabled={loadingCategories}
                              className="flex-1 bg-black text-white py-2 text-sm uppercase tracking-widest hover:bg-gold-600 transition-colors disabled:opacity-50"
                          >
                              {editingCatId ? 'Update' : 'Add'}
                          </button>
                          {editingCatId && (
                              <button
                                  type="button"
                                  onClick={() => { setEditingCatId(null); setNewCatName(""); setNewCatImage(""); }}
                                  className="px-4 bg-gray-200 text-gray-700 py-2 text-sm uppercase tracking-widest hover:bg-gray-300 transition-colors"
                              >
                                  Cancel
                              </button>
                          )}
                        </div>
                    </form>
                </div>

                {/* List */}
                <div className="md:col-span-2">
                    {loadingCategories ? (
                        <p className="text-gray-500">Loading categories...</p>
                    ) : categoriesList.length === 0 ? (
                        <p className="text-gray-500">No categories found.</p>
                    ) : (
                        <ul className="space-y-3">
                            {categoriesList.map(cat => (
                                <li key={cat.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-sm">
                                    <div className="flex items-center gap-3">
                                        {cat.imageUrl ? (
                                            <img src={cat.imageUrl} alt="" className="w-10 h-10 object-cover rounded-sm" />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-xs text-gray-400 rounded-sm">No Img</div>
                                        )}
                                        <span className="font-medium text-gray-800">{cat.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleEditCategory(cat)} className="p-1 text-blue-600 hover:text-blue-800">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-1 text-red-600 hover:text-red-800">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
      ) : activeTab === 'home-settings' ? (
        // Home Page Settings View
        <div className="bg-white p-6 shadow-sm border border-gray-100 max-w-4xl mx-auto">
             <h2 className="text-xl font-serif mb-6 border-b pb-2">Home Page Settings</h2>
             <p className="text-sm text-gray-500 mb-6">Manage products displayed in the "New Arrivals" and "Best Sellers" sections on the home page. You can mark products via the "Add Product" form.</p>

             <div className="space-y-8">
                 <div>
                     <h3 className="text-lg font-medium text-gray-800 mb-4 border-l-2 border-gold-500 pl-2">New Arrivals</h3>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {products.filter(p => p.isNewArrival).map(prod => (
                             <div key={prod.id} className="border border-gray-200 p-2 rounded flex flex-col items-center text-center">
                                 {prod.imageUrl && prod.imageUrl[0] ? (
                                    <img src={prod.imageUrl[0]} alt="" className="w-16 h-16 object-cover rounded-sm mb-2" />
                                ) : (
                                    <div className="w-16 h-16 bg-gray-200 rounded-sm mb-2"></div>
                                )}
                                 <p className="text-xs font-medium line-clamp-1">{prod.title}</p>
                                 <button onClick={async () => await update(ref(db, `products/${prod.id}`), { isNewArrival: false, updatedAt: new Date().toISOString() })} className="mt-2 text-[10px] uppercase tracking-widest text-red-500 hover:text-red-700">Remove</button>
                             </div>
                         ))}
                         {products.filter(p => p.isNewArrival).length === 0 && <p className="text-sm text-gray-500 col-span-full">No products marked as New Arrival.</p>}
                     </div>
                 </div>

                 <div>
                     <h3 className="text-lg font-medium text-gray-800 mb-4 border-l-2 border-gold-500 pl-2">Best Sellers</h3>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {products.filter(p => p.isBestSeller).map(prod => (
                             <div key={prod.id} className="border border-gray-200 p-2 rounded flex flex-col items-center text-center">
                                 {prod.imageUrl && prod.imageUrl[0] ? (
                                    <img src={prod.imageUrl[0]} alt="" className="w-16 h-16 object-cover rounded-sm mb-2" />
                                ) : (
                                    <div className="w-16 h-16 bg-gray-200 rounded-sm mb-2"></div>
                                )}
                                 <p className="text-xs font-medium line-clamp-1">{prod.title}</p>
                                 <button onClick={async () => await update(ref(db, `products/${prod.id}`), { isBestSeller: false, updatedAt: new Date().toISOString() })} className="mt-2 text-[10px] uppercase tracking-widest text-red-500 hover:text-red-700">Remove</button>
                             </div>
                         ))}
                         {products.filter(p => p.isBestSeller).length === 0 && <p className="text-sm text-gray-500 col-span-full">No products marked as Best Seller.</p>}
                     </div>
                 </div>
             </div>
        </div>
      ) : activeTab === 'settings' ? (
        // Settings View
        <>
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

        <div className="bg-white p-6 shadow-sm border border-gray-100 max-w-2xl mx-auto mt-8">
            <h2 className="text-xl font-serif mb-6 border-b pb-2">Recommended Products (Max 6)</h2>

            <div className="mb-6 relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search products to add..."
                        value={recSearchTerm}
                        onChange={(e) => setRecSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none text-sm"
                    />
                </div>
                {recSearchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 shadow-lg rounded-sm max-h-60 overflow-y-auto">
                        {recSearchResults.map(prod => (
                            <div
                                key={prod.id}
                                onClick={() => handleAddRecommended(prod)}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                            >
                                {prod.imageUrl && prod.imageUrl[0] ? (
                                    <img src={prod.imageUrl[0]} alt="" className="w-10 h-10 object-cover rounded-sm" />
                                ) : (
                                    <div className="w-10 h-10 bg-gray-200 rounded-sm"></div>
                                )}
                                <div>
                                    <p className="text-sm font-medium">{prod.title}</p>
                                    <p className="text-xs text-gray-500">Rs. {prod.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-3 mb-6">
                {recommendedProducts.map(recId => {
                    const prod = products.find(p => p.id === recId);
                    if (!prod) return null;
                    return (
                        <div key={recId} className="flex items-center justify-between p-3 border border-gray-200 rounded-sm">
                            <div className="flex items-center gap-3">
                                {prod.imageUrl && prod.imageUrl[0] ? (
                                    <img src={prod.imageUrl[0]} alt="" className="w-12 h-12 object-cover rounded-sm" />
                                ) : (
                                    <div className="w-12 h-12 bg-gray-200 rounded-sm"></div>
                                )}
                                <div>
                                    <p className="text-sm font-medium">{prod.title}</p>
                                    <p className="text-xs text-gray-500">{prod.category || 'No Category'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleRemoveRecommended(recId)}
                                className="text-red-500 hover:text-red-700 p-2"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    );
                })}
                {recommendedProducts.length === 0 && (
                    <p className="text-center text-gray-500 text-sm py-4">No recommended products added yet.</p>
                )}
            </div>

            <button
                onClick={handleSaveRecommended}
                className="w-full bg-black text-white py-3 uppercase tracking-widest hover:bg-gold-600 transition-colors"
            >
                Save Recommendations
            </button>
        </div>
        </>
      ) : null}
    </div>
    </div>
  );
};

export default AdminPanel;
