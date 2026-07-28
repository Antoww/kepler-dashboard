# Kepler Dashboard

Dashboard web de Kepler, développé avec SvelteKit, TypeScript et Tailwind CSS.

## Prérequis

- Node.js 24 LTS
- npm 11+

## Démarrage

```bash
cp .env.example .env
npm install
npm run dev
```

## Scripts

```bash
npm run dev       # serveur de développement
npm run check     # vérification Svelte et TypeScript
npm run lint      # lint et formatage
npm run format    # applique le formatage
npm run build     # build de production
npm run preview   # build et prévisualisation dans Workers
npm run deploy    # build et déploiement Cloudflare
```

## Cloudflare Workers

Le projet utilise l'adapter Cloudflare officiel et Wrangler.

```bash
cp .dev.vars.example .dev.vars
npx wrangler login
npm run preview
npm run deploy
```

`.dev.vars` contient les secrets locaux et ne doit jamais être commité. Les secrets de
production sont enregistrés avec `npx wrangler secret put NOM_DU_SECRET`.

## Architecture prévue

- Authentification Discord OAuth2 côté serveur
- Sélection des serveurs où l'utilisateur possède `MANAGE_GUILD`
- Vérification indépendante de la présence de Kepler sur le serveur
- Lecture et modification des réglages dans Supabase
- Secrets Discord et clé Supabase service-role exclusivement côté serveur

La branche de référence du bot est `Antoww/kepler-bot@v1.0.0`.
