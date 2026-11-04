import { config as loadEnv } from 'dotenv';
import { existsSync, readdirSync, watch } from 'node:fs';
import { resolve } from 'node:path';
import { defineNuxtConfig } from 'nuxt/config';
import { envFilePath } from './server/helpers/EnvHelper.js';
import { TRAILING_SLASH_ENABLED } from './utils/pathHelpers.js';

// Public pages listed in sitemap.xml (admin and login stay out)
const publicRoutes: string[] = ['/', '/legal', '/pay-me', '/privacy', '/refund-policy', '/terms', '/withdrawal']
const privateRoutes: string[] = ['/admin', '/login']

// Environment file of the mode: .env in development, .env.production in production.
// For the build, .env.production wins over anything already read (Nuxt reads .env by itself first): the values of the server
// (database, Stripe, SMTP...) are written into the build, a value of development would go online
if (!process.env.CONFIG_LOADED) {
  const envPath = envFilePath(process.env.NODE_ENV || 'development')
  loadEnv({ path: envPath, quiet: true, override: process.env.NODE_ENV === 'production' })
  process.env.CONFIG_LOADED = 'true'
  console.log(`⚡ Loaded ${envPath}`)
}

// true with npm run dev, false for the production build
const isDev = process.env.NODE_ENV !== 'production'

// "#controllers" = every server/controllers/*Controller.js file, so API routes never have to be declared by hand (DC Scaffold (https://github.com/Djason16/dc-scaffold))
const controllersDir = resolve('./server/controllers')
const controllersModule = () => {
  const files = existsSync(controllersDir) ? readdirSync(controllersDir).filter(file => /Controller\.js$/.test(file)) : []
  const imports = files.map((file, i) => `import c${i} from '${controllersDir.replace(/\\/g, '/')}/${file}'`)
  const entries = files.map((file, i) => `{ name: '${file.replace(/\.js$/, '')}', controller: c${i} }`)
  return `${imports.join('\n')}\nexport default [${entries.join(', ')}]`
}

export default defineNuxtConfig({
  // @ts-ignore — site is injected by @nuxtjs/sitemap
  site: {
    url: process.env.NUXT_PUBLIC_FRONTEND_DOMAIN,
    trailingSlash: TRAILING_SLASH_ENABLED,
  },

  // Pages rendered on the server (SEO), styles of the whole site
  ssr: true,
  devtools: { enabled: isDev },
  compatibilityDate: '2024-11-01',
  // Fonts served by the site itself (no request to Google): Archivo in its expanded width (like the logo) for the titles,
  // Barlow Condensed for the texts, labels and menus
  css: [
    '@fontsource-variable/archivo/wdth.css',
    '@fontsource/barlow-condensed/300.css', '@fontsource/barlow-condensed/400.css', '@fontsource/barlow-condensed/400-italic.css',
    '@fontsource/barlow-condensed/500.css', '@fontsource/barlow-condensed/600.css',
    './assets/css/main.css', '@fortawesome/fontawesome-free/css/all.min.css',
  ],

  // Transpile CJS packages that need it
  build: { transpile: ['entities'] },

  // Nuxt features turned on: page transitions and server components
  experimental: {
    payloadExtraction: false,
    viewTransition: true,
    componentIslands: true
  },

  // Development server (npm run dev), reachable through ngrok to test on a phone
  devServer: { host: 'localhost', port: 3000 } as any,

  // Production bundle: modern JavaScript, minified, no console logs
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
    // Packages prepared in advance by the dev server, so the first page loads faster
    optimizeDeps: {
      include: [
        'bcryptjs',
        'entities',
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ],
      exclude: ['@vue/devtools-api'],
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

  // Nitro: the server of the API
  nitro: {
    // Helpers (ResponseHelper, DatabaseHelper...) and templates (emails, Stripe pages) imported automatically in server/
    imports: { dirs: [resolve('./server/helpers'), resolve('./server/templates')] },
    virtual: { '#controllers': controllersModule },
    modules: [
      // Dev only: rebuild when a controller file is added or removed
      (nitro: any) => {
        if (!nitro.options.dev || !existsSync(controllersDir)) return
        let timer: ReturnType<typeof setTimeout> | undefined
        watch(controllersDir, () => {
          clearTimeout(timer)
          timer = setTimeout(() => nitro.hooks.callHook('rollup:reload'), 200)
        })
      },
    ],
    compressPublicAssets: { gzip: true, brotli: true },
    externals: {
      inline: ['entities'],
      external: ['@vue/devtools-api']
    },
    alias: {
      'entities/decode': 'entities/dist/commonjs/decode.js',
    },
    // Browser cache per type of file, and admin / login / API hidden from search engines
    routeRules: {
      '/images/**': { headers: { 'Cache-Control': 'public, max-age=7200', 'X-Content-Type-Options': 'nosniff' } },
      '/fonts/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } },
      '/admin/**': { ssr: true, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'X-Robots-Tag': 'noindex, nofollow' } },
      '/login/**': { ssr: true, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'X-Robots-Tag': 'noindex, nofollow' } },
      '/api/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
      '/': { ssr: true, headers: { 'Cache-Control': 'public, max-age=600, s-maxage=3600' } },
      '/pay-me': { ssr: true, headers: { 'Cache-Control': 'public, max-age=600, s-maxage=3600' } },
      '/legal/**': { ssr: true, headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=7200' } }
    },
    minify: !isDev
  },

  // Sitemap, robots.txt and Pinia (cookie banner)
  modules: [
    ['@nuxtjs/sitemap', {
      gzip: true,
      excludeAppSources: ['nuxt:pages', 'nuxt:prerender'],
      autoLastmod: true,
      exclude: privateRoutes.map(route => `${route}/**`),
      urls: publicRoutes.map(route => ({ loc: route, lastmod: new Date().toISOString(), changefreq: 'daily' }))
    }],
    // Outside production robots.txt blocks every crawler automatically; it hides pages, it does not protect them
    ['@nuxtjs/robots', {
      disallow: privateRoutes,
    }],
    '@pinia/nuxt'
  ],

  // <head> of every page (favicon); a page change fades (style: assets/css/components/reveal.css)
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' }
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' }
      ]
    },
  },

  // Values of the .env files: server only at the top, sent to the browser in "public"
  runtimeConfig: {
    // MySQL database of the API (server/helpers/DatabaseHelper.js)
    db: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      name: process.env.DB_NAME,
      user: process.env.DB_USER,
      pass: process.env.DB_PASS,
    },
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    // Signing secret of the Stripe webhook (/api/stripe/webhook): whsec_...
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
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
    // Machine translation of the admin (server/helpers/TranslateHelper.js): an email raises the free daily quota
    mymemoryEmail: process.env.MYMEMORY_EMAIL,
    // Region of an address outside France shown on the site (server/helpers/AreaHelper.js); empty: only its country
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    public: {
      frontendDomain: process.env.NUXT_PUBLIC_FRONTEND_DOMAIN,
    },
  },
})