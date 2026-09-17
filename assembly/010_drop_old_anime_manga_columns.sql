-- Suppression des colonnes désormais portées par anime_season_list /
-- manga_season_list plutôt que par anime_list / manga_list directement.
-- À exécuter uniquement après 009_migrate_existing_seasons_data.sql, une fois
-- les données existantes vérifiées dans les nouvelles tables de saisons.
-- Attention : la colonne chapters_en de manga_list n'a pas d'équivalent dans
-- manga_season_list et est donc perdue définitivement par ce script.

alter table public.anime_list
  drop column if exists episodes,
  drop column if exists status,
  drop column if exists current_season,
  drop column if exists comment;

alter table public.manga_list
  drop column if exists chapters,
  drop column if exists chapters_en,
  drop column if exists status,
  drop column if exists current_season,
  drop column if exists comment;
