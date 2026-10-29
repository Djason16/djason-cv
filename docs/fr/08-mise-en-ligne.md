# 8. Mise en ligne

[← Documentation](README.md)

Le site et l'API sont une seule application Node.js, hébergée chez **Infomaniak** (HTTPS inclus).

## 1. Construire

```bash
npm run build      # ou start.bat → B
```

Crée `.output/`, la version optimisée pour la production. Lit `.env.production`.

## 2. Envoyer

> **Avant chaque nouvelle version :** télécharge une sauvegarde de la base depuis la page admin.

Connecte-toi en SFTP (WinSCP ou autre) et envoie dans `sites/ton-site` :

```
.output/            version de production
package.json        modules
package-lock.json   versions exactes des modules
.env.production     variables d'environnement
```

**À garder sur le serveur** (ne jamais les écraser) :

- `.data/` : la base SQLite
- `.output/public/upload/` : les images envoyées depuis l'admin

## 3. Réglages Node.js (Infomaniak)

| Réglage | Valeur |
| ------- | ------ |
| Commande de démarrage | `npm run start` |
| Port | `3000` |

## Version statique (sans l'API)

```bash
npm run generate
```

Envoie le contenu de `.output/public/` sur n'importe quel hébergement statique.
La connexion, l'admin, les paiements et toutes les routes `/api` ne marchent **pas** dans ce mode.
