import { config as loadEnv } from 'dotenv';
import { defineNuxtConfig } from 'nuxt/config';
import { resolve } from 'path';
import { TRAILING_SLASH_ENABLED } from './utils/pathHelpers.js';

// Import personalInfo
const { personalInfo } = await import('./utils/personalInfo.js')

// Common prerender and sitemap routes
const routes: string[] = ['/', '/legal', '/pay-me', '/privacy', '/refund-policy', '/terms', '/login', '/admin']

// Load the .env corresponding to the NODE_ENV
if (!process.env.CONFIG_LOADED) {
  const envPath = `.env.${process.env.NODE_ENV || 'development'}`
  loadEnv({ path: resolve(process.cwd(), envPath) })
  process.env.CONFIG_LOADED = 'true'
  console.log(`⚡ Loading ${envPath}`)
  console.log('🔍 NUXT_PUBLIC_FRONTEND_DOMAIN:', process.env.NUXT_PUBLIC_FRONTEND_DOMAIN)
}

// Detection mode
const isDev = process.env.NODE_ENV !== 'production'

export default defineNuxtConfig({
  site: {
    name: personalInfo.name,
    url: process.env.NUXT_PUBLIC_FRONTEND_DOMAIN,
    trailingSlash: TRAILING_SLASH_ENABLED,
  },

  ssr: true,
  devtools: { enabled: true },
  css: ['./assets/css/main.css', '@fortawesome/fontawesome-free/css/all.min.css'],

  // Modern JS for supported browsers
  build: { transpile: [] },
  experimental: { payloadExtraction: false },

  devServer: {
    host: 'localhost',
    port: 3000
  },

  vite: {
    server: {
      allowedHosts: [
        '.ngrok.io',
        '.ngrok-free.app',
        'localhost',
      ],
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes('stripe')) return 'stripe'
            if (id.includes('node_modules')) return 'vendor'
          },
        },
      },
    },
    esbuild: { target: 'es2020' },
  },

  nitro: {
    experimental: {
      wasm: true,
      database: true
    },
    database: {
      default: {
        connector: 'sqlite',
        options: {
          filename: resolve('./.data/db.sqlite')
        }
      }
    },
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
    routeRules: {
      '/images/svg/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
      '/images/**': { headers: { 'Cache-Control': 'public, max-age=3600' } },
      '/fonts/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
      '/_ipx/**': { headers: { 'Cache-Control': 'public, max-age=3600' } },
    }
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
            Disallow: isDev ? '/' : '',
            Allow: isDev ? '' : '/',
          },
        ],
        Sitemap: `${process.env.NUXT_PUBLIC_FRONTEND_DOMAIN}/sitemap.xml`,
      },
    ],
    '@nuxt/image'],

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
        {
          rel: 'preload',
          href: '/fonts/BarlowCondensed/BarlowCondensed-Regular.woff',
          as: 'font',
          type: 'font/woff',
          crossorigin: 'anonymous',
          fetchpriority: 'high',
        },
        {
          rel: 'preload',
          href: '/fonts/BarlowCondensed/BarlowCondensed-Bold.woff',
          as: 'font',
          type: 'font/woff',
          crossorigin: 'anonymous',
          fetchpriority: 'high',
        },
        { rel: 'icon', type: 'image/jpeg', href: '/favicon_dc.jpg' },
      ],
    },
  },

  runtimeConfig: {
    // Private variables (server only) - must match env variable names
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    adminEmail: process.env.NUXT_ADMIN_EMAIL,
    adminPassword: process.env.NUXT_ADMIN_PASSWORD,
    adminName: process.env.NUXT_ADMIN_NAME,
    securityAnswer: process.env.NUXT_SECURITY_ANSWER,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpSecure: process.env.SMTP_SECURE,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    // Public variables (client + server)
    public: {
      frontendDomain: process.env.NUXT_PUBLIC_FRONTEND_DOMAIN,
      stripePublicKey: process.env.NUXT_PUBLIC_STRIPE_PUBLIC_KEY,
    },
  },

  compatibilityDate: '2025-01-01',
})