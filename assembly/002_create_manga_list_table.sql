-- Création de la table manga_list, qui stocke la liste de mangas de chaque utilisateur.
-- Reprend la structure de anime_list, avec deux différences :
--   - la colonne "episodes" devient "chapters" (chapitre, plus adapté au manga)
--   - ajout de "chapters_en" pour suivre le nombre de chapitres disponibles en anglais

create table if not exists public.manga_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  chapters integer,
  chapters_en integer,
  status text not null check (status in ('En cours', 'Terminé', 'En pause')),
  current_season integer,
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists manga_list_user_id_idx on public.manga_list (user_id);

-- Row Level Security : chaque utilisateur ne voit et ne modifie que ses propres mangas.
alter table public.manga_list enable row level security;

create policy "Les utilisateurs voient leurs propres mangas"
  on public.manga_list
  for select
  using (auth.uid() = user_id);

create policy "Les utilisateurs ajoutent leurs propres mangas"
  on public.manga_list
  for insert
  with check (auth.uid() = user_id);

create policy "Les utilisateurs modifient leurs propres mangas"
  on public.manga_list
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Les utilisateurs suppriment leurs propres mangas"
  on public.manga_list
  for delete
  using (auth.uid() = user_id);
