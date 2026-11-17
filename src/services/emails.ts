// Emails simulados: en vez de mandarlos, quedan guardados para mostrarlos en el panel
// "Emails enviados". Al pasar a producción, crearEmail se reemplaza por un envío con Resend.

import type { EmailSimulado, TipoEmail } from '../types';
import { generarId, leerDB } from './storage';

export function crearEmail(para: string, tipo: TipoEmail, asunto: string, cuerpo: string): EmailSimulado {
  return { id: generarId('eml'), para, tipo, asunto, cuerpo, fecha: new Date().toISOString() };
}

/** Enlace que iría en el email. En el prototipo apunta a la app actual. */
export function enlaceApp(ruta = '/'): string {
  return `${window.location.origin}${ruta}`;
}

/** Todos los emails simulados, del más nuevo al más viejo. */
export async function listarEmails(): Promise<EmailSimulado[]> {
  return [...leerDB().emails].sort((a, b) => b.fecha.localeCompare(a.fecha));
}
