module.exports = {
    // PM2 apps configuration
    apps: [{
        name: 'api',
        script: 'server.js',
        // Environment variables for development
        env: {
            NODE_ENV: 'development',
            BACKEND_PORT: 3001,
            BACKEND_DOMAIN: 'http://localhost:3001',
            FRONTEND_DOMAIN: 'http://localhost:3000',
        },
        // Environment variables for production
        env_production: {
            NODE_ENV: 'production',
            BACKEND_PORT: 3000,
            BACKEND_DOMAIN: 'https://api.djason-chery.dev',
            FRONTEND_DOMAIN: 'https://djason-chery.dev',
        },
    }],
};