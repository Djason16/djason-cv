// Payment page templates for success and cancellation
const PAYMENT_CONFIGS = {
    success: {
        highlight: '#58D68D',
        title: 'Paiement réussi !',
        message: 'Le paiement a été effectué avec succès.',
        english: 'Payment Successful! This window will close automatically.'
    },
    cancel: {
        highlight: '#E74C3C',
        title: 'Paiement annulé !',
        message: 'Le paiement a été annulé.',
        english: 'Payment Canceled. This window will close automatically.'
    }
}

// Render HTML page for payment result
export function renderPaymentPage(type = 'success') {
    const config = PAYMENT_CONFIGS[type] || PAYMENT_CONFIGS.success
    const colors = {
        bg: '#C9D6DF',
        text: '#1a1d1f',
        highlight: config.highlight
    }

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
        background: ${colors.bg};
        color: ${colors.text};
        padding: 2rem;
      }
      .container {
        width: 100%;
        max-width: 600px;
        padding: 3rem 2rem;
        background: #fff;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        text-align: center;
      }
      h1 {
        color: ${colors.highlight};
        font-size: 2.5rem;
        margin-bottom: 1.5rem;
        font-weight: bold;
      }
      p {
        font-size: 1.3rem;
        line-height: 1.6;
        margin-bottom: 1rem;
      }
      strong {
        color: ${colors.highlight};
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>${config.title}</h1>
      <p>${config.message}</p>
      <p><strong>${config.english}</strong></p>
    </div>
    <script>setTimeout(() => window.close(), 3000);</script>
  </body>
</html>`
}