# matthieubabe.fr

Site vitrine statique construit avec Astro et prévu pour un déploiement Vercel.

## Commandes

```bash
npm install
npm run dev
npm run build
```

## Contenu et mises à jour

- Work : `src/pages/index.astro`. About : `src/pages/about.astro`. Les deux routes restent accessibles sans JavaScript.
- Introduction (`site.intro`, `site.company`), bio (`site.about` et `site.aboutNickname`), note (`site.colophon`), liens, projets (`work`) et historique : `src/data/site.ts`. Ajouter les nouvelles entrées en tête de `changelog`, avec une date ISO et son fuseau horaire.
- Chaque entrée du changelog contient un titre descriptif court et trois puces brèves maximum.
- Le compteur de la signature utilise la date de la première entrée ; il ne se réinitialise pas au rechargement.
- Changelog et liens sociaux : dans About. La ligne « Last updated » ouvre une carte modale avec fermeture par bouton, Échap ou clic extérieur. La route `/changelog/` reste disponible en accès direct et sans JavaScript.
- Les aperçus de Work apparaissent au survol ou au focus sur ordinateur. Le visuel AI Guard provient de sa [page produit officielle](https://www.datadoghq.com/products/security/ai-guard/) ; celui de [The care era](https://medium.com/@MatthieuBabe/the-care-era-7342fbb5f832) reprend l’image de l’article, identifiée dans le flux RSS public de Matthieu.
- Les transitions Astro conservent l’en-tête et sa scène 3D entre les pages ; les animations respectent la préférence de mouvement réduit.
- Mise en page et fond blanc : `src/layouts/SiteLayout.astro` et `src/styles/site.css`.
- Identité : « I’m Matthieu », quatre magnets « Babe », puis l’introduction. `src/scripts/magnet-scene.ts` définit la géométrie, le grain du plastique, les couleurs et l’éclairage Three.js. Les lettres initialement éparpillées se rangent avant l’apparition des textes de haut en bas. La scène reste au repos après l’entrée et se redessine au redimensionnement ; l’image fixe fonctionne sans JavaScript ou WebGL, et la préférence de mouvement réduit supprime la séquence.
- `npm run generate:magnets` régénère les contours depuis Quicksand Bold et Lilita One (le B), les deux arrangements transparents à 4× et le B du favicon. Il utilise Chromium (`CHROMIUM_PATH` si nécessaire), ou le navigateur installé par `npx playwright install chromium`, et un serveur local temporaire sur le port 4327. Les fontes et leurs licences SIL OFL sont conservées dans `scripts/assets/magnets/`.
- Ancien scotch à l’encre bleue : source conservée dans `scripts/assets/name-tape-ai-source.png` et générée par `npm run generate:tape`.
- Favicon : le même B rouge en magnet. `npm run generate:favicon` produit les PNG 16/32 px, l’ICO et l’icône Apple depuis `scripts/assets/magnets/magnet-b.png`.

## Déploiement Vercel

1. Pousser ce dépôt sur GitHub.
2. Créer un nouveau projet Vercel depuis le dépôt.
3. Laisser Vercel détecter Astro automatiquement.
4. Ajouter le domaine `matthieubabe.fr` dans les paramètres du projet.
5. Mettre à jour la zone DNS OVH avec les enregistrements indiqués par Vercel.

## OVH

Garder uniquement le nom de domaine `matthieubabe.fr` chez OVH.

- Domaine : à conserver.
- Framer : à résilier après validation du site Vercel en production.
- Hébergement OVH Perso : à désactiver avant le renouvellement du 31 janvier 2027.
- Emails OVH : non utilisés actuellement.
