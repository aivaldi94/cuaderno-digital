import { createContext, useContext } from 'react';
import type { Usuario } from '../types';

export interface ValorSesion {
  usuario: Usuario | null;
  cargando: boolean;
  entrar: (usuarioId: string) => Promise<Usuario>;
  salir: () => Promise<void>;
}

export const SesionContext = createContext<ValorSesion | null>(null);

export function useSesion(): ValorSesion {
  const valor = useContext(SesionContext);
  if (!valor) throw new Error('useSesion tiene que usarse dentro de <SesionProvider>.');
  return valor;
}

/** El usuario logueado, para páginas que están dentro de <RutaProtegida> (ahí nunca es null). */
export function useUsuarioActual(): Usuario {
  const { usuario } = useSesion();
  if (!usuario) throw new Error('useUsuarioActual se usa solo dentro de <RutaProtegida>.');
  return usuario;
}
