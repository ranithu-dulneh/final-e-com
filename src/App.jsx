import { useTrackVisit } from "./hooks/useTrackVisit";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminPanel from "./pages/AdminPanel";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import OrderConfirmation from "./pages/OrderConfirmation";
import ProtectedRoute from "./components/ProtectedRoute";
import Terms from "./pages/Terms";
import PopupAd from "./components/PopupAd";
import Marquee from "./components/Marquee";
import BottomNav from "./components/BottomNav";
import Profile from "./pages/Profile";

function App() {
  useTrackVisit();
  return (
    <Router>
      <ScrollToTop />
      <PopupAd />
      <Marquee />
      <AuthProvider>
        <CartProvider>
          <div className="pb-16 md:pb-0">
            <Routes>
              <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
          <BottomNav />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
