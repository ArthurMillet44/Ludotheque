# Ludotheque

Application web pour gérer sa liste personnelle de mangas, animes, films et autres catégories de médias.

Le but du projet est de répertorier des contenus personnels variés : animes vus, mangas lus, listes de mods pour Skyrim, suivis de parties Nuzlocke sur Pokémon, et d'autres catégories à venir.

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

## Déploiement (Vercel)

1. Pousser le projet sur GitHub (déjà fait pour ce repo).
2. Sur [vercel.com](https://vercel.com/), se connecter avec le compte GitHub, puis "Add New Project" et importer le repo `Ludotheque`.
3. Vercel détecte automatiquement le framework Vite (commande de build `npm run build`, dossier de sortie `dist`) : ne rien changer à cette étape.
4. Dans "Environment Variables", renseigner `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` avec les mêmes valeurs que dans `.env`.
5. Cliquer sur "Deploy".
6. Une fois le site en ligne, aller dans le dashboard Supabase (`Authentication > URL Configuration`) et ajouter l'URL du site Vercel (ex. `https://ludotheque.vercel.app`) en "Site URL" / "Redirect URLs", pour que l'authentification fonctionne correctement en production.

Le fichier `vercel.json` à la racine configure la redirection nécessaire pour que les routes de l'application (`/animes`, `/pokemon/:id`, etc.) fonctionnent au rafraîchissement de page, puisque le routage est géré côté client par `react-router`.

## État du projet

Version 1.0.0. Voir [CHANGELOG.md](CHANGELOG.md) pour le détail de l'avancement.
