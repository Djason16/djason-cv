const express = require('express');
const Stripe = require('stripe');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Use environment-specific secret key

// Create a Stripe checkout session
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { amount, currency, email } = req.body;
        if (!amount || !currency || !email)
            return res.status(400).json({ error: 'Amount, currency, and email are required.' });

        const total = Math.ceil(amount * 1.029 + 30); // Stripe fee included
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price_data: { currency, product_data: { name: 'Djason CHERY - Video and Web Services' }, unit_amount: total }, quantity: 1 }],
            mode: 'payment',
            customer_email: email,
            success_url: `${process.env.BACKEND_DOMAIN}/stripe/success`,
            cancel_url: `${process.env.BACKEND_DOMAIN}/stripe/cancel`,
        });

        res.json({ sessionId: session.id, url: session.url });
    } catch (err) {
        console.error('Stripe Error:', err.message);
        res.status(500).json({ error: 'Failed to create Stripe session.' });
    }
});

// Render payment page (success or cancel)
const renderPaymentPage = (type = 'success') => {
    const isSuccess = type === 'success';
    const colors = { bg: '#C9D6DF', text: '#1a1d1f', highlight: isSuccess ? '#58D68D' : '#E74C3C' };
    const messages = {
        title: isSuccess ? 'Paiement réussi !' : 'Paiement annulé !',
        message: isSuccess ? 'Le paiement a été effectué avec succès.' : 'Le paiement a été annulé.',
        english: isSuccess ? 'Payment Successful! This window will close automatically.' : 'Payment Canceled. This window will close automatically.'
    };

    return `
    <html>
      <head>
        <style>
          body { text-align:center; padding:2rem; font-family:'Barlow Condensed','Roboto Condensed',sans-serif; background:${colors.bg}; color:${colors.text}; }
          .container { width:90%; max-width:600px; aspect-ratio:1/1; margin:auto; padding:2rem; background:#fff; box-shadow:0 4px 10px rgba(0,0,0,0.1); display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; }
          h1 { color:${colors.highlight}; font-size:2rem; }
          p { margin-top:1rem; font-size:1.2rem; line-height:1.5; }
          strong { color:${colors.highlight}; font-weight:500; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${messages.title}</h1>
          <p>${messages.message}</p>
          <p><strong>${messages.english}</strong></p>
        </div>
        <script>setTimeout(()=>window.close(),3000);</script>
      </body>
    </html>
  `;
};

// Success and cancel routes
router.get('/success', (req, res) => res.send(renderPaymentPage('success')));
router.get('/cancel', (req, res) => res.send(renderPaymentPage('cancel')));

// Check payment status by session ID
router.get('/check-payment-status', async (req, res) => {
    try {
        const { sessionId } = req.query;
        if (!sessionId) return res.status(400).json({ error: 'Session ID is required' });

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        res.json({ success: session.payment_status === 'paid' });
    } catch (err) {
        console.error('Error checking payment status:', err.message);
        res.status(500).json({ error: 'Unable to check payment status' });
    }
});

module.exports = router;