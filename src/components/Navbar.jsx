import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, User, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white/60 backdrop-blur-xl sticky top-0 z-50 border-b border-white/50 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-900 hover:text-gold-600 focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-900 hover:text-gold-600 transition-colors uppercase tracking-widest text-sm">Home</Link>
            <Link to="/shop" className="text-gray-900 hover:text-gold-600 transition-colors uppercase tracking-widest text-sm">Shop</Link>
          </div>

          <div className="flex-shrink-0 flex items-center justify-center">
             <Link to="/" className="font-serif text-3xl font-bold tracking-tighter">ZAFIRA</Link>
          </div>

          <div className="hidden md:flex space-x-8 items-center">
             <Link to="/about" className="text-gray-900 hover:text-gold-600 transition-colors uppercase tracking-widest text-sm">About</Link>
             <Link to="/contact" className="text-gray-900 hover:text-gold-600 transition-colors uppercase tracking-widest text-sm">Contact</Link>
             <div className="flex items-center space-x-4 border-l pl-6 ml-2 border-gray-200">
                <Link to="/profile" className="text-gray-900 hover:text-gold-600">
                  <User size={20} />
                </Link>
                <Link to="/cart" className="text-gray-900 hover:text-gold-600">
                    <ShoppingBag size={20} />
                </Link>
             </div>
          </div>

          {/* Mobile Cart Icon (visible on mobile next to logo usually, or keep it right) */}
          <div className="flex items-center md:hidden">
             <Link to="/cart" className="text-gray-900 hover:text-gold-600">
                <ShoppingBag size={24} />
             </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 top-20 shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col items-center">
            <Link
              to="/"
              className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-gold-600 uppercase tracking-widest"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-gold-600 uppercase tracking-widest"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-gold-600 uppercase tracking-widest"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-gold-600 uppercase tracking-widest"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="border-t border-gray-100 w-full pt-4 mt-2 flex justify-center">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-gray-900 hover:text-gold-600 px-3 py-2 uppercase tracking-widest text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User size={20} />
                  Profile
                </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
