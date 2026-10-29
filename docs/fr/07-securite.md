# 7. Sécurité

[← Documentation](README.md)

## Connexion admin

E-mail et mot de passe, puis un code à usage unique envoyé par e-mail. En cas de mot de passe oublié, la réponse de sécurité
(`SECURITY_ANSWER`) est demandée, puis un mot de passe temporaire est envoyé.

## Routes protégées

La session est vérifiée par le routeur de l'API (`server/api/[...path].js`) sur la route trouvée :
`/api/env`, `/api/env/` et `/api//env` sont donc la même route protégée.
Seules les actions listées dans `publicActions` d'un contrôleur sont publiques ([toutes les routes](05-l-api.md#toutes-les-routes)).

`robots.txt` et `.htaccess` ne sont **pas** une protection : ils guident seulement les moteurs de recherche.

## Limites de tentatives

Les échecs sont gardés dans la base (`dc_rate_limits`), par compte et par adresse IP :

| Tentative | Limite | Bloqué pendant |
| --------- | ------ | -------------- |
| Mauvais mot de passe | 5 | 15 minutes |
| Mauvais code à usage unique | 5 | 15 minutes |
| Mauvaise réponse de sécurité | 3 | 1 heure |

## Envois de fichiers

- Seulement des images JPG, PNG, GIF, WEBP et AVIF
- Un remplacement de base doit être un fichier SQLite valide de ce site

## Secrets

- Clé secrète Stripe, SMTP, banque et compte admin restent sur le serveur : jamais dans une variable `NUXT_PUBLIC_`
- Les fichiers `.env` ne sont jamais envoyés sur Git
