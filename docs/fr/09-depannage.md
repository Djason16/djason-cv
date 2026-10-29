# 9. Dépannage

[← Documentation](README.md)

| Problème | Solution |
| -------- | -------- |
| `node:sqlite` introuvable / erreur de base au démarrage | Node.js est trop ancien : installe la 22.16+ (`node -v`) |
| Un texte affiche sa clé (`aboutTitle`) | La clé manque dans une langue, ou son fichier n'est pas dans `TRANSLATIONS` (`plugins/translations/translations.js`) |
| Une nouvelle route de l'API renvoie 404 | Nouveau fichier de contrôleur : relance `npm run dev`. Vérifie le nom de la méthode ([Ajouter une route](05-l-api.md#ajouter-une-route)) |
| Une route de l'API renvoie 401 | Elle demande la session admin : connecte-toi, ou ajoute l'action dans `publicActions` |
| Un changement du `.env` n'a pas d'effet | Relance `npm run dev` ; en production, **refais un build** (`npm run build`) |
| Le code de connexion n'arrive pas | Vérifie les valeurs `SMTP_*` ; le port `465` demande `SMTP_SECURE=true` |
| Un document n'est pas créé | Lis l'alerte : il manque quelque chose ([Documents de l'admin](06-documents-admin.md#vérifications)) |
| Le bandeau cookies revient | Normal si le visiteur a changé de page sans choisir : rien n'a été enregistré |
| VS Code : « L'instanciation de type est trop profonde et éventuellement infinie » | Lance `npx nuxi prepare` dans `app/`, puis `Ctrl+Shift+P` → **Vue: Restart Vue Server**. `tsconfig.json` doit garder les `references` de Nuxt 4 |
| La langue n'est pas gardée | Le visiteur a refusé les cookies fonctionnels : normal |
