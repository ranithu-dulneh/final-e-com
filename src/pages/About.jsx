import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="min-h-screen bg-off-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-8">
            Our Story of Excellence
          </h1>
          <div className="w-24 h-1 bg-gold-500 mx-auto mb-10"></div>

          <div className="prose prose-lg mx-auto text-gray-600 space-y-8 font-light leading-relaxed">
            <p>
              Welcome to <span className="text-gray-900 font-medium">ZAFIRA</span>, where luxury meets craftsmanship.
              Our journey began with a simple yet profound vision: to provide exquisite jewelry that embodies
              sophistication, quality, and timeless beauty.
            </p>

            <p>
              We believe that true luxury lies in the details. Every piece in our collection is curated with
              an unwavering commitment to <strong>quality</strong>. From the finest materials to the intricate designs,
              we ensure that each item reflects the high standards our customers deserve.
            </p>

            <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 bg-white border border-gray-100 shadow-sm">
                <h3 className="font-serif text-xl text-gray-900 mb-3">Uncompromising Quality</h3>
                <p className="text-sm">Only the finest materials and craftsmanship make it to our collection.</p>
              </div>
              <div className="p-6 bg-white border border-gray-100 shadow-sm">
                <h3 className="font-serif text-xl text-gray-900 mb-3">Fine Products</h3>
                <p className="text-sm">Elegant, timeless, and sophisticated designs for every occasion.</p>
              </div>
              <div className="p-6 bg-white border border-gray-100 shadow-sm">
                <h3 className="font-serif text-xl text-gray-900 mb-3">Trust & Integrity</h3>
                <p className="text-sm">Building lasting relationships through transparency and reliability.</p>
              </div>
            </div>

            <p>
              At ZAFIRA, <strong>trust</strong> is the cornerstone of our business. We understand that purchasing
              fine jewelry is an investment, both emotional and financial. That is why we are dedicated to
              transparency and exceptional service, ensuring that your experience with us is as flawless as the
              products we offer.
            </p>

            <p>
              Discover the art of fine gifting and adorn yourself with elegance. Thank you for choosing ZAFIRA.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default About;
