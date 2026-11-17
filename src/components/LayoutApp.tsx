import Container from '@mui/material/Container';
import { Outlet } from 'react-router-dom';
import { Encabezado } from './Encabezado';

/** Layout de las pantallas con sesión: encabezado + contenido centrado (pensado para ~380px). */
export function LayoutApp() {
  return (
    <>
      <Encabezado />
      <Container component="main" maxWidth="sm" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </>
  );
}
