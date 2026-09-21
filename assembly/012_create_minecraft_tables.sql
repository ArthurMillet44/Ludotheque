-- Création des tables pour le suivi Minecraft random (craft et loots
-- randomisés) : minecraft_game_list stocke les parties suivies par chaque
-- utilisateur, minecraft_history_list stocke l'historique des
-- correspondances "objet obtenu" pour une partie donnée.

create table if not exists public.minecraft_game_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists minecraft_game_list_user_id_idx on public.minecraft_game_list (user_id);

alter table public.minecraft_game_list enable row level security;

create policy "Les utilisateurs voient leurs propres parties Minecraft"
  on public.minecraft_game_list
  for select
  using (auth.uid() = user_id);

create policy "Les utilisateurs ajoutent leurs propres parties Minecraft"
  on public.minecraft_game_list
  for insert
  with check (auth.uid() = user_id);

create policy "Les utilisateurs modifient leurs propres parties Minecraft"
  on public.minecraft_game_list
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Les utilisateurs suppriment leurs propres parties Minecraft"
  on public.minecraft_game_list
  for delete
  using (auth.uid() = user_id);

-- minecraft_history_list : une entrée correspond à l'une de ces trois
-- situations :
--   - bloc_casse       : casser un des input_items (un ou plusieurs blocs,
--                        pouvant normalement donner le même résultat) donne
--                        un ou plusieurs output_items
--   - craft             : fabriquer la recette de l'unique input_items[0]
--                        donne l'unique output_items[0]
--   - pierre_a_tailler  : utiliser l'unique input_items[0] dans la pierre à
--                        tailler donne l'unique output_items[0]
--
-- input_items et output_items sont les identifiants texte des items
-- Minecraft (ex. "cobblestone", "diamond_sword"), tels que définis dans
-- src/data/minecraftItems.json côté frontend. Pas de clé étrangère vers une
-- table d'items côté base : la liste de référence est statique et
-- versionnée avec le code, pas stockée en base. Plusieurs items ne sont
-- possibles (en entrée comme en sortie) que pour bloc_casse, les contraintes
-- ci-dessous l'imposent pour craft et pierre_a_tailler.
--
-- parent_entry_id rattache une entrée à une entrée parente (sous-entrée),
-- transformant l'historique d'une partie en arbre plutôt qu'une simple
-- liste chronologique : une sous-entrée représente une nouvelle action
-- réalisée à partir d'un item obtenu par son entrée parente, ce qui permet
-- de représenter plusieurs branches possibles à partir d'un même item. Nul
-- pour les entrées de premier niveau (racines de l'arbre).
--
-- recipe_hint lève l'ambiguïté quand un même item d'entrée correspond à
-- plusieurs recettes vanilla différentes (le randomiseur scramble chaque
-- recette individuellement, pas chaque item résultat) : l'ingrédient réel
-- utilisé pour craft (ex. "allium" plutôt que "lilac" pour obtenir
-- Magenta Dye), ou l'item normalement obtenu pour pierre_a_tailler (ex.
-- "stone_stairs" plutôt qu'un autre résultat normalement possible avec
-- Stone). Sans effet pour bloc_casse.
--
-- category classe une chaîne entière (Armure, Outil, Potion, Nourriture,
-- Bloc, Autre), réservée côté frontend aux entrées de premier niveau (une
-- sous-entrée n'a pas de catégorie propre, elle appartient à celle de sa
-- chaîne) : pas de contrainte imposant ça ici pour rester simple, le
-- frontend n'affiche simplement pas ce champ pour les sous-entrées.

create table if not exists public.minecraft_history_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  minecraft_game_id uuid not null references public.minecraft_game_list (id) on delete cascade,
  parent_entry_id uuid references public.minecraft_history_list (id) on delete cascade,
  type text not null check (type in ('bloc_casse', 'craft', 'pierre_a_tailler')),
  recipe_hint text,
  category text check (category is null or category in ('armure', 'outil', 'potion', 'nourriture', 'bloc', 'autre')),
  input_items text[] not null,
  output_items text[] not null,
  created_at timestamptz not null default now(),
  constraint minecraft_history_list_input_items_not_empty check (array_length(input_items, 1) > 0),
  constraint minecraft_history_list_output_items_not_empty check (array_length(output_items, 1) > 0),
  constraint minecraft_history_list_single_input_unless_bloc_casse
    check (type = 'bloc_casse' or array_length(input_items, 1) = 1),
  constraint minecraft_history_list_single_output_unless_bloc_casse
    check (type = 'bloc_casse' or array_length(output_items, 1) = 1)
);

create index if not exists minecraft_history_list_user_id_idx on public.minecraft_history_list (user_id);
create index if not exists minecraft_history_list_game_id_idx on public.minecraft_history_list (minecraft_game_id);
create index if not exists minecraft_history_list_parent_entry_id_idx
  on public.minecraft_history_list (parent_entry_id);

alter table public.minecraft_history_list enable row level security;

create policy "Les utilisateurs voient leur propre historique Minecraft"
  on public.minecraft_history_list
  for select
  using (auth.uid() = user_id);

create policy "Les utilisateurs ajoutent leur propre historique Minecraft"
  on public.minecraft_history_list
  for insert
  with check (auth.uid() = user_id);

create policy "Les utilisateurs modifient leur propre historique Minecraft"
  on public.minecraft_history_list
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Les utilisateurs suppriment leur propre historique Minecraft"
  on public.minecraft_history_list
  for delete
  using (auth.uid() = user_id);
