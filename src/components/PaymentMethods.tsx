import React from 'react';

const paymentMethods = [
  {
    name: "Airtel Money",
    logo: "/airtel-money.png"
  },
  {
    name: "Moov Money",
    logo: "/moov-money.png"
  },
  
  {
    name: "Virement Bancaire",
    logo: "/virement-bancaire.jpg"
  },
  {
    name: "Wero ou PayLib",
    logo: "/wero.png"
  },
  //{
   // name: "Carte Bancaire",
  //  logo: "/cb.png"
 // },
  {
    name: "PayPal",
    logo: "/paypal.png"  // Assurez-vous d'ajouter le logo PayPal dans le dossier public
  },
  {
    name: "Alipay",
    logo: "/1000133611.6795ed4372fe81.90775491.png"
  }
];

const PaymentMethods = () => {
  return (
    <section id="payment-methods" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Moyens de paiement et de réception
          </h2>
        </div>

        <div className="mt-12 flex justify-center items-center gap-8 flex-wrap">
          {paymentMethods.map((method, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="h-20 w-20 flex items-center justify-center">
                <img
                  src={method.logo}
                  alt={`Logo ${method.name}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PaymentMethods;