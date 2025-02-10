import React from 'react';
import { CircleDollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

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
                <Link to="/conditions-generales" className="text-base text-gray-300 hover:text-white">
                  Conditions générales
                </Link>
              </li>
              <li>
                <Link to="/politique-de-confidentialite" className="text-base text-gray-300 hover:text-white">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/mentions-legales" className="text-base text-gray-300 hover:text-white">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Réseaux sociaux
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="https://www.facebook.com/kundapay" target="_blank" rel="noopener noreferrer" className="text-base text-gray-300 hover:text-white">
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 text-center">
            © {new Date().getFullYear()} KundaPay. Tous droits réservés. Créé par <a href="https://agency.toutpaie.fr/" target="_blank">ToutPaie Agency</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;