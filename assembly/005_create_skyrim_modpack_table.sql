-- Création de la table skyrim_modpack, qui stocke les modpacks Skyrim suivis par chaque
-- utilisateur. Reprend la structure minimale de pokemon_games (juste un nom pour l'instant),
-- à enrichir au fur et à mesure des besoins de la page Skyrim.

create table if not exists public.skyrim_modpack (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists skyrim_modpack_user_id_idx on public.skyrim_modpack (user_id);

-- Row Level Security : chaque utilisateur ne voit et ne modifie que ses propres modpacks.
alter table public.skyrim_modpack enable row level security;

create policy "Les utilisateurs voient leurs propres modpacks"
  on public.skyrim_modpack
  for select
  using (auth.uid() = user_id);

create policy "Les utilisateurs ajoutent leurs propres modpacks"
  on public.skyrim_modpack
  for insert
  with check (auth.uid() = user_id);

create policy "Les utilisateurs modifient leurs propres modpacks"
  on public.skyrim_modpack
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Les utilisateurs suppriment leurs propres modpacks"
  on public.skyrim_modpack
  for delete
  using (auth.uid() = user_id);
