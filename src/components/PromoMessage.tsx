import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const images = ["/pub1.svg", "/pub2.svg"];

const PromoCarousel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change toutes les 3 secondes
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative w-[90%] md:w-[70%] bg-white rounded-lg shadow-md mx-auto mt-6 overflow-hidden"
    >
      {/* Conteneur pour les images */}
      <div className="relative w-full h-[40vh] h-72 flex items-center justify-center overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={images[index]}
            src={images[index]}
            alt="Promo Envoi d'Argent"
            className="absolute w-full h-full object-cover"
            initial={{ x: direction === 1 ? 100 : -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction === 1 ? -100 : 100, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        </AnimatePresence>
      </div>

      {/* Boutons de navigation */}
      <button
        onClick={() => {
          setDirection(-1);
          setIndex((index - 1 + images.length) % images.length);
        }}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-900 transition"
      >
        {"<"}
      </button>

      <button
        onClick={() => {
          setDirection(1);
          setIndex((index + 1) % images.length);
        }}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-900 transition"
      >
        {">"}
      </button>

      {/* Bouton de fermeture */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 bg-gray-700 text-white p-1 rounded-full hover:bg-gray-900 transition"
        aria-label="Fermer la publicité"
      >
        <X size={20} />
      </button>
    </motion.div>
  );
};

export default PromoCarousel;
