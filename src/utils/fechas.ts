const hora = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' });
const diaCorto = new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
const diaLargo = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

function mismoDia(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

/** Para listas: "Hoy, 09:30", "Ayer, 18:10" o "jue, 12 nov". */
export function fechaCorta(iso: string): string {
  const fecha = new Date(iso);
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);
  if (mismoDia(fecha, hoy)) return `Hoy, ${hora.format(fecha)}`;
  if (mismoDia(fecha, ayer)) return `Ayer, ${hora.format(fecha)}`;
  return diaCorto.format(fecha);
}

/** Para el detalle: "jueves, 12 de noviembre, 09:30". */
export function fechaCompleta(iso: string): string {
  const fecha = new Date(iso);
  return `${diaLargo.format(fecha)}, ${hora.format(fecha)}`;
}
