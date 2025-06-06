module.exports = {
    apps: [
        {
            name: "api",
            script: "server.js",
            env: {
                NODE_ENV: "development",
                BACKEND_PORT: 3001,
                BACKEND_DOMAIN: "http://localhost:3001",
                FRONTEND_DOMAIN: "http://localhost:3000"
            },
            env_production: {
                NODE_ENV: "production",
                BACKEND_PORT: 3000,
                BACKEND_DOMAIN: "https://api.djason-chery.dev",
                FRONTEND_DOMAIN: "https://djason-chery.dev"
            }
        },
    ],
};
// This configuration file is used by PM2 to manage the API application.
// It defines the application name, script to run, and environment variables for both development and production environments.  