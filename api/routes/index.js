// Importing the Express framework to create a new router instance
const express = require('express');

// Importing the Stripe-related routes to be used in the API
const stripeRoutes = require('./stripe');

// Creating a new instance of the Express Router
const router = express.Router();

// Setting up a default route that responds with a welcome message
router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API!' }); // Return a JSON response with a message
});

// Mounting the stripeRoutes on the '/stripe' endpoint
router.use('/stripe', stripeRoutes); // All requests to '/stripe' will be handled by stripeRoutes

// Exporting the router to be used in the main server file
module.exports = router;