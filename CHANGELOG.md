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

### Corrigé

- Débordement du champ mot de passe et des onglets connexion/inscription hors de la carte sur petits écrans (largeur minimale par défaut des éléments flex non contrainte).
