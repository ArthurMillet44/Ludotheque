-- Création de la table pokemon_games, qui stocke les jeux Pokémon suivis par chaque utilisateur.
-- Table volontairement minimale pour l'instant (juste le nom du jeu) : elle sera enrichie
-- au fur et à mesure des besoins de la page Pokémon.

create table if not exists public.pokemon_games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists pokemon_games_user_id_idx on public.pokemon_games (user_id);

-- Row Level Security : chaque utilisateur ne voit et ne modifie que ses propres jeux.
alter table public.pokemon_games enable row level security;

create policy "Les utilisateurs voient leurs propres jeux Pokémon"
  on public.pokemon_games
  for select
  using (auth.uid() = user_id);

create policy "Les utilisateurs ajoutent leurs propres jeux Pokémon"
  on public.pokemon_games
  for insert
  with check (auth.uid() = user_id);

create policy "Les utilisateurs modifient leurs propres jeux Pokémon"
  on public.pokemon_games
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Les utilisateurs suppriment leurs propres jeux Pokémon"
  on public.pokemon_games
  for delete
  using (auth.uid() = user_id);
