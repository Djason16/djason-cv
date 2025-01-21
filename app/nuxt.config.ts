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

process.env.NUXT_PUBLIC_SITE_URL = envConfig.FRONTEND_DOMAIN;
process.env.BACKEND_DOMAIN = envConfig.BACKEND_DOMAIN;
process.env.FRONTEND_DOMAIN = envConfig.FRONTEND_DOMAIN;
process.env.STRIPE_PUBLIC_KEY = envConfig.STRIPE_PUBLIC_KEY;
process.env.STRIPE_SECRET_KEY = envConfig.STRIPE_SECRET_KEY;

export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
  css: ['./assets/css/main.css'],
  plugins: ['./plugins/langs/lang.js'],
  modules: [
    ['@nuxtjs/sitemap', {
      hostname: process.env.NUXT_PUBLIC_SITE_URL,
      gzip: true,
      routes: async () => {
        const paths = [
          '/',
          '/legal',
          '/pay-me',
          '/privacy',
          '/refund-policy',
          '/terms',
        ];
        return paths.map(path => `${process.env.NUXT_PUBLIC_SITE_URL}${path}`);
      },
    }],
    ['@nuxtjs/robots', {
      rules: [
        {
          UserAgent: '*',
          Disallow: process.env.NODE_ENV === 'production' ? '' : '/',
          Allow: process.env.NODE_ENV === 'production' ? '/' : '',
        }
      ],
      Sitemap: `${process.env.NUXT_PUBLIC_SITE_URL}/sitemap.xml`,
    }],
  ],
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
      backendDomain: process.env.BACKEND_DOMAIN,
      frontendDomain: process.env.FRONTEND_DOMAIN,
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
    },
  },

  compatibilityDate: '2024-12-11',
});