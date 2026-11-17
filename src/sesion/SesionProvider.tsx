import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as sesion from '../services/sesion';
import type { Usuario } from '../types';
import { SesionContext, type ValorSesion } from './contexto';

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    sesion.usuarioActual().then((u) => {
      setUsuario(u);
      setCargando(false);
    });
  }, []);

  const entrar = useCallback(async (usuarioId: string) => {
    const u = await sesion.entrarComo(usuarioId);
    setUsuario(u);
    return u;
  }, []);

  const salir = useCallback(async () => {
    await sesion.salir();
    setUsuario(null);
  }, []);

  const valor = useMemo<ValorSesion>(() => ({ usuario, cargando, entrar, salir }), [usuario, cargando, entrar, salir]);

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}
