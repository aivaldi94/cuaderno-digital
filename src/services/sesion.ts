// Sesión simulada: "Entrar como…" guarda el id del usuario elegido, sin contraseña.
// En producción esto lo reemplaza Supabase Auth (email + contraseña, invitación).

import type { Usuario } from '../types';
import { buscarUsuario } from './personas';
import { leerDB } from './storage';

const CLAVE_SESION = 'cuaderno-sesion-v1';

export async function entrarComo(usuarioId: string): Promise<Usuario> {
  const usuario = buscarUsuario(leerDB(), usuarioId);
  if (!usuario) throw new Error('Ese usuario no existe.');
  localStorage.setItem(CLAVE_SESION, usuario.id);
  return usuario;
}

/** El usuario con sesión abierta, o null. Si el usuario ya no existe (ej. tras un reset), cierra la sesión. */
export async function usuarioActual(): Promise<Usuario | null> {
  const id = localStorage.getItem(CLAVE_SESION);
  if (!id) return null;
  const usuario = buscarUsuario(leerDB(), id);
  if (!usuario) localStorage.removeItem(CLAVE_SESION);
  return usuario ?? null;
}

export async function salir(): Promise<void> {
  localStorage.removeItem(CLAVE_SESION);
}
