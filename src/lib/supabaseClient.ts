import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Les variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être renseignées dans le fichier .env.',
  )
}

/**
 * Client Supabase partagé par toute l'application, initialisé à partir
 * des variables d'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
