-- Création de la table manga_season_list, qui stocke les saisons de chaque manga
-- (nombre de chapitres et statut au niveau de la saison, et non plus au niveau
-- du manga entier). Reprend la structure de anime_season_list, avec la colonne
-- "episodes" qui devient "chapters" (plus adapté au manga).

create table if not exists public.manga_season_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  manga_list_id uuid not null references public.manga_list (id) on delete cascade,
  season_number integer not null,
  chapters integer,
  status text not null check (status in ('En cours', 'Terminé', 'En pause')),
  created_at timestamptz not null default now(),
  unique (manga_list_id, season_number)
);

create index if not exists manga_season_list_user_id_idx on public.manga_season_list (user_id);
create index if not exists manga_season_list_manga_list_id_idx on public.manga_season_list (manga_list_id);

-- Row Level Security : chaque utilisateur ne voit et ne modifie que ses propres saisons.
alter table public.manga_season_list enable row level security;

create policy "Les utilisateurs voient leurs propres saisons de manga"
  on public.manga_season_list
  for select
  using (auth.uid() = user_id);

create policy "Les utilisateurs ajoutent leurs propres saisons de manga"
  on public.manga_season_list
  for insert
  with check (auth.uid() = user_id);

create policy "Les utilisateurs modifient leurs propres saisons de manga"
  on public.manga_season_list
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Les utilisateurs suppriment leurs propres saisons de manga"
  on public.manga_season_list
  for delete
  using (auth.uid() = user_id);
