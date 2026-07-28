# Kepler Dashboard

Dashboard web de Kepler, développé avec SvelteKit, TypeScript et Tailwind CSS.

## Prérequis

- Node.js 22 LTS
- npm 10+

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
```

## Architecture prévue

- Authentification Discord OAuth2 côté serveur
- Sélection des serveurs où l'utilisateur possède `MANAGE_GUILD`
- Vérification indépendante de la présence de Kepler sur le serveur
- Lecture et modification des réglages dans Supabase
- Secrets Discord et clé Supabase service-role exclusivement côté serveur

La branche de référence du bot est `Antoww/kepler-bot@v1.0.0`.
