import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Clipboard } from "lucide-react";

const DiscountPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Fonction pour copier un code promo
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Code ${code} copié !`);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div className="bg-green-100 rounded-lg p-6 w-[90%] md:w-[500px] shadow-lg relative">
        {/* Bouton de fermeture */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 text-gray-700 hover:bg-gray-200 p-1 rounded-full"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>

        {/* Titre */}
        <h2 className="text-green-800 font-bold text-xl text-center">
          🎉 Réduction de frais chez KundaPay ! 🎉
        </h2>
        <p className="text-gray-700 text-center mt-2">
          Profitez de **réductions exclusives** pour vos transferts **de la France vers le Gabon** :
        </p>

        {/* Offres avec codes promos */}
        <div className="mt-4 space-y-3">
          {/* Offre 1 */}
          <div className="bg-white p-3 rounded-md shadow flex items-center justify-between">
            <div>
              <span className="text-lg font-semibold text-red-600">-50%</span>
              <p className="text-gray-800 text-sm">Dès <strong>500€</strong> de transfert</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-gray-100 px-3 py-1 rounded-md font-semibold text-gray-900">WELCOME50</span>
              <button
                onClick={() => copyToClipboard("WELCOME50")}
                className="text-gray-600 hover:text-gray-900"
                aria-label="Copier"
              >
                <Clipboard size={20} />
              </button>
            </div>
          </div>

          {/* Offre 2 */}
          <div className="bg-white p-3 rounded-md shadow flex items-center justify-between">
            <div>
              <span className="text-lg font-semibold text-red-600">-75%</span>
              <p className="text-gray-800 text-sm">Dès <strong>1000€</strong> de transfert</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-gray-100 px-3 py-1 rounded-md font-semibold text-gray-900">WELCOME75</span>
              <button
                onClick={() => copyToClipboard("WELCOME75")}
                className="text-gray-600 hover:text-gray-900"
                aria-label="Copier"
              >
                <Clipboard size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Bouton pour fermer le popup */}
        <div className="text-center mt-6">
          <button
            onClick={() => setIsVisible(false)} // 🔹 Ferme le popup en cliquant
            className="bg-green-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-800 transition"
          >
            J'en profite 🚀
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DiscountPopup;
