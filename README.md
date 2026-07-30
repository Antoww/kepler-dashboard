# Kepler Dashboard

Interface web officielle de **Kepler**, un bot français conçu pour administrer,
protéger et animer les communautés Discord.

Le dashboard permet aux administrateurs de se connecter avec Discord, de retrouver
les serveurs qu’ils sont autorisés à gérer et de configurer Kepler sans passer par
une succession de commandes.

## Fonctionnalités

- Authentification Discord OAuth2 avec PKCE
- Liste des serveurs où l’utilisateur possède la permission de gestion
- Détection des serveurs sur lesquels Kepler est installé
- Configuration des modules depuis Supabase :
  - paramètres généraux et fuseau horaire ;
  - journaux ;
  - modération et rôle muet ;
  - anniversaires ;
  - signalements ;
  - tickets et publication du panneau Discord
- Statistiques du serveur et graphiques d’activité
- Créateur de messages Discord Components V2 avec aperçu
- Interface responsive avec navigation latérale
- Séparation complète des applications Discord de développement et de production

## Stack

- [SvelteKit](https://svelte.dev/docs/kit) et Svelte 5
- TypeScript
- Tailwind CSS 4
- [Lucide](https://lucide.dev/) pour les icônes
- [Supabase](https://supabase.com/) pour les données partagées avec le bot
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) pour
  l’hébergement
- API Discord v10 pour l’authentification et les actions du bot

## Prérequis

- Node.js 24 LTS
- npm 11 ou une version compatible avec le fichier `package-lock.json`
- Un compte Cloudflare avec Wrangler authentifié
- Une application Discord pour chaque environnement
- Un projet Supabase accessible avec une clé `service_role`

## Installation locale

```bash
git clone https://github.com/Antoww/kepler-dashboard.git
cd kepler-dashboard
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

Le serveur Vite est ensuite disponible sur `http://localhost:5173`.

### Variables locales

Compléter `.dev.vars` avec les valeurs suivantes :

```dotenv
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URI=http://localhost:5173/auth/discord/callback
DISCORD_BOT_TOKEN=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

SESSION_SECRET=
```

Générer un secret de session avec :

```bash
openssl rand -base64 32
```

Les fichiers `.dev.vars*` contiennent des secrets et ne doivent jamais être
commités. Seuls leurs fichiers `.example` sont suivis par Git.

## Scripts

| Commande              | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `npm run dev`         | Lance le serveur de développement SvelteKit           |
| `npm run check`       | Vérifie les composants Svelte et les types TypeScript |
| `npm run check:watch` | Lance les vérifications en mode continu               |
| `npm run lint`        | Vérifie Prettier et ESLint                            |
| `npm run format`      | Formate le projet avec Prettier                       |
| `npm run build`       | Génère le Worker Cloudflare                           |
| `npm run preview`     | Prévisualise la configuration de production           |
| `npm run preview:dev` | Prévisualise l’environnement Wrangler `dev`           |
| `npm run deploy:dev`  | Déploie uniquement le dashboard de développement      |
| `npm run deploy:prod` | Déploie le dashboard de production                    |
| `npm run cf-typegen`  | Régénère les types des bindings Cloudflare            |

Avant un déploiement, exécuter au minimum :

```bash
npm run lint
npm run check
npm run build
```

## Environnements

Les deux dashboards utilisent le même projet Supabase, mais des applications et
des bots Discord distincts.

| Environnement | Worker                 | Domaine                        | Commande              |
| ------------- | ---------------------- | ------------------------------ | --------------------- |
| Développement | `kepler-dashboard-dev` | `dev.dashboard.kepler-bot.net` | `npm run deploy:dev`  |
| Production    | `kepler-dashboard`     | `dashboard.kepler-bot.net`     | `npm run deploy:prod` |

### Secrets Cloudflare

Chaque Worker possède ses propres secrets :

```text
DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET
DISCORD_REDIRECT_URI
DISCORD_BOT_TOKEN
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SESSION_SECRET
```

Enregistrer un secret de développement :

```bash
npx wrangler secret put NOM_DU_SECRET --env dev
```

Enregistrer un secret de production en ciblant explicitement la configuration
principale :

```bash
npx wrangler secret put NOM_DU_SECRET --env=""
```

Les callbacks OAuth2 attendus sont :

```text
http://localhost:5173/auth/discord/callback
https://dev.dashboard.kepler-bot.net/auth/discord/callback
https://dashboard.kepler-bot.net/auth/discord/callback
```

Ils doivent également être déclarés dans l’application correspondante depuis le
Discord Developer Portal.

## Architecture

```text
src/
├── lib/
│   ├── components/       Composants d’interface partagés
│   └── server/
│       ├── auth/         OAuth2, sessions et appels à l’API Discord
│       └── database/     Accès serveur à Supabase
└── routes/
    ├── auth/             Connexion, callback et déconnexion Discord
    └── dashboard/
        ├── +page.*        Sélection du serveur
        └── [guildId]/     Configuration et statistiques d’un serveur
```

Les tokens Discord et la clé Supabase `service_role` restent exclusivement côté
serveur. Le navigateur ne reçoit que les données nécessaires à l’interface.

La branche de référence actuelle du bot est `1.0.0` dans
`Antoww/kepler-bot`.

## Versionnement

Le projet suivra [Semantic Versioning](https://semver.org/lang/fr/) :

- `MAJOR` pour une modification incompatible ;
- `MINOR` pour une nouvelle fonctionnalité rétrocompatible ;
- `PATCH` pour une correction rétrocompatible.

Les changements destinés à la prochaine version sont ajoutés sous
`[Non publié]` dans [`CHANGELOG.md`](./CHANGELOG.md). Lors d’une release :

1. déplacer les entrées concernées dans une section `[X.Y.Z] - AAAA-MM-JJ` ;
2. mettre à jour la version dans `package.json` et `package-lock.json` ;
3. valider le build et déployer en production ;
4. créer le tag Git `vX.Y.Z` et la release GitHub correspondante.

## Statut

Le dashboard est en développement actif. Les fonctionnalités et le schéma de
données peuvent encore évoluer avant la première version stable.
