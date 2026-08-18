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
- Connexion d'un utilisateur via Supabase Auth (`signInWithEmail`) depuis l'onglet Connexion du formulaire, avec affichage d'une erreur et redirection vers `/animes` en cas de succès
- Barre de navigation (`Navbar`) avec logo et menu de profil (`ProfileMenu`) proposant la déconnexion, affichée sur la page Animes à la place du bouton de déconnexion isolé
- Dossier `assembly/` avec les scripts SQL Supabase : `001_create_anime_list_table.sql` (table `anime_list`)
- Affichage de la liste des animes de l'utilisateur connecté (`fetchAnimes`) sur la page Animes, sous forme de tableau, avec états de chargement, d'erreur et de liste vide ("Aucun anime n'existe pour le moment")
- Lien de navigation "Animes" dans la `Navbar`, préparant l'ajout de futures catégories (mangas, films)
- Tri du tableau des animes par titre, épisodes, statut ou saison, avec une flèche indiquant la colonne et le sens du tri actifs
- Composant générique `SearchBar` réutilisable
