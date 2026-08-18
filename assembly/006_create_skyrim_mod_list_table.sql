-- Création de la table skyrim_mod_list, qui stocke les mods installés pour un modpack
-- Skyrim donné (page de détail à venir sur /skyrim). Reprend la structure de
-- pokemon_captures (liée à skyrim_modpack de la même façon que pokemon_captures
-- l'est à pokemon_games), avec les colonnes suivantes.

create table if not exists public.skyrim_mod_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  skyrim_modpack_id uuid not null references public.skyrim_modpack (id) on delete cascade,
  mod_name varchar(100) not null,
  version varchar(50),
  category varchar(50),
  deploy_order integer not null,
  created_at timestamptz not null default now()
);

create index if not exists skyrim_mod_list_user_id_idx on public.skyrim_mod_list (user_id);
create index if not exists skyrim_mod_list_modpack_id_idx on public.skyrim_mod_list (skyrim_modpack_id);

-- Row Level Security : chaque utilisateur ne voit et ne modifie que ses propres mods.
alter table public.skyrim_mod_list enable row level security;

create policy "Les utilisateurs voient leurs propres mods"
  on public.skyrim_mod_list
  for select
  using (auth.uid() = user_id);

create policy "Les utilisateurs ajoutent leurs propres mods"
  on public.skyrim_mod_list
  for insert
  with check (auth.uid() = user_id);

create policy "Les utilisateurs modifient leurs propres mods"
  on public.skyrim_mod_list
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Les utilisateurs suppriment leurs propres mods"
  on public.skyrim_mod_list
  for delete
  using (auth.uid() = user_id);
