import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { db, storage } from "../firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { ref, get, query, orderByChild, equalTo, push, set } from "firebase/database";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [warrantyForm, setWarrantyForm] = useState({ name: "", mobile: "", cause: "", orderSource: "online", orderId: "", image: null });
  const [submittingWarranty, setSubmittingWarranty] = useState(false);

  const handleReviewClick = async (item, orderId) => {
    if (item.id) {
      navigate(`/product/${item.id}?orderId=${orderId}`);
      return;
    }


    // Fallback if item.id is missing (old orders)
    try {
      const productsRef = ref(db, 'products');
      const productQuery = query(productsRef, orderByChild('title'), equalTo(item.title));
      const snapshot = await get(productQuery);

      if (snapshot.exists()) {
        const productsData = snapshot.val();
        const foundId = Object.keys(productsData)[0]; // Since title should be unique enough, pick the first match
        if (foundId) {
          navigate(`/product/${foundId}?orderId=${orderId}`);
        } else {
          alert('Product not found.');
        }
      } else {
        alert('Product not found.');
      }
    } catch (err) {
      console.error(err);
      alert('Error finding product.');
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      setLoadingOrders(true);
      try {
        const ordersRef = ref(db, 'orders');
        // Fetch all orders and filter client-side to bypass potential Firebase index issues
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
      setLoadingOrders(false);
    };

    fetchOrders();
  }, [currentUser]);


  const handleWarrantySubmit = async (e) => {
    e.preventDefault();
    if (!warrantyForm.name || !warrantyForm.mobile || !warrantyForm.cause || !warrantyForm.image) {
      alert("Please fill all required fields and upload an image.");
      return;
    }
    if (warrantyForm.orderSource === 'online' && !warrantyForm.orderId) {
      alert("Please select an online order.");
      return;
    }

    setSubmittingWarranty(true);
    try {
      const imageRef = storageRef(storage, `warrantyClaims/${Date.now()}_${warrantyForm.image.name}`);
      const snapshot = await uploadBytes(imageRef, warrantyForm.image);
      const imageUrl = await getDownloadURL(snapshot.ref);

      const claimRef = push(ref(db, 'warrantyClaims'));
      await set(claimRef, {
        userId: currentUser ? currentUser.uid : null,
        name: warrantyForm.name,
        mobile: warrantyForm.mobile,
        cause: warrantyForm.cause,
        orderSource: warrantyForm.orderSource,
        orderId: warrantyForm.orderSource === 'online' ? warrantyForm.orderId : null,
        imageUrl: imageUrl,
        status: 'Pending',
        createdAt: new Date().toISOString()
      });

      alert("Warranty claim submitted successfully!");
      setShowWarrantyModal(false);
      setWarrantyForm({ name: "", mobile: "", cause: "", orderSource: "online", orderId: "", image: null });
    } catch (err) {
      console.error(err);
      alert("Failed to submit claim.");
    }
    setSubmittingWarranty(false);
  };

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

      {/* Warranty Claim Modal */}
      {showWarrantyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 max-w-md w-full shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-serif text-gray-900 mb-4">Submit Warranty Claim</h2>
            <form onSubmit={handleWarrantySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input type="text" required value={warrantyForm.name} onChange={e => setWarrantyForm({...warrantyForm, name: e.target.value})} className="w-full border border-gray-300 p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mobile No</label>
                <input type="text" required value={warrantyForm.mobile} onChange={e => setWarrantyForm({...warrantyForm, mobile: e.target.value})} className="w-full border border-gray-300 p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cause / Issue</label>
                <textarea required value={warrantyForm.cause} onChange={e => setWarrantyForm({...warrantyForm, cause: e.target.value})} className="w-full border border-gray-300 p-2 text-sm" rows="3"></textarea>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Order Source</label>
                <select value={warrantyForm.orderSource} onChange={e => setWarrantyForm({...warrantyForm, orderSource: e.target.value})} className="w-full border border-gray-300 p-2 text-sm">
                  <option value="online">Online Order</option>
                  <option value="whatsapp">WhatsApp / Manual</option>
                </select>
              </div>
              {warrantyForm.orderSource === 'online' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Select Order</label>
                  <select value={warrantyForm.orderId} onChange={e => setWarrantyForm({...warrantyForm, orderId: e.target.value})} className="w-full border border-gray-300 p-2 text-sm">
                    <option value="">-- Select an Order --</option>
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>{new Date(o.createdAt).toLocaleDateString()} - Rs. {o.totalAmount}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Upload Image (Required)</label>
                <input type="file" required accept="image/*" onChange={e => setWarrantyForm({...warrantyForm, image: e.target.files[0]})} className="w-full border border-gray-300 p-2 text-sm" />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" disabled={submittingWarranty} className="flex-1 bg-black text-white py-2 text-sm uppercase tracking-widest hover:bg-gold-600 transition-colors disabled:opacity-50">
                  {submittingWarranty ? "Submitting..." : "Submit Claim"}
                </button>
                <button type="button" onClick={() => setShowWarrantyModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 text-sm uppercase tracking-widest hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Navbar />
      <div className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900 tracking-tight">Profile</h1>

          {currentUser ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowWarrantyModal(true)}
                className="text-sm uppercase tracking-wider text-gray-500 hover:text-black transition-colors border border-gray-300 px-3 py-1 rounded"
              >
                Claim Warranty
              </button>
              <button
                onClick={handleLogout}
                className="text-sm uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
              >
                Logout
              </button>
            </div>
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
              toReview: orders.filter(o => o.status === 'Delivered' && !o.isReviewCompleted).length,
              completed: orders.filter(o => o.status === 'Completed' || (o.status === 'Delivered' && o.isReviewCompleted)).length
            };

            const toggleStatus = (statusGroup) => {
              setSelectedStatus(prev => prev === statusGroup ? null : statusGroup);
            };

            return (
              <>
                <div className="grid grid-cols-5 gap-2 md:gap-4 text-center">
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

                  <div onClick={() => toggleStatus('completed')} className={`relative flex flex-col items-center justify-center p-2 cursor-pointer rounded transition-colors ${selectedStatus === 'completed' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                    <span className="text-gray-400 mb-1">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </span>
                    {counts.completed > 0 && (
                      <span className="absolute top-1 right-1 md:right-4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {counts.completed}
                      </span>
                    )}
                    <span className="text-[10px] uppercase tracking-wider text-gray-600">Completed</span>
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
                        if (selectedStatus === 'toReview') return o.status === 'Delivered' && !o.isReviewCompleted;
                        if (selectedStatus === 'completed') return o.status === 'Completed' || (o.status === 'Delivered' && o.isReviewCompleted);
                        return false;
                      }).map(order => (
                        <div key={order.id} className="p-4 bg-gray-50 border border-gray-100">
                          <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                            <p className="text-xs uppercase tracking-wider font-medium bg-gray-200 text-gray-700 inline-block px-2 py-1 rounded">{order.status}</p>
                          </div>

                          {order.items && order.items.slice(0, 2).map((item, idx) => {
                             let imageSrc = "https://placehold.co/80x80";
                             if (Array.isArray(item.imageUrl) && item.imageUrl.length > 0) {
                                imageSrc = item.imageUrl[0];
                             } else if (typeof item.imageUrl === 'string' && item.imageUrl) {
                                imageSrc = item.imageUrl.split(',')[0];
                             }

                             return (
                               <div key={idx} className="flex gap-4 items-start mb-3 last:mb-0">
                                 <img src={imageSrc} alt="" className="w-12 h-12 object-cover bg-white border border-gray-200" />
                                 <div className="flex-1">
                                   <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</p>
                                   <div className="flex justify-between items-center mt-0.5">
                                     <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                     {selectedStatus === 'toReview' && (
                                       <button
                                         onClick={() => handleReviewClick(item, order.id)}
                                         className="text-[10px] uppercase tracking-widest text-gold-600 hover:text-gold-700 border border-gold-600 px-2 py-0.5 rounded-sm"
                                       >
                                         Leave a review
                                       </button>
                                     )}
                                   </div>
                                 </div>
                               </div>
                             )
                          })}
                          {order.items && order.items.length > 2 && (
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-xs text-gray-500 italic">+ {order.items.length - 2} more items</p>
                              {selectedStatus === 'toReview' && (
                                <button
                                  onClick={() => navigate(`/order-history`)}
                                  className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-gray-700 underline"
                                >
                                  View all to review
                                </button>
                              )}
                            </div>
                          )}

                          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">Total</span>
                            <span className="text-sm font-medium text-gold-600">Rs. {order.totalAmount?.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                      {orders.filter(o => {
                        if (selectedStatus === 'toPay') return o.status === 'Pending';
                        if (selectedStatus === 'confirmed') return o.status === 'Order confirmed';
                        if (selectedStatus === 'shipped') return ['Dispatched', 'Arrived at the destination', 'Out for delivery'].includes(o.status);
                        if (selectedStatus === 'toReview') return o.status === 'Delivered' && !o.isReviewCompleted;
                        if (selectedStatus === 'completed') return o.status === 'Completed' || (o.status === 'Delivered' && o.isReviewCompleted);
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
            <div className="grid grid-cols-5 gap-2 md:gap-4 text-center opacity-50">
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

              <div className="flex flex-col items-center justify-center p-2 rounded">
                <span className="text-gray-400 mb-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-gray-600">Completed</span>
              </div>
            </div>
          )}
        </div>

        {/* Feature: Recent Order */}
        <div className="bg-white p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-widest mb-4">Recent Order</h3>
          {currentUser && !loadingOrders ? (
            orders.length > 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 border border-gray-100">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                    <p className="text-xs text-gray-500">{new Date(orders[0].createdAt).toLocaleDateString()}</p>
                    <p className="text-xs uppercase tracking-wider font-medium bg-gray-200 inline-block px-2 py-1 rounded">{orders[0].status}</p>
                  </div>

                  {orders[0].items && orders[0].items.slice(0, 2).map((item, idx) => {
                     let imageSrc = "https://placehold.co/80x80";
                     if (Array.isArray(item.imageUrl) && item.imageUrl.length > 0) {
                        imageSrc = item.imageUrl[0];
                     } else if (typeof item.imageUrl === 'string' && item.imageUrl) {
                        imageSrc = item.imageUrl.split(',')[0];
                     }

                     return (
                       <div key={idx} className="flex gap-4 items-start mb-3 last:mb-0">
                         <img src={imageSrc} alt="" className="w-12 h-12 object-cover bg-white border border-gray-200" />
                         <div className="flex-1">
                           <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</p>
                           <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                         </div>
                       </div>
                     )
                  })}
                  {orders[0].items && orders[0].items.length > 2 && (
                    <p className="text-xs text-gray-500 mt-2 italic">+ {orders[0].items.length - 2} more items</p>
                  )}

                  <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Total</span>
                    <span className="text-sm font-medium text-gold-600">Rs. {orders[0].totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/order-history")}
                  className="w-full bg-black text-white py-3 text-xs uppercase tracking-widest hover:bg-gold-600 transition-colors"
                >
                  View All Orders
                </button>
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
