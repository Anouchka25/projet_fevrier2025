import React from 'react';
import { Link } from 'react-router-dom';
import { CircleDollarSign } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center">
              <CircleDollarSign className="h-8 w-8 text-yellow-500" />
              <span className="ml-2 text-2xl font-bold text-white">KundaPay</span>
            </div>
            <p className="mt-2 text-base text-gray-400">
              Le transfert en toute confiance.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Liens utiles
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/mentions-legales" className="text-base text-gray-300 hover:text-white">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/conditions-generales" className="text-base text-gray-300 hover:text-white">
                  Conditions générales
                </Link>
              </li>
              <li>
                <Link to="/Procedures" className="text-base text-gray-300 hover:text-white">
                  Procédure de Vérification des Fonds Entrants
                </Link>
              </li>
              <li>
                <Link to="/politique-de-confidentialite" className="text-base text-gray-300 hover:text-white">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Contact
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="mailto:kundapay@gmail.com" className="text-base text-gray-300 hover:text-white">
                  kundapay@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+33658898531" className="text-base text-gray-300 hover:text-white">
                  +33 6 58 89 85 31
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;