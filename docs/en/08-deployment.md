# 8. Deployment

[← Documentation](README.md)

The site and the API are one Node.js application, hosted on **Infomaniak** (HTTPS included).

## 1. Build

```bash
npm run build      # or start.bat → B
```

This creates `.output/`, the optimized production build. It reads `.env.production`.

## 2. Upload

> **Before each new version:** download a backup of the database from the admin page.

Connect with SFTP (WinSCP or any client) and upload into `sites/your-site`:

```
.output/            production build
package.json        dependencies
package-lock.json   lock file
.env.production     environment variables
```

**Keep on the server** (never overwrite them):

- `.data/`: the SQLite database
- `.output/public/upload/`: images uploaded from the admin page

## 3. Node.js settings (Infomaniak)

| Setting | Value |
| ------- | ----- |
| Start command | `npm run start` |
| Port | `3000` |

## Static version (without the API)

```bash
npm run generate
```

Upload the content of `.output/public/` to any static host.
Login, admin, payments and every `/api` route will **not** work in this mode.
