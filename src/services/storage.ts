// "Base de datos" del prototipo: un solo objeto JSON en localStorage.
//
// Por qué una sola clave: es lo más parecido a una base de datos (todo junto, se lee y
// se guarda de una vez) y hace trivial el botón de reset. Al migrar a Supabase, cada
// array de BaseDeDatos pasa a ser una tabla y este archivo desaparece; los demás
// servicios cambian sus lecturas/escrituras por consultas, sin cambiar sus firmas.
//
// Solo lo usan otros servicios. Componentes y páginas nunca lo importan.

import { crearSeed } from '../data/seed';
import type { BaseDeDatos } from '../types';

const CLAVE_DB = 'cuaderno-db-v1';

export function leerDB(): BaseDeDatos {
  const guardado = localStorage.getItem(CLAVE_DB);
  if (guardado) {
    try {
      return JSON.parse(guardado) as BaseDeDatos;
    } catch {
      // Si se corrompió, volvemos a los datos de ejemplo.
    }
  }
  const db = crearSeed();
  guardarDB(db);
  return db;
}

export function guardarDB(db: BaseDeDatos): void {
  localStorage.setItem(CLAVE_DB, JSON.stringify(db));
}

/** Lee la base, aplica un cambio y la guarda. Simula una transacción. */
export function modificarDB<T>(cambio: (db: BaseDeDatos) => T): T {
  const db = leerDB();
  const resultado = cambio(db);
  guardarDB(db);
  return resultado;
}

export function generarId(prefijo: string): string {
  return `${prefijo}_${crypto.randomUUID().slice(0, 8)}`;
}

/** Borra todo lo que se hizo en la demo y vuelve a los datos de ejemplo. */
export async function resetearDatos(): Promise<void> {
  guardarDB(crearSeed());
}
