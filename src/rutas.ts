import type { Rol } from './types';

/** Pantalla de inicio de cada rol. */
export const inicioPorRol: Record<Rol, string> = {
  admin: '/admin',
  docente: '/docente',
  tutor: '/tutor',
  alumno: '/alumno',
};

export const nombreRol: Record<Rol, string> = {
  admin: 'Administración',
  docente: 'Docente',
  tutor: 'Tutor/a',
  alumno: 'Alumno/a',
};
