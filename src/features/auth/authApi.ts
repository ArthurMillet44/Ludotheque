import { supabase } from '../../lib/supabaseClient'

export interface AuthResult {
  error: string | null
}

/**
 * Crée un nouveau compte utilisateur via Supabase Auth à partir d'un
 * email et d'un mot de passe.
 * @param email adresse email du nouvel utilisateur
 * @param password mot de passe choisi par l'utilisateur
 * @returns un objet contenant le message d'erreur renvoyé par Supabase, ou null si l'inscription a réussi
 */
export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signUp({ email, password })

  return { error: error ? error.message : null }
}

/**
 * Connecte un utilisateur existant via Supabase Auth à partir d'un
 * email et d'un mot de passe.
 * @param email adresse email de l'utilisateur
 * @param password mot de passe de l'utilisateur
 * @returns un objet contenant le message d'erreur renvoyé par Supabase, ou null si la connexion a réussi
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  return { error: error ? error.message : null }
}

/**
 * Déconnecte l'utilisateur actuellement authentifié auprès de Supabase Auth.
 * @returns un objet contenant le message d'erreur renvoyé par Supabase, ou null si la déconnexion a réussi
 */
export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut()

  return { error: error ? error.message : null }
}
