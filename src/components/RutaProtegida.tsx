import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSesion } from '../sesion/contexto';
import type { Rol } from '../types';

/** Muestra el contenido solo si hay sesión y el rol coincide; si no, vuelve a "Entrar como…". */
export function RutaProtegida({ rol, children }: { rol: Rol; children: ReactNode }) {
  const { usuario, cargando } = useSesion();

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!usuario || usuario.rol !== rol) return <Navigate to="/" replace />;
  return children;
}
