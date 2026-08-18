-- Création de la table pokemon_captures, qui stocke les Pokémon capturés par zone
-- pour un jeu Pokémon donné (page de détail /pokemon/:id).

create table if not exists public.pokemon_captures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pokemon_game_id uuid not null references public.pokemon_games (id) on delete cascade,
  zone varchar(100) not null,
  captured_pokemon varchar(50) not null,
  status text not null check (status in ('Vivant', 'Mort')),
  created_at timestamptz not null default now()
);

create index if not exists pokemon_captures_user_id_idx on public.pokemon_captures (user_id);
create index if not exists pokemon_captures_pokemon_game_id_idx on public.pokemon_captures (pokemon_game_id);

-- Row Level Security : chaque utilisateur ne voit et ne modifie que ses propres captures.
alter table public.pokemon_captures enable row level security;

create policy "Les utilisateurs voient leurs propres captures"
  on public.pokemon_captures
  for select
  using (auth.uid() = user_id);

create policy "Les utilisateurs ajoutent leurs propres captures"
  on public.pokemon_captures
  for insert
  with check (auth.uid() = user_id);

create policy "Les utilisateurs modifient leurs propres captures"
  on public.pokemon_captures
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Les utilisateurs suppriment leurs propres captures"
  on public.pokemon_captures
  for delete
  using (auth.uid() = user_id);
