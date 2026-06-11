import { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, get } from "firebase/database";

const Marquee = () => {
  const [offerData, setOfferData] = useState(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const snapshot = await get(ref(db, "settings/offers"));
        if (snapshot.exists()) {
          setOfferData(snapshot.val());
        }
      } catch (error) {
        console.error("Error fetching offers for marquee:", error);
      }
    };

    fetchOffers();
  }, []);

  if (!offerData || !offerData.marqueeActive) {
    return null;
  }

  const messages = [];

  if (offerData.marqueeShowFreeShipping && offerData.freeShippingThreshold) {
    messages.push(`Free Shipping on Orders Above Rs. ${offerData.freeShippingThreshold}!`);
  }

  if (offerData.marqueeShowSeasonal && offerData.seasonalOfferActive && offerData.seasonalOfferTitle) {
    messages.push(`${offerData.seasonalOfferTitle} - ${offerData.seasonalOfferDescription}`);
  }

  if (offerData.marqueeCustomText && offerData.marqueeCustomText.trim() !== "") {
    messages.push(offerData.marqueeCustomText);
  }

  if (messages.length === 0) {
    return null;
  }

  const marqueeContent = messages.join(" ✦ ");

  return (
    <div className="bg-black text-gold-500 overflow-hidden relative z-[60] text-sm py-2 font-sans tracking-widest uppercase flex">
      {/* We use two divs with the same content for seamless looping */}
      <div className="flex whitespace-nowrap animate-marquee shrink-0">
        <span className="mx-4">{marqueeContent} ✦ </span>
        <span className="mx-4">{marqueeContent} ✦ </span>
        <span className="mx-4">{marqueeContent} ✦ </span>
        <span className="mx-4">{marqueeContent} ✦ </span>
      </div>
      <div className="flex whitespace-nowrap animate-marquee shrink-0">
        <span className="mx-4">{marqueeContent} ✦ </span>
        <span className="mx-4">{marqueeContent} ✦ </span>
        <span className="mx-4">{marqueeContent} ✦ </span>
        <span className="mx-4">{marqueeContent} ✦ </span>
      </div>
    </div>
  );
};

export default Marquee;
