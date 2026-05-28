// Configuration templates for payment and subscription results
const RESULT_CONFIGS = {
  payment: {
    success: {
      highlight: '#2e9e5e',
      highlightDeco: '#58D68D',
      title: 'Paiement réussi !',
      message: 'Le paiement a été effectué avec succès.',
      english: 'Payment Successful! This window will close automatically.'
    },
    cancel: {
      highlight: '#c0392b',
      highlightDeco: '#E74C3C',
      title: 'Paiement annulé !',
      message: 'Le paiement a été annulé.',
      english: 'Payment Canceled. This window will close automatically.'
    }
  },
  subscription: {
    success: {
      highlight: '#2e9e5e',
      highlightDeco: '#58D68D',
      title: 'Abonnement activé !',
      message: 'Votre abonnement de 12 mois a été activé avec succès.',
      english: 'Subscription Activated! Your 12-month web development subscription is now active. This window will close automatically.'
    },
    cancel: {
      highlight: '#c0392b',
      highlightDeco: '#E74C3C',
      title: 'Abonnement annulé !',
      message: 'L\'activation de l\'abonnement a été annulée.',
      english: 'Subscription Canceled. This window will close automatically.'
    }
  }
}

// Generic render function for payment/subscription result pages
function renderResultPage(configType, resultType = 'success') {
  const config = RESULT_CONFIGS[configType]?.[resultType] || RESULT_CONFIGS[configType]?.success

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Barlow Condensed', 'Roboto Condensed', sans-serif;
        background: #C9D6DF;
        color: #1a1d1f;
        padding: 2rem;
      }
      .container {
        width: 100%;
        max-width: 600px;
        padding: 3rem 2rem;
        background: #fff;
        border-top: 3px solid ${config.highlightDeco};
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        text-align: center;
      }
      .divider {
        width: 40px;
        height: 3px;
        background: ${config.highlightDeco};
        margin: 0 auto 1.5rem;
      }
      h1 {
        color: ${config.highlight};
        font-size: 2.5rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin-bottom: 0.5rem;
      }
      p {
        font-size: 1.1rem;
        line-height: 1.6;
        color: #1a1d1f;
        margin-bottom: 0.75rem;
      }
      strong {
        color: ${config.highlight};
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>${config.title}</h1>
      <div class="divider"></div>
      <p>${config.message}</p>
      <p><strong>${config.english}</strong></p>
    </div>
    <script>setTimeout(() => window.close(), 3000);</script>
  </body>
</html>`
}

// Export convenience functions
export const renderPaymentPage = (type) => renderResultPage('payment', type)
export const renderSubscriptionPage = (type) => renderResultPage('subscription', type)