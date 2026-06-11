import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingBag, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const BottomNav = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  const isActive = (path) => {
    return location.pathname === path ? "text-gold-600" : "text-gray-500 hover:text-gray-900";
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        <Link to="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive("/")}`}>
          <Home size={24} />
          <span className="text-[10px] uppercase tracking-wider">Home</span>
        </Link>
        <Link to="/shop" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive("/shop")}`}>
          <Search size={24} />
          <span className="text-[10px] uppercase tracking-wider">Search</span>
        </Link>
        <Link to="/cart" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive("/cart")}`}>
          <ShoppingBag size={24} />
          <span className="text-[10px] uppercase tracking-wider">Cart</span>
        </Link>
        <Link to={currentUser ? "/profile" : "/login"} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive(currentUser ? "/profile" : "/login")}`}>
          <User size={24} />
          <span className="text-[10px] uppercase tracking-wider">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;
