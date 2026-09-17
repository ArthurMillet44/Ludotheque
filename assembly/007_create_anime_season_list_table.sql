-- Création de la table anime_season_list, qui stocke les saisons de chaque anime
-- (nombre d'épisodes et statut au niveau de la saison, et non plus au niveau de
-- l'anime entier). Reprend la structure de skyrim_mod_list (liée à skyrim_modpack
-- de la même façon que anime_season_list l'est à anime_list).

create table if not exists public.anime_season_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  anime_list_id uuid not null references public.anime_list (id) on delete cascade,
  season_number integer not null,
  episodes integer,
  status text not null check (status in ('En cours', 'Terminé', 'En pause')),
  created_at timestamptz not null default now(),
  unique (anime_list_id, season_number)
);

create index if not exists anime_season_list_user_id_idx on public.anime_season_list (user_id);
create index if not exists anime_season_list_anime_list_id_idx on public.anime_season_list (anime_list_id);

-- Row Level Security : chaque utilisateur ne voit et ne modifie que ses propres saisons.
alter table public.anime_season_list enable row level security;

create policy "Les utilisateurs voient leurs propres saisons d'anime"
  on public.anime_season_list
  for select
  using (auth.uid() = user_id);

create policy "Les utilisateurs ajoutent leurs propres saisons d'anime"
  on public.anime_season_list
  for insert
  with check (auth.uid() = user_id);

create policy "Les utilisateurs modifient leurs propres saisons d'anime"
  on public.anime_season_list
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Les utilisateurs suppriment leurs propres saisons d'anime"
  on public.anime_season_list
  for delete
  using (auth.uid() = user_id);
