import { defineNuxtConfig } from 'nuxt/config';

// Load environment dynamically
const envConfig = process.env.NODE_ENV === 'production'
  ? require('./env/env.prod.js').default
  : require('./env/env.dev.js').default;

console.log(
  process.env.NODE_ENV === 'production'
    ? '\x1b[32m%s\x1b[0m Running in production mode'
    : '\x1b[33m%s\x1b[0m Running in development mode'
);

// Set environment variables
process.env.NUXT_PUBLIC_SITE_URL = envConfig.FRONTEND_DOMAIN;
process.env.BACKEND_DOMAIN = envConfig.BACKEND_DOMAIN;
process.env.FRONTEND_DOMAIN = envConfig.FRONTEND_DOMAIN;
process.env.STRIPE_PUBLIC_KEY = envConfig.STRIPE_PUBLIC_KEY;
process.env.STRIPE_SECRET_KEY = envConfig.STRIPE_SECRET_KEY;

// Common prerender and sitemap routes
const routes: string[] = ['/', '/legal', '/pay-me', '/privacy', '/refund-policy', '/terms'];

export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
  css: ['./assets/css/main.css'],

  // Nitro prerender configuration for static hosting
  nitro: {
    prerender: {
      crawlLinks: true,
      routes,
      failOnError: true,
      ignore: [],
      autoSubfolderIndex: true,
      concurrency: 4,
      retry: 2,
      retryDelay: 1000,
      ignoreUnprefixedPublicAssets: true,
    },
  },

  // Modules with sitemap and robots
  modules: [
    ['@nuxtjs/sitemap', {
      hostname: process.env.NUXT_PUBLIC_SITE_URL,
      gzip: true,
      routes: routes.map(path => `${process.env.NUXT_PUBLIC_SITE_URL}${path}`),
    }],
    ['@nuxtjs/robots', {
      rules: [{
        UserAgent: '*',
        Disallow: process.env.NODE_ENV === 'production' ? '' : '/',
        Allow: process.env.NODE_ENV === 'production' ? '/' : '',
      }],
      Sitemap: `${process.env.NUXT_PUBLIC_SITE_URL}/sitemap.xml`,
    }],
  ],

  // Head elements for scripts and links
  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/css/all.min.css' },
        { rel: 'icon', type: 'image/jpeg', href: '/favicon_dc.jpg' },
      ],
      script: [
        { src: 'https://js.stripe.com/v3/', type: 'text/javascript', defer: true },
      ],
    },
  },

  // Runtime environment configuration
  runtimeConfig: {
    public: {
      backendDomain: process.env.BACKEND_DOMAIN,
      frontendDomain: process.env.FRONTEND_DOMAIN,
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
    },
  },

  // Compatibility date for Nuxt
  compatibilityDate: '2024-12-11',
});