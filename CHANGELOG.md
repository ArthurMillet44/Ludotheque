# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [1.3.1]

### Ajouté

- Nombre total d'épisodes (Animes) ou de chapitres (Mangas), toutes saisons confondues, affiché à côté du titre dans le tableau : recalculé à la volée à partir des saisons existantes, jamais stocké en base

## [1.3.0]

### Ajouté

- Script SQL `assembly/012_create_minecraft_tables.sql` (tables `minecraft_game_list` et `minecraft_history_list`) : suivi de parties Minecraft "random" (craft et loots randomisés), avec historique en arbre (sous-entrées), items d'entrée/sortie multiples pour les blocs cassés, indice de recette pour lever l'ambiguïté sur craft/pierre à tailler, et catégorie optionnelle (Armure, Outil, Potion, Nourriture, Bloc, Autre) par chaîne
- Page Minecraft (`/minecraft`), lien "Minecraft" dans la `Navbar` : parties affichées sous forme de cartes
- Page de détail d'une partie Minecraft (`/minecraft/:id`) : historique en arbre des correspondances "item(s) A donne(nt) item(s) B", pour les trois situations bloc cassé, craft et pierre à tailler, chaque chaîne de premier niveau étant repliable (repliée par défaut) et filtrable par catégorie
- Liste statique des items Minecraft (`src/data/minecraftItems.json`, générée depuis PrismarineJS/minecraft-data version 26.1, complétée par les 75 potions nommées par effet issues du fichier de langue officiel du jeu) et composant `MinecraftItemPicker` pour choisir un item par autocomplétion
- Composant `MinecraftItemIcon` affichant l'icône d'un item via le CDN InventivetalentDev/minecraft-assets (jsDelivr), avec repli automatique entre les dossiers de textures "item" et "block" (et vers l'icône générique de fiole pour les potions nommées par effet, qui n'ont pas de texture distincte dans le jeu)

## [1.2.0]

### Ajouté

- Scripts SQL `assembly/007_create_anime_season_list_table.sql` et `assembly/008_create_manga_season_list_table.sql` (tables `anime_season_list` et `manga_season_list`)
- Script SQL `assembly/009_migrate_existing_seasons_data.sql` : reprend les données existantes (numéro de saison, épisodes/chapitres, statut) dans une saison unique pour chaque anime/manga
- Script SQL `assembly/010_drop_old_anime_manga_columns.sql` : supprime les colonnes désormais portées par les saisons (`episodes`, `chapters`, `chapters_en`, `status`, `current_season`, `comment`)
- Script SQL `assembly/011_anime_manga_season_label.sql` : remplace le numéro de saison (entier) par un libellé libre (texte), pour pouvoir nommer une entrée "Film", "OAV", etc. et pas seulement "Saison X"
- Chaque ligne du tableau Animes/Mangas est désormais dépliable pour afficher ses saisons, chacune avec son propre nom, son propre nombre d'épisodes/chapitres, son propre statut et ses propres actions (ajout, modification, suppression, incrémentation rapide)
- Composants `AnimeSeasonsPanel`/`MangaSeasonsPanel` et `AnimeSeasonForm`/`MangaSeasonForm`
- Documentation des tests manuels pour la fonctionnalité de saisons (`TESTS_MANUELS_saisons.md`)

### Modifié

- Les animes et mangas ne portent plus qu'un titre : le nombre d'épisodes/chapitres, le statut et la saison en cours sont désormais gérés au niveau de chaque saison
- `AnimeForm`/`MangaForm` simplifiés pour ne plus gérer que le titre
- Le nom d'une saison n'est plus un simple numéro auto-incrémenté mais un texte libre modifiable ("Saison 2", "Film", "OAV"...)

### Supprimé

- Champ "Commentaire" au niveau de l'anime/du manga (retiré, non repris au niveau des saisons)
- Champ "Chapitres en anglais" du manga (n'a pas d'équivalent dans le nouveau modèle par saison)

## [1.1.0] - 2026-08-19

### Ajouté

- Fichier `vercel.json` avec la redirection nécessaire au routage côté client (`react-router`) lors d'un déploiement sur Vercel
- Section "Déploiement (Vercel)" dans le `README.md`
- Menu burger dans la `Navbar` sur petit écran pour le responsive

### Modifié

- `README.md` : ajout d'une phrase précisant le but du projet (animes, mangas, mods Skyrim, suivis Nuzlocke Pokémon, et d'autres catégories à venir)

## [1.0.0] - 2026-08-18

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
- CRUD sur les animes
- Composants génériques `Modal` et `SelectField`, réutilisables pour d'autres formulaires/boîtes de dialogue
- Script SQL `assembly/002_create_manga_list_table.sql` (table `manga_list`)
- Page Mangas (`/mangas`), lien "Mangas" dans la `Navbar`
- Script SQL `assembly/003_create_pokemon_games_table.sql` (table `pokemon_games`)
- Page Pokémon (`/pokemon`), lien "Pokémon" dans la `Navbar`
- Affichage des jeux Pokémon existants sous forme de cartes
- Modification et suppression d'un jeu Pokémon directement depuis sa carte
- Page de détail d'un jeu Pokémon (`/pokemon/:id`)
- Script SQL `assembly/004_create_pokemon_captures_table.sql` (table `pokemon_captures`)
- Affichage des Pokémon capturés (`fetchPokemonCaptures`) sur la page de détail d'un jeu
- Modification et suppression d'une capture, ligne par ligne, dans le tableau de la page de détail d'un jeu
- Tri du tableau des captures par zone, Pokémon capturé ou statut, et barre de recherche sur la page de détail d'un jeu
- Page Skyrim (`/skyrim`), lien "Skyrim" dans la `Navbar`
- Script SQL `assembly/005_create_skyrim_modpack_table.sql` (table `skyrim_modpack`)
- Logique backend et CRUD complet pour la page Skyrim : affichage des modpacks sous forme de cartes, ajout, modification et suppression
- Script SQL `assembly/006_create_skyrim_mod_list_table.sql` (table `skyrim_mod_list`)
- Page de détail d'un modpack Skyrim (`/skyrim/:id`)
- Bouton "Infos supplémentaires" sur la page de détail d'un modpack Skyrim, ouvrant une modale avec un texte statique

### Modifié

- Nom de l'application : "Cinémathèque" renommé en "Ludothèque" (titre de la page et logo)
