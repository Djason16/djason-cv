// Importing the Express framework to create a new router instance
const express = require('express');

// Importing the Stripe-related routes to be used in the API
const stripeRoutes = require('./stripe');

// Creating a new instance of the Express Router
const router = express.Router();

// Setting up a default route that responds with basic information about the API
router.get('/', (req, res) => {
    res.json({
        environment: process.env.NODE_ENV || 'development',
        message: 'Welcome to the API!',
        serverTimeUTC: new Date().toISOString(),
        backendDomain: process.env.BACKEND_DOMAIN || 'not set',
        frontendDomain: process.env.FRONTEND_DOMAIN || 'not set'
    });
});

// Mounting the stripeRoutes on the '/stripe' endpoint
router.use('/stripe', stripeRoutes);

// Exporting the router to be used in the main server file
module.exports = router;
