// Tipos del dominio. Reflejan el modelo de datos de CLAUDE.md;
// al migrar a Supabase cada interface pasa a ser (más o menos) una tabla.

export type Rol = 'admin' | 'docente' | 'tutor' | 'alumno';

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: Rol;
  pinFirma?: string; // solo tutores
}

export interface Curso {
  id: string;
  nombre: string; // "3° A"
  anio: number; // 2027
}

/** Alumno en un curso del año. */
export interface Inscripcion {
  alumnoId: string;
  cursoId: string;
}

/** Relación N a N entre tutores y alumnos. */
export interface TutorAlumno {
  tutorId: string;
  alumnoId: string;
}

/** Relación N a N entre docentes y cursos. */
export interface DocenteCurso {
  docenteId: string;
  cursoId: string;
}

export type Destino = { tipo: 'curso' } | { tipo: 'alumnos'; alumnoIds: string[] };

export interface Nota {
  id: string;
  remitenteId: string;
  cursoId: string;
  destino: Destino;
  asunto: string;
  cuerpo: string;
  requiereFirma: boolean;
  fechaEnvio: string; // ISO
}

export interface Firma {
  tutorId: string;
  fecha: string; // ISO
  dispositivo: string;
}

/** Una por alumno destinatario de una nota. */
export interface Recepcion {
  id: string;
  notaId: string;
  alumnoId: string;
  leidaPorAlumno?: string; // fecha ISO
  lecturasTutores: Record<string, string>; // tutorId -> fecha ISO
  firma?: Firma;
}

export type TipoEmail = 'nueva-nota' | 'aviso-firma';

export interface EmailSimulado {
  id: string;
  para: string;
  tipo: TipoEmail;
  asunto: string;
  cuerpo: string;
  fecha: string; // ISO
}

/** Todo lo que el prototipo guarda. Es el equivalente a "la base de datos". */
export interface BaseDeDatos {
  usuarios: Usuario[];
  cursos: Curso[];
  inscripciones: Inscripcion[];
  tutoresAlumnos: TutorAlumno[];
  docentesCursos: DocenteCurso[];
  notas: Nota[];
  recepciones: Recepcion[];
  emails: EmailSimulado[];
}

/** Una nota vista desde un alumno puntual (para tutor y alumno). */
export interface NotaRecibida {
  nota: Nota;
  recepcion: Recepcion;
  remitente: Usuario;
  curso: Curso;
  alumno: Usuario;
  /** El tutor que firmó, si ya está firmada. */
  firmante?: Usuario;
}

/** Un hijo con lo que le importa al tutor en el selector. */
export interface ResumenHijo {
  hijo: Usuario;
  curso?: Curso;
  pendientesDeFirma: number;
}

/** Una nota enviada con el estado de cada alumno destinatario (para docente y admin). */
export interface NotaEnviada {
  nota: Nota;
  curso: Curso;
  remitente: Usuario;
  recepciones: Recepcion[];
}
