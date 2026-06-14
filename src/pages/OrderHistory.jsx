import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
import { Package, Truck, Calendar, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      try {
        const ordersRef = ref(db, 'orders');
        const snapshot = await get(ordersRef);

        if (snapshot.exists()) {
          const ordersData = snapshot.val();
          const ordersList = Object.keys(ordersData)
            .map(key => ({
              id: key,
              ...ordersData[key]
            }))
            .filter(order => order.userId === currentUser.uid || (currentUser.email && order.customer && order.customer.email === currentUser.email))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          setOrders(ordersList);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-off-white flex flex-col">
      <Navbar />
      <div className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-6 uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back to Profile
        </button>

        <h1 className="font-serif text-3xl md:text-4xl text-gray-900 tracking-tight mb-8">Order History</h1>

        {loading ? (
          <div className="flex items-center justify-center h-48 bg-white border border-gray-100 shadow-sm">
            <span className="text-sm text-gray-500 uppercase tracking-widest animate-pulse">Loading orders...</span>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id} className="bg-white shadow-sm border border-gray-100 overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 uppercase tracking-wider text-[10px] mr-1">Total:</span>
                      <span className="font-medium text-gold-600">Rs. {order.totalAmount?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 uppercase tracking-wider text-[10px] mr-1">Status:</span>
                      <span className="font-medium px-2 py-0.5 bg-gray-200 rounded text-xs uppercase tracking-wider">{order.status}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    ID: {order.id.slice(-8).toUpperCase()}
                  </div>
                </div>

                {/* Tracking Info (if exists) */}
                {order.trackingInfo && (
                  <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-start gap-3 text-blue-800 text-sm">
                    <Truck size={18} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Tracking Information</p>
                      <p className="text-blue-700/80">{order.trackingInfo}</p>
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="p-4 md:p-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                    <Package size={14} /> Items Purchased
                  </h4>
                  {order.items && order.items.map((item, idx) => {
                    let imageSrc = "https://placehold.co/80x80";
                    if (Array.isArray(item.imageUrl) && item.imageUrl.length > 0) {
                      imageSrc = item.imageUrl[0];
                    } else if (typeof item.imageUrl === 'string' && item.imageUrl) {
                      imageSrc = item.imageUrl.split(',')[0];
                    }

                    return (
                      <div key={idx} className="flex items-start gap-4">
                        <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-gray-100 border border-gray-200 overflow-hidden">
                          <img src={imageSrc} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <h5 className="text-sm font-medium text-gray-900 truncate">{item.title}</h5>
                          {item.selectedVariant && (
                            <p className="text-xs text-gray-500 mt-1">Variant: {item.selectedVariant}</p>
                          )}
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            <div className="flex items-center gap-4">
                              <p className="text-sm font-medium text-gray-900">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                              {order.status === 'Delivered' && item.id && (
                                <button
                                  onClick={() => navigate(`/product/${item.id}`)}
                                  className="text-[10px] uppercase tracking-widest text-gold-600 hover:text-gold-700 border border-gold-600 px-2 py-0.5 rounded-sm"
                                >
                                  Leave a review
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-white border border-gray-100 shadow-sm text-center px-4">
            <Package size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-serif text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 text-sm mb-6">Looks like you haven't made any purchases yet.</p>
            <button
              onClick={() => navigate('/shop')}
              className="bg-black text-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-gold-600 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
