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
  <a href="mailto:djason.chery@yahoo.com">
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
  <li><a href="#prerequisites">Prerequisites</a></li>
  <li><a href="#quick-start">Quick Start</a></li>
  <li><a href="#installation">Installation</a></li>
  <li><a href="#deployment">Deployment</a></li>
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
  <li>Built with <strong>Nuxt 4 (v4.1.2)</strong> - Vue.js meta-framework</li>
  <li>Server-Side Rendering (SSR) for optimal SEO</li>
  <li>Static Site Generation (SSG) support</li>
  <li>Styled with <strong>CSS 3</strong>, <strong>GSAP</strong> animations, and <strong>Font Awesome</strong> icons</li>
  <li>Responsive design for all devices</li>
  <li>Multi-language support with custom language switcher</li>
  <li>Optimized images with <strong>@nuxt/image</strong></li>
  <li>Automatic sitemap generation with <strong>@nuxtjs/sitemap</strong></li>
</ul>

<h3>Backend (API Routes)</h3>
<ul>
  <li><strong>Nitro</strong> server (built into Nuxt 4)</li>
  <li><strong>Stripe API</strong> integration for secure payment processing</li>
  <li>RESTful API routes in <code>server/api/</code></li>
  <li>Server utilities and middleware</li>
  <li>Environment-based configuration</li>
</ul>

<h3>Deployment</h3>
<ul>
  <li>Deployed on <strong>Infomaniak</strong> with <strong>PM2</strong> process manager</li>
  <li>Single unified application (no separate backend server needed)</li>
  <li>Automatic SSL/HTTPS support</li>
</ul>

<hr>

<h2 id="tech-stack">Tech Stack</h2>

<table>
  <tr>
    <th>Category</th>
    <th>Technologies</th>
  </tr>
  <tr>
    <td><strong>Framework</strong></td>
    <td>Nuxt 4 (Vue 3)</td>
  </tr>
  <tr>
    <td><strong>Server Engine</strong></td>
    <td>Nitro</td>
  </tr>
  <tr>
    <td><strong>Styling</strong></td>
    <td>CSS 3, GSAP</td>
  </tr>
  <tr>
    <td><strong>Icons</strong></td>
    <td>Font Awesome</td>
  </tr>
  <tr>
    <td><strong>Payment</strong></td>
    <td>Stripe API</td>
  </tr>
  <tr>
    <td><strong>Deployment</strong></td>
    <td>Infomaniak, PM2</td>
  </tr>
  <tr>
    <td><strong>Build Tool</strong></td>
    <td>Vite</td>
  </tr>
</table>

<hr>

<h2 id="prerequisites">Prerequisites</h2>
<ul>
  <li><strong>Node.js</strong> version 18.x or higher</li>
  <li><strong>npm</strong> (comes with Node.js)</li>
</ul>
<p>Ensure Node.js is installed before proceeding:</p>
<pre><code>node -v  # Should be >= 18.0.0</code></pre>

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
    <td><strong>G</strong></td>
    <td>Generate Static Site</td>
    <td>Create a static version for hosting</td>
  </tr>
  <tr>
    <td><strong>B</strong></td>
    <td>Build for Production</td>
    <td>Optimize for deployment with SSR</td>
  </tr>
</table>

<p>The script will open a new terminal window for the selected command.</p>

<h3>For Mac/Linux Users</h3>

<p>Use the following npm commands directly:</p>

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

<p>Before running the project for the first time:</p>

<ul>
  <li>✅ Install Node.js 18+ (<code>node -v</code> to check)</li>
  <li>✅ Clone the repository</li>
  <li>✅ Run <code>npm install</code></li>
  <li>✅ Create <code>.env</code> file with your environment variables</li>
  <li>✅ Add your Stripe keys (test keys for development)</li>
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

<p>Create a <code>.env.development</code> file at the root of the project for development:</p>

<pre><code># .env.development
NODE_ENV=development
FRONTEND_DOMAIN=http://localhost:3000
STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
</code></pre>

<p>For production, create a <code>.env.production</code> file:</p>

<pre><code># .env.production
NODE_ENV=production
FRONTEND_DOMAIN=https://djason-chery.dev
STRIPE_PUBLIC_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
</code></pre>

<p><strong>⚠️ IMPORTANT:</strong> Never commit <code>.env.development</code> or <code>.env.production</code> files to Git. Add them to <code>.gitignore</code>.</p>

<h3>4. Run the development server</h3>
<pre><code>npm run dev</code></pre>

<p>The application will be available at <a href="http://localhost:3000">http://localhost:3000</a></p>

<p>Both frontend and API routes are served by the same Nuxt server:</p>
<ul>
  <li><strong>Frontend:</strong> <code>http://localhost:3000/</code></li>
  <li><strong>API:</strong> <code>http://localhost:3000/api/*</code></li>
</ul>

<hr>

<h2 id="deployment">Deployment</h2>

<h3>Build for Production</h3>

<p>Build the application for production:</p>
<pre><code>npm run build</code></pre>

<p>This creates a <code>.output/</code> folder containing the optimized production build.</p>

<h3>Deploy to Infomaniak</h3>

<h4>1. Upload files via SFTP/SSH</h4>

<p>Upload the following files to your Infomaniak server:</p>

<pre><code>.output/              # Production build
ecosystem.config.cjs   # PM2 configuration
package.json          # Dependencies
package-lock.json     # Lock file
.env.production       # Environment variables (create directly on server)
</code></pre>

<h4>2. Install dependencies on server</h4>

<p>Connect via SSH:</p>
<pre><code>ssh your-user@your-server.infomaniak.com
cd /path/to/your/site
npm ci --production
npm install cross-env --save-dev
</code></pre>

<h4>3. Start with PM2</h4>

<pre><code>pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup
</code></pre>

<h4>4. Configure reverse proxy</h4>

<p>In your Infomaniak panel, configure a reverse proxy:</p>
<ul>
  <li><strong>Domain:</strong> <code>https://djason-chery.dev</code></li>
  <li><strong>Proxy to:</strong> <code>http://localhost:3000</code></li>
</ul>

<h3>Alternative: Static Generation</h3>

<p>For static hosting (no Node.js server needed):</p>

<pre><code>npm run generate</code></pre>

<p>Upload the contents of the <code>.output/public/</code> folder to any static hosting provider.</p>

<p><strong>⚠️ Note:</strong> Static generation will not support dynamic API routes (like Stripe payments).</p>

<hr>

<h2 id="api-routes">API Routes</h2>

<p>The following API routes are available:</p>

<table>
  <tr>
    <th>Method</th>
    <th>Endpoint</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>GET</td>
    <td><code>/api/</code></td>
    <td>API health check</td>
  </tr>
  <tr>
    <td>POST</td>
    <td><code>/api/stripe/create-checkout-session</code></td>
    <td>Create Stripe payment session</td>
  </tr>
  <tr>
    <td>GET</td>
    <td><code>/api/stripe/payment-result</code></td>
    <td>Payment success/cancel page</td>
  </tr>
  <tr>
    <td>GET</td>
    <td><code>/api/stripe/check-payment-status</code></td>
    <td>Verify payment status</td>
  </tr>
</table>

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
  <strong>📩 Email:</strong> <a href="mailto:djason.chery@yahoo.com">djason.chery@yahoo.com</a><br>
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
