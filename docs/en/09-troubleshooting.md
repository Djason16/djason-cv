# 9. Troubleshooting

[← Documentation](README.md)

| Problem | Fix |
| ------- | --- |
| `node:sqlite` not found / database error on start | Node.js is too old: install 22.16+ (`node -v`) |
| A text shows its key (`aboutTitle`) | The key is missing in one language, or its file is not in `TRANSLATIONS` (`plugins/translations/translations.js`) |
| A new API route returns 404 | New controller file: restart `npm run dev`. Check the method name ([Adding a route](05-api.md#adding-a-route)) |
| An API route returns 401 | It needs the admin session: log in, or add the action to `publicActions` |
| A `.env` change has no effect | Restart `npm run dev`; in production, **rebuild** (`npm run build`) |
| Login code never arrives | Check the `SMTP_*` values; port `465` needs `SMTP_SECURE=true` |
| A document is not generated | Read the alert: something is missing ([Admin documents](06-admin-documents.md#checks)) |
| The cookie banner keeps coming back | Expected when the visitor changed page without choosing: nothing was saved |
| VS Code: "Type instantiation is excessively deep and possibly infinite" | Run `npx nuxi prepare` in `app/`, then `Ctrl+Shift+P` → **Vue: Restart Vue Server**. `tsconfig.json` must keep the Nuxt 4 `references` |
| The language is not remembered | The visitor refused functional cookies: expected |
