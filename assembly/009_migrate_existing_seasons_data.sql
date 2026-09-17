-- Migration des données existantes vers le nouveau modèle par saison.
-- Pour chaque anime/manga déjà en base, crée une saison unique reprenant les
-- valeurs actuelles (numéro de saison, nombre d'épisodes/chapitres, statut),
-- avant que le script suivant (010) ne supprime ces colonnes de anime_list /
-- manga_list. Sans effet si ces colonnes ont déjà été supprimées ou si les
-- tables sont vides.
--
-- Le numéro de saison reprend l'ancien champ current_season (1 par défaut
-- s'il est vide ou invalide, ex. 0 ou négatif) : l'ancien modèle ne stockait
-- qu'une seule ligne par anime/manga, avec un seul numéro de saison "en
-- cours" et un seul compteur d'épisodes/chapitres, donc une seule saison est
-- créée ici. Si ce compteur totalisait en réalité plusieurs saisons (ex.
-- épisodes cumulés sur toute la série), il faudra répartir manuellement ces
-- valeurs entre plusieurs saisons après la migration, la base ne peut pas
-- deviner cette répartition.

insert into public.anime_season_list (user_id, anime_list_id, season_number, episodes, status)
select user_id, id, greatest(coalesce(current_season, 1), 1), episodes, status
from public.anime_list
where not exists (
  select 1 from public.anime_season_list where anime_season_list.anime_list_id = anime_list.id
);

insert into public.manga_season_list (user_id, manga_list_id, season_number, chapters, status)
select user_id, id, greatest(coalesce(current_season, 1), 1), chapters, status
from public.manga_list
where not exists (
  select 1 from public.manga_season_list where manga_season_list.manga_list_id = manga_list.id
);
