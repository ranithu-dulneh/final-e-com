import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { CheckCircle, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, orderData } = location.state || {};

  useEffect(() => {
    if (!orderId || !orderData) {
      navigate("/");
    }
  }, [orderId, orderData, navigate]);

  if (!orderId || !orderData) {
    return null;
  }

  const { customer, items, totalAmount, subtotal, deliveryCharge, paymentMethod } = orderData;

  return (
    <div className="min-h-screen bg-off-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white p-8 md:p-12 shadow-lg border border-gray-100 text-center"
        >

            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle size={64} className="text-green-600" />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
              Thank You for Your Order!
            </h1>
            <p className="text-gray-600 mb-8">
              Your order has been successfully placed. We have sent a confirmation to your email.
              <br/>
              Order ID: <span className="font-mono font-bold text-black">{orderId}</span>
            </p>

            <div className="bg-gray-50 p-6 md:p-8 text-left border border-gray-100 mb-8">
                <h2 className="text-xl font-serif text-gray-900 mb-6 border-b pb-4">Order Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-2">Customer Info</h3>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-gray-600">{customer.address}, {customer.city}</p>
                        <p className="text-gray-600">{customer.phone1}</p>
                        {customer.phone2 && <p className="text-gray-600">{customer.phone2}</p>}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-2">Payment Info</h3>
                        <p className="font-medium text-gray-900">
                            {paymentMethod === 'cod' ? 'Cash On Delivery' : 'Bank Deposit'}
                        </p>
                        <p className="text-gray-600 mt-1">
                            Status: <span className="text-gold-600 font-medium">Pending Processing</span>
                        </p>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-4">Items Ordered</h3>
                    <div className="space-y-4">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                                <div>
                                    <p className="font-medium text-gray-900">{item.title}</p>
                                    <p className="text-sm text-gray-500">{item.selectedVariant} x {item.quantity}</p>
                                </div>
                                <p className="font-medium text-gray-900">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>Rs. {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Delivery Charge</span>
                        <span>Rs. {deliveryCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-4">
                        <span>Total</span>
                        <span>Rs. {totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <p className="text-gray-800 font-medium mb-8">
              Our agents will contact you shortly to confirm the delivery details.
            </p>

            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 uppercase tracking-widest hover:bg-gold-600 transition-colors"
            >
              <ShoppingBag size={20} />
              Continue Shopping
            </button>
        </motion.div>
      </main>
    </div>
  );
};

export default OrderConfirmation;
