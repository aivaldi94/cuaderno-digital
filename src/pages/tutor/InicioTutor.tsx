import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSearchParams } from 'react-router-dom';
import { SelectorHijo } from '../../components/SelectorHijo';
import { TarjetaNota } from '../../components/TarjetaNota';
import { estaPendienteDeFirma, notasDelTutor, resumenHijos } from '../../services/notas';
import { useUsuarioActual } from '../../sesion/contexto';
import type { NotaRecibida, ResumenHijo } from '../../types';

export function InicioTutor() {
  const tutor = useUsuarioActual();
  const [params, setParams] = useSearchParams();
  const [hijos, setHijos] = useState<ResumenHijo[] | null>(null);
  // Guardamos de qué hijo son las notas cargadas: si no coincide con el elegido, está cargando.
  const [cargadas, setCargadas] = useState<{ hijoId: string; notas: NotaRecibida[] } | null>(null);

  // El hijo elegido va en la URL (?hijo=...) para que "Volver" desde una nota lo recuerde.
  const pedido = params.get('hijo');
  const hijoId = hijos?.find((h) => h.hijo.id === pedido)?.hijo.id ?? hijos?.[0]?.hijo.id;

  useEffect(() => {
    resumenHijos(tutor.id).then(setHijos);
  }, [tutor.id]);

  useEffect(() => {
    if (!hijoId) return;
    let vigente = true;
    notasDelTutor(tutor.id, hijoId).then((notas) => vigente && setCargadas({ hijoId, notas }));
    return () => {
      vigente = false;
    };
  }, [tutor.id, hijoId]);

  if (!hijos) return <Cargando />;
  if (!hijoId) return <Alert severity="info">Todavía no tenés alumnos asociados. Consultá con la escuela.</Alert>;

  const notas = cargadas?.hijoId === hijoId ? cargadas.notas : null;
  const pendientes = notas?.filter(estaPendienteDeFirma) ?? [];
  const resto = notas?.filter((n) => !estaPendienteDeFirma(n)) ?? [];
  const nombreHijo = hijos.find((h) => h.hijo.id === hijoId)?.hijo.nombre;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 1.5 }}>
          Cuaderno de comunicaciones
        </Typography>
        <SelectorHijo hijos={hijos} seleccionado={hijoId} onCambiar={(id) => setParams({ hijo: id })} />
      </Box>

      {!notas ? (
        <Cargando />
      ) : (
        <>
          {pendientes.length > 0 ? (
            <Seccion titulo={`Para firmar (${pendientes.length})`}>
              {pendientes.map((item) => (
                <TarjetaNota key={item.recepcion.id} item={item} href={`/tutor/nota/${item.recepcion.id}`} sinLeer={!item.recepcion.lecturasTutores[tutor.id]} />
              ))}
            </Seccion>
          ) : (
            notas.length > 0 && <Alert severity="success">No hay notas de {nombreHijo} pendientes de firma.</Alert>
          )}

          <Seccion titulo="Historial">
            {resto.length === 0 ? (
              <Typography color="text.secondary">
                {notas.length === 0 ? `Todavía no hay notas para ${nombreHijo}.` : 'No hay otras notas.'}
              </Typography>
            ) : (
              resto.map((item) => (
                <TarjetaNota key={item.recepcion.id} item={item} href={`/tutor/nota/${item.recepcion.id}`} sinLeer={!item.recepcion.lecturasTutores[tutor.id]} />
              ))
            )}
          </Seccion>
        </>
      )}
    </Stack>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <Box component="section">
      <Typography variant="overline" component="h2" color="text.secondary" sx={{ fontWeight: 700 }}>
        {titulo}
      </Typography>
      <Stack spacing={1.5}>{children}</Stack>
    </Box>
  );
}

function Cargando() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <CircularProgress />
    </Box>
  );
}
