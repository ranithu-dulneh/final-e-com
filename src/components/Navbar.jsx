import { Link } from "react-router-dom";
import { ShoppingBag, User } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Mobile menu button could go here */}

          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-900 hover:text-gold-600 transition-colors uppercase tracking-widest text-sm">Home</Link>
            <Link to="/shop" className="text-gray-900 hover:text-gold-600 transition-colors uppercase tracking-widest text-sm">Shop</Link>
          </div>

          <div className="flex-shrink-0 flex items-center justify-center">
             <Link to="/" className="font-serif text-3xl font-bold tracking-tighter">ZAFAIR</Link>
          </div>

          <div className="hidden md:flex space-x-8 items-center">
             <Link to="/about" className="text-gray-900 hover:text-gold-600 transition-colors uppercase tracking-widest text-sm">About</Link>
             <Link to="/contact" className="text-gray-900 hover:text-gold-600 transition-colors uppercase tracking-widest text-sm">Contact</Link>
             <div className="flex items-center space-x-4 border-l pl-6 ml-2 border-gray-200">
                <button className="text-gray-900 hover:text-gold-600">
                    <ShoppingBag size={20} />
                </button>
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
