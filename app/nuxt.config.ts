import { config as loadEnv } from 'dotenv'
import { defineNuxtConfig } from 'nuxt/config'
import { resolve } from 'path'

// Load the .env corresponding to the NODE_ENV
const envPath = `.env.${process.env.NODE_ENV || 'development'}`
loadEnv({ path: resolve(process.cwd(), envPath) })

// Import personalInfo
const { personalInfo } = await import('./utils/personalInfo.js')

// Common prerender and sitemap routes
const routes: string[] = ['/', '/legal', '/pay-me', '/privacy', '/refund-policy', '/terms']

// Detection mode
const isDev = process.env.NODE_ENV !== 'production'
console.log(`⚡ Chargement de ${envPath}`)
console.log('🔍 NUXT_PUBLIC_FRONTEND_DOMAIN:', process.env.NUXT_PUBLIC_FRONTEND_DOMAIN)

export default defineNuxtConfig({
  site: {
    name: personalInfo.name,
    url: process.env.NUXT_PUBLIC_FRONTEND_DOMAIN,
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
            Disallow: isDev ? '/' : '',
            Allow: isDev ? '' : '/',
          },
        ],
        Sitemap: `${process.env.NUXT_PUBLIC_FRONTEND_DOMAIN}/sitemap.xml`,
      },
    ],
    '@nuxt/image',
  ],

  app: {
    head: {
      htmlAttrs: {
        lang: 'fr',
      },
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
    // Private variables (server only)
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    // Public variables (client + server)
    public: {
      frontendDomain: process.env.NUXT_PUBLIC_FRONTEND_DOMAIN,
      stripePublicKey: process.env.NUXT_PUBLIC_STRIPE_PUBLIC_KEY,
    },
  },

  compatibilityDate: '2025-01-01',
})