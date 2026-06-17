import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { db } from "../firebase";
import { ref, push, set, get } from "firebase/database";
import { Upload, ShieldAlert, ArrowLeft } from "lucide-react";

const WarrantyClaim = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: currentUser?.displayName || "",
    mobile: "",
    cause: "",
    orderType: "online", // 'online' or 'whatsapp'
    selectedOrderId: "",
    manualOrderRef: ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [imageBase64, setImageBase64] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/warranty-claim' } });
      return;
    }

    const fetchOrders = async () => {
      try {
        const ordersRef = ref(db, 'orders');
        const snapshot = await get(ordersRef);
        if (snapshot.exists()) {
          const ordersData = snapshot.val();
          const ordersList = Object.keys(ordersData)
            .map(key => ({ id: key, ...ordersData[key] }))
            .filter(order => order.userId === currentUser.uid || (currentUser.email && order.customer && order.customer.email === currentUser.email))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setOrders(ordersList);
        }
      } catch (err) {
        console.error("Failed to fetch orders for warranty", err);
      }
    };
    fetchOrders();
  }, [currentUser, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.orderType === "online" && !formData.selectedOrderId) {
      setError("Please select a past order.");
      return;
    }
    if (formData.orderType === "whatsapp" && !formData.manualOrderRef) {
      setError("Please provide details about your WhatsApp order.");
      return;
    }
    if (!imageBase64) {
      setError("Please upload an image of the product.");
      return;
    }

    setLoading(true);

    try {
      const claimRef = push(ref(db, 'warrantyClaims'));

      let itemDetails = "Manual WhatsApp Order";
      if (formData.orderType === "online") {
         const order = orders.find(o => o.id === formData.selectedOrderId);
         if (order && order.items) {
             itemDetails = order.items.map(i => i.title).join(", ");
         }
      }

      await set(claimRef, {
        userId: currentUser.uid,
        userEmail: currentUser.email || "No Email",
        name: formData.name,
        mobile: formData.mobile,
        cause: formData.cause,
        orderType: formData.orderType,
        orderId: formData.orderType === "online" ? formData.selectedOrderId : formData.manualOrderRef,
        itemDetails: itemDetails,
        imageUrl: imageBase64, // Storing base64 directly for simplicity in this implementation
        status: "Pending",
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
      setFormData({
        name: currentUser?.displayName || "",
        mobile: "",
        cause: "",
        orderType: "online",
        selectedOrderId: "",
        manualOrderRef: ""
      });
      setImageFile(null);
      setImageBase64("");

    } catch (err) {
      console.error("Failed to submit claim", err);
      setError("Failed to submit claim. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-off-white flex flex-col">
      <Navbar />
      <div className="flex-grow max-w-2xl mx-auto w-full px-4 py-8 md:py-12">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-6 uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back to Profile
        </button>

        <div className="bg-white p-6 md:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <ShieldAlert size={28} className="text-gold-600" />
            <h1 className="font-serif text-2xl md:text-3xl text-gray-900 tracking-tight">Claim Warranty</h1>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert size={32} />
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-2">Claim Submitted Successfully</h3>
              <p className="text-gray-500 text-sm mb-6">Our team will review your claim and update you shortly. You can check the status in your Profile.</p>
              <button
                onClick={() => navigate('/profile')}
                className="bg-black text-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-gold-600 transition-colors"
              >
                Go to Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Where did you order from?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.orderType === "online"}
                      onChange={() => setFormData({...formData, orderType: "online"})}
                      className="text-gold-600 focus:ring-gold-500"
                    />
                    <span className="text-sm text-gray-700">Online Store</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.orderType === "whatsapp"}
                      onChange={() => setFormData({...formData, orderType: "whatsapp"})}
                      className="text-gold-600 focus:ring-gold-500"
                    />
                    <span className="text-sm text-gray-700">WhatsApp / Direct</span>
                  </label>
                </div>
              </div>

              {formData.orderType === "online" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Order</label>
                  <select
                    required
                    value={formData.selectedOrderId}
                    onChange={(e) => setFormData({...formData, selectedOrderId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none bg-white"
                  >
                    <option value="">-- Choose an Order --</option>
                    {orders.map(order => (
                      <option key={order.id} value={order.id}>
                        {new Date(order.createdAt).toLocaleDateString()} - Rs. {order.totalAmount} ({order.items?.length || 0} items)
                      </option>
                    ))}
                  </select>
                  {orders.length === 0 && <p className="text-xs text-gray-500 mt-1">No online orders found.</p>}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Reference or Details</label>
                  <textarea
                    required
                    rows="2"
                    placeholder="Enter order date, item purchased, or reference..."
                    value={formData.manualOrderRef}
                    onChange={(e) => setFormData({...formData, manualOrderRef: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cause of Claim</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe the issue with the product..."
                  value={formData.cause}
                  onChange={(e) => setFormData({...formData, cause: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image of Product</label>
                <div className="border-2 border-dashed border-gray-300 p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {imageBase64 ? (
                    <div className="flex flex-col items-center">
                      <img src={imageBase64} alt="Preview" className="h-32 object-contain mb-2" />
                      <p className="text-xs text-gold-600">Click to change image</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-500">
                      <Upload size={24} className="mb-2" />
                      <p className="text-sm">Click to upload or drag and drop</p>
                      <p className="text-xs mt-1">PNG, JPG, JPEG</p>
                    </div>
                  )}
                </div>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 p-2">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 uppercase tracking-widest hover:bg-gold-600 transition-colors disabled:opacity-50 mt-4"
              >
                {loading ? 'Submitting...' : 'Submit Claim'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarrantyClaim;
