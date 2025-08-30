// Load environment variables based on NODE_ENV
require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });

const express = require('express');
const cors = require('cors');
const routes = require('./routes/index');

const app = express();
const backendDomain = process.env.BACKEND_DOMAIN;
const port = process.env.BACKEND_PORT || (process.env.NODE_ENV === 'production' ? 3000 : 3001);

// CORS configuration allowing frontend domain and specific production URL
const corsOptions = {
    origin: (origin, callback) => {
        const allowed = [process.env.FRONTEND_DOMAIN, 'https://djason-chery.dev'];
        callback(null, !origin || allowed.includes(origin));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('public'));

// Log incoming requests
app.use((req, res, next) => { console.log(`Request: ${req.method} ${req.url}`); next(); });

// Application routes
app.use(routes);

// 404 handler for unmatched routes
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Start server
app.listen(port, () => {
    console.log('Environment:', process.env.NODE_ENV, '| Backend:', backendDomain, '| Port:', port);
});