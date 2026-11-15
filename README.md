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
- Introduction (`site.intro`, `site.company`), bio (`site.about`), note (`site.colophon`), liens, projets (`work`) et historique : `src/data/site.ts`. Ajouter les nouvelles entrées en tête de `changelog`, avec une date ISO et son fuseau horaire.
- Chaque entrée du changelog contient un titre descriptif court et trois puces brèves maximum.
- Le compteur de la signature utilise la date de la première entrée ; il ne se réinitialise pas au rechargement.
- Changelog et liens sociaux : dans About. La ligne « Last updated » ouvre une carte modale avec fermeture par bouton, Échap ou clic extérieur. La route `/changelog/` reste disponible en accès direct et sans JavaScript.
- Les aperçus de Work apparaissent au survol ou au focus sur ordinateur. Le visuel AI Guard provient de sa [page produit officielle](https://www.datadoghq.com/products/security/ai-guard/) ; celui de [The care era](https://medium.com/@MatthieuBabe/the-care-era-7342fbb5f832) reprend l’image de l’article, identifiée dans le flux RSS public de Matthieu.
- Les transitions Astro conservent le scotch entre les pages ; les animations respectent la préférence de mouvement réduit.
- Mise en page, fond blanc et lumière au bord de l’écran : `src/layouts/SiteLayout.astro` et `src/styles/site.css`.

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
