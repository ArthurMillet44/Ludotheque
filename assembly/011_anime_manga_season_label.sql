-- Remplace le numéro de saison (season_number, entier) par un libellé libre
-- (label, texte), pour permettre de nommer une entrée "Film", "OAV", etc. et
-- pas seulement "Saison X". À exécuter après 007/008/009/010, qui ont déjà
-- créé anime_season_list / manga_season_list avec la colonne season_number.
--
-- Étapes : ajout de la colonne label, reprise des valeurs existantes sous la
-- forme "Saison N", passage en NOT NULL, puis suppression de l'ancienne
-- colonne season_number et de sa contrainte d'unicité (le libellé libre n'a
-- plus besoin d'être unique par anime/manga).

alter table public.anime_season_list add column if not exists label text;

update public.anime_season_list
set label = 'Saison ' || season_number
where label is null;

alter table public.anime_season_list alter column label set not null;
alter table public.anime_season_list drop constraint if exists anime_season_list_anime_list_id_season_number_key;
alter table public.anime_season_list drop column if exists season_number;

alter table public.manga_season_list add column if not exists label text;

update public.manga_season_list
set label = 'Saison ' || season_number
where label is null;

alter table public.manga_season_list alter column label set not null;
alter table public.manga_season_list drop constraint if exists manga_season_list_manga_list_id_season_number_key;
alter table public.manga_season_list drop column if exists season_number;
