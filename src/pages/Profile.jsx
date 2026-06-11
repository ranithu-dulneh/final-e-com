import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
import Navbar from "../components/Navbar";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const snapshot = await get(ref(db, "orders"));
        if (snapshot.exists()) {
          const allOrders = snapshot.val();
          const userOrders = Object.keys(allOrders)
            .map((key) => ({ id: key, ...allOrders[key] }))
            .filter((order) => {
              return (
                order.userId === currentUser.uid ||
                (order.customer && order.customer.email === currentUser.email && currentUser.email)
              );
            })
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

          setOrders(userOrders);
        }
      } catch (err) {
        console.error("Error fetching user orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Failed to log out", err);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen flex flex-col bg-off-white">
      <Navbar />
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="bg-white p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-100 pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-serif text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">
                Welcome, {currentUser.isAnonymous ? "Guest" : currentUser.displayName || currentUser.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 md:mt-0 bg-black text-white px-6 py-2 uppercase tracking-widest hover:bg-gold-600 transition-colors duration-300 text-sm"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-serif mb-4">Account Information</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-medium text-gray-900">Email:</span> {currentUser.isAnonymous ? "Guest Account" : currentUser.email}</p>
                <p><span className="font-medium text-gray-900">User ID:</span> {currentUser.uid}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-serif mb-4">Offers & Promotions</h2>
              <div className="bg-gold-50 p-4 border border-gold-100 text-sm text-gold-900">
                <p className="mb-2 font-medium">Special Offers Available!</p>
                <p className="mb-4">Check out our latest seasonal promotions and free shipping thresholds.</p>
                <Link to="/shop" className="underline hover:text-gold-700">Browse Shop</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-serif mb-6">My Orders</h2>

          {loading ? (
            <p className="text-gray-500">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div>
              <p className="text-gray-500 mb-4">You have not placed any orders yet.</p>
              <Link to="/shop" className="text-gold-600 underline hover:text-gold-700">Start Shopping</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Tracking</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{order.id}</td>
                      <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Dispatched' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">Rs. {order.totalAmount?.toLocaleString()}</td>
                      <td className="px-4 py-3">{order.trackingNumber || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
