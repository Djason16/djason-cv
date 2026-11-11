<p align="center"><img src="../assets/docs-en.png" alt="Documentation" width="100%" /></p>

# 08 — Deployment

**DOC-08** &nbsp;·&nbsp; [← Documentation](README.md)

The site and the API are one Node.js application, hosted on **Infomaniak** (HTTPS included).

## 01 — Database (once)

In the Infomaniak Manager, create a **MySQL database** and its user, then write its server, name, user and password
in `.env.production` (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`, see [Configuration](02-configuration.md)).
The database is separate from the files of the site: deploying a new version never touches it, Infomaniak backs it up,
and you see it in phpMyAdmin from the Manager.

To have the database ready before going online: phpMyAdmin (the database on the left) → **Import** → `mysql/init/example.sql`.
It holds every table of the site and its default rows (services, rates, agenda), no personal data; it is made from
`frontend/server/helpers/DatabaseSchema.ts`. The site makes the same tables at its start anyway, and Docker runs this file on the first start of
the local database. It can be imported again: a table that exists is kept, a row is never added twice.

## 02 — Build

```bash
npm run build      # or start.bat → B
```

This creates `.output/`, the optimized production build. It reads `.env.production`.

## 03 — Upload

Upload into `sites/your-site` (SFTP or the deployment of Infomaniak):

```
.output/            production build
package.json        dependencies
package-lock.json   lock file
.env.production     environment variables
```

Nothing has to be kept on the server between two versions: the data and the images of the projects are in the MySQL database.
On the first start, the site creates the missing tables and the admin account.
Then fill in **admin → My info** (name, contact, legal details, social links).

## 04 — Node.js settings (Infomaniak)

| Setting | Value |
| ------- | ----- |
| Start command | `npm run start` |
| Port | `3000` |

## 05 — Back up and restore the database

The whole database fits in one SQL file: the tables, their rows and the images uploaded from the admin (`dc_uploads`).

| Action | Command, in `frontend/` |
| ------ | ------------------ |
| Back up the local database | `npm run db:backup` |
| Back up the online database | `npm run db:backup -- --env .env.production` |
| Restore a backup locally | `npm run db:restore -- ../backups/<file>.sql` |
| Restore a backup online | `npm run db:restore -- ../backups/<file>.sql --env .env.production` (asks you to type the database name) |

- Files go to `backups/` at the root of the project, never sent to Git
- A restore **replaces** every table with the one in the file: back up the current state first
- The online database only accepts computers allowed in the Infomaniak Manager (**Databases** → **Remote access**). Otherwise: phpMyAdmin from the Manager → **Export** to back up, **Import** the file to restore
- Infomaniak also keeps automatic backups of the database: **Manager** → **Databases** → **Backups** → **Restore**
- Before any big release: `npm run db:backup -- --env .env.production`

---

<p align="center"><sub><a href="07-security.md">← 07 — Security</a> &nbsp;·&nbsp; <a href="README.md">Documentation</a> &nbsp;·&nbsp; <a href="09-troubleshooting.md">09 — Troubleshooting →</a></sub></p>
