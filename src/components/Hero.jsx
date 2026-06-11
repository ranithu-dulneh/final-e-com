import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import heroBg from "../assets/hero-bg.png";

const TypewriterText = ({ text, className, delay = 0 }) => {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delay * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.span
      style={{ overflow: "hidden", display: "inline-flex", flexWrap: "wrap", justifyContent: "center" }}
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {words.map((word, index) => (
        <motion.span variants={child} style={{ marginRight: "0.25em" }} key={index}>
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

const Hero = () => {
  const ref = useRef(null);
  const { scrollY } = useScroll();

  // Opacity fades from 1 to 0 between scroll 0 and 400
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  // Move down slightly as we scroll down to create a parallax/fade out
  const y = useTransform(scrollY, [0, 400], [0, 100]);

  return (
    <div
      ref={ref}
      className="relative bg-off-white overflow-hidden min-h-[80vh] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      {/* Dark overlay to make text readable */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      <motion.div
        style={{ opacity, y }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <h1 className="text-4xl md:text-6xl font-serif text-white tracking-tight mb-6 leading-tight flex flex-col items-center">
          <TypewriterText text="Timeless Elegance &" delay={0.04} />
          <TypewriterText text="Exquisite Luxury" className="text-gold-400 italic mt-2" delay={0.5} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 1.5 }}
          className="mt-4 max-w-2xl mx-auto text-xl text-gray-200 font-light mb-10 drop-shadow-md"
        >
          Discover our exclusive collection of hand-crafted jewelry and premium gifts.
          Designed for those who appreciate the finer things in life.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 1.8 }}
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
             className="px-8 py-4 border border-white text-white text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 font-medium"
          >
             Our Story
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero;
