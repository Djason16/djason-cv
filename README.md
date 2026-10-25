<p align="center">
  <img src="/app/public/images/main_logo_dark.png" alt="Portfolio Logo" width="400" />
</p>

<hr>

<p align="center">
  <a href="https://djason-chery.dev" target="_blank">
    <img src="https://img.shields.io/badge/Website-%23F0F5F9?style=for-the-badge&logo=medium&logoColor=%23FFFFFF" alt="Djason Chery | Website" />
  </a>
  <a href="https://www.linkedin.com/in/djason-chery-3b87702b4" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-%230077b5?style=for-the-badge&logo=linkedin&logoColor=white" alt="Djason Chery | LinkedIn" />
  </a>
  <a href="https://www.malt.fr/profile/djasonchery" target="_blank">
    <img src="https://img.shields.io/badge/Malt-%23FF6F61?style=for-the-badge&logo=malt&logoColor=%23FFFFFF" alt="Djason Chery | Malt" />
  </a>
  <a href="tel:+33758204726">
    <img src="https://img.shields.io/badge/Phone-%2352616B?style=for-the-badge&logo=phone&logoColor=%23FFFFFF" alt="Djason Chery | Phone" />
  </a>
  <a href="mailto:contact@djason-chery.dev">
    <img src="https://img.shields.io/badge/Email-%231E2022?style=for-the-badge&logo=gmail&logoColor=%23FFFFFF" alt="Djason Chery | Email" />
  </a>
  <a href="https://wa.me/33758204726" target="_blank">
    <img src="https://img.shields.io/badge/WhatsApp-%2325D366?style=for-the-badge&logo=whatsapp&logoColor=%23FFFFFF" alt="Djason Chery | WhatsApp" />
  </a>
  <a href="https://www.instagram.com/djasonchery" target="_blank">
    <img src="https://img.shields.io/badge/Instagram-%23E4405F?style=for-the-badge&logo=instagram&logoColor=%23FFFFFF" alt="Djason Chery | Instagram" />
  </a>
</p>

<hr>

<p align="center">
  Welcome to my online portfolio. Here, you can learn about my professional journey, skills, and projects. This website showcases my work as a full-stack developer and compositing editor.
</p>

<hr>

<h2>Table of Contents</h2>
<ul>
  <li><a href="#introduction">Introduction</a></li>
  <li><a href="#features">Features</a></li>
  <li><a href="#tech-stack">Tech Stack</a></li>
  <li><a href="#architecture">Architecture</a></li>
  <li><a href="#prerequisites">Prerequisites</a></li>
  <li><a href="#quick-start">Quick Start</a></li>
  <li><a href="#installation">Installation</a></li>
  <li><a href="#deployment">Deployment</a></li>
  <li><a href="#api-routes">API Routes</a></li>
  <li><a href="#security">Security</a></li>
  <li><a href="#scripts">Available Scripts</a></li>
  <li><a href="#contact">Contact</a></li>
  <li><a href="#license">License</a></li>
</ul>

<hr>

<h2 id="introduction">Introduction</h2>
<p>
  I am a passionate <strong>full-stack developer</strong> and <strong>compositing editor</strong> with expertise in video editing, 3D compositing, and modern web development.
</p>
<p>
  This portfolio is built with <strong>Nuxt 4</strong>, leveraging its full-stack capabilities to handle both frontend rendering and backend API routes in a single unified application. It showcases dynamic payment integration with <strong>Stripe</strong>, server-side rendering (SSR), and optimized static generation.
</p>

<hr>

<h2 id="features">Features</h2>

<h3>Frontend</h3>
<ul>
  <li>Built with <strong>Nuxt 4 (v4.4.8)</strong> - Vue.js meta-framework</li>
  <li>Server-Side Rendering (SSR) for optimal SEO</li>
  <li>Static Site Generation (SSG) support</li>
  <li>Styled with <strong>CSS 3</strong>, <strong>GSAP v3.15</strong> animations, and <strong>Font Awesome v7</strong> icons</li>
  <li>Responsive design for all devices</li>
  <li>Multi-language support with custom language switcher</li>
  <li>Optimized images with <strong>@nuxt/image v2</strong></li>
  <li>Automatic sitemap generation with <strong>@nuxtjs/sitemap v8</strong></li>
  <li>SEO-ready with <strong>@nuxtjs/robots v6</strong></li>
</ul>

<h3>Backend (API Routes)</h3>
<ul>
  <li><strong>Nitro</strong> server (built into Nuxt 4), organized like a <a href="https://github.com/Djason16/dc-scaffold"><strong>DC Scaffold</strong></a> back end: controllers, <code>ResponseHelper</code>, <code>RequestHelper</code>, <code>DatabaseHelper</code>, automatic REST routes</li>
  <li><strong>Stripe API v22</strong> integration for secure payment processing</li>
  <li><strong>Complete Client Management System</strong> - CRUD operations for client data</li>
  <li><strong>Mission Management</strong> - Track and manage missions with client associations</li>
  <li><strong>Service Management</strong> - Organize and categorize services</li>
  <li><strong>Automatic Document Generation</strong> - Generate quotes, invoices, and contracts (PDF in the browser)</li>
  <li>Admin login with email + one-time code, attempts limited server-side</li>
  <li><strong>SQLite Database</strong> through <strong>Nitro Database</strong> (<code>node:sqlite</code>, built into Node.js) for data persistence</li>
</ul>

<h3>Deployment</h3>
<ul>
  <li>Deployed on <strong>Infomaniak</strong></li>
  <li>Single unified application (no separate backend server needed)</li>
  <li>Automatic SSL/HTTPS support</li>
</ul>

<hr>

<h2 id="tech-stack">Tech Stack</h2>

<table>
  <tr>
    <th>Category</th>
    <th>Technologies</th>
    <th>Version</th>
  </tr>
  <tr>
    <td><strong>Framework</strong></td>
    <td>Nuxt 4 (Vue 3)</td>
    <td>4.4.8 / 3.5.38</td>
  </tr>
  <tr>
    <td><strong>Server Engine</strong></td>
    <td>Nitro</td>
    <td>built-in</td>
  </tr>
  <tr>
    <td><strong>State Management</strong></td>
    <td>Pinia</td>
    <td>3.0.4</td>
  </tr>
  <tr>
    <td><strong>Styling</strong></td>
    <td>CSS 3, GSAP</td>
    <td>3.15.0</td>
  </tr>
  <tr>
    <td><strong>Icons</strong></td>
    <td>Font Awesome</td>
    <td>7.2.0</td>
  </tr>
  <tr>
    <td><strong>Payment</strong></td>
    <td>Stripe API</td>
    <td>22.2.1</td>
  </tr>
  <tr>
    <td><strong>Database</strong></td>
    <td>SQLite (Nitro Database, node:sqlite)</td>
    <td>built-in</td>
  </tr>
  <tr>
    <td><strong>Email</strong></td>
    <td>Nodemailer</td>
    <td>9.0.3</td>
  </tr>
  <tr>
    <td><strong>Deployment</strong></td>
    <td>Infomaniak</td>
    <td>—</td>
  </tr>
  <tr>
    <td><strong>Build Tool</strong></td>
    <td>Vite</td>
    <td>built-in</td>
  </tr>
</table>

<hr>

<h2 id="architecture">Architecture</h2>

<p>One Nuxt 4 project in <code>app/</code>: the site (Vue) and the API (Nitro) are built and deployed together. The responsibilities follow the <a href="https://github.com/Djason16/dc-scaffold">DC Scaffold</a> conventions.</p>

<pre><code>app/
├── assets/css/          main.css imports base/ (global, typography), utils/ (variables) and
│                        components/ (one <kebab-name>.css per component, e.g. hero-button.css for HeroButton.vue)
├── components/
│   ├── layout/          AppShell (loader, header, footer, cookie banner, language), Header (+ HeaderTop), Footer
│   ├── ui/              reusable UI: Button, Modal (ModalDialog), Table (EditableTable), SectionLayout, Loader,
│   │                    PreferencesBanner (cookies), Animation, Carousel, List, Message, Nav
│   └── views/           content of each page (pages/*.vue only display their view and call useSeo)
│       ├── Index/       sections of the home page
│       ├── Admin/       admin page and its modals (DocumentsModal = quotes, invoices and contracts)
│       ├── Documents/   PDF templates: DocumentContainer (quote / invoice), ContractContainer (contract)
│       └── Legal/, Privacy/, Terms/, RefundPolicy/, Login/, PayMe/, NotFound/ (error page)
├── composables/         reactive state and API calls: useAuth, useClients, useMissions, useInterestRates, useProjects,
│                        useCalendar, useUnavailability, useEnv, useDocuments, useMessage, useLang, useSeo
├── middleware/          page guards: auth (admin) and guest (login), trailing slash redirect
├── pages/               one file per page
├── plugins/             lang.js (read with useLang()) + translations/ (common/ and pages/, French and English)
├── stores/              Pinia: userPreferences (cookie banner) + actions/
├── utils/               plain functions: api.js (API client), documents.js (quote / invoice / contract rules),
│                        pdf.js (PDF export), seo.js, text.js (links in the texts), availability.js, clientTypes.js...
├── data/                static projects, services and skills of the home page
├── server/
│   ├── api/[...path].js       router of every controller (session check included)
│   ├── api/index.get.js       GET /api
│   ├── api/upload/            GET /api/upload/images/... (uploaded images)
│   ├── controllers/           one *Controller.js per resource = the API routes
│   ├── plugins/               init-database.js (tables, default rows, admin account)
│   ├── helpers/               ResponseHelper, RequestHelper, DatabaseHelper, Controller, RouteDiscovery,
│   │                          DatabaseSchema, SessionHelper, RateLimitHelper, MailHelper, StripeHelper,
│   │                          EnvHelper, UploadHelper (imported automatically in server/)
│   └── templates/             MailLayout, MailTemplates (emails), StripePages (payment result pages)
└── nuxt.config.ts
</code></pre>

<h3>Translations</h3>
<p>Same system as <a href="https://github.com/Djason16/dc-scaffold">DC Scaffold</a>. Texts are in <code>plugins/translations/</code>: <code>common/</code> (whole site, cookie banner, SEO) and <code>pages/</code> (one file per page, <code>pages/admin/</code> for the admin features). Each file has an <code>fr</code> and an <code>en</code> block with the same keys; a key exists in one file only. A new file is imported in <code>translations.js</code> and added to <code>TRANSLATIONS</code>.</p>
<pre><code>const { getTranslation: t } = useLang()   // in &lt;script setup&gt;
{{ t('legal') }}                          // template
t('footerText', { year, name })           // script, with values
useLang().current.value                   // 'fr' or 'en'</code></pre>
<p>Every key exists in both languages (timezone names included: <code>pages/admin/timezonesAfricaAmericas.js</code> and <code>timezonesAsiaEuropeOceania.js</code>).</p>
<p>The language chosen with the FR / EN buttons is remembered only when the visitor accepted functional cookies.</p>

<h3>Quotes, invoices and contracts</h3>
<ul>
  <li><strong>Screen</strong>: <code>components/views/Admin/DocumentsModal.vue</code> (one modal, <code>kind</code> = quote, invoice or contract)</li>
  <li><strong>Data, questions to the admin, filling the template</strong>: <code>composables/useDocuments.js</code> (missions, clients and services from the API, grouped per document)</li>
  <li><strong>Rules and amounts</strong>: <code>utils/documents.js</code> (payment rules per service, totals, schedules, prices)</li>
  <li><strong>Checks before generating</strong>: <code>utils/documentChecks.js</code>. Nothing is generated when something is missing (your SIRET / address in <code>.env</code>, client address, mission price, IBAN / BIC, interest rate active today for a contract): an alert lists what to fix.</li>
  <li><strong>Templates</strong>: <code>components/views/Documents/</code> (keep their CSS classes: the page breaks rely on them)</li>
  <li><strong>PDF</strong>: <code>utils/pdf.js</code> (html2pdf.js, in the browser). Nothing is stored on the server: the PDF is downloaded.</li>
</ul>

<h3>API response format</h3>
<pre><code>{ "success": true, ...data }                                     // e.g. { "success": true, "clients": [...] }
{ "success": false, "error": "message", "type": "NOT_FOUND" }    // with the right HTTP status (400, 401, 404, 429, 500...)</code></pre>
<p>On the front, every call goes through <code>utils/api.js</code> (<code>api.get('/clients')</code>, <code>api.post(...)</code>...), which never throws and always resolves to this format. Error messages shown to the visitor are translation keys (e.g. <code>invalidCredentials</code>).</p>

<h3>Add an API route</h3>
<p>Create <code>server/controllers/ProductsController.js</code>; its methods become routes automatically (restart <code>npm run dev</code> if the file is new):</p>
<table>
  <tr><th>Method</th><th>Route</th></tr>
  <tr><td><code>getAll</code></td><td><code>GET /api/products</code></td></tr>
  <tr><td><code>getOne</code></td><td><code>GET /api/products/{id}</code></td></tr>
  <tr><td><code>create</code></td><td><code>POST /api/products</code></td></tr>
  <tr><td><code>update</code></td><td><code>PUT</code> / <code>PATCH /api/products/{id}</code></td></tr>
  <tr><td><code>delete</code></td><td><code>DELETE /api/products/{id}</code></td></tr>
</table>
<pre><code>export default class ProductsController extends Controller {
    static publicActions = ['getAll']                            // every other route needs the admin session
    static routes = { markShipped: ['POST', '/{id}/mark-shipped'] } // routes the REST naming cannot guess

    async getAll(event) {
        return ResponseHelper.success(event, { products: await this.fetchAll('SELECT * FROM products') })
    }

    async create(event) {
        const data = await this.body(event)
        const missing = RequestHelper.missing(data, ['name'])
        if (missing.length) return ResponseHelper.validationError(event, `Missing fields: ${missing.join(', ')}`)
        const id = DatabaseHelper.uuid()
        await this.insert('INSERT INTO products (id, name) VALUES (?, ?)', [id, data.name])
        return ResponseHelper.success(event, { id }, 201)
    }
}</code></pre>
<p>New tables go in <code>server/helpers/DatabaseSchema.js</code> (<code>CREATE TABLE IF NOT EXISTS</code>, safe on an existing database). A change to an existing table needs its own <code>ALTER TABLE</code>: never drop or recreate a table that holds data.</p>

<h3>Add a page</h3>
<p>Create <code>components/views/About/About.vue</code> (the content) and <code>pages/about.vue</code> that only displays it and calls <code>useSeo('about')</code>, add its entry in <code>utils/seo.js</code>, its texts in <code>plugins/translations/pages/about.js</code> (imported in <code>translations.js</code>) and <code>seoAboutTitle</code> / <code>seoAboutDescription</code> in <code>common/seo.js</code>, and its address in <code>publicRoutes</code> of <code>nuxt.config.ts</code> (sitemap).</p>

<hr>

<h2 id="prerequisites">Prerequisites</h2>
<ul>
  <li><strong>Node.js</strong> 22.16 or higher (recommended: 24.x LTS) — required by <code>node:sqlite</code></li>
  <li><strong>npm</strong> version 10.x or higher</li>
</ul>
<p>Ensure Node.js is installed before proceeding:</p>
<pre><code>node -v  # Should be >= 22.16.0
npm -v   # Should be >= 10.0.0</code></pre>

<hr>

<h2 id="quick-start">⚡ Quick Start</h2>

<h3>For Windows Users</h3>

<p>The easiest way to start the project on Windows is using the provided launcher:</p>

<ol>
  <li><strong>Double-click</strong> <code>start.bat</code> in the project root</li>
  <li>Choose your option from the menu:</li>
</ol>

<table>
  <tr>
    <th>Option</th>
    <th>Description</th>
    <th>Use Case</th>
  </tr>
  <tr>
    <td><strong>D</strong></td>
    <td>Development Server</td>
    <td>Start coding and see live changes</td>
  </tr>
  <tr>
    <td><strong>I</strong></td>
    <td>Install</td>
    <td>Install / update the npm dependencies of <code>app/</code></td>
  </tr>
  <tr>
    <td><strong>B</strong></td>
    <td>Build front</td>
    <td><code>npm run build</code>: production build (SSR + API)</td>
  </tr>
</table>

<p>Same launcher as <a href="https://github.com/Djason16/dc-scaffold">DC Scaffold</a> (<code>start.bat</code>, <code>start.ps1</code>, <code>scripts/common.ps1</code>). Development installs the missing dependencies first, then opens a new terminal window. Direct choice: <code>.\start.ps1 -Action D</code>.</p>

<h3>For Mac/Linux Users</h3>

<pre><code># Clone and setup
git clone https://github.com/Djason16/djason-cv.git
cd djason-cv
npm install

# Create .env file (see Installation section)
# Edit .env with your values

# Start development
npm run dev
</code></pre>

<h3>First-Time Setup Checklist</h3>

<ul>
  <li>✅ Install Node.js 22.16+ (<code>node -v</code> to check)</li>
  <li>✅ Clone the repository</li>
  <li>✅ Run <code>npm install</code> in <code>app/</code></li>
  <li>✅ Create the <code>app/.env</code> file with your environment variables</li>
  <li>✅ Add your Stripe test keys</li>
  <li>✅ Run <code>npm run dev</code> or use <code>start.bat</code></li>
</ul>

<p>Your site will be available at <a href="http://localhost:3000">http://localhost:3000</a></p>

<hr>

<h2 id="installation">Installation</h2>

<h3>1. Clone the repository</h3>
<pre><code>git clone https://github.com/Djason16/djason-cv.git
cd djason-cv</code></pre>

<h3>2. Install dependencies</h3>
<pre><code>npm install</code></pre>

<h3>3. Set up environment variables</h3>

<p>Copy the example file to create your own <code>.env</code> (in <code>app/</code>):</p>

<pre><code>cp .env.example .env</code></pre>

<p>Edit <code>.env</code> for development (an existing <code>.env.development</code> is still read when there is no <code>.env</code>):</p>

<pre><code>
# --------------------------------------------------
# Environment
# --------------------------------------------------
NODE_ENV=development

# --------------------------------------------------
# Nuxt Frontend
# Public – exposed to the client
# --------------------------------------------------
NUXT_PUBLIC_FRONTEND_DOMAIN=http://localhost:3000

# --------------------------------------------------
# Stripe (Payments)
# --------------------------------------------------
NUXT_PUBLIC_STRIPE_PUBLIC_KEY=STRIPE_PUBLIC_KEY_HERE
STRIPE_SECRET_KEY=STRIPE_SECRET_KEY_HERE

# --------------------------------------------------
# Default Admin Login
# --------------------------------------------------
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
ADMIN_NAME="Admin User"

# --------------------------------------------------
# Security
# --------------------------------------------------
SECURITY_ANSWER=examplecity

# --------------------------------------------------
# SMTP Configuration
# --------------------------------------------------
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=smtp-user@example.com
SMTP_PASS=examplepassword

# --------------------------------------------------
# Public identity & contact information
# --------------------------------------------------
NUXT_PUBLIC_PERSONAL_NAME="John Doe"
NUXT_PUBLIC_PERSONAL_EMAIL=contact@example.com
NUXT_PUBLIC_PERSONAL_PHONE=+33123456789
NUXT_PUBLIC_PERSONAL_BIRTHDATE=1990-01-01

# --------------------------------------------------
# Legal & billing information
# --------------------------------------------------
NUXT_PUBLIC_LEGAL_SIRET=12345678900000
NUXT_PUBLIC_LEGAL_TVA=FR00123456789
NUXT_PUBLIC_LEGAL_ADDRESS="Sample Town, France"
NUXT_PUBLIC_LEGAL_INVOICE_ADDRESS="10 Demo Street, 75000 Paris"

# --------------------------------------------------
# Banking information
# STRICTLY server-side — NEVER expose to frontend
# --------------------------------------------------
BANK_IBAN=FR0000000000000000000000000
BANK_BIC=TESTFRXX

# --------------------------------------------------
# Public professional links
# --------------------------------------------------
NUXT_PUBLIC_LINKEDIN=https://www.linkedin.com/in/example
NUXT_PUBLIC_GITHUB=https://github.com/example
NUXT_PUBLIC_MALT=https://www.malt.fr/profile/example
NUXT_PUBLIC_INSTAGRAM=https://www.instagram.com/example
NUXT_PUBLIC_WHATSAPP=https://wa.me/33123456789

# --------------------------------------------------
# Database Management
# --------------------------------------------------
DB_REPLACE_TRIGGER=0
# Optional: SQLite file, relative to the folder the server starts from
# DB_FILE=.data/db.sqlite
</code></pre>

<p>For production, create <code>.env.production</code> with the same structure and replace values accordingly (domain, Stripe live keys, real SMTP, etc.).</p>

<p><strong>⚠️ Important:</strong> Never commit <code>.env</code>, <code>.env.development</code> or <code>.env.production</code> to Git (they are already in <code>.gitignore</code>). Server values (Stripe secret key, SMTP, bank details, admin account) are read when the site is built: rebuild after changing them.</p>

<h3>First-Time Setup Checklist</h3>
<ul>
  <li>✅ Install Node.js 22.16+ (<code>node -v</code> to check)</li>
  <li>✅ Clone the repository</li>
  <li>✅ Run <code>npm install</code> in <code>app/</code></li>
  <li>✅ Copy <code>.env.example</code> to <code>.env</code> and update values</li>
  <li>✅ Add your Stripe test keys</li>
  <li>✅ Run <code>npm run dev</code> (Windows users can also use <code>start.bat</code>)</li>
</ul>

<p>Your site will be available at <a href="http://localhost:3000">http://localhost:3000</a></p>

<p>Both frontend and API routes are served by the same Nuxt server:</p>
<ul>
  <li><strong>Frontend:</strong> <code>http://localhost:3000/</code></li>
  <li><strong>API:</strong> <code>http://localhost:3000/api/*</code></li>
</ul>

<hr>

<h2 id="deployment">Deployment</h2>

<h3>Build for Production</h3>

<pre><code>npm run build</code></pre>

<p>This creates a <code>.output/</code> folder containing the optimized production build.</p>

<h3>Deploy to Infomaniak</h3>

<h4>1. Upload files via SFTP/SSH</h4>

<p>Connect using WinSCP or any SFTP client and upload the following files into <code>sites/your-site</code>:</p>

<pre><code>.output/            # Production build
package.json        # Dependencies
package-lock.json   # Lock file
.env.production     # Environment variables
</code></pre>

<p>Keep the <code>.data/</code> folder (SQLite database) and <code>.output/public/upload/</code> (uploaded images) of the server when you deploy a new build: download a backup from the admin page first.</p>

<h4>2. Node.js Settings</h4>

<ul>
  <li>Start Command: <code>npm run start</code></li>
  <li>Port: 3000</li>
</ul>

<h3>Alternative: Static Generation</h3>

<pre><code>npm run generate</code></pre>

<p>Upload the contents of the <code>.output/public/</code> folder to any static hosting provider.</p>

<p><strong>⚠️ Note:</strong> Static generation will not support dynamic API routes.</p>

<hr>

<h2 id="api-routes">API Routes</h2>

<p>Every route is served by a controller of <code>server/controllers/</code>. 🔓 = public, every other route needs the admin session (401 otherwise).</p>

<table>
  <tr><th>Resource</th><th>Routes</th></tr>
  <tr><td>API</td><td>🔓 <code>GET /api</code></td></tr>
  <tr><td>Auth</td><td>🔓 <code>GET /api/auth/check-session</code>, 🔓 <code>POST /api/auth/login</code>, 🔓 <code>POST /api/auth/verify-otp</code>, 🔓 <code>POST /api/auth/logout</code>, 🔓 <code>POST /api/auth/send-temp-password</code>, <code>POST /api/auth/update-password</code></td></tr>
  <tr><td>Clients</td><td><code>GET /api/clients</code>, <code>POST /api/clients</code>, <code>PUT /api/clients/{id}</code>, <code>DELETE /api/clients/{id}</code></td></tr>
  <tr><td>Missions</td><td><code>GET /api/missions</code>, <code>POST /api/missions</code>, <code>PUT /api/missions/{id}</code>, <code>DELETE /api/missions/{id}</code></td></tr>
  <tr><td>Services</td><td><code>GET /api/services</code></td></tr>
  <tr><td>Interest rates</td><td><code>GET /api/interest-rates</code>, <code>POST /api/interest-rates</code>, <code>PUT /api/interest-rates/{id}</code>, <code>DELETE /api/interest-rates/{id}</code></td></tr>
  <tr><td>Projects</td><td>🔓 <code>GET /api/projects</code>, <code>POST /api/projects</code> (multipart), <code>PUT /api/projects/{id}</code>, <code>POST /api/projects/{id}/image</code>, <code>DELETE /api/projects/{id}</code></td></tr>
  <tr><td>Calendar</td><td>🔓 <code>GET /api/calendar</code>, <code>PUT</code>/<code>PATCH /api/calendar/{id}</code>, <code>POST /api/calendar/send-agenda</code></td></tr>
  <tr><td>Unavailability</td><td>🔓 <code>GET /api/unavailability</code>, <code>POST /api/unavailability</code>, <code>PUT /api/unavailability/{id}</code>, <code>DELETE /api/unavailability/{id}</code></td></tr>
  <tr><td>Availability</td><td>🔓 <code>GET /api/availability</code>, <code>PUT /api/availability/toggle</code></td></tr>
  <tr><td>Bank</td><td><code>GET /api/bank</code></td></tr>
  <tr><td>Environment</td><td><code>GET /api/env</code>, <code>PUT /api/env</code></td></tr>
  <tr><td>Database</td><td>🔓 <code>GET /api/database/setup</code> (state only), <code>GET /api/database/download-db</code>, <code>GET /api/database/export-sql</code>, <code>POST /api/database/replace-db</code></td></tr>
  <tr><td>Stripe</td><td>🔓 <code>POST /api/stripe/create-checkout</code>, 🔓 <code>POST /api/stripe/create-subscription</code>, 🔓 <code>GET /api/stripe/check-payment</code>, 🔓 <code>GET /api/stripe/check-subscription</code>, 🔓 <code>GET /api/stripe/payment-result</code>, 🔓 <code>GET /api/stripe/subscription-result</code></td></tr>
  <tr><td>Uploads</td><td>🔓 <code>GET /api/upload/images/{file}</code></td></tr>
</table>

<hr>

<h2 id="security">Security</h2>
<ul>
  <li>The session is checked by the API router on the route that was matched: <code>/api/env</code>, <code>/api/env/</code> and <code>/api//env</code> are the same protected route. <code>robots.txt</code> and <code>.htaccess</code> are not a protection.</li>
  <li>Failed attempts are stored in the database (<code>dc_rate_limits</code>), per account and per IP: 5 wrong passwords or 5 wrong codes lock for 15 minutes, 3 wrong security answers lock the reset for 1 hour.</li>
  <li>Only JPG, PNG, GIF, WEBP and AVIF images can be uploaded; a database replacement must be a valid SQLite file of this site.</li>
</ul>

<hr>

<h2 id="scripts">Available Scripts</h2>

<table>
  <tr>
    <th>Command</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>npm run dev</code></td>
    <td>Start development server</td>
  </tr>
  <tr>
    <td><code>npm run build</code></td>
    <td>Build for production</td>
  </tr>
  <tr>
    <td><code>npm run start</code></td>
    <td>Start production server (after build)</td>
  </tr>
  <tr>
    <td><code>npm run generate</code></td>
    <td>Generate static site</td>
  </tr>
  <tr>
    <td><code>npm run preview</code></td>
    <td>Preview production build locally</td>
  </tr>
</table>

<hr>

<h2 id="contact">Contact</h2>
<p align="center">
  <strong>📩 Email:</strong> <a href="mailto:contact@djason-chery.dev">contact@djason-chery.dev</a><br>
  <strong>📞 Phone:</strong> <a href="tel:+33758204726">07 58 20 47 26</a><br>
  <strong>🌐 Website:</strong> <a href="https://djason-chery.dev/">djason-chery.dev</a>
</p>

<hr>

<h2 id="license">License</h2>
<p>
  This project is licensed under the MIT License. See the <a href="LICENSE">LICENSE</a> file for details.
</p>

<hr>

<p align="center">
  <strong>Made with ❤️ using Nuxt 4</strong>
</p>