const express = require('express'); // Web framework to handle HTTP requests
const Stripe = require('stripe'); // Stripe library to interact with Stripe API

// Create a new router instance
const router = express.Router();

// Select Stripe secret key based on environment (development or production)
const stripeSecretKey = process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY // Use production secret key
    : process.env.STRIPE_SECRET_KEY; // Use development secret key

const stripe = new Stripe(stripeSecretKey); // Initialize Stripe with the correct secret key

// Endpoint to create a Stripe checkout session
router.post('/create-checkout-session', async (req, res) => {
    try {
        // Destructure amount, currency, and email from the request body
        const { amount, currency, email } = req.body;

        // Validate that all required fields are provided
        if (!amount || !currency || !email) {
            return res.status(400).json({ error: 'Amount, currency, and email are required.' });
        }

        // Calculate the total amount, including Stripe's percentage and fixed fee
        const stripePercentage = 0.029; // Stripe's transaction percentage
        const stripeFixedFee = 30; // Stripe's fixed fee per transaction
        const totalAmount = Math.ceil(amount + amount * stripePercentage + stripeFixedFee); // Total amount to charge

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], // Accept only card payments
            line_items: [
                {
                    price_data: {
                        currency, // Currency type (USD, EUR, etc.)
                        product_data: { name: 'Djason CHERY - Video and Web Services' }, // The product being purchased
                        unit_amount: totalAmount, // The total amount for the product
                    },
                    quantity: 1, // Number of items (in this case, 1 item)
                },
            ],
            mode: 'payment', // The payment mode
            customer_email: email, // The customer's email address
            success_url: `${process.env.BACKEND_DOMAIN}/stripe/success`, // Redirect URL for successful payment
            cancel_url: `${process.env.BACKEND_DOMAIN}/stripe/cancel`, // Redirect URL for canceled payment
        });

        // Return session ID and URL for redirection to Stripe's checkout page
        res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        // Log and return error if creating the checkout session fails
        console.error('Stripe Error:', error.message);
        res.status(500).json({ error: 'An error occurred while creating the Stripe session.' });
    }
});

// Function to render the payment page with a consistent layout
function renderPaymentPage(type = 'success') {
    const isSuccess = type === 'success';

    const backgroundColor = '#C9D6DF';
    const textColor = '#1a1d1f';
    const highlightColor = isSuccess ? '#58D68D' : '#E74C3C';
    const title = isSuccess ? 'Paiement réussi !' : 'Paiement annulé !';
    const message = isSuccess
        ? 'Le paiement a été effectué avec succès.'
        : 'Le paiement a été annulé.';
    const englishMsg = isSuccess
        ? 'Payment Successful! This window will close automatically.'
        : 'Payment Canceled. This window will close automatically.';

    return `
        <html>
            <head>
                <style>
                    body {
                        text-align: center;
                        padding: 2rem;
                        font-family: 'Barlow Condensed', 'Roboto Condensed', sans-serif;
                        background-color: ${backgroundColor};
                        color: ${textColor};
                    }
                    .container {
                        width: 90%;
                        max-width: 600px;
                        aspect-ratio: 1 / 1; /* carré */
                        margin: auto;
                        padding: 2rem;
                        background-color: #ffffff;
                        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
                        box-sizing: border-box;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        text-align: center;
                    }
                    h1 {
                        color: ${highlightColor};
                        font-size: 2rem;
                    }
                    p {
                        margin-top: 1rem;
                        font-size: 1.2rem;
                        line-height: 1.5;
                    }
                    strong {
                        color: ${highlightColor};
                        font-weight: 500;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>${title}</h1>
                    <p>${message}</p>
                    <p><strong>${englishMsg}</strong></p>
                </div>
                <script>
                    setTimeout(() => {
                        window.close();
                    }, 3000);
                </script>
            </body>
        </html>
    `;
}

// Route to handle successful payment
router.get('/success', (req, res) => {
    res.send(renderPaymentPage('success'));
});

// Route to handle canceled payment
router.get('/cancel', (req, res) => {
    res.send(renderPaymentPage('cancel'));
});

// Endpoint to check payment status for a given session ID
router.get('/check-payment-status', async (req, res) => {
    try {
        const { sessionId } = req.query;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        // Retrieve session details from Stripe using the session ID
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Check if the payment status is 'paid' and return the result
        if (session.payment_status === 'paid') {
            return res.json({ success: true });
        }

        return res.json({ success: false });
    } catch (error) {
        // Log and return error if checking payment status fails
        console.error('Error checking payment status:', error.message);
        res.status(500).json({ error: 'Unable to check payment status' });
    }
});

// Export the router to be used in the main application
module.exports = router;