import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppBubble = () => {
  const phoneNumber = "33658898531"; // Format international sans le +
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#128C7E] transition-colors duration-300 z-50 flex items-center justify-center"
      aria-label="Contactez-nous sur WhatsApp"
    >
      <MessageCircle className="h-8 w-8" />
    </a>
  );
};

export default WhatsAppBubble;