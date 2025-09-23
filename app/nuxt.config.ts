import { defineNuxtConfig } from 'nuxt/config';

// Import personalInfo
const { personalInfo } = await import('./utils/personalInfo.js');

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
  site: {
    name: personalInfo.name,
    url: process.env.NUXT_PUBLIC_SITE_URL,
    trailingSlash: true,
  },

  ssr: true,
  devtools: { enabled: true },
  css: ['./assets/css/main.css', '@fortawesome/fontawesome-free/css/all.min.css'],

  // Modern JS for supported browsers
  build: { transpile: [] },
  experimental: { payloadExtraction: false },

  vite: {
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes('stripe')) return 'stripe'
            if (id.includes('node_modules')) return 'vendor'
            return undefined
          },
        },
      },
    },
    esbuild: { target: 'es2020' },
  },

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
    experimental: { wasm: true },
  },

  modules: [
    [
      '@nuxtjs/sitemap',
      {
        gzip: true,
        excludeAppSources: ['nuxt:pages', 'nuxt:prerender'],
        autoLastmod: true,
        urls: routes.map((route) => ({
          loc: route,
          lastmod: new Date().toISOString(),
          changefreq: 'daily',
        })),
      },
    ],
    [
      '@nuxtjs/robots',
      {
        rules: [
          {
            UserAgent: '*',
            Disallow: process.env.NODE_ENV === 'production' ? '' : '/',
            Allow: process.env.NODE_ENV === 'production' ? '/' : '',
          },
        ],
        Sitemap: `${process.env.NUXT_PUBLIC_SITE_URL}/sitemap.xml`,
      },
    ],
    '@nuxt/image',
  ],

  app: {
    head: {
      htmlAttrs: {
        lang: 'fr'
      },
      link: [
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
        { rel: 'preload', href: '/fonts/BarlowCondensed/BarlowCondensed-Regular.woff', as: 'font', type: 'font/woff', crossorigin: 'anonymous', fetchpriority: 'high' },
        { rel: 'preload', href: '/fonts/BarlowCondensed/BarlowCondensed-Bold.woff', as: 'font', type: 'font/woff', crossorigin: 'anonymous', fetchpriority: 'high' },
        { rel: 'icon', type: 'image/jpeg', href: '/favicon_dc.jpg' },
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

  compatibilityDate: '2025-01-01',
});