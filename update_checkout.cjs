const fs = require('fs');

const filePath = 'src/pages/Checkout.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const importSearch = `import { CreditCard, Truck, CheckCircle, AlertCircle, Building, Upload } from "lucide-react";`;
const importReplace = `import { CreditCard, Truck, CheckCircle, AlertCircle, Building, Upload, X } from "lucide-react";`;

content = content.replace(importSearch, importReplace);

const stateSearch = `  const [agreeToTerms, setAgreeToTerms] = useState(false);`;
const stateReplace = `  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showGuestPopup, setShowGuestPopup] = useState(false);

  useEffect(() => {
    // Only show popup if user is NOT logged in and we haven't shown it in this session
    if (!currentUser && !sessionStorage.getItem('guestCheckoutPopupShown')) {
        setShowGuestPopup(true);
        sessionStorage.setItem('guestCheckoutPopupShown', 'true');
    }
  }, [currentUser]);`;

content = content.replace(stateSearch, stateReplace);

const popupSearch = `      <Navbar />`;
const popupReplace = `      <Navbar />

      {/* Guest Checkout Suggestion Popup */}
      {showGuestPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white max-w-md w-full p-6 shadow-2xl relative">
                <button
                    onClick={() => setShowGuestPopup(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
                >
                    <X size={20} />
                </button>
                <h3 className="text-2xl font-serif text-gray-900 mb-2">Track Your Order Easily</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Sign in or create an account to easily track your order status, manage returns, and claim your warranty later.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/login', { state: { from: '/checkout' } })}
                        className="w-full bg-black text-white py-3 uppercase tracking-widest text-sm hover:bg-gold-600 transition-colors"
                    >
                        Sign In / Create Account
                    </button>
                    <button
                        onClick={() => setShowGuestPopup(false)}
                        className="w-full bg-white text-gray-900 border border-gray-300 py-3 uppercase tracking-widest text-sm hover:bg-gray-50 transition-colors"
                    >
                        Continue as Guest
                    </button>
                </div>
            </div>
        </div>
      )}`;

content = content.replace(popupSearch, popupReplace);

fs.writeFileSync(filePath, content);
console.log('Done checkout update');
