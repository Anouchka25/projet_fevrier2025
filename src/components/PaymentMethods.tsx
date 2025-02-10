import React from 'react';

const paymentMethods = [
  {
    name: "Airtel Money",
    logo: "/1000133609.6795ec426ab7e3.44408427.png"
  },
  {
    name: "Wero ou Virement Bancaire",
    logo: "/images.67962a90368955.30206419.jpg"
  },
  {
    name: "Wero ou Virement Bancaire",
    logo: "/6758417ac70b0020047139.679629e46bd3b7.68657112.jpg"
  },
  {
    name: "Carte Bancaire",
    logo: "/cb.png"
  },
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

        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <div className="text-center text-sm text-gray-500">
            <p>Note : Le paiement en espèces est disponible auprès de nos agences partenaires au Gabon.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PaymentMethods;