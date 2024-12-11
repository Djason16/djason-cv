import { defineNuxtConfig } from 'nuxt/config';

// Dynamically import the correct environment file based on NODE_ENV
let envConfig;
if (process.env.NODE_ENV === 'production') {
  envConfig = require('./env/env.prod.js').default;
  console.log('\x1b[32m%s\x1b[0m', 'Running in production mode');
} else {
  envConfig = require('./env/env.dev.js').default;
  console.log('\x1b[33m%s\x1b[0m', 'Running in development mode');
}

export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
  css: ['./assets/css/main.css'],
  plugins: ['./plugins/langs/lang.js'],
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
        },
        {
          rel: 'icon',
          type: 'image/jpeg',
          href: '/favicon_dc.jpg',
        },
      ],
      script: [
        {
          src: 'https://js.stripe.com/v3/',
          type: 'text/javascript',
          defer: true,
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      backendDomain: envConfig.BACKEND_DOMAIN,
      frontendDomain: envConfig.FRONTEND_DOMAIN,
      stripePublicKey: envConfig.STRIPE_PUBLIC_KEY,
    },
  },

  compatibilityDate: '2024-12-11',
});