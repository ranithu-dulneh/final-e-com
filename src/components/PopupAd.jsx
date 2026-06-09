import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, get } from 'firebase/database';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PopupAd = () => {
    const [activeAd, setActiveAd] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already seen a popup this session to avoid annoyance
        const hasSeenPopup = sessionStorage.getItem('hasSeenPopup');
        if (hasSeenPopup) return;

        const fetchPopup = async () => {
            try {
                const snapshot = await get(ref(db, 'settings/popupAds'));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const ads = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                    const active = ads.find(ad => ad.isActive);

                    if (active) {
                        setActiveAd(active);
                        // Small delay before showing
                        setTimeout(() => setIsVisible(true), 2000);
                    }
                }
            } catch (error) {
                console.error("Error fetching popup ad:", error);
            }
        };

        fetchPopup();
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('hasSeenPopup', 'true');
    };

    if (!activeAd) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="bg-white max-w-md w-full overflow-hidden shadow-2xl relative"
                    >
                        <button
                            onClick={handleClose}
                            className="absolute top-2 right-2 p-1.5 bg-black/10 hover:bg-black/20 text-gray-800 rounded-full z-10 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        {activeAd.imageUrl && (
                            <div className="w-full h-48 bg-gray-100">
                                <img src={activeAd.imageUrl} alt={activeAd.title} className="w-full h-full object-cover" />
                            </div>
                        )}

                        <div className="p-8 text-center">
                            <h2 className="text-2xl font-serif text-gray-900 mb-4">{activeAd.title}</h2>
                            {activeAd.description && (
                                <p className="text-gray-600 text-sm mb-6 whitespace-pre-wrap leading-relaxed">
                                    {activeAd.description}
                                </p>
                            )}
                            <button
                                onClick={handleClose}
                                className="w-full bg-black text-white py-3 px-6 text-sm font-bold uppercase tracking-widest hover:bg-gold-600 transition-colors"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PopupAd;
