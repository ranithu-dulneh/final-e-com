import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const total = getCartTotal();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-off-white flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col justify-center items-center px-4">
          <h2 className="text-2xl font-serif text-gray-900 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8 text-center max-w-md">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link to="/shop" className="bg-black text-white py-3 px-8 uppercase tracking-widest hover:bg-gray-800 transition-colors">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-serif text-gray-900 mb-8">Shopping Bag</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => {
                 // Determine image source
                 let imageSrc = "https://placehold.co/100x100";
                 if (Array.isArray(item.imageUrl) && item.imageUrl.length > 0) {
                    imageSrc = item.imageUrl[0];
                 } else if (typeof item.imageUrl === 'string' && item.imageUrl) {
                    imageSrc = item.imageUrl.split(',')[0];
                 }

                 return (
                  <div key={`${item.id}-${item.selectedVariant || 'default'}`} className="flex flex-col sm:flex-row gap-6 bg-white p-6 border border-gray-100 items-start sm:items-center">
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-50">
                      <img src={imageSrc} alt={item.title} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                          {item.selectedVariant && (
                            <p className="text-sm text-gray-500 mt-1">Variant: {item.selectedVariant}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                        </div>
                        <p className="text-lg font-medium text-gray-900">Rs. {parseFloat(item.price).toFixed(2)}</p>
                      </div>

                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center border border-gray-200">
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedVariant, -1)}
                            className="p-2 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-1 text-gray-900 text-sm font-medium w-10 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedVariant, 1)}
                            className="p-2 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id, item.selectedVariant)}
                          className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 transition-colors"
                        >
                          <Trash2 size={16} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                 );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 border border-gray-100 sticky top-24">
              <h2 className="text-xl font-serif text-gray-900 mb-6 border-b pb-4">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs. {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-gray-900 font-medium text-lg pt-4 border-t border-gray-100">
                  <span>Total</span>
                  <span>Rs. {total.toFixed(2)}</span>
                </div>
              </div>

              <Link to="/checkout" className="block w-full bg-gold-600 text-white text-center py-4 uppercase tracking-widest hover:bg-gold-700 transition-colors">
                Proceed to Checkout
              </Link>

              <button onClick={clearCart} className="block w-full text-center py-4 text-sm text-gray-500 hover:text-black underline mt-2">
                Clear Cart
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Cart;
