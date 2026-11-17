import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { RouterProvider } from 'react-router-dom';
import { escuelaConfig } from './config/escuela.config';
import { router } from './router';
import { SesionProvider } from './sesion/SesionProvider';
import { crearTheme } from './theme';

const theme = crearTheme(escuelaConfig);
document.title = `Cuaderno de comunicaciones · ${escuelaConfig.nombre}`;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SesionProvider>
        <RouterProvider router={router} />
      </SesionProvider>
    </ThemeProvider>
  </StrictMode>,
);
