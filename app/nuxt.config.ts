import { config as loadEnv } from 'dotenv';
import { defineNuxtConfig } from 'nuxt/config';
import { resolve } from 'path';
import { TRAILING_SLASH_ENABLED } from './utils/pathHelpers.js';

// Define prerender and sitemap routes
const routes: string[] = ['/', '/legal', '/pay-me', '/privacy', '/refund-policy', '/terms', '/login', '/admin']

// Load environment variables if not loaded
if (!process.env.CONFIG_LOADED) {
  const envPath = `.env.${process.env.NODE_ENV || 'development'}`
  loadEnv({ path: resolve(process.cwd(), envPath) })
  process.env.CONFIG_LOADED = 'true'
  console.log(`⚡ Loaded ${envPath}`)
  console.log('🔍 NUXT_PUBLIC_FRONTEND_DOMAIN:', process.env.NUXT_PUBLIC_FRONTEND_DOMAIN)
}

// Detection mode
const isDev = process.env.NODE_ENV !== 'production'

export default defineNuxtConfig({
  // @ts-ignore — site is injected by @nuxtjs/sitemap
  site: {
    name: process.env.NUXT_PUBLIC_PERSONAL_NAME,
    url: process.env.NUXT_PUBLIC_FRONTEND_DOMAIN,
    trailingSlash: TRAILING_SLASH_ENABLED,
  },

  ssr: true,
  devtools: { enabled: isDev },
  compatibilityDate: '2024-11-01',
  css: ['./assets/css/main.css', '@fortawesome/fontawesome-free/css/all.min.css'],

  // Transpile CJS packages that need it
  build: { transpile: ['entities'] },

  experimental: {
    payloadExtraction: false,
    viewTransition: true,
    componentIslands: true
  },

  devServer: { host: 'localhost', port: 3000 } as any,

  vite: {
    server: { allowedHosts: ['.ngrok.io', '.ngrok-free.app', 'localhost'] } as any,
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      reportCompressedSize: true,
      chunkSizeWarningLimit: 500,
      minify: 'terser',
      sourcemap: false,
      terserOptions: {
        compress: {
          drop_console: !isDev,
          drop_debugger: !isDev,
          pure_funcs: !isDev ? ['console.log', 'console.info', 'console.debug'] : []
        }
      },
      rollupOptions: {
        output: {
          chunkFileNames: '_nuxt/[name]-[hash].js',
          entryFileNames: '_nuxt/[name]-[hash].js',
          assetFileNames: '_nuxt/[name]-[hash][extname]'
        },
      },
    },
    optimizeDeps: {
      include: [
        'gsap',
        'bcryptjs',
        'entities',
        'html2pdf.js',
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ],
      exclude: ['sql.js', '@vue/devtools-api'],
      esbuildOptions: {
        target: 'es2022',
        supported: { 'top-level-await': true, bigint: true }
      }
    },
    esbuild: {
      target: 'es2022',
      legalComments: 'none',
      drop: isDev ? [] : ['console', 'debugger'],
      treeShaking: true
    },
  },

  nitro: {
    experimental: { wasm: true, database: true },
    compressPublicAssets: { gzip: true, brotli: true },
    externals: {
      inline: ['entities'],
      external: ['@vue/devtools-api']
    },
    alias: {
      'entities/decode': 'entities/dist/commonjs/decode.js',
    },
    database: {
      default: { connector: 'sqlite', options: { filename: resolve('./.data/db.sqlite') } }
    },
    prerender: {
      crawlLinks: true,
      routes,
      failOnError: true,
      ignore: [''],
      autoSubfolderIndex: true,
      concurrency: 4,
      retry: 2,
      retryDelay: 1000,
      ignoreUnprefixedPublicAssets: true
    },
    routeRules: {
      '/images/svg/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } },
      '/images/**': { headers: { 'Cache-Control': 'public, max-age=7200', 'X-Content-Type-Options': 'nosniff' } },
      '/fonts/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } },
      '/admin/**': { ssr: true, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'X-Robots-Tag': 'noindex, nofollow' } },
      '/': { ssr: true, headers: { 'Cache-Control': 'public, max-age=600, s-maxage=3600' } },
      '/pay-me': { ssr: true, headers: { 'Cache-Control': 'public, max-age=600, s-maxage=3600' } },
      '/legal/**': { ssr: true, headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=7200' } }
    },
    minify: !isDev
  },

  modules: [
    ['@nuxtjs/sitemap', {
      gzip: true,
      excludeAppSources: ['nuxt:pages', 'nuxt:prerender'],
      autoLastmod: true,
      urls: routes.map(route => ({ loc: route, lastmod: new Date().toISOString(), changefreq: 'daily' }))
    }],
    ['@nuxtjs/robots', {
      rules: [{ UserAgent: '*', Disallow: isDev ? '/' : '', Allow: isDev ? '' : '/' }],
      Sitemap: `${process.env.NUXT_PUBLIC_FRONTEND_DOMAIN}/sitemap.xml`
    }],
    '@nuxt/image',
    '@pinia/nuxt'
  ],

  image: {
    quality: 80,
    format: ['webp', 'avif'],
    screens: { xs: 320, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 },
    provider: 'none',
  },

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
        { rel: 'preload', href: '/fonts/BarlowCondensed/BarlowCondensed-Regular.woff', as: 'font', type: 'font/woff', crossorigin: 'anonymous', fetchpriority: 'high' },
        { rel: 'preload', href: '/fonts/BarlowCondensed/BarlowCondensed-Bold.woff', as: 'font', type: 'font/woff', crossorigin: 'anonymous', fetchpriority: 'high' },
        { rel: 'icon', type: 'image/jpeg', href: '/favicon_dc.jpg' }
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' }
      ]
    },
  },

  runtimeConfig: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
    adminName: process.env.ADMIN_NAME,
    securityAnswer: process.env.SECURITY_ANSWER,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpSecure: process.env.SMTP_SECURE,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    bankIban: process.env.BANK_IBAN,
    bankBic: process.env.BANK_BIC,
    dbReplaceTrigger: process.env.DB_REPLACE_TRIGGER,
    public: {
      frontendDomain: process.env.NUXT_PUBLIC_FRONTEND_DOMAIN,
      stripePublicKey: process.env.NUXT_PUBLIC_STRIPE_PUBLIC_KEY,
      name: process.env.NUXT_PUBLIC_PERSONAL_NAME,
      contactEmail: process.env.NUXT_PUBLIC_PERSONAL_EMAIL,
      contactPhone: process.env.NUXT_PUBLIC_PERSONAL_PHONE,
      birthDate: process.env.NUXT_PUBLIC_PERSONAL_BIRTHDATE,
      legalSiret: process.env.NUXT_PUBLIC_LEGAL_SIRET,
      legalTva: process.env.NUXT_PUBLIC_LEGAL_TVA,
      legalAddress: process.env.NUXT_PUBLIC_LEGAL_ADDRESS,
      legalInvoiceAddress: process.env.NUXT_PUBLIC_LEGAL_INVOICE_ADDRESS,
      linkedin: process.env.NUXT_PUBLIC_LINKEDIN,
      github: process.env.NUXT_PUBLIC_GITHUB,
      malt: process.env.NUXT_PUBLIC_MALT,
      instagram: process.env.NUXT_PUBLIC_INSTAGRAM,
      whatsapp: process.env.NUXT_PUBLIC_WHATSAPP,
    },
  },
})