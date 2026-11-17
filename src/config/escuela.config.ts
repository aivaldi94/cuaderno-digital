// Identidad de la escuela. Es lo único que cambia entre instalaciones:
// nadie lo edita desde la app (ni el admin).

export const escuelaConfig = {
  nombre: 'Edmondo De Amicis',
  subtitulo: 'Complejo Educativo Bicultural',
  logo: '/logo.png', // PNG apaisado con texto oscuro: usar sobre fondo claro
  colores: {
    principal: '#0B7A3B',
    secundario: '#CE2B37',
    texto: '#173826',
    fondo: '#F7F5F0',
  },
} as const;

export type EscuelaConfig = typeof escuelaConfig;
