<p align="center"><img src="../assets/docs-en.png" alt="Documentation" width="100%" /></p>

# 09 — Troubleshooting

**DOC-09** &nbsp;·&nbsp; [← Documentation](README.md)

| Problem | Fix |
| ------- | --- |
| "Database not reachable yet" / "Database setup failed" on start | Locally: start Docker Desktop, then `start.bat` → `D` (MySQL takes a few seconds). Online: check the `DB_*` values of `.env.production` and rebuild |
| Docker Desktop shows `localhost:3306` that opens nothing | Normal: it is the MySQL port, used by the site, not a web page. phpMyAdmin is http://localhost:8081 |
| A text shows its key (`aboutTitle`) | The key is missing in one language, or its file is not in `TRANSLATIONS` (`plugins/translations/translations.js`) |
| A new API route returns 404 | New controller file: restart `npm run dev`. Check the method name ([Adding a route](05-api.md#02--adding-a-route)) |
| An API route returns 401 | It needs the admin session: log in, or add the action to `publicActions` |
| A `.env` change has no effect | Restart `npm run dev`; in production, **rebuild** (`npm run build`) |
| Login code never arrives | Check the `SMTP_*` values; port `465` needs `SMTP_SECURE=true` |
| A document is not generated | Read the alert: something is missing ([Admin & documents](06-admin-documents.md)) |
| The cookie banner keeps coming back | Expected when the visitor changed page without choosing: nothing was saved |
| VS Code: "Type instantiation is excessively deep and possibly infinite" | Run `npx nuxi prepare` in `app/`, then `Ctrl+Shift+P` → **Vue: Restart Vue Server**. `tsconfig.json` must keep the Nuxt 4 `references` |
| The language is not remembered | The visitor refused functional cookies: expected |

---

<p align="center"><sub><a href="08-deployment.md">← 08 — Deployment</a> &nbsp;·&nbsp; <a href="README.md">Documentation</a></sub></p>
