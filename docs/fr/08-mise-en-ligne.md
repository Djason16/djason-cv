<p align="center"><img src="../assets/docs-fr.png" alt="Documentation" width="100%" /></p>

# 08 — Mise en ligne

**DOC-08** &nbsp;·&nbsp; [← Documentation](README.md)

Le site et l'API sont une seule application Node.js, hébergée chez **Infomaniak** (HTTPS inclus).

## 01 — Base de données (une seule fois)

Dans le Manager Infomaniak, crée une **base MySQL** et son utilisateur, puis écris son serveur, son nom, l'utilisateur et le mot de passe
dans `.env.production` (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`, voir [Configuration](02-configuration.md)).
La base est séparée des fichiers du site : une nouvelle version n'y touche jamais, Infomaniak la sauvegarde,
et tu la vois dans phpMyAdmin depuis le Manager.

Pour avoir la base prête avant la mise en ligne : phpMyAdmin (la base à gauche) → **Importer** → `mysql/init/example.sql`.
Il contient toutes les tables du site et leurs lignes par défaut (services, taux, agenda), sans donnée personnelle ; il est fait depuis
`app/server/helpers/DatabaseSchema.js`. Le site crée de toute façon les mêmes tables à son démarrage, et Docker exécute ce fichier au premier
démarrage de la base locale. Il peut être importé de nouveau : une table existante est gardée, une ligne n'est jamais ajoutée deux fois.

## 02 — Construire

```bash
npm run build      # ou start.bat → B
```

Crée `.output/`, la version optimisée pour la production. Lit `.env.production`.

## 03 — Envoyer

Envoie dans `sites/ton-site` (SFTP ou le déploiement d'Infomaniak) :

```
.output/            version de production
package.json        modules
package-lock.json   versions exactes des modules
.env.production     variables d'environnement
```

Rien n'est à garder sur le serveur entre deux versions : les données et les images des projets sont dans la base MySQL.
Au premier démarrage, le site crée les tables manquantes et le compte admin.
Remplis ensuite **admin → Mes infos** (nom, contact, mentions légales, réseaux sociaux).

## 04 — Réglages Node.js (Infomaniak)

| Réglage | Valeur |
| ------- | ------ |
| Commande de démarrage | `npm run start` |
| Port | `3000` |

## 05 — Sauvegarder et restaurer la base

Toute la base tient dans un fichier SQL : les tables, leurs lignes et les images envoyées depuis l'admin (`dc_uploads`).

| Action | Commande, dans `app/` |
| ------ | --------------------- |
| Sauvegarder la base locale | `npm run db:backup` |
| Sauvegarder la base en ligne | `npm run db:backup -- --env .env.production` |
| Remettre une sauvegarde en local | `npm run db:restore -- ../backups/<fichier>.sql` |
| Remettre une sauvegarde en ligne | `npm run db:restore -- ../backups/<fichier>.sql --env .env.production` (demande de taper le nom de la base) |

- Les fichiers vont dans `backups/` à la racine du projet, jamais envoyé sur Git
- La restauration **remplace** chaque table par celle du fichier : fais d'abord une sauvegarde de l'état actuel
- La base en ligne n'accepte que les ordinateurs autorisés dans le Manager Infomaniak (**Bases de données** → **Accès distant**). Sinon : phpMyAdmin du Manager → **Exporter** pour sauvegarder, **Importer** le fichier pour restaurer
- Infomaniak garde en plus des sauvegardes automatiques de la base : **Manager** → **Bases de données** → **Sauvegardes** → **Restaurer**
- Avant chaque mise en ligne importante : `npm run db:backup -- --env .env.production`

---

<p align="center"><sub><a href="07-securite.md">← 07 — Sécurité</a> &nbsp;·&nbsp; <a href="README.md">Documentation</a> &nbsp;·&nbsp; <a href="09-depannage.md">09 — Dépannage →</a></sub></p>
