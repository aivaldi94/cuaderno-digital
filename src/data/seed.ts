// Datos de ejemplo del prototipo. Solo los lee src/services/storage.ts.
//
// Casos que cubre:
// - Carolina Gómez es tutora de dos hijos en cursos distintos (Tomás en 3° A, Sofía en 4° B).
// - Lucía Martínez tiene dos tutores (Diego Martínez y Ana López).
// - Marcela Rossi da clases en los dos cursos; Pablo Ferrari solo en 4° B.

import type { BaseDeDatos, Nota, Recepcion, Usuario } from '../types';

const PIN_EJEMPLO = '1234';
const DISPOSITIVO_EJEMPLO = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile Safari';

const usuarios: Usuario[] = [
  { id: 'adm1', nombre: 'Laura', apellido: 'Benedetti', email: 'direccion@deamicis.edu.ar', rol: 'admin' },

  { id: 'doc1', nombre: 'Marcela', apellido: 'Rossi', email: 'mrossi@deamicis.edu.ar', rol: 'docente' },
  { id: 'doc2', nombre: 'Pablo', apellido: 'Ferrari', email: 'pferrari@deamicis.edu.ar', rol: 'docente' },

  { id: 'alu1', nombre: 'Tomás', apellido: 'Gómez', email: 'tomas.gomez@alumnos.deamicis.edu.ar', rol: 'alumno' },
  { id: 'alu2', nombre: 'Lucía', apellido: 'Martínez', email: 'lucia.martinez@alumnos.deamicis.edu.ar', rol: 'alumno' },
  { id: 'alu3', nombre: 'Mateo', apellido: 'Romano', email: 'mateo.romano@alumnos.deamicis.edu.ar', rol: 'alumno' },
  { id: 'alu4', nombre: 'Valentina', apellido: 'Sosa', email: 'valentina.sosa@alumnos.deamicis.edu.ar', rol: 'alumno' },
  { id: 'alu5', nombre: 'Sofía', apellido: 'Gómez', email: 'sofia.gomez@alumnos.deamicis.edu.ar', rol: 'alumno' },
  { id: 'alu6', nombre: 'Joaquín', apellido: 'Pereyra', email: 'joaquin.pereyra@alumnos.deamicis.edu.ar', rol: 'alumno' },
  { id: 'alu7', nombre: 'Martina', apellido: 'Colombo', email: 'martina.colombo@alumnos.deamicis.edu.ar', rol: 'alumno' },
  { id: 'alu8', nombre: 'Bruno', apellido: 'Díaz', email: 'bruno.diaz@alumnos.deamicis.edu.ar', rol: 'alumno' },

  { id: 'tut1', nombre: 'Carolina', apellido: 'Gómez', email: 'carolina.gomez@example.com', rol: 'tutor', pinFirma: PIN_EJEMPLO },
  { id: 'tut2', nombre: 'Diego', apellido: 'Martínez', email: 'diego.martinez@example.com', rol: 'tutor', pinFirma: PIN_EJEMPLO },
  { id: 'tut3', nombre: 'Ana', apellido: 'López', email: 'ana.lopez@example.com', rol: 'tutor', pinFirma: PIN_EJEMPLO },
  { id: 'tut4', nombre: 'Roberto', apellido: 'Romano', email: 'roberto.romano@example.com', rol: 'tutor', pinFirma: PIN_EJEMPLO },
  { id: 'tut5', nombre: 'Silvia', apellido: 'Sosa', email: 'silvia.sosa@example.com', rol: 'tutor', pinFirma: PIN_EJEMPLO },
  { id: 'tut6', nombre: 'Gabriela', apellido: 'Pereyra', email: 'gabriela.pereyra@example.com', rol: 'tutor', pinFirma: PIN_EJEMPLO },
  { id: 'tut7', nombre: 'Hernán', apellido: 'Colombo', email: 'hernan.colombo@example.com', rol: 'tutor', pinFirma: PIN_EJEMPLO },
  { id: 'tut8', nombre: 'Natalia', apellido: 'Díaz', email: 'natalia.diaz@example.com', rol: 'tutor', pinFirma: PIN_EJEMPLO },
];

const notas: Nota[] = [
  {
    id: 'not1',
    remitenteId: 'doc1',
    cursoId: 'cur1',
    destino: { tipo: 'curso' },
    asunto: 'Salida educativa al Museo de Bellas Artes',
    cuerpo:
      'El jueves 12/11 visitamos el Museo Nacional de Bellas Artes. Salimos de la escuela a las 8:30 y volvemos a las 12:30.\n\nTraer vianda y abrigo.',
    requiereFirma: true,
    fechaEnvio: '2026-11-04T13:15:00.000Z',
  },
  {
    id: 'not2',
    remitenteId: 'doc1',
    cursoId: 'cur2',
    destino: { tipo: 'curso' },
    asunto: 'Cambio de horario el viernes',
    cuerpo: 'Este viernes la salida es a las 11:40 por reunión de personal.',
    requiereFirma: true,
    fechaEnvio: '2026-11-06T11:00:00.000Z',
  },
  {
    id: 'not3',
    remitenteId: 'doc2',
    cursoId: 'cur2',
    destino: { tipo: 'alumnos', alumnoIds: ['alu5'] },
    asunto: 'Conducta en clase',
    cuerpo:
      'Hoy Sofía estuvo usando el celular durante la clase después de que se le pidiera guardarlo. Les pido que lo conversen en casa.',
    requiereFirma: true,
    fechaEnvio: '2026-11-10T16:30:00.000Z',
  },
  {
    id: 'not4',
    remitenteId: 'adm1',
    cursoId: 'cur2',
    destino: { tipo: 'curso' },
    asunto: 'Acto por el Día de la Soberanía Nacional',
    cuerpo: 'El viernes 20/11 no hay clases (feriado). El acto se hace el jueves 19/11 a las 10 en el patio.',
    requiereFirma: false,
    fechaEnvio: '2026-11-12T12:00:00.000Z',
  },
];

const recepciones: Recepcion[] = [
  // not1 → 3° A: Lucía firmada por Ana López, el resto pendiente
  { id: 'rec1', notaId: 'not1', alumnoId: 'alu1', lecturasTutores: {} },
  {
    id: 'rec2',
    notaId: 'not1',
    alumnoId: 'alu2',
    leidaPorAlumno: '2026-11-04T14:02:00.000Z',
    lecturasTutores: { tut3: '2026-11-04T20:10:00.000Z' },
    firma: { tutorId: 'tut3', fecha: '2026-11-04T20:11:00.000Z', dispositivo: DISPOSITIVO_EJEMPLO },
  },
  { id: 'rec3', notaId: 'not1', alumnoId: 'alu3', leidaPorAlumno: '2026-11-05T09:00:00.000Z', lecturasTutores: {} },
  { id: 'rec4', notaId: 'not1', alumnoId: 'alu4', lecturasTutores: { tut5: '2026-11-05T22:30:00.000Z' } },

  // not2 → 4° B: Sofía firmada por Carolina, Joaquín firmado, el resto pendiente
  {
    id: 'rec5',
    notaId: 'not2',
    alumnoId: 'alu5',
    leidaPorAlumno: '2026-11-06T12:00:00.000Z',
    lecturasTutores: { tut1: '2026-11-06T19:45:00.000Z' },
    firma: { tutorId: 'tut1', fecha: '2026-11-06T19:46:00.000Z', dispositivo: DISPOSITIVO_EJEMPLO },
  },
  {
    id: 'rec6',
    notaId: 'not2',
    alumnoId: 'alu6',
    lecturasTutores: { tut6: '2026-11-06T21:00:00.000Z' },
    firma: { tutorId: 'tut6', fecha: '2026-11-06T21:01:00.000Z', dispositivo: DISPOSITIVO_EJEMPLO },
  },
  { id: 'rec7', notaId: 'not2', alumnoId: 'alu7', lecturasTutores: {} },
  { id: 'rec8', notaId: 'not2', alumnoId: 'alu8', leidaPorAlumno: '2026-11-07T08:10:00.000Z', lecturasTutores: {} },

  // not3 → solo Sofía, pendiente de firma
  { id: 'rec9', notaId: 'not3', alumnoId: 'alu5', leidaPorAlumno: '2026-11-10T17:00:00.000Z', lecturasTutores: {} },

  // not4 → 4° B, sin firma
  { id: 'rec10', notaId: 'not4', alumnoId: 'alu5', lecturasTutores: {} },
  { id: 'rec11', notaId: 'not4', alumnoId: 'alu6', lecturasTutores: {} },
  { id: 'rec12', notaId: 'not4', alumnoId: 'alu7', leidaPorAlumno: '2026-11-12T13:00:00.000Z', lecturasTutores: {} },
  { id: 'rec13', notaId: 'not4', alumnoId: 'alu8', lecturasTutores: {} },
];

const seed: BaseDeDatos = {
  usuarios,
  cursos: [
    { id: 'cur1', nombre: '3° A', anio: 2026 },
    { id: 'cur2', nombre: '4° B', anio: 2026 },
  ],
  inscripciones: [
    { alumnoId: 'alu1', cursoId: 'cur1' },
    { alumnoId: 'alu2', cursoId: 'cur1' },
    { alumnoId: 'alu3', cursoId: 'cur1' },
    { alumnoId: 'alu4', cursoId: 'cur1' },
    { alumnoId: 'alu5', cursoId: 'cur2' },
    { alumnoId: 'alu6', cursoId: 'cur2' },
    { alumnoId: 'alu7', cursoId: 'cur2' },
    { alumnoId: 'alu8', cursoId: 'cur2' },
  ],
  tutoresAlumnos: [
    { tutorId: 'tut1', alumnoId: 'alu1' },
    { tutorId: 'tut1', alumnoId: 'alu5' },
    { tutorId: 'tut2', alumnoId: 'alu2' },
    { tutorId: 'tut3', alumnoId: 'alu2' },
    { tutorId: 'tut4', alumnoId: 'alu3' },
    { tutorId: 'tut5', alumnoId: 'alu4' },
    { tutorId: 'tut6', alumnoId: 'alu6' },
    { tutorId: 'tut7', alumnoId: 'alu7' },
    { tutorId: 'tut8', alumnoId: 'alu8' },
  ],
  docentesCursos: [
    { docenteId: 'doc1', cursoId: 'cur1' },
    { docenteId: 'doc1', cursoId: 'cur2' },
    { docenteId: 'doc2', cursoId: 'cur2' },
  ],
  notas,
  recepciones,
  // Arranca vacío: el panel muestra solo los emails que se generan durante la demo.
  emails: [],
};

/** Devuelve una copia nueva de los datos de ejemplo (para no mutar el original). */
export function crearSeed(): BaseDeDatos {
  return structuredClone(seed);
}
