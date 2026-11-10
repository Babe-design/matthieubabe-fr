# matthieubabe.fr

Site vitrine statique construit avec Astro et prévu pour un déploiement Vercel.

## Commandes

```bash
npm install
npm run dev
npm run build
```

## Contenu et mises à jour

- Accueil : `src/pages/index.astro` (vide pour accueillir les futurs contenus).
- Liens, présentation (`site.intro` et `site.currentRole`) et historique : `src/data/site.ts`. Ajouter les nouvelles entrées en tête de `changelog`, avec une date ISO et son fuseau horaire.
- Le compteur de la signature utilise la date de la première entrée ; il ne se réinitialise pas au rechargement.
- Changelog public : `/changelog/`.
- Mise en page et papier blanc : `src/layouts/SiteLayout.astro` et `src/styles/site.css`.

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
