const express = require('express');
const stripeRoutes = require('./stripe');

const router = express.Router();

// Default API route with environment and domain info
router.get('/', (req, res) => res.json({
    environment: process.env.NODE_ENV || 'development',
    message: 'Welcome to the API!',
    serverTimeUTC: new Date().toISOString(),
    backendDomain: process.env.BACKEND_DOMAIN || 'not set',
    frontendDomain: process.env.FRONTEND_DOMAIN || 'not set'
}));

// Mount Stripe routes under '/stripe'
router.use('/stripe', stripeRoutes);

module.exports = router;