import { createTheme } from '@mui/material/styles';
import type { EscuelaConfig } from '../config/escuela.config';

export function crearTheme(config: EscuelaConfig) {
  const { colores } = config;
  return createTheme({
    palette: {
      primary: { main: colores.principal },
      secondary: { main: colores.secundario },
      error: { main: colores.secundario },
      text: { primary: colores.texto },
      background: { default: colores.fondo, paper: '#FFFFFF' },
    },
    shape: { borderRadius: 12 },
    typography: {
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'inherit' },
        styleOverrides: { root: { backgroundColor: '#FFFFFF' } },
      },
      MuiCard: {
        defaultProps: { variant: 'outlined' },
      },
    },
  });
}
