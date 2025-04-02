import React from 'react';

const CountryFlags = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Nos flux de transferts actuels
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Nos flux de transfert d'argent entre le Gabon et d'autres pays (France, Belgique, Allemagne, Chine, Canada, et USA). <br/>
            D'autres pays viendront au fur et à mesure se compléter à nos flux actuels.
          </p>
        </div>
        
        <div className="mt-12 flex justify-center">
          <img
            src="/flux-transferts.png"
            alt="Flux de transferts KundaPay"
            className="max-w-full h-auto rounded-lg shadow-lg"
            style={{ maxHeight: '400px' }}
          />
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8">
          <div className="flex flex-col items-center">
            <img src="https://flagcdn.com/ga.svg" alt="Gabon" className="w-16 h-12 object-cover rounded shadow-sm" />
            <span className="mt-2 font-medium">Gabon</span>
          </div>
          <div className="flex flex-col items-center">
            <img src="https://flagcdn.com/fr.svg" alt="France" className="w-16 h-12 object-cover rounded shadow-sm" />
            <span className="mt-2 font-medium">France</span>
          </div>
          <div className="flex flex-col items-center">
            <img src="https://flagcdn.com/be.svg" alt="Belgique" className="w-16 h-12 object-cover rounded shadow-sm" />
            <span className="mt-2 font-medium">Belgique</span>
          </div>
          <div className="flex flex-col items-center">
            <img src="https://flagcdn.com/de.svg" alt="Allemagne" className="w-16 h-12 object-cover rounded shadow-sm" />
            <span className="mt-2 font-medium">Allemagne</span>
          </div>
          <div className="flex flex-col items-center">
            <img src="https://flagcdn.com/cn.svg" alt="Chine" className="w-16 h-12 object-cover rounded shadow-sm" />
            <span className="mt-2 font-medium">Chine</span>
          </div>
          <div className="flex flex-col items-center">
            <img src="https://flagcdn.com/us.svg" alt="États-Unis" className="w-16 h-12 object-cover rounded shadow-sm" />
            <span className="mt-2 font-medium">États-Unis</span>
          </div>
          <div className="flex flex-col items-center">
            <img src="https://flagcdn.com/ca.svg" alt="Canada" className="w-16 h-12 object-cover rounded shadow-sm" />
            <span className="mt-2 font-medium">Canada</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CountryFlags;