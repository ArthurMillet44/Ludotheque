# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]

### Ajouté

- Mise en place de la structure de base du projet : `README.md`, `CHANGELOG.md`, `.gitignore`, `.env` / `.env.example`, workflow CI GitHub Actions.
- Ajout de la branche `develop` dans les déclencheurs de la CI.
- Ajout de `CLAUDE.md` avec les règles de collaboration du projet
- Ajout des règles d'architecture du code dans `CLAUDE.md` (responsabilité unique, séparation CSS/HTML/TS, architecture en composants)
- Initialisation du projet frontend avec Vite, React et TypeScript
- Page de connexion (UI uniquement) : logo, onglets connexion/inscription, champs email et mot de passe, sans logique métier ni appel réseau
- Client Supabase partagé (`src/lib/supabaseClient.ts`) initialisé à partir des variables d'environnement
- Mise en place du routage (react-router-dom) avec une page Animes provisoire comme destination après inscription
- Inscription d'un utilisateur via Supabase Auth (`signUpWithEmail`) depuis l'onglet Inscription du formulaire, avec affichage d'une erreur et redirection vers `/animes` en cas de succès
- Bouton de déconnexion (`signOut`) sur la page Animes, qui ramène vers la page de connexion
- Connexion d'un utilisateur via Supabase Auth (`signInWithEmail`) depuis l'onglet Connexion du formulaire, avec affichage d'une erreur et redirection vers `/animes` en cas de succès

### Corrigé

- Débordement du champ mot de passe et des onglets connexion/inscription hors de la carte sur petits écrans (largeur minimale par défaut des éléments flex non contrainte).
