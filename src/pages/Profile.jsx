import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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
          <button
            onClick={handleLogout}
            className="text-sm uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="bg-white p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-serif text-gray-900 mb-2">Welcome{currentUser?.email ? `, ${currentUser.email}` : ''}</h2>
          <p className="text-gray-500 text-sm">Manage your account and view orders.</p>
        </div>

        {/* Feature: Past Order Categorization */}
        <div className="bg-white p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-widest mb-4">My Orders</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-gray-50 rounded transition-colors">
              <span className="text-gray-400 mb-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-600">To Pay</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-gray-50 rounded transition-colors">
              <span className="text-gray-400 mb-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-600">Confirmed</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-gray-50 rounded transition-colors">
              <span className="text-gray-400 mb-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-600">Shipped</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-gray-50 rounded transition-colors">
              <span className="text-gray-400 mb-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-600">To Review</span>
            </div>
          </div>
          {/* TODO: Implement actual order fetching and count badges for each category */}
        </div>

        {/* Feature: Recent Order */}
        <div className="bg-white p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-widest mb-4">Recent Order</h3>
          <div className="flex items-center justify-center h-24 bg-gray-50 border border-dashed border-gray-200">
            <span className="text-sm text-gray-500">No recent orders found.</span>
          </div>
          {/* TODO: Fetch and display the most recent order summary here */}
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
