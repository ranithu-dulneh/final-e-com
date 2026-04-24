import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <div className="relative bg-off-white overflow-hidden min-h-[80vh] flex items-center justify-center">
      <div className="absolute inset-0 z-0 opacity-10 pattern-grid-lg text-gray-300" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="text-4xl md:text-6xl font-serif text-black tracking-tight mb-6"
        >
          Timeless Elegance &<br/>
          <span className="text-gold-600 italic">Exquisite Luxury</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 font-light mb-10"
        >
          Discover our exclusive collection of hand-crafted jewelry and premium gifts.
          Designed for those who appreciate the finer things in life.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
          className="flex justify-center gap-4"
        >
          <Link
            to="/shop"
            className="px-8 py-4 bg-gold-500 text-white text-sm uppercase tracking-widest font-medium hover:bg-gold-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Shop Collection
          </Link>
          <Link
             to="/about"
             className="px-8 py-4 border border-black text-black text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300 font-medium"
          >
             Our Story
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero;
