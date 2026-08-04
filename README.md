# ListeMangas

Application web pour gérer sa liste personnelle de mangas, animes, films et autres catégories de médias.

## Stack technique

- **Frontend** : [Vite](https://vitejs.dev/) + [React](https://react.dev/)
- **Backend / Auth / Base de données** : [Supabase](https://supabase.com/) (PostgreSQL, Auth, Row Level Security)
- **Hébergement** : [Vercel](https://vercel.com/)
- **Gestionnaire de paquets** : npm

## Prérequis

- [Node.js](https://nodejs.org/) 20+
- Un compte [Supabase](https://supabase.com/) avec un projet créé

## Configuration

1. Copier le fichier d'exemple des variables d'environnement :

   ```bash
   cp .env.example .env
   ```

2. Renseigner dans `.env` les valeurs de ton projet Supabase (`Project Settings > API`) :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

## Build

```bash
npm run build
```

## État du projet

Le projet est en cours de structuration initiale. Voir [CHANGELOG.md](CHANGELOG.md) pour le détail de l'avancement.
