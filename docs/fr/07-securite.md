<p align="center"><img src="../assets/docs-fr.png" alt="Documentation" width="100%" /></p>

# 07 — Sécurité

**DOC-07** &nbsp;·&nbsp; [← Documentation](README.md)

## 01 — Connexion admin

E-mail et mot de passe, puis un code à usage unique envoyé par e-mail. En cas de mot de passe oublié, la réponse de sécurité
(`SECURITY_ANSWER`) est demandée, puis un mot de passe temporaire est envoyé.

## 02 — Routes protégées

La session est vérifiée par le routeur de l'API (`server/api/[...path].js`) sur la route trouvée :
`/api/env`, `/api/env/` et `/api//env` sont donc la même route protégée.
Seules les actions listées dans `publicActions` d'un contrôleur sont publiques ([toutes les routes](05-l-api.md#04--toutes-les-routes)).

`robots.txt` n'est **pas** une protection : il guide seulement les moteurs de recherche.

## 03 — Limites de tentatives

Les échecs sont gardés dans la base (`dc_rate_limits`), par compte et par adresse IP :

| Tentative | Limite | Bloqué pendant |
| --------- | ------ | -------------- |
| Mauvais mot de passe | 5 | 15 minutes |
| Mauvais code à usage unique | 5 | 15 minutes |
| Mauvaise réponse de sécurité | 3 | 1 heure |

## 04 — Envois de fichiers

- Seulement des images JPG, PNG, GIF, WEBP et AVIF, gardées dans la base (`dc_uploads`)

## 05 — Secrets

- Clé secrète Stripe, SMTP, mot de passe de la base, banque et compte admin restent sur le serveur : jamais dans une variable `NUXT_PUBLIC_`
- Les fichiers `.env` ne sont jamais envoyés sur Git

---

<p align="center"><sub><a href="06-documents-admin.md">← 06 — L'admin et les documents</a> &nbsp;·&nbsp; <a href="README.md">Documentation</a> &nbsp;·&nbsp; <a href="08-mise-en-ligne.md">08 — Mise en ligne →</a></sub></p>
