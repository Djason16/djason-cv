/*
 * Pages of the Stripe popup once the payment is done or cancelled (success / cancel URLs given to Stripe),
 * closed automatically after 3 seconds:
 *   StripePages.payment('success' | 'cancel')   StripePages.subscription('success' | 'cancel')
 */

// Configuration templates for payment and subscription results
const RESULT_CONFIGS = {
  payment: {
    success: {
      highlight: '#7ee6a8',
      highlightDeco: '#7ee6a8',
      title: 'Paiement réussi !',
      message: 'Le paiement a été effectué avec succès.',
      english: 'Payment Successful! This window will close automatically.'
    },
    cancel: {
      highlight: '#ffb4a8',
      highlightDeco: '#e74c3c',
      title: 'Paiement annulé !',
      message: 'Le paiement a été annulé.',
      english: 'Payment Canceled. This window will close automatically.'
    }
  },
  subscription: {
    success: {
      highlight: '#7ee6a8',
      highlightDeco: '#7ee6a8',
      title: 'Abonnement activé !',
      message: 'Votre abonnement de 12 mois a été activé avec succès.',
      english: 'Subscription Activated! Your 12-month web development subscription is now active. This window will close automatically.'
    },
    cancel: {
      highlight: '#ffb4a8',
      highlightDeco: '#e74c3c',
      title: 'Abonnement annulé !',
      message: 'L\'activation de l\'abonnement a été annulée.',
      english: 'Subscription Canceled. This window will close automatically.'
    }
  }
}

// Result page in the look of the site: the bar with the logo, a mint (or red) label, the Archivo title, and a thin bar that empties until the popup closes
function renderResultPage(configType, resultType = 'success') {
  const config = RESULT_CONFIGS[configType]?.[resultType] || RESULT_CONFIGS[configType]?.success
  const icon = resultType === 'cancel' ? '&#10005;' : '&#10003;'

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex">
    <title>${config.title}</title>
    <style>
      @font-face { font-family: 'Barlow Condensed'; font-weight: 400; src: url('/fonts/BarlowCondensed-Regular.ttf') format('truetype'); }
      @font-face { font-family: 'Barlow Condensed'; font-weight: 600 700; src: url('/fonts/BarlowCondensed-SemiBold.ttf') format('truetype'); }
      @font-face { font-family: 'Archivo'; font-weight: 600; font-stretch: 125%; src: url('/fonts/Archivo-Expanded-SemiBold.ttf') format('truetype'); }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Barlow Condensed', 'Arial Narrow', Arial, sans-serif;
        background: #0b0d0f;
        color: #eef1f3;
        padding: 1.5rem;
      }
      /* The card of the site: ink, thin rules, no rounded corners */
      .card {
        width: 100%;
        max-width: 520px;
        background: #111417;
        border: 1px solid rgba(255, 255, 255, 0.08);
        overflow: hidden;
        animation: rise 0.55s cubic-bezier(0.33, 1, 0.68, 1) both;
      }
      .brand { padding: 1.25rem 2rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
      .brand img { height: 30px; display: block; }
      .content { padding: 2.25rem 2rem 2rem; }
      .eyebrow { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.9rem; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.26em; text-transform: uppercase; color: ${config.highlight}; }
      .eyebrow .mark { display: inline-grid; place-items: center; width: 1.6rem; height: 1.6rem; background: ${config.highlightDeco}; color: #111417; font-size: 0.9rem; letter-spacing: 0; }
      h1 {
        font-family: 'Archivo', 'Arial Black', Arial, sans-serif;
        font-stretch: 125%;
        font-weight: 600;
        font-size: 2rem;
        line-height: 1.05;
        text-transform: uppercase;
      }
      .divider { width: 48px; height: 2px; background: ${config.highlightDeco}; margin: 1rem 0 1.25rem; }
      p { font-size: 1.15rem; line-height: 1.55; color: #d6dce0; }
      .english { margin-top: 0.5rem; font-size: 1rem; color: #a4b0b8; }
      .timer { height: 2px; background: rgba(255, 255, 255, 0.06); }
      .timer span { display: block; height: 100%; background: ${config.highlightDeco}; animation: empty 3s linear forwards; }
      @keyframes rise { from { opacity: 0; transform: translateY(1.5rem); } }
      @keyframes empty { from { width: 100%; } to { width: 0; } }
      @media (prefers-reduced-motion: reduce) { .card, .timer span { animation: none; } }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="brand"><img src="/images/main_logo_light.png" alt="Djason Chery"></div>
      <div class="content">
        <p class="eyebrow"><span class="mark" aria-hidden="true">${icon}</span>${resultType === 'cancel' ? 'Stripe · annulé' : 'Stripe · confirmé'}</p>
        <h1>${config.title}</h1>
        <div class="divider"></div>
        <p>${config.message}</p>
        <p class="english">${config.english}</p>
      </div>
      <div class="timer" aria-hidden="true"><span></span></div>
    </main>
    <script>setTimeout(() => window.close(), 3000);</script>
  </body>
</html>`
}

export const StripePages = {
    payment: type => renderResultPage('payment', type),
    subscription: type => renderResultPage('subscription', type),
}
