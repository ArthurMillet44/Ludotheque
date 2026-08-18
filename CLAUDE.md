# Instructions pour Claude

Ces règles s'appliquent à tout le travail effectué sur ce projet.

## Documentation du code

- Chaque fonction créée doit avoir une docstring décrivant son rôle, ses paramètres et sa valeur de retour.
- Dans les commentaires de code et dans la documentation, ne jamais utiliser le caractère "" (tiret cadratin/tiret demi-cadratin). Utiliser une virgule, un point ou reformuler la phrase à la place.
- Ne jamais utiliser d'emoji, dans le code, les commentaires ou la documentation.

## Changelog et documentation

- À chaque changement, mettre à jour la documentation concernée si nécessaire (README, etc.).
- À chaque changement, ajouter une entrée dans le CHANGELOG.md avec une description succincte. L'objectif est de comprendre rapidement ce qui a changé sans avoir à lire tout le diff.

## Sécurité

- Ne jamais lire le fichier .env, sauf demande explicite de l'utilisateur dans le message en cours.

## Fiabilité

- Ne jamais inventer d'information dont on n'est pas sûr (API, comportement Supabase, structure de données, etc.). En cas de doute, poser la question plutôt que de supposer.

## Architecture du code

- Chaque fichier doit avoir sa propre responsabilité, et chaque fonction également.
- Séparer au maximum le CSS, le HTML/JSX et le TypeScript dans des fichiers distincts.
- Privilégier une architecture en composants quand cela a un intérêt.
