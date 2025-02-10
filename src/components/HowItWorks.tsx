import React from 'react';
import { MapPin, FileText, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: MapPin,
    title: "Sélectionnez les pays",
    description: "Choisissez le pays d'envoi et de réception"
  },
  {
    icon: FileText,
    title: "Remplissez le formulaire",
    description: "Saisissez les informations du transfert"
  },
  {
    icon: CheckCircle,
    title: "Confirmez et envoyez",
    description: "Validez les détails et finalisez la transaction"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Comment ça fonctionne ?
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Transférer de l'argent n'a jamais été aussi simple
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
                      <Icon className="h-8 w-8 text-yellow-500" />
                    </div>
                    <h3 className="mt-6 text-xl font-medium text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-base text-gray-500 text-center">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;