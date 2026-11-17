// Notas, recepciones, lectura y firma.
//
// Acá viven las reglas de permisos (quién ve qué, quién puede firmar). En producción
// las mismas reglas se repiten en la base con Row Level Security, pero la UI nunca
// filtra por su cuenta: confía en lo que devuelven estas funciones.

import type { BaseDeDatos, Destino, Nota, NotaEnviada, NotaRecibida, Recepcion, ResumenHijo, Usuario } from '../types';
import { crearEmail, enlaceApp } from './emails';
import {
  alumnosDelCursoEn,
  buscarUsuario,
  cursoDelAlumnoEn,
  cursosHabilitadosEn,
  esTutorDe,
  nombreCompleto,
  tutoresDelAlumnoEn,
} from './personas';
import { generarId, leerDB, modificarDB } from './storage';

export interface NuevaNota {
  cursoId: string;
  destino: Destino;
  asunto: string;
  cuerpo: string;
  requiereFirma: boolean;
}

const PIN_VALIDO = /^\d{4,6}$/;

// --- Enviar ---

/**
 * Envía una nota. Crea una Recepción por cada alumno destinatario, tomando los alumnos
 * inscriptos en el curso EN ESTE MOMENTO (uno que se sume después no la ve), y genera
 * el email de aviso para cada alumno y sus tutores.
 */
export async function enviarNota(remitenteId: string, datos: NuevaNota): Promise<Nota> {
  return modificarDB((db) => {
    const remitente = buscarUsuario(db, remitenteId);
    if (!remitente || (remitente.rol !== 'docente' && remitente.rol !== 'admin')) {
      throw new Error('Solo docentes y administración pueden enviar notas.');
    }
    const curso = cursosHabilitadosEn(db, remitenteId).find((c) => c.id === datos.cursoId);
    if (!curso) throw new Error('No podés enviar notas a ese curso.');

    const asunto = datos.asunto.trim();
    const cuerpo = datos.cuerpo.trim();
    if (!asunto) throw new Error('Falta el asunto.');
    if (!cuerpo) throw new Error('Falta el texto de la nota.');

    const alumnosDelCurso = alumnosDelCursoEn(db, curso.id);
    let destinatarios: Usuario[];
    let destino: Destino;
    if (datos.destino.tipo === 'curso') {
      destinatarios = alumnosDelCurso;
      destino = { tipo: 'curso' };
    } else {
      const elegidos = new Set(datos.destino.alumnoIds);
      destinatarios = alumnosDelCurso.filter((a) => elegidos.has(a.id));
      if (destinatarios.length !== elegidos.size) {
        throw new Error('Hay alumnos elegidos que no están en ese curso.');
      }
      destino = { tipo: 'alumnos', alumnoIds: destinatarios.map((a) => a.id) };
    }
    if (destinatarios.length === 0) throw new Error('La nota no tiene destinatarios.');

    const nota: Nota = {
      id: generarId('not'),
      remitenteId,
      cursoId: curso.id,
      destino,
      asunto,
      cuerpo,
      requiereFirma: datos.requiereFirma,
      fechaEnvio: new Date().toISOString(),
    };
    db.notas.push(nota);

    const yaAvisados = new Set<string>(); // un tutor con dos hijos en el curso recibe un solo email
    for (const alumno of destinatarios) {
      const recepcion: Recepcion = {
        id: generarId('rec'),
        notaId: nota.id,
        alumnoId: alumno.id,
        lecturasTutores: {},
      };
      db.recepciones.push(recepcion);

      const asuntoEmail = `Nueva nota de ${nombreCompleto(remitente)}: ${asunto}`;
      db.emails.push(
        crearEmail(
          alumno.email,
          'nueva-nota',
          asuntoEmail,
          `Tenés una nota nueva en el cuaderno de comunicaciones.\n\nLeela acá: ${enlaceApp(`/alumno/nota/${recepcion.id}`)}`,
        ),
      );
      for (const tutor of tutoresDelAlumnoEn(db, alumno.id)) {
        if (yaAvisados.has(tutor.id)) continue;
        yaAvisados.add(tutor.id);
        const pideFirma = nota.requiereFirma ? ' y necesita tu firma' : '';
        db.emails.push(
          crearEmail(
            tutor.email,
            'nueva-nota',
            asuntoEmail,
            `Hay una nota nueva para ${alumno.nombre}${pideFirma}.\n\nLeela acá: ${enlaceApp(`/tutor/nota/${recepcion.id}`)}`,
          ),
        );
      }
    }
    return nota;
  });
}

// --- Leer (tutor y alumno) ---

function armarRecibidas(db: BaseDeDatos, alumnoId: string): NotaRecibida[] {
  const alumno = buscarUsuario(db, alumnoId);
  if (!alumno) return [];
  return db.recepciones
    .filter((r) => r.alumnoId === alumnoId)
    .flatMap((recepcion) => {
      const nota = db.notas.find((n) => n.id === recepcion.notaId);
      const remitente = nota && buscarUsuario(db, nota.remitenteId);
      const curso = nota && db.cursos.find((c) => c.id === nota.cursoId);
      if (!nota || !remitente || !curso) return [];
      const firmante = recepcion.firma && buscarUsuario(db, recepcion.firma.tutorId);
      return [{ nota, recepcion, remitente, curso, alumno, firmante }];
    })
    .sort((a, b) => b.nota.fechaEnvio.localeCompare(a.nota.fechaEnvio));
}

export function estaPendienteDeFirma({ nota, recepcion }: Pick<NotaRecibida, 'nota' | 'recepcion'>): boolean {
  return nota.requiereFirma && !recepcion.firma;
}

/** Los hijos del tutor con su curso y cuántas notas les falta firmar, para el selector. */
export async function resumenHijos(tutorId: string): Promise<ResumenHijo[]> {
  const db = leerDB();
  return db.tutoresAlumnos
    .filter((r) => r.tutorId === tutorId)
    .flatMap((r) => {
      const hijo = buscarUsuario(db, r.alumnoId);
      if (!hijo) return [];
      const pendientesDeFirma = armarRecibidas(db, hijo.id).filter(estaPendienteDeFirma).length;
      return [{ hijo, curso: cursoDelAlumnoEn(db, hijo.id), pendientesDeFirma }];
    })
    .sort((a, b) => a.hijo.nombre.localeCompare(b.hijo.nombre));
}

/** Notas de un hijo, vistas por un tutor. Si no es su hijo, no devuelve nada. */
export async function notasDelTutor(tutorId: string, alumnoId: string): Promise<NotaRecibida[]> {
  const db = leerDB();
  if (!esTutorDe(db, tutorId, alumnoId)) return [];
  return armarRecibidas(db, alumnoId);
}

/** Notas que recibió un alumno (dirigidas a él o a su curso). */
export async function notasDelAlumno(alumnoId: string): Promise<NotaRecibida[]> {
  const db = leerDB();
  if (buscarUsuario(db, alumnoId)?.rol !== 'alumno') return [];
  return armarRecibidas(db, alumnoId);
}

/** Detalle de una recepción, si el usuario (el alumno o uno de sus tutores) puede verla. */
export async function notaRecibida(recepcionId: string, usuarioId: string): Promise<NotaRecibida | undefined> {
  const db = leerDB();
  const recepcion = db.recepciones.find((r) => r.id === recepcionId);
  if (!recepcion || !puedeVerRecepcion(db, recepcion, usuarioId)) return undefined;
  return armarRecibidas(db, recepcion.alumnoId).find((r) => r.recepcion.id === recepcionId);
}

function puedeVerRecepcion(db: BaseDeDatos, recepcion: Recepcion, usuarioId: string): boolean {
  return recepcion.alumnoId === usuarioId || esTutorDe(db, usuarioId, recepcion.alumnoId);
}

/** Registra que el alumno o un tutor abrió la nota. Solo guarda la primera lectura. */
export async function marcarLeida(recepcionId: string, usuarioId: string): Promise<void> {
  modificarDB((db) => {
    const recepcion = db.recepciones.find((r) => r.id === recepcionId);
    if (!recepcion) return;
    const ahora = new Date().toISOString();
    if (recepcion.alumnoId === usuarioId) {
      recepcion.leidaPorAlumno ??= ahora;
    } else if (esTutorDe(db, usuarioId, recepcion.alumnoId)) {
      recepcion.lecturasTutores[usuarioId] ??= ahora;
    }
  });
}

// --- Firmar ---

/**
 * Firma "Me notifiqué". Valida que sea tutor del alumno, que la nota pida firma, que no
 * esté firmada y que el PIN sea correcto. Avisa por email a TODOS los tutores del alumno.
 *
 * En el prototipo el PIN se valida en el navegador (no es seguro). En producción se valida
 * en el servidor y además se guarda la IP en el registro de auditoría.
 */
export async function firmar(recepcionId: string, tutorId: string, pin: string): Promise<Recepcion> {
  return modificarDB((db) => {
    const recepcion = db.recepciones.find((r) => r.id === recepcionId);
    const nota = recepcion && db.notas.find((n) => n.id === recepcion.notaId);
    const tutor = buscarUsuario(db, tutorId);
    const alumno = recepcion && buscarUsuario(db, recepcion.alumnoId);
    if (!recepcion || !nota || !alumno) throw new Error('No encontramos la nota.');
    if (tutor?.rol !== 'tutor' || !esTutorDe(db, tutorId, recepcion.alumnoId)) {
      throw new Error('Solo un tutor del alumno puede firmar.');
    }
    if (!nota.requiereFirma) throw new Error('Esta nota no necesita firma.');
    if (recepcion.firma) throw new Error('Esta nota ya está firmada.');
    if (!PIN_VALIDO.test(pin) || pin !== tutor.pinFirma) throw new Error('El PIN no es correcto.');

    const ahora = new Date().toISOString();
    recepcion.lecturasTutores[tutorId] ??= ahora;
    recepcion.firma = { tutorId, fecha: ahora, dispositivo: navigator.userAgent };

    const cuando = new Date(ahora).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
    for (const t of tutoresDelAlumnoEn(db, alumno.id)) {
      db.emails.push(
        crearEmail(
          t.email,
          'aviso-firma',
          `${t.id === tutorId ? 'Firmaste' : `${tutor.nombre} firmó`}: ${nota.asunto}`,
          `${nombreCompleto(tutor)} firmó "Me notifiqué" en la nota "${nota.asunto}" de ${alumno.nombre} el ${cuando}.\n\nSi no fuiste vos o no lo reconocés, avisá a la escuela.\n\nVer la nota: ${enlaceApp(`/tutor/nota/${recepcion.id}`)}`,
        ),
      );
    }
    return recepcion;
  });
}

// --- Seguimiento (docente y admin) ---

function armarEnviada(db: BaseDeDatos, nota: Nota): NotaEnviada | undefined {
  const curso = db.cursos.find((c) => c.id === nota.cursoId);
  const remitente = buscarUsuario(db, nota.remitenteId);
  if (!curso || !remitente) return undefined;
  return { nota, curso, remitente, recepciones: db.recepciones.filter((r) => r.notaId === nota.id) };
}

function puedeVerEstado(db: BaseDeDatos, nota: Nota, usuarioId: string): boolean {
  const usuario = buscarUsuario(db, usuarioId);
  return usuario?.rol === 'admin' || (usuario?.rol === 'docente' && nota.remitenteId === usuarioId);
}

/** Notas con su estado: el docente ve las suyas; el admin, todas. */
export async function notasEnviadas(usuarioId: string): Promise<NotaEnviada[]> {
  const db = leerDB();
  return db.notas
    .filter((n) => puedeVerEstado(db, n, usuarioId))
    .sort((a, b) => b.fechaEnvio.localeCompare(a.fechaEnvio))
    .flatMap((n) => armarEnviada(db, n) ?? []);
}

export async function detalleNotaEnviada(notaId: string, usuarioId: string): Promise<NotaEnviada | undefined> {
  const db = leerDB();
  const nota = db.notas.find((n) => n.id === notaId);
  if (!nota || !puedeVerEstado(db, nota, usuarioId)) return undefined;
  return armarEnviada(db, nota);
}
