<p align="center">
  <img src="app/public/images/main_logo_dark.png" alt="Djason Chery" width="400" />
</p>

<p align="center">
  <a href="https://djason-chery.dev"><img src="https://img.shields.io/badge/Website-%23F0F5F9?style=for-the-badge&logo=medium&logoColor=%23FFFFFF" alt="Website" /></a>
  <a href="https://www.linkedin.com/in/djason-chery-3b87702b4"><img src="https://img.shields.io/badge/LinkedIn-%230077b5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
  <a href="https://www.malt.fr/profile/djasonchery"><img src="https://img.shields.io/badge/Malt-%23FF6F61?style=for-the-badge&logo=malt&logoColor=%23FFFFFF" alt="Malt" /></a>
  <a href="mailto:contact@djason-chery.dev"><img src="https://img.shields.io/badge/Email-%231E2022?style=for-the-badge&logo=gmail&logoColor=%23FFFFFF" alt="Email" /></a>
  <a href="https://wa.me/33758204726"><img src="https://img.shields.io/badge/WhatsApp-%2325D366?style=for-the-badge&logo=whatsapp&logoColor=%23FFFFFF" alt="WhatsApp" /></a>
  <a href="https://www.instagram.com/djasonchery"><img src="https://img.shields.io/badge/Instagram-%23E4405F?style=for-the-badge&logo=instagram&logoColor=%23FFFFFF" alt="Instagram" /></a>
</p>

<p align="center">
  <a href="#quick-start"><b>QUICK START</b></a> &nbsp;·&nbsp; <a href="docs/en/README.md"><b>DOCUMENTATION</b></a> &nbsp;·&nbsp; <a href="docs/fr/README.md"><b>DOCUMENTATION FR</b></a> &nbsp;·&nbsp; <a href="https://djason-chery.dev"><b>LIVE SITE</b></a>
</p>

---

My portfolio as a **full-stack developer** and **compositing editor**: [djason-chery.dev](https://djason-chery.dev).

One **Nuxt 4** project holds both the site and its API (Nitro), organized like a
[DC Scaffold](https://github.com/Djason16/dc-scaffold) project. Besides the public pages, a private admin space
manages clients, missions and availability, generates quotes, invoices and contracts as PDF, and takes payments with Stripe.

## What's inside

| Part | Highlights |
| ---- | ---------- |
| **Site** | Server-side rendering, French / English, SEO (sitemap, robots, meta tags), GSAP animations, cookie banner |
| **Admin** | Email + one-time code login, clients, missions, projects, calendar, quotes / invoices / contracts in PDF |
| **API** | Automatic REST routes from controllers, same JSON format everywhere, SQLite database (`node:sqlite`) |
| **Payments** | Stripe Checkout and subscriptions |

**Stack:** Nuxt 4.4 · Vue 3.5 · Nitro · Pinia 3 · SQLite · Stripe 22 · Nodemailer 9 · GSAP 3.15 · Font Awesome 7

## Quick start

Requires **Node.js 22.16+** (24 LTS recommended).

**Windows:** double-click `start.bat`, then press `D`. The site opens on http://localhost:3000.

**Mac / Linux:**

```bash
git clone https://github.com/Djason16/djason-cv.git
cd djason-cv/app
cp .env.example .env   # then fill in your values
npm install
npm run dev
```

The site is on http://localhost:3000 and the API on http://localhost:3000/api.

## Documentation

Everything else is in **[`docs/`](docs/en/README.md)** (🇫🇷 [version française](docs/fr/README.md)):

| Page | What you'll find |
| ---- | ---------------- |
| [1. Getting started](docs/en/01-getting-started.md) | Requirements, `start.bat`, npm scripts |
| [2. Configuration](docs/en/02-configuration.md) | Every `.env` variable |
| [3. Architecture](docs/en/03-architecture.md) | Folders, tech stack, conventions |
| [4. The site](docs/en/04-site.md) | Texts and languages, cookies, styles, adding a page |
| [5. The API](docs/en/05-api.md) | Response format, adding a route, database, every route |
| [6. Admin documents](docs/en/06-admin-documents.md) | Quotes, invoices and contracts |
| [7. Security](docs/en/07-security.md) | Sessions, rate limits, uploads |
| [8. Deployment](docs/en/08-deployment.md) | Build and put the site online (Infomaniak) |
| [9. Troubleshooting](docs/en/09-troubleshooting.md) | Common problems and their fix |

## Contact

📩 [contact@djason-chery.dev](mailto:contact@djason-chery.dev) · 📞 [07 58 20 47 26](tel:+33758204726) · 🌐 [djason-chery.dev](https://djason-chery.dev)

## License

MIT, see [LICENSE](LICENSE).
