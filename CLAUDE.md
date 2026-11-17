# Cuaderno de Comunicaciones Digital

Web app (mobile-first) que reemplaza el cuaderno de comunicaciones escolar: los docentes envían notas a un curso o a alumnos puntuales, los padres/tutores y los alumnos las leen, y los tutores las firman ("Me notifiqué").

- **Escuela piloto:** Edmondo De Amicis — Complejo Educativo Bicultural (nivel secundario).
- **Etapa actual:** PROTOTIPO sin backend, para mostrar a directivos. Nada de base de datos real, login real ni emails reales todavía.
- **Spec funcional completa:** https://claude.ai/artifact/XKi1UP8mnjp6WhPpGSuEsJ (fuente de verdad del producto; este archivo la resume).
- **Presentación para directivos:** https://claude.ai/artifact/LTxdvQMr5jcKy1HxQHTG9x

## Producto (resumen de la spec)

### Una instalación por escuela
- Cada escuela tiene su propia app, base de datos y repo/deploy. Nunca se mezclan datos entre escuelas. La app no sabe que existen otras escuelas: NO hay multi-tenant en el código.
- Nombre, logo y colores de la escuela salen de `src/config/escuela.config.ts`. Nadie los cambia desde la app (ni el admin).
- No existe rol de súper admin: la dueña de la plataforma clona y configura cada instalación a mano.

### Roles (cada usuario tiene UN solo rol)
| Acción | Admin escuela | Docente | Tutor | Alumno |
| --- | --- | --- | --- | --- |
| Cargar cursos, alumnos, tutores, docentes y asociarlos | Sí | — | — | — |
| Enviar notas | A cualquier curso | Solo a sus cursos | — | — |
| Ver estado de lectura/firma | Todas las notas | Sus notas | — | — |
| Leer notas | — | — | Dirigidas a sus hijos + enviadas a los cursos de sus hijos | Dirigidas a él + enviadas a su curso |
| Firmar "Me notifiqué" | — | — | Sí | No |

- Un tutor puede tener varios hijos (elige cuál ver). Un alumno puede tener varios tutores; con la firma de uno alcanza.
- Docente ↔ Curso es N a N. Tutor ↔ Alumno es N a N. Alumno está en un curso por año.
- Los cursos se crean de nuevo cada año (ej. "3° A — 2027").

### La nota
- Campos: remitente, destinatarios (curso entero o alumnos de un curso), asunto, cuerpo (texto con formato básico), requiere firma (sí/no), fecha de envío.
- Contenido libre (conducta, avisos, recordatorios). La firma un docente, NO una materia. Sin calificaciones.
- Una nota enviada NO se edita, NO se borra y NO se anula.
- Una nota a un curso llega a los alumnos que están en ese curso AL MOMENTO DEL ENVÍO (y a sus tutores). Un alumno que se suma después no la ve.
- Al enviar se crea una **Recepción por alumno destinatario**: guarda lectura del alumno, lectura de cada tutor y la firma (qué tutor, cuándo, dispositivo).

### Seguridad de la firma (MVP)
- Cuentas de tutor solo por invitación al email registrado por la escuela. El alumno nunca firma.
- PIN de firma (4–6 dígitos), distinto de la contraseña, pedido en cada firma.
- Aviso por email a TODOS los tutores del alumno cada vez que se firma.
- Registro de auditoría: tutor, fecha/hora, dispositivo, IP. Inmodificable.
- Es "firma electrónica"/"notificación registrada", no "firma digital" con certificado.

### Emails
| Email | Destinatario | Cuándo |
| --- | --- | --- |
| Invitación | Usuario nuevo | Alta |
| Recuperar contraseña o PIN | Quien lo pida | A pedido |
| Nueva nota | Tutores y alumno | Al enviarse (solo aviso + enlace, sin el cuerpo) |
| Aviso de firma | Todos los tutores del alumno | Al firmarse |

### Fuera de alcance por ahora (fase 2+)
Adjuntos, autorizaciones Sí/No, respuestas de padres a docentes, firma con passkeys, notificaciones push/PWA, recordatorios automáticos, notas por materia, primaria/inicial, una persona con dos roles.

## El prototipo

| Parte | Cómo se resuelve en el prototipo |
| --- | --- |
| Login y roles | Pantalla "Entrar como…" con usuarios de ejemplo de cada rol. Sin contraseñas. |
| Datos | `src/data/seed.ts` + persistencia en `localStorage`. Botón para resetear a los datos de ejemplo. |
| Notas, lectura, firma | Funcionan de verdad sobre esos datos. |
| PIN de firma | Validado en el navegador (no es seguro, es demostrativo). PIN de ejemplo: 1234. |
| Emails | Panel "Emails enviados" que muestra lo que habría recibido cada persona. |
| Identidad visual | `src/config/escuela.config.ts` + logo en `public/`. |
| Importar planilla, invitaciones, recuperar contraseña | No se implementan. |

## Stack
- Vite + React + TypeScript (strict).
- MUI (`@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material`). El theme se arma desde `escuela.config.ts`.
- React Router.
- Deploy del prototipo: Netlify o Cloudflare Pages (NO el plan gratis de Vercel: es para uso no comercial).
- Futuro (no ahora): Supabase (Postgres + Auth + Row Level Security + funciones), Resend para emails, backups propios con pg_dump.

## Reglas de arquitectura
1. **Los componentes y páginas NUNCA acceden a `seed.ts` ni a `localStorage` directamente.** Todo pasa por `src/services/`. Al migrar a Supabase solo se reescriben los servicios.
2. Las funciones de servicio son `async` y devuelven Promises, aunque hoy sean síncronas, para que la migración no cambie las firmas.
3. Las reglas de permisos (quién ve qué) viven en los servicios, no en los componentes. Ej.: `notasDelTutor(tutorId, alumnoId)` ya devuelve solo lo que corresponde.
4. Tipos del dominio en `src/types/`.
5. Mobile-first: todo se diseña para ~380px de ancho y se adapta a desktop. Padres y alumnos usan el celular; docentes y admin también la computadora.
6. Nada hardcodeado de la escuela en componentes: nombre, logo y colores siempre desde la config.

## Estructura
```
src/
  config/escuela.config.ts   nombre, logo, colores
  types/                     Usuario, Curso, Nota, Recepcion, EmailSimulado...
  data/seed.ts               datos de ejemplo
  services/                  única capa que toca los datos (storage.ts, notas.ts, personas.ts, emails.ts, sesion.ts)
  theme/                     theme de MUI generado desde la config
  pages/
    login/                   "Entrar como…"
    admin/  docente/  tutor/  alumno/
  components/                piezas reutilizables (TarjetaNota, SelectorHijo, DialogoPin...)
public/logo.png
```

## Modelo de datos (prototipo)
```ts
type Rol = 'admin' | 'docente' | 'tutor' | 'alumno';
interface Usuario { id: string; nombre: string; apellido: string; email: string; rol: Rol; pinFirma?: string /* solo tutores */ }
interface Curso { id: string; nombre: string; anio: number }            // "3° A", 2027
interface Inscripcion { alumnoId: string; cursoId: string }            // alumno en curso del año
interface TutorAlumno { tutorId: string; alumnoId: string }            // N a N
interface DocenteCurso { docenteId: string; cursoId: string }          // N a N
type Destino = { tipo: 'curso' } | { tipo: 'alumnos'; alumnoIds: string[] };
interface Nota { id: string; remitenteId: string; cursoId: string; destino: Destino;
  asunto: string; cuerpo: string; requiereFirma: boolean; fechaEnvio: string /* ISO */ }
interface Recepcion { id: string; notaId: string; alumnoId: string;
  leidaPorAlumno?: string; lecturasTutores: Record<string, string>; // tutorId -> fecha ISO
  firma?: { tutorId: string; fecha: string; dispositivo: string } }
interface EmailSimulado { id: string; para: string; tipo: 'nueva-nota' | 'aviso-firma'; asunto: string; cuerpo: string; fecha: string }
```

## Identidad de la escuela piloto
- Nombre: "Edmondo De Amicis" — subtítulo "Complejo Educativo Bicultural".
- Logo: `public/logo.png` (PNG con fondo transparente, ~7:1 apaisado, texto oscuro: usar sobre fondo claro).
- Colores (bandera italiana): verde principal `#0B7A3B`, rojo `#CE2B37`, verde oscuro para textos `#173826`, fondo claro `#F7F5F0`.

## Plan de trabajo del prototipo
1. [x] Base: theme desde la config, routing, pantalla "Entrar como…", layout con logo.
2. [x] Tipos, `seed.ts` (1 admin, 2 docentes, 2 cursos, ~8 alumnos, tutores con un caso de 2 hijos) y capa de servicios con `localStorage`.
3. [x] Tutor: inicio (selector de hijo, pendientes de firma arriba, historial), detalle de nota, firma con PIN.
4. [ ] Docente: nueva nota (curso → todo el curso o alumnos → asunto, cuerpo, requiere firma → vista previa), notas enviadas, detalle con estado por alumno y filtro "sin firmar".
5. [ ] Alumno (solo lectura, ve si su tutor firmó) + panel de emails simulados.
6. [ ] Admin: listado de cursos y personas con sus asociaciones (solo lectura alcanza).
7. [ ] Deploy y prueba en celular.

## Cómo trabajar en este repo
- La autora es dev frontend con experiencia en React / React Native; backend y bases de datos son nuevos para ella: explicar brevemente las decisiones de esa área.
- Textos de la interfaz en español rioplatense (vos), claros y cortos. Nombres del dominio en español en el código (Nota, Curso, Tutor, Recepcion).
- Avanzar de a una feature chica por vez. Antes de dar algo por terminado: `npm run build` y `npm run lint` sin errores.
- Si una tarea contradice la spec, preguntar antes de implementar. Si se toma una decisión nueva de producto, actualizar este archivo.
- Lint: el template de Vite actual usa **oxlint** (no ESLint); `npm run lint` lo corre.
