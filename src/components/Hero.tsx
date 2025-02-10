import React from 'react';

const Hero = () => {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">KundaPay :</span>
                <span className="block text-yellow-500">Le transfert en toute confiance</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Grâce à notre service innovant, transférez de l'argent instantanément entre le Gabon, la Chine, la France, le Canada et les USA . Profitez de frais compétitifs et d'une expérience utilisateur optimisée pour vos besoins personnels ou professionnels.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Hero;