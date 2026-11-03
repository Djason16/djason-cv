<p align="center"><img src="../assets/docs-fr.png" alt="Documentation" width="100%" /></p>

# 09 — Dépannage

**DOC-09** &nbsp;·&nbsp; [← Documentation](README.md)

| Problème | Solution |
| -------- | -------- |
| « Database not reachable yet » / « Database setup failed » au démarrage | En local : lance Docker Desktop, puis `start.bat` → `D` (MySQL met quelques secondes). En ligne : vérifie les valeurs `DB_*` de `.env.production` et refais un build |
| Docker Desktop affiche `localhost:3306` qui n'ouvre rien | Normal : c'est le port de MySQL, utilisé par le site, pas une page web. phpMyAdmin est sur http://localhost:8081 |
| Un texte affiche sa clé (`aboutTitle`) | La clé manque dans une langue, ou son fichier n'est pas dans `TRANSLATIONS` (`plugins/translations/translations.js`) |
| Une nouvelle route de l'API renvoie 404 | Nouveau fichier de contrôleur : relance `npm run dev`. Vérifie le nom de la méthode ([Ajouter une route](05-l-api.md#02--ajouter-une-route)) |
| Une route de l'API renvoie 401 | Elle demande la session admin : connecte-toi, ou ajoute l'action dans `publicActions` |
| Un changement du `.env` n'a pas d'effet | Relance `npm run dev` ; en production, **refais un build** (`npm run build`) |
| Le code de connexion n'arrive pas | Vérifie les valeurs `SMTP_*` ; le port `465` demande `SMTP_SECURE=true` |
| Un document n'est pas créé | Lis l'alerte : il manque quelque chose ([L'admin et les documents](06-documents-admin.md)) |
| Le bandeau cookies revient | Normal si le visiteur a changé de page sans choisir : rien n'a été enregistré |
| VS Code : « L'instanciation de type est trop profonde et éventuellement infinie » | Lance `npx nuxi prepare` dans `app/`, puis `Ctrl+Shift+P` → **Vue: Restart Vue Server**. `tsconfig.json` doit garder les `references` de Nuxt 4 |
| La langue n'est pas gardée | Le visiteur a refusé les cookies fonctionnels : normal |

---

<p align="center"><sub><a href="08-mise-en-ligne.md">← 08 — Mise en ligne</a> &nbsp;·&nbsp; <a href="README.md">Documentation</a></sub></p>
