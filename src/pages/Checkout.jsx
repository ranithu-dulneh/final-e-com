import { trackSale } from "../utils/trackSales";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { db } from "../firebase";
import { ref, push, set } from "firebase/database";
import Navbar from "../components/Navbar";
import { CreditCard, Truck, CheckCircle, AlertCircle, Building, Upload } from "lucide-react";

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const total = getCartTotal();

    useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || currentUser.displayName || "",
        email: prev.email || currentUser.email || ""
      }));
    }
  }, [currentUser]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone1: "",
    phone2: "",
    city: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [enteredCoupon, setEnteredCoupon] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Allowed Payment logic
  const [availableMethods, setAvailableMethods] = useState({ cod: true, bank: true, online: true });

  useEffect(() => {
    if (cartItems.length > 0) {
      let codAllowed = true;
      let bankAllowed = true;
      let onlineAllowed = true;

      cartItems.forEach(item => {
        if (item.allowedPayments) {
          if (!item.allowedPayments.cod) codAllowed = false;
          if (!item.allowedPayments.bank) bankAllowed = false;
          if (!item.allowedPayments.online) onlineAllowed = false;
        }
      });

      setAvailableMethods({ cod: codAllowed, bank: bankAllowed, online: onlineAllowed });

      // Auto-switch if currently selected is no longer valid
      if (paymentMethod === 'cod' && !codAllowed) {
        setPaymentMethod(bankAllowed ? 'bank' : (onlineAllowed ? 'online' : ''));
      } else if (paymentMethod === 'bank' && !bankAllowed) {
        setPaymentMethod(codAllowed ? 'cod' : (onlineAllowed ? 'online' : ''));
      }
    }
  }, [cartItems, paymentMethod]);

  /* Deprecated: Global delivery charges
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snapshot = await get(ref(db, 'settings/deliveryCharges'));
        if (snapshot.exists()) {
          setDeliveryCharges(snapshot.val());
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);
  */

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate Phone 1
    if (!formData.phone1) {
      setError("Phone number (WhatsApp) is required.");
      return;
    }

    // Regex for 10-digit number
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone1.replace(/\s/g, ''))) {
        setError("Phone number 1 must be exactly 10 digits.");
        return;
    }

    if (formData.phone2 && !phoneRegex.test(formData.phone2.replace(/\s/g, ''))) {
        setError("Phone number 2 must be exactly 10 digits.");
        return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!agreeToTerms) {
      setError("You must agree to the terms and conditions, privacy policy, and refund policy to place an order.");
      return;
    }

    setLoading(true);

    try {
      // Calculate per-product shipping based on method
      const deliveryCharge = cartItems.reduce((acc, item) => {
          const cost = paymentMethod === 'cod'
            ? (Number(item.shippingCostCod) || 0)
            : (Number(item.shippingCostBank) || 0);
          return acc + (cost * item.quantity);
      }, 0);

      const finalTotal = total + deliveryCharge - appliedDiscount;

      const orderData = {
        userId: currentUser ? currentUser.uid : null,
        customer: formData,
        items: cartItems,
        totalAmount: finalTotal > 0 ? finalTotal : 0,
        subtotal: total,
        deliveryCharge: deliveryCharge,
        discount: appliedDiscount,
        couponCode: isCouponApplied ? enteredCoupon : "",
        paymentMethod: paymentMethod,
        receiptUrl: "", // Receipt upload removed
        status: "Pending",
        createdAt: new Date().toISOString()
      };

      const newOrderRef = push(ref(db, 'orders'));
      await set(newOrderRef, orderData);
      await trackSale(orderData.totalAmount);

      clearCart();
      navigate('/order-confirmation', { state: { orderId: newOrderRef.key, orderData } });
    } catch (err) {
      console.error("Error placing order:", err);
      setError("Failed to place order. Please try again. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = (method) => {
    alert(`${method} payment is currently under development. Please select Cash On Delivery.`);
  };

  const handleApplyCoupon = (e) => {
      e.preventDefault();
      setCouponMessage("");
      setAppliedDiscount(0);
      setIsCouponApplied(false);

      if (!enteredCoupon.trim()) return;

      const code = enteredCoupon.trim().toUpperCase();
      let totalDisc = 0;
      let applied = false;

      cartItems.forEach(item => {
          if (item.couponCode && item.couponCode.toUpperCase() === code) {
              const disc = Number(item.couponDiscount) || 0;
              totalDisc += disc * item.quantity;
              applied = true;
          }
      });

      if (applied) {
           setAppliedDiscount(totalDisc);
           setIsCouponApplied(true);
           setCouponMessage(`Coupon applied! You saved Rs. ${totalDisc}`);
      } else {
           setCouponMessage("Invalid coupon code for items in cart.");
      }
  };

  if (cartItems.length === 0) {
     // If user directly navigates to /checkout with empty cart
     return (
        <div className="min-h-screen bg-off-white flex flex-col justify-center items-center">
            <h2 className="text-xl font-serif">Your cart is empty</h2>
            <button onClick={() => navigate('/shop')} className="mt-4 text-gold-600 underline">Go to Shop</button>
        </div>
     )
  }

  return (
    <div className="min-h-screen bg-off-white relative">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-serif text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Checkout Form */}
          <div className="bg-white p-6 border border-gray-100 h-fit">
            <h2 className="text-xl font-serif text-gray-900 mb-6 border-b pb-4">Shipping Details</h2>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  required
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nearest City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone No. 1 (WhatsApp)*</label>
                    <input
                      type="tel"
                      name="phone1"
                      required
                      value={formData.phone1}
                      onChange={handleChange}
                      placeholder="Required"
                      className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone No. 2</label>
                    <input
                      type="tel"
                      name="phone2"
                      value={formData.phone2}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                    />
                  </div>
              </div>

              <div className="pt-6">
                <h2 className="text-xl font-serif text-gray-900 mb-4 border-b pb-2">Payment Method</h2>

                {(!availableMethods.cod || !availableMethods.bank || !availableMethods.online) && (
                    <div className="mb-4 bg-yellow-50 text-yellow-800 p-3 flex items-start gap-2 text-sm border border-yellow-200 rounded-sm">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <p>Some payment methods are unavailable due to restrictions on certain items in your cart.</p>
                    </div>
                )}

                <div className="space-y-3">
                    {availableMethods.cod && (
                        <label className={`flex items-center p-4 border cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-gold-600 bg-gold-50' : 'border-gray-200'}`}>
                            <input
                                type="radio"
                                name="payment"
                                value="cod"
                                checked={paymentMethod === 'cod'}
                                onChange={() => setPaymentMethod('cod')}
                                className="text-gold-600 focus:ring-gold-500"
                            />
                            <div className="ml-3 w-full">
                                <span className="font-medium text-gray-900 flex items-center gap-2">
                                    <Truck size={18} /> Cash On Delivery
                                </span>
                                {paymentMethod === 'cod' && (
                                    <p className="text-xs text-gray-500 mt-1">Shipping calculated per product (COD rates apply).</p>
                                )}
                            </div>
                        </label>
                    )}

                    {availableMethods.bank && (
                        <label className={`flex flex-col p-4 border cursor-pointer transition-colors ${paymentMethod === 'bank' ? 'border-gold-600 bg-gold-50' : 'border-gray-200'}`}>
                            <div className="flex items-center w-full">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="bank"
                                    checked={paymentMethod === 'bank'}
                                    onChange={() => setPaymentMethod('bank')}
                                    className="text-gold-600 focus:ring-gold-500"
                                />
                                <div className="ml-3 w-full">
                                    <span className="font-medium text-gray-900 flex items-center gap-2">
                                        <Building size={18} /> Bank Deposit
                                    </span>
                                    {paymentMethod === 'bank' && (
                                        <p className="text-xs text-gray-500 mt-1">Shipping calculated per product (Bank rates apply).</p>
                                    )}
                                </div>
                            </div>

                            {paymentMethod === 'bank' && (
                                <div className="mt-4 ml-7 space-y-3">
                                    <div className="bg-white p-3 border border-gray-200 text-sm text-gray-700 space-y-1">
                                        <p className="font-bold">Bank Details:</p>
                                        <p>Account Name: <span className="font-medium">RD Liyanwala</span></p>
                                        <p>Account No: <span className="font-medium">115020367371</span></p>
                                        <p>Bank: <span className="font-medium">HNB Bank Colpetty</span></p>
                                    </div>
                                    <div className="bg-blue-50 p-4 border border-blue-100 text-sm text-blue-900">
                                        <p className="font-bold mb-1">Instructions:</p>
                                        <p className="mb-2">Please use your <span className="font-bold">Mobile Number</span> as the reference for the transaction.</p>
                                        <p>For more details contact <span className="font-bold">070 7506269</span> through WhatsApp.</p>
                                    </div>
                                </div>
                            )}
                        </label>
                    )}

                    {availableMethods.online && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleOnlinePayment('Visa')}
                                    className="flex items-center justify-center gap-2 p-4 border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
                                >
                                    <CreditCard size={18} /> Visa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleOnlinePayment('Mastercard')}
                                    className="flex items-center justify-center gap-2 p-4 border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
                                >
                                    <CreditCard size={18} /> Mastercard
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 text-center">Online payments are currently under development.</p>
                        </>
                    )}
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-gold-600 border-gray-300 rounded focus:ring-gold-500"
                  />
                  <span className="text-sm text-gray-600">
                    I have read and agree to the website{" "}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-gold-600 hover:text-gold-700 underline">
                      Terms and Conditions, Privacy Policy, and Refund Policy
                    </a>.
                  </span>
                </label>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 flex items-center gap-2 text-sm mt-4">
                    <AlertCircle size={16} /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 mt-4"
              >
                {loading ? 'Processing...' : `Place Order (Rs. ${(total + cartItems.reduce((acc, item) => {
                    const cost = paymentMethod === 'cod' ? (Number(item.shippingCostCod) || 0) : (Number(item.shippingCostBank) || 0);
                    return acc + (cost * item.quantity);
                }, 0)).toFixed(2)})`}
              </button>
            </form>
          </div>

          {/* Order Summary Preview */}
          <div className="bg-gray-50 p-6 h-fit border border-gray-100">
             <h2 className="text-lg font-serif text-gray-900 mb-6">Order Summary</h2>
             <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {cartItems.map((item, idx) => {
                     let imageSrc = "https://placehold.co/100x100";
                     if (Array.isArray(item.imageUrl) && item.imageUrl.length > 0) {
                        imageSrc = item.imageUrl[0];
                     } else if (typeof item.imageUrl === 'string' && item.imageUrl) {
                        imageSrc = item.imageUrl.split(',')[0];
                     }

                    return (
                        <div key={idx} className="flex gap-4 items-start border-b border-gray-200 pb-4 last:border-0">
                            <img src={imageSrc} alt="" className="w-16 h-16 object-cover bg-white" />
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                                <p className="text-xs text-gray-500">{item.selectedVariant}</p>
                                <div className="flex justify-between mt-1">
                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                    <p className="text-sm font-medium text-gray-900">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
             </div>

             <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                {/* Coupon Input */}
                <div className="pb-4 border-b border-gray-100">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={enteredCoupon}
                            onChange={(e) => setEnteredCoupon(e.target.value)}
                            placeholder="Coupon Code"
                            disabled={isCouponApplied}
                            className="w-full px-3 py-2 border border-gray-300 text-sm focus:border-gold-500 outline-none uppercase"
                        />
                        {isCouponApplied ? (
                            <button
                                onClick={() => {
                                    setEnteredCoupon("");
                                    setAppliedDiscount(0);
                                    setIsCouponApplied(false);
                                    setCouponMessage("");
                                }}
                                className="bg-red-500 text-white px-4 text-sm font-medium hover:bg-red-600"
                            >
                                Remove
                            </button>
                        ) : (
                            <button
                                onClick={handleApplyCoupon}
                                className="bg-black text-white px-4 text-sm font-medium hover:bg-gray-800"
                            >
                                Apply
                            </button>
                        )}
                    </div>
                    {couponMessage && (
                        <p className={`text-xs mt-1 ${isCouponApplied ? 'text-green-600' : 'text-red-500'}`}>
                            {couponMessage}
                        </p>
                    )}
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>Rs. {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span>Rs. {cartItems.reduce((acc, item) => {
                        const cost = paymentMethod === 'cod' ? (Number(item.shippingCostCod) || 0) : (Number(item.shippingCostBank) || 0);
                        return acc + (cost * item.quantity);
                    }, 0).toFixed(2)}</span>
                </div>
                {isCouponApplied && (
                    <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>- Rs. {appliedDiscount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>Rs. {Math.max(0, (total + cartItems.reduce((acc, item) => {
                        const cost = paymentMethod === 'cod' ? (Number(item.shippingCostCod) || 0) : (Number(item.shippingCostBank) || 0);
                        return acc + (cost * item.quantity);
                    }, 0) - appliedDiscount)).toFixed(2)}</span>
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Checkout;
