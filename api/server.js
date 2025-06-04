// Load environment variables based on the NODE_ENV (production or development)
const envPath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
require('dotenv').config({ path: envPath });
console.log('[server.js] [ENV] Loaded variables from:', envPath);

// Import necessary modules
const cors = require('cors');
const express = require('express');
const routes = require('./routes/index');

const app = express();

// Retrieve environment-specific configurations
const backendDomain = process.env.BACKEND_DOMAIN;
const frontendDomain = process.env.FRONTEND_DOMAIN;
const port = process.env.BACKEND_PORT || 3001;

// === Validate required ENV variables ===
if (!backendDomain) console.warn('[WARN] BACKEND_DOMAIN is not set');
if (!frontendDomain) console.warn('[WARN] FRONTEND_DOMAIN is not set');

// === CORS options configuration ===
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [frontendDomain, 'https://djason-chery.dev'];

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Blocked origin: ${origin}`);
            callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
        }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
};

// === Middleware setup ===
app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url}`);
    next();
});

// === Routes ===
app.use(routes);

// === 404 Handler ===
app.use((req, res) => {
    console.warn(`[404] Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Route not found' });
});

// === Start Server ===
app.listen(port, () => {
    console.log('[INFO] Server started');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Backend Domain:', backendDomain);
    console.log('Frontend Domain:', frontendDomain);
    console.log('Port:', port);
});