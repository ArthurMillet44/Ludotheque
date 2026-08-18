-- Création de la table anime_list, qui stocke la liste d'animes de chaque utilisateur.
-- Le nom est en snake_case (et non animeList) car PostgreSQL met en minuscules les
-- identifiants non cités entre guillemets, ce qui rendrait "animeList" ambigu.

create table if not exists public.anime_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  episodes integer,
  status text not null check (status in ('En cours', 'Terminé', 'En pause')),
  current_season integer,
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists anime_list_user_id_idx on public.anime_list (user_id);

-- Row Level Security : chaque utilisateur ne voit et ne modifie que ses propres animes.
alter table public.anime_list enable row level security;

create policy "Les utilisateurs voient leurs propres animes"
  on public.anime_list
  for select
  using (auth.uid() = user_id);

create policy "Les utilisateurs ajoutent leurs propres animes"
  on public.anime_list
  for insert
  with check (auth.uid() = user_id);

create policy "Les utilisateurs modifient leurs propres animes"
  on public.anime_list
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Les utilisateurs suppriment leurs propres animes"
  on public.anime_list
  for delete
  using (auth.uid() = user_id);
