import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DrawIcon from '@mui/icons-material/Draw';
import { Link, useParams } from 'react-router-dom';
import { ChipFirma } from '../../components/ChipFirma';
import { DialogoPin } from '../../components/DialogoPin';
import { firmar, marcarLeida, notaRecibida } from '../../services/notas';
import { useUsuarioActual } from '../../sesion/contexto';
import type { NotaRecibida } from '../../types';
import { fechaCompleta } from '../../utils/fechas';

export function DetalleNotaTutor() {
  const tutor = useUsuarioActual();
  const { recepcionId = '' } = useParams();
  const [item, setItem] = useState<NotaRecibida | null | undefined>(undefined); // undefined = cargando
  const [pidiendoPin, setPidiendoPin] = useState(false);
  const [avisoFirma, setAvisoFirma] = useState(false);

  useEffect(() => {
    // Abrir la nota cuenta como lectura del tutor.
    marcarLeida(recepcionId, tutor.id)
      .then(() => notaRecibida(recepcionId, tutor.id))
      .then((n) => setItem(n ?? null));
  }, [recepcionId, tutor.id]);

  async function handleFirmar(pin: string) {
    await firmar(recepcionId, tutor.id, pin);
    setItem((await notaRecibida(recepcionId, tutor.id)) ?? null);
    setPidiendoPin(false);
    setAvisoFirma(true);
  }

  if (item === undefined) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const volver = item ? `/tutor?hijo=${item.alumno.id}` : '/tutor';
  const botonVolver = (
    <Button component={Link} to={volver} startIcon={<ArrowBackIcon />} color="inherit" sx={{ alignSelf: 'flex-start' }}>
      Volver
    </Button>
  );

  if (item === null) {
    return (
      <Stack spacing={2}>
        {botonVolver}
        <Alert severity="warning">No encontramos esta nota, o no es para ninguno de tus hijos.</Alert>
      </Stack>
    );
  }

  const { nota, recepcion, remitente, curso, alumno, firmante } = item;
  const para = nota.destino.tipo === 'curso' ? `todo ${curso.nombre}` : alumno.nombre;
  const firmaPendiente = nota.requiereFirma && !recepcion.firma;

  return (
    <Stack spacing={2}>
      {botonVolver}

      <Card>
        <CardContent>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 2, flexGrow: 1 }}>
              Nota para {alumno.nombre}
            </Typography>
            <ChipFirma nota={nota} recepcion={recepcion} />
          </Stack>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            {nota.asunto}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            De {remitente.nombre} {remitente.apellido} · para {para}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {fechaCompleta(nota.fechaEnvio)}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{nota.cuerpo}</Typography>
        </CardContent>
      </Card>

      {firmaPendiente && (
        <Card sx={{ borderColor: 'secondary.main' }}>
          <CardContent>
            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Esta nota pide tu firma</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Firmando confirmás que leíste la nota. La escuela y los demás tutores de {alumno.nombre} reciben un aviso.
            </Typography>
            <Button fullWidth size="large" variant="contained" startIcon={<DrawIcon />} onClick={() => setPidiendoPin(true)}>
              Me notifiqué
            </Button>
          </CardContent>
        </Card>
      )}

      {recepcion.firma && (
        <Alert severity="success">
          {firmante?.id === tutor.id ? 'Firmaste' : `Firmó ${firmante?.nombre} ${firmante?.apellido}`} el{' '}
          {fechaCompleta(recepcion.firma.fecha)}.
        </Alert>
      )}

      {!nota.requiereFirma && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          Esta nota es informativa: no hace falta firmarla.
        </Typography>
      )}

      <DialogoPin
        open={pidiendoPin}
        descripcion={`Vas a firmar "Me notifiqué" en la nota "${nota.asunto}" de ${alumno.nombre}.`}
        onCerrar={() => setPidiendoPin(false)}
        onConfirmar={handleFirmar}
      />

      <Snackbar
        open={avisoFirma}
        autoHideDuration={4000}
        onClose={() => setAvisoFirma(false)}
        message="Listo, quedó firmada. Les avisamos por email a los tutores."
      />
    </Stack>
  );
}
