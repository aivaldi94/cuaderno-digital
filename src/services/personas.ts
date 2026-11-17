// Usuarios, cursos y sus asociaciones.

import type { BaseDeDatos, Curso, Rol, Usuario } from '../types';
import { leerDB } from './storage';

// --- Helpers internos (sincrónicos, sobre una db ya leída). Los usan también otros servicios. ---

export function buscarUsuario(db: BaseDeDatos, id: string): Usuario | undefined {
  return db.usuarios.find((u) => u.id === id);
}

export function alumnosDelCursoEn(db: BaseDeDatos, cursoId: string): Usuario[] {
  const ids = db.inscripciones.filter((i) => i.cursoId === cursoId).map((i) => i.alumnoId);
  return ordenarPorApellido(db.usuarios.filter((u) => ids.includes(u.id)));
}

export function tutoresDelAlumnoEn(db: BaseDeDatos, alumnoId: string): Usuario[] {
  const ids = db.tutoresAlumnos.filter((r) => r.alumnoId === alumnoId).map((r) => r.tutorId);
  return ordenarPorApellido(db.usuarios.filter((u) => ids.includes(u.id)));
}

export function esTutorDe(db: BaseDeDatos, tutorId: string, alumnoId: string): boolean {
  return db.tutoresAlumnos.some((r) => r.tutorId === tutorId && r.alumnoId === alumnoId);
}

/** Cursos a los que el usuario puede enviar notas: admin a todos, docente a los suyos. */
export function cursosHabilitadosEn(db: BaseDeDatos, usuarioId: string): Curso[] {
  const usuario = buscarUsuario(db, usuarioId);
  if (usuario?.rol === 'admin') return ordenarCursos(db.cursos);
  if (usuario?.rol === 'docente') {
    const ids = db.docentesCursos.filter((r) => r.docenteId === usuarioId).map((r) => r.cursoId);
    return ordenarCursos(db.cursos.filter((c) => ids.includes(c.id)));
  }
  return [];
}

/** El curso actual del alumno (un curso por año: nos quedamos con el más reciente). */
export function cursoDelAlumnoEn(db: BaseDeDatos, alumnoId: string): Curso | undefined {
  const ids = db.inscripciones.filter((i) => i.alumnoId === alumnoId).map((i) => i.cursoId);
  return db.cursos.filter((c) => ids.includes(c.id)).sort((a, b) => b.anio - a.anio)[0];
}

export function nombreCompleto(u: Pick<Usuario, 'nombre' | 'apellido'>): string {
  return `${u.nombre} ${u.apellido}`;
}

function ordenarPorApellido(usuarios: Usuario[]): Usuario[] {
  return [...usuarios].sort((a, b) => a.apellido.localeCompare(b.apellido) || a.nombre.localeCompare(b.nombre));
}

function ordenarCursos(cursos: Curso[]): Curso[] {
  return [...cursos].sort((a, b) => b.anio - a.anio || a.nombre.localeCompare(b.nombre));
}

// --- API pública (async) ---

export async function obtenerUsuario(id: string): Promise<Usuario | undefined> {
  return buscarUsuario(leerDB(), id);
}

export async function listarCursos(): Promise<Curso[]> {
  return ordenarCursos(leerDB().cursos);
}

export async function alumnosDelCurso(cursoId: string): Promise<Usuario[]> {
  return alumnosDelCursoEn(leerDB(), cursoId);
}

export async function hijosDelTutor(tutorId: string): Promise<Usuario[]> {
  const db = leerDB();
  const ids = db.tutoresAlumnos.filter((r) => r.tutorId === tutorId).map((r) => r.alumnoId);
  return ordenarPorApellido(db.usuarios.filter((u) => ids.includes(u.id)));
}

export async function tutoresDelAlumno(alumnoId: string): Promise<Usuario[]> {
  return tutoresDelAlumnoEn(leerDB(), alumnoId);
}

export async function cursoDelAlumno(alumnoId: string): Promise<Curso | undefined> {
  return cursoDelAlumnoEn(leerDB(), alumnoId);
}

export async function cursosDelDocente(docenteId: string): Promise<Curso[]> {
  return cursosHabilitadosEn(leerDB(), docenteId);
}

/** Cursos a los que el usuario puede enviar notas (admin: todos; docente: los suyos). */
export async function cursosParaEnviar(usuarioId: string): Promise<Curso[]> {
  return cursosHabilitadosEn(leerDB(), usuarioId);
}

export interface UsuarioConDetalle {
  usuario: Usuario;
  detalle: string; // ej. "3° A", "Tutor/a de Tomás y Sofía"
}

/** Usuarios agrupados por rol con una línea descriptiva, para la pantalla "Entrar como…". */
export async function usuariosParaEntrar(): Promise<Record<Rol, UsuarioConDetalle[]>> {
  const db = leerDB();
  const grupos: Record<Rol, UsuarioConDetalle[]> = { admin: [], docente: [], tutor: [], alumno: [] };

  for (const usuario of ordenarPorApellido(db.usuarios)) {
    let detalle = '';
    switch (usuario.rol) {
      case 'admin':
        detalle = 'Administración de la escuela';
        break;
      case 'docente':
        detalle = cursosHabilitadosEn(db, usuario.id).map((c) => c.nombre).join(' · ');
        break;
      case 'tutor': {
        const hijos = db.tutoresAlumnos
          .filter((r) => r.tutorId === usuario.id)
          .map((r) => buscarUsuario(db, r.alumnoId)?.nombre)
          .filter(Boolean);
        detalle = `Tutor/a de ${new Intl.ListFormat('es', { type: 'conjunction' }).format(hijos as string[])}`;
        break;
      }
      case 'alumno':
        detalle = cursoDelAlumnoEn(db, usuario.id)?.nombre ?? 'Sin curso';
        break;
    }
    grupos[usuario.rol].push({ usuario, detalle });
  }
  return grupos;
}
