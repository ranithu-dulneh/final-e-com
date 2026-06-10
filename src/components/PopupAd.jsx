import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { db } from "../firebase";
import { ref, get } from "firebase/database";

const PopupAd = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchPopupData = async () => {
      try {
        const snapshot = await get(ref(db, 'settings/offers'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.popupActive) {
            setPopupData(data);

            // Check if already seen in this session
            const hasSeen = sessionStorage.getItem("hasSeenPopup");

            // Check page target
            const targetPage = data.popupTargetPage || "All";
            const isMatch = targetPage === "All" || targetPage === location.pathname;

            if (!hasSeen && isMatch) {
                // Slight delay for better UX
                setTimeout(() => setIsOpen(true), 1500);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load popup data", err);
      }
    };

    fetchPopupData();
  }, [location.pathname]);

  const handleClose = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    sessionStorage.setItem("hasSeenPopup", "true");
  };

  const handleAction = () => {
    setIsOpen(false);
    sessionStorage.setItem("hasSeenPopup", "true");
    if (popupData?.popupTargetUrl) {
        navigate(popupData.popupTargetUrl);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && popupData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative bg-white shadow-2xl max-w-lg w-full overflow-hidden cursor-pointer group"
            onClick={handleAction}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 hover:bg-white text-gray-800 rounded-full transition-colors shadow-sm"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                {popupData.popupImageUrl && (
                    <div className="w-full md:w-1/2 h-48 md:h-auto relative overflow-hidden bg-gray-100">
                        <img
                            src={popupData.popupImageUrl}
                            alt={popupData.popupHeading || "Offer"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                    </div>
                )}

                {/* Content Section */}
                <div className={`w-full p-8 flex flex-col justify-center ${popupData.popupImageUrl ? 'md:w-1/2' : ''}`}>
                    <h2 className="text-2xl font-serif text-gray-900 mb-3">{popupData.popupHeading}</h2>
                    {popupData.popupDescription && (
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            {popupData.popupDescription}
                        </p>
                    )}
                    {popupData.popupTargetUrl && (
                        <span className="inline-block border-b border-black text-sm uppercase tracking-widest text-black pb-1 hover:text-gold-600 hover:border-gold-600 transition-colors w-max">
                            Discover More
                        </span>
                    )}
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PopupAd;
