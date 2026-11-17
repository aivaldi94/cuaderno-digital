import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LayoutApp } from './components/LayoutApp';
import { RutaProtegida } from './components/RutaProtegida';
import { InicioAdmin } from './pages/admin/InicioAdmin';
import { InicioAlumno } from './pages/alumno/InicioAlumno';
import { InicioDocente } from './pages/docente/InicioDocente';
import { EntrarComo } from './pages/login/EntrarComo';
import { DetalleNotaTutor } from './pages/tutor/DetalleNotaTutor';
import { InicioTutor } from './pages/tutor/InicioTutor';

export const router = createBrowserRouter([
  { path: '/', element: <EntrarComo /> },
  {
    element: <LayoutApp />,
    children: [
      { path: '/admin', element: <RutaProtegida rol="admin"><InicioAdmin /></RutaProtegida> },
      { path: '/docente', element: <RutaProtegida rol="docente"><InicioDocente /></RutaProtegida> },
      { path: '/tutor', element: <RutaProtegida rol="tutor"><InicioTutor /></RutaProtegida> },
      { path: '/tutor/nota/:recepcionId', element: <RutaProtegida rol="tutor"><DetalleNotaTutor /></RutaProtegida> },
      { path: '/alumno', element: <RutaProtegida rol="alumno"><InicioAlumno /></RutaProtegida> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
