import React, { useEffect } from 'react';

const JotForm = () => {
  useEffect(() => {
    // Charger les scripts JotForm
    const scripts = [
      'https://eu-cdn.jotfor.ms/static/prototype.forms.js',
      'https://eu-cdn.jotfor.ms/static/jotform.forms.js',
      'https://eu-cdn.jotfor.ms/js/punycode-1.4.1.min.js',
      'https://eu-cdn.jotfor.ms/js/vendor/maskedinput_5.0.9.min.js',
      'https://eu-cdn.jotfor.ms/js/vendor/imageinfo.js',
      'https://eu-cdn.jotfor.ms/file-uploader/fileuploader.js',
      'https://eu-cdn.jotfor.ms/s/umd/7b4b993c273/for-widgets-server.js',
      'https://eu-cdn.jotfor.ms/js/vendor/math-processor.js',
      'https://eu-cdn.jotfor.ms/s/umd/7b4b993c273/for-form-branding-footer.js',
      'https://eu-cdn.jotfor.ms/js/vendor/smoothscroll.min.js',
      'https://eu-cdn.jotfor.ms/js/errorNavigation.js'
    ];

    scripts.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    });

    // Ajouter les styles JotForm
    const styles = [
      'https://eu-cdn.jotfor.ms/stylebuilder/static/form-common.css',
      'https://eu-cdn.jotfor.ms/themes/CSS/defaultV2.css',
      'https://eu-cdn.jotfor.ms/themes/CSS/63fdee5e333565092370f287.css',
      'https://eu-cdn.jotfor.ms/css/styles/payment/payment_styles.css',
      'https://eu-cdn.jotfor.ms/css/styles/payment/payment_feature.css'
    ];

    styles.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    });

    // Nettoyer les scripts et styles lors du démontage
    return () => {
      const scripts = document.querySelectorAll('script[src*="jotfor.ms"]');
      const styles = document.querySelectorAll('link[href*="jotfor.ms"]');
      
      scripts.forEach(script => script.remove());
      styles.forEach(style => style.remove());
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <iframe
          id="JotFormIFrame-250247897167368"
          title="KundaPay - Transfert d'Argent"
          allowtransparency="true"
          allowFullScreen
          allow="geolocation; microphone; camera"
          src="https://eu.jotform.com/250247897167368"
          frameBorder="0"
          style={{
            minHeight: '600px',
            width: '100%',
            border: 'none'
          }}
        />
      </div>
    </div>
  );
};

export default JotForm;