import { supabase } from './supabase';

const ONESIGNAL_APP_ID = '66a65c91-e2db-45d6-a879-14f1208adacf';
const ONESIGNAL_API_KEY = 'os_v2_app_m2tfzepc3nc5nkdzctysbcw2z4r7647yl2jej6es4swqxyquifi3wwtwozpj6jlk3y2ue43an6ndpgijp4jlrku7g5tnj6tmdh6ku3q';

export async function initializeOneSignal() {
  try {
    if (!window.OneSignalDeferred) {
      console.warn('OneSignal not loaded');
      return;
    }

    window.OneSignalDeferred.push(async function(OneSignal) {
      // Check if we're in development or production
      const isLocalEnvironment = 
        window.location.hostname === 'localhost' || 
        window.location.hostname.includes('webcontainer-api.io') ||
        window.location.hostname.includes('local-credentialless');
      
      if (isLocalEnvironment) {
        console.log('OneSignal: Running in development environment - notifications disabled');
        return; // Skip OneSignal initialization in development
      }
      
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        safari_web_id: "web.onesignal.auto.2b3f64b2-7083-4ec5-9c09-3f8119751fed",
        notifyButton: {
          enable: true,
        },
      });

      // Save OneSignal user ID to Supabase
      try {
        const userId = await OneSignal.getUserId();
        if (userId) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase
              .from('users')
              .update({ onesignal_id: userId })
              .eq('id', user.id);
            
            if (error) console.error('Error saving OneSignal ID:', error);
          }
        }
      } catch (idError) {
        console.error('Error getting OneSignal user ID:', idError);
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de OneSignal:', error);
  }
}

export async function sendWelcomeEmail(userId: string, userEmail: string, userName: string) {
  try {
    const notificationData = {
      app_id: ONESIGNAL_APP_ID,
      include_external_user_ids: [userId],
      email_subject: {
        fr: "Bienvenue sur KundaPay !",
        en: "Welcome to KundaPay!"
      },
      email_body: {
        fr: `
          <h1>Bienvenue sur KundaPay, ${userName} !</h1>
          <p>Merci d'avoir choisi KundaPay pour vos transferts d'argent.</p>
          <p>Nous sommes ravis de vous compter parmi nos utilisateurs et nous nous engageons à vous offrir le meilleur service possible.</p>
          <p>N'hésitez pas à nous contacter si vous avez des questions !</p>
          <p>L'équipe KundaPay</p>
        `,
        en: `
          <h1>Welcome to KundaPay, ${userName}!</h1>
          <p>Thank you for choosing KundaPay for your money transfers.</p>
          <p>We're delighted to have you as a user and we're committed to providing you with the best possible service.</p>
          <p>Don't hesitate to contact us if you have any questions!</p>
          <p>The KundaPay Team</p>
        `
      },
      channel_for_external_user_ids: "push",
      email_from_name: "KundaPay",
      email_from_address: "noreply@kundapay.com"
    };

    await sendOneSignalNotification(notificationData);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
  }
}

export async function sendTransferConfirmationEmail(transferId: string) {
  try {
    const { data: transfer, error } = await supabase
      .from('transfers')
      .select(`
        *,
        user:users!transfers_user_id_fkey (id, email, first_name, last_name, onesignal_id),
        beneficiaries (first_name, last_name, email)
      `)
      .eq('id', transferId)
      .single();

    if (error) throw error;
    if (!transfer?.user?.id) throw new Error('Utilisateur non trouvé');

    // Envoyer l'email à l'utilisateur
    const userNotificationData = {
      app_id: ONESIGNAL_APP_ID,
      include_external_user_ids: [transfer.user.id],
      email_subject: {
        fr: `Confirmation de votre transfert ${transfer.reference}`,
        en: `Confirmation of your transfer ${transfer.reference}`
      },
      email_body: {
        fr: `
          <h1>Votre transfert a été créé avec succès !</h1>
          <h2>Détails du transfert :</h2>
          <ul>
            <li>Référence : ${transfer.reference}</li>
            <li>Montant envoyé : ${transfer.amount_sent} ${transfer.sender_currency}</li>
            <li>Montant reçu : ${transfer.amount_received} ${transfer.receiver_currency}</li>
            <li>Bénéficiaire : ${transfer.beneficiaries[0].first_name} ${transfer.beneficiaries[0].last_name}</li>
            <li>Statut : En attente de validation</li>
          </ul>
          <p>Nous vous informerons dès que votre transfert sera validé.</p>
        `,
        en: `
          <h1>Your transfer has been created successfully!</h1>
          <h2>Transfer details:</h2>
          <ul>
            <li>Reference: ${transfer.reference}</li>
            <li>Amount sent: ${transfer.amount_sent} ${transfer.sender_currency}</li>
            <li>Amount received: ${transfer.amount_received} ${transfer.receiver_currency}</li>
            <li>Beneficiary: ${transfer.beneficiaries[0].first_name} ${transfer.beneficiaries[0].last_name}</li>
            <li>Status: Pending validation</li>
          </ul>
          <p>We will notify you as soon as your transfer is validated.</p>
        `
      },
      channel_for_external_user_ids: "push",
      email_from_name: "KundaPay",
      email_from_address: "noreply@kundapay.com"
    };

    // Envoyer l'email aux administrateurs
    const adminNotificationData = {
      app_id: ONESIGNAL_APP_ID,
      include_external_user_ids: ['admin_group'],
      email_subject: {
        fr: `Nouveau transfert à valider - ${transfer.reference}`,
        en: `New transfer to validate - ${transfer.reference}`
      },
      email_body: {
        fr: `
          <h1>Nouveau transfert à valider</h1>
          <h2>Détails du transfert :</h2>
          <ul>
            <li>Référence : ${transfer.reference}</li>
            <li>Montant envoyé : ${transfer.amount_sent} ${transfer.sender_currency}</li>
            <li>Montant reçu : ${transfer.amount_received} ${transfer.receiver_currency}</li>
            <li>Expéditeur : ${transfer.user.first_name} ${transfer.user.last_name} (${transfer.user.email})</li>
            <li>Bénéficiaire : ${transfer.beneficiaries[0].first_name} ${transfer.beneficiaries[0].last_name}</li>
            <li>Mode de paiement : ${transfer.payment_method}</li>
            <li>Mode de réception : ${transfer.receiving_method}</li>
            <li>Origine des fonds : ${transfer.funds_origin}</li>
            <li>Raison du transfert : ${transfer.transfer_reason}</li>
          </ul>
          <p>Veuillez valider ce transfert dans le tableau de bord administrateur.</p>
        `,
        en: `
          <h1>New transfer to validate</h1>
          <h2>Transfer details:</h2>
          <ul>
            <li>Reference: ${transfer.reference}</li>
            <li>Amount sent: ${transfer.amount_sent} ${transfer.sender_currency}</li>
            <li>Amount received: ${transfer.amount_received} ${transfer.receiver_currency}</li>
            <li>Sender: ${transfer.user.first_name} ${transfer.user.last_name} (${transfer.user.email})</li>
            <li>Beneficiary: ${transfer.beneficiaries[0].first_name} ${transfer.beneficiaries[0].last_name}</li>
            <li>Payment method: ${transfer.payment_method}</li>
            <li>Receiving method: ${transfer.receiving_method}</li>
            <li>Funds origin: ${transfer.funds_origin}</li>
            <li>Transfer reason: ${transfer.transfer_reason}</li>
          </ul>
          <p>Please validate this transfer in the admin dashboard.</p>
        `
      },
      channel_for_external_user_ids: "push",
      email_from_name: "KundaPay",
      email_from_address: "noreply@kundapay.com"
    };

    await Promise.all([
      sendOneSignalNotification(userNotificationData),
      sendOneSignalNotification(adminNotificationData)
    ]);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
  }
}

export async function sendTransferStatusEmail(transferId: string, status: 'completed' | 'cancelled') {
  try {
    const { data: transfer, error } = await supabase
      .from('transfers')
      .select(`
        *,
        user:users!transfers_user_id_fkey (id, email, first_name, last_name, onesignal_id),
        beneficiaries (first_name, last_name, email)
      `)
      .eq('id', transferId)
      .single();

    if (error) throw error;
    if (!transfer?.user?.id) throw new Error('Utilisateur non trouvé');

    const notificationData = {
      app_id: ONESIGNAL_APP_ID,
      include_external_user_ids: [transfer.user.id],
      email_subject: {
        fr: status === 'completed' 
          ? `Votre transfert ${transfer.reference} a été validé`
          : `Votre transfert ${transfer.reference} a été annulé`,
        en: status === 'completed'
          ? `Your transfer ${transfer.reference} has been validated`
          : `Your transfer ${transfer.reference} has been cancelled`
      },
      email_body: {
        fr: status === 'completed' ? `
          <h1>Votre transfert a été validé !</h1>
          <h2>Détails du transfert :</h2>
          <ul>
            <li>Référence : ${transfer.reference}</li>
            <li>Montant envoyé : ${transfer.amount_sent} ${transfer.sender_currency}</li>
            <li>Montant reçu : ${transfer.amount_received} ${transfer.receiver_currency}</li>
            <li>Bénéficiaire : ${transfer.beneficiaries[0].first_name} ${transfer.beneficiaries[0].last_name}</li>
          </ul>
          <p>Le montant sera bientôt disponible pour le bénéficiaire.</p>
          <p>Merci de votre confiance !</p>
        ` : `
          <h1>Votre transfert a été annulé</h1>
          <h2>Détails du transfert :</h2>
          <ul>
            <li>Référence : ${transfer.reference}</li>
            <li>Montant : ${transfer.amount_sent} ${transfer.sender_currency}</li>
            <li>Bénéficiaire : ${transfer.beneficiaries[0].first_name} ${transfer.beneficiaries[0].last_name}</li>
          </ul>
          <p>Pour plus d'informations, veuillez nous contacter.</p>
        `,
        en: status === 'completed' ? `
          <h1>Your transfer has been validated!</h1>
          <h2>Transfer details:</h2>
          <ul>
            <li>Reference: ${transfer.reference}</li>
            <li>Amount sent: ${transfer.amount_sent} ${transfer.sender_currency}</li>
            <li>Amount received: ${transfer.amount_received} ${transfer.receiver_currency}</li>
            <li>Beneficiary: ${transfer.beneficiaries[0].first_name} ${transfer.beneficiaries[0].last_name}</li>
          </ul>
          <p>The amount will soon be available to the beneficiary.</p>
          <p>Thank you for your trust!</p>
        ` : `
          <h1>Your transfer has been cancelled</h1>
          <h2>Transfer details:</h2>
          <ul>
            <li>Reference: ${transfer.reference}</li>
            <li>Amount: ${transfer.amount_sent} ${transfer.sender_currency}</li>
            <li>Beneficiary: ${transfer.beneficiaries[0].first_name} ${transfer.beneficiaries[0].last_name}</li>
          </ul>
          <p>For more information, please contact us.</p>
        `
      },
      channel_for_external_user_ids: "push",
      email_from_name: "KundaPay",
      email_from_address: "noreply@kundapay.com"
    };

    await sendOneSignalNotification(notificationData);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de statut:', error);
  }
}

async function sendOneSignalNotification(data: any) {
  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_API_KEY}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'envoi de la notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification OneSignal:', error);
    throw error;
  }
}