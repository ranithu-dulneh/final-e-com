import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, query, orderByChild, equalTo, get } from "firebase/database";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      setLoadingOrders(true);
      try {
        const ordersRef = ref(db, 'orders');
        const userOrdersQuery = query(ordersRef, orderByChild('userId'), equalTo(currentUser.uid));
        const snapshot = await get(userOrdersQuery);

        if (snapshot.exists()) {
          const ordersData = snapshot.val();
          const ordersList = Object.keys(ordersData).map(key => ({
            id: key,
            ...ordersData[key]
          })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          setOrders(ordersList);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
      setLoadingOrders(false);
    };

    fetchOrders();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="min-h-screen bg-off-white flex flex-col">
      <Navbar />
      <div className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900 tracking-tight">Profile</h1>
          {currentUser ? (
            <button
              onClick={handleLogout}
              className="text-sm uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="text-sm uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
            >
              Login
            </button>
          )}
        </div>

        <div className="bg-white p-6 shadow-sm border border-gray-100 mb-8">
          {currentUser ? (
             <>
                <h2 className="text-xl font-serif text-gray-900 mb-2">Welcome{currentUser.displayName ? `, ${currentUser.displayName}` : (currentUser.email ? `, ${currentUser.email}` : '')}</h2>
                <p className="text-gray-500 text-sm">Manage your account and view orders.</p>
             </>
          ) : (
             <>
                <h2 className="text-xl font-serif text-gray-900 mb-2">Welcome Guest</h2>
                <p className="text-gray-500 text-sm mb-4">Sign in to manage your account and view your orders.</p>
                <button
                  onClick={() => navigate("/login")}
                  className="bg-black text-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-gold-600 transition-colors"
                >
                  Sign In
                </button>
             </>
          )}
        </div>

        {/* Feature: Past Order Categorization */}
        <div className="bg-white p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-widest mb-4">My Orders</h3>

          {currentUser && !loadingOrders ? (() => {
            const counts = {
              toPay: orders.filter(o => o.status === 'Pending').length,
              confirmed: orders.filter(o => o.status === 'Order confirmed').length,
              shipped: orders.filter(o => ['Dispatched', 'Arrived at the destination', 'Out for delivery'].includes(o.status)).length,
              toReview: orders.filter(o => o.status === 'Delivered').length
            };

            const toggleStatus = (statusGroup) => {
              setSelectedStatus(prev => prev === statusGroup ? null : statusGroup);
            };

            return (
              <>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div onClick={() => toggleStatus('toPay')} className={`relative flex flex-col items-center justify-center p-2 cursor-pointer rounded transition-colors ${selectedStatus === 'toPay' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                    <span className="text-gray-400 mb-1">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </span>
                    {counts.toPay > 0 && (
                      <span className="absolute top-1 right-1 md:right-4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {counts.toPay}
                      </span>
                    )}
                    <span className="text-[10px] uppercase tracking-wider text-gray-600">To Pay</span>
                  </div>
                  <div onClick={() => toggleStatus('confirmed')} className={`relative flex flex-col items-center justify-center p-2 cursor-pointer rounded transition-colors ${selectedStatus === 'confirmed' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                    <span className="text-gray-400 mb-1">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </span>
                    {counts.confirmed > 0 && (
                      <span className="absolute top-1 right-1 md:right-4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {counts.confirmed}
                      </span>
                    )}
                    <span className="text-[10px] uppercase tracking-wider text-gray-600">Confirmed</span>
                  </div>
                  <div onClick={() => toggleStatus('shipped')} className={`relative flex flex-col items-center justify-center p-2 cursor-pointer rounded transition-colors ${selectedStatus === 'shipped' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                    <span className="text-gray-400 mb-1">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                    </span>
                    {counts.shipped > 0 && (
                      <span className="absolute top-1 right-1 md:right-4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {counts.shipped}
                      </span>
                    )}
                    <span className="text-[10px] uppercase tracking-wider text-gray-600">Shipped</span>
                  </div>
                  <div onClick={() => toggleStatus('toReview')} className={`relative flex flex-col items-center justify-center p-2 cursor-pointer rounded transition-colors ${selectedStatus === 'toReview' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                    <span className="text-gray-400 mb-1">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                    </span>
                    {counts.toReview > 0 && (
                      <span className="absolute top-1 right-1 md:right-4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {counts.toReview}
                      </span>
                    )}
                    <span className="text-[10px] uppercase tracking-wider text-gray-600">To Review</span>
                  </div>
                </div>

                {selectedStatus && (
                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Orders in {selectedStatus}</h4>
                    <div className="space-y-4">
                      {orders.filter(o => {
                        if (selectedStatus === 'toPay') return o.status === 'Pending';
                        if (selectedStatus === 'confirmed') return o.status === 'Order confirmed';
                        if (selectedStatus === 'shipped') return ['Dispatched', 'Arrived at the destination', 'Out for delivery'].includes(o.status);
                        if (selectedStatus === 'toReview') return o.status === 'Delivered';
                        return false;
                      }).map(order => (
                        <div key={order.id} className="text-sm p-4 border border-gray-100 flex flex-col bg-gray-50">
                          <div className="flex justify-between items-center w-full">
                            <div>
                              <p className="font-medium">Order #{order.id.slice(-6).toUpperCase()}</p>
                              <p className="text-gray-500 text-xs mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gold-600">Rs. {order.totalAmount?.toLocaleString()}</p>
                              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{order.status}</p>
                            </div>
                          </div>
                          {selectedStatus === 'toReview' && order.items && (
                             <div className="mt-4 border-t border-gray-200 pt-3 space-y-3">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Items to review:</p>
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            {item.imageUrl && (
                                                <img src={Array.isArray(item.imageUrl) ? item.imageUrl[0] : item.imageUrl} alt={item.title} className="w-8 h-8 object-cover rounded" />
                                            )}
                                            <span className="text-xs text-gray-700 truncate max-w-[150px] sm:max-w-[200px]">{item.title}</span>
                                        </div>
                                        <Link
                                            to={`/product/${item.id}#reviews`}
                                            className="text-[10px] bg-black text-white px-3 py-1.5 uppercase tracking-wider hover:bg-gray-800 transition-colors"
                                        >
                                            Leave Review
                                        </Link>
                                    </div>
                                ))}
                             </div>
                          )}
                        </div>
                      ))}
                      {orders.filter(o => {
                        if (selectedStatus === 'toPay') return o.status === 'Pending';
                        if (selectedStatus === 'confirmed') return o.status === 'Order confirmed';
                        if (selectedStatus === 'shipped') return ['Dispatched', 'Arrived at the destination', 'Out for delivery'].includes(o.status);
                        if (selectedStatus === 'toReview') return o.status === 'Delivered';
                        return false;
                      }).length === 0 && (
                        <p className="text-xs text-gray-500 text-center py-4">No orders found for this status.</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            );
          })() : (
            <div className="grid grid-cols-4 gap-4 text-center opacity-50">
              <div className="flex flex-col items-center justify-center p-2 rounded">
                <span className="text-gray-400 mb-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-gray-600">To Pay</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded">
                <span className="text-gray-400 mb-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-gray-600">Confirmed</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded">
                <span className="text-gray-400 mb-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-gray-600">Shipped</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded">
                <span className="text-gray-400 mb-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-gray-600">To Review</span>
              </div>
            </div>
          )}
        </div>

        {/* Feature: Recent Order */}
        <div className="bg-white p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-widest mb-4">Recent Order</h3>
          {currentUser && !loadingOrders ? (
            orders.length > 0 ? (
              <div className="p-4 bg-gray-50 border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Order #{orders[0].id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(orders[0].createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gold-600">Rs. {orders[0].totalAmount?.toLocaleString()}</p>
                  <p className="text-xs uppercase tracking-wider mt-1 font-medium bg-gray-200 inline-block px-2 py-1 rounded">{orders[0].status}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 bg-gray-50 border border-dashed border-gray-200">
                <span className="text-sm text-gray-500">No recent orders found.</span>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-24 bg-gray-50 border border-dashed border-gray-200">
              <span className="text-sm text-gray-500">{currentUser ? 'Loading...' : 'Sign in to view orders.'}</span>
            </div>
          )}
        </div>

        {/* Feature: Wishlisted Items */}
        <div className="bg-white p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-widest mb-4">Wishlist</h3>
          <div className="flex items-center justify-center h-24 bg-gray-50 border border-dashed border-gray-200">
            <span className="text-sm text-gray-500">Your wishlist is empty.</span>
          </div>
          {/* TODO: Implement wishlist functionality, store in Firebase/localStorage, and display items here */}
        </div>

        {/* Feature: Recently Viewed Items */}
        <div className="bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-widest mb-4">Recently Viewed</h3>
          <div className="grid grid-cols-2 gap-4">
             {/* Placeholder for a 50-50 block method */}
             <div className="aspect-square bg-gray-50 border border-gray-100 flex items-center justify-center text-xs text-gray-400">
                Item 1 Placeholder
             </div>
             <div className="aspect-square bg-gray-50 border border-gray-100 flex items-center justify-center text-xs text-gray-400">
                Item 2 Placeholder
             </div>
             {/* TODO: Track recently viewed items in localStorage/sessionStorage and display up to N items here */}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
