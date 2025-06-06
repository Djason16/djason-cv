// Load environment variables based on the NODE_ENV (production or development)
// Uses dotenv to load variables from .env.production or .env files
require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
});

// Import necessary modules
const cors = require('cors'); // CORS middleware for handling cross-origin requests
const express = require('express'); // Express framework for building the server
const routes = require('./routes/index'); // Importing the routes for the application

const app = express(); // Initialize the Express app

// Retrieve environment-specific configurations (backend domain and port)
const backendDomain = process.env.BACKEND_DOMAIN; // Backend domain from environment variables
const port = process.env.BACKEND_PORT || (process.env.NODE_ENV === 'production' ? 3000 : 3001); // Set the port based on the environment

// CORS options configuration to allow specific origins
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.FRONTEND_DOMAIN, // Allow requests from the frontend domain
            'https://djason-chery.dev', // Allow requests from specific URL (for production)
        ];

        // If the request's origin is in the allowed list, allow the request
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Reject the request if the origin is not in the allowed list
            callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
        }
    },
    methods: ['GET', 'POST'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type'], // Allowed headers for requests
};

// Use middleware for handling CORS requests
app.use(cors(corsOptions));
// Use JSON middleware to parse incoming JSON request bodies
app.use(express.json());

// Serve static files from the "public" directory (e.g., for SSL validation)
app.use(express.static('public'));

// Log each incoming request (method and URL) for debugging purposes
app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`); // Log the request method and URL
    next(); // Pass control to the next middleware
});

// Use the imported routes for routing requests
app.use(routes);

// Catch-all handler for 404 errors when no route matches the request
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' }); // Return a 404 error with a message
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log('Current Environment:', process.env.NODE_ENV); // Log the current environment (development or production)
    console.log('Backend Domain:', backendDomain); // Log the backend domain
    console.log('Port:', port); // Log the port the server is running on

});