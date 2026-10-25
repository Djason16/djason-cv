import { config as loadEnv } from 'dotenv';
import { existsSync, readdirSync, watch } from 'node:fs';
import { resolve } from 'node:path';
import { defineNuxtConfig } from 'nuxt/config';
import { DEFAULT_DB_FILE, envFilePath } from './server/helpers/EnvHelper.js';
import { TRAILING_SLASH_ENABLED } from './utils/pathHelpers.js';

// Public pages: prerendered by "nuxt generate" and listed in sitemap.xml (admin and login stay out)
const publicRoutes: string[] = ['/', '/legal', '/pay-me', '/privacy', '/refund-policy', '/terms']
const privateRoutes: string[] = ['/admin', '/login']

// Environment file of the mode: .env (or the former .env.development) in development, .env.production in production
if (!process.env.CONFIG_LOADED) {
  const envPath = envFilePath(process.env.NODE_ENV || 'development')
  loadEnv({ path: envPath, quiet: true })
  process.env.CONFIG_LOADED = 'true'
  console.log(`⚡ Loaded ${envPath}`)
}

// Detection mode
const isDev = process.env.NODE_ENV !== 'production'

// SQLite file of Nitro Database (DB_FILE, relative to the folder the server is started from)
const dbFile = process.env.DB_FILE || DEFAULT_DB_FILE

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

  nitro: {
    experimental: { database: true },
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
    database: {
      default: { connector: 'sqlite', options: { path: dbFile } }
    },
    prerender: {
      crawlLinks: true,
      routes: publicRoutes,
      failOnError: true,
      ignore: privateRoutes,
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
      '/login/**': { ssr: true, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'X-Robots-Tag': 'noindex, nofollow' } },
      '/api/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
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
      exclude: privateRoutes.map(route => `${route}/**`),
      urls: publicRoutes.map(route => ({ loc: route, lastmod: new Date().toISOString(), changefreq: 'daily' }))
    }],
    // Outside production robots.txt blocks every crawler automatically; it hides pages, it does not protect them
    ['@nuxtjs/robots', {
      disallow: privateRoutes,
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
    dbFile,
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