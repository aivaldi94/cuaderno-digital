import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import type { NotaRecibida } from '../types';
import { fechaCorta } from '../utils/fechas';
import { ChipFirma } from './ChipFirma';

interface Props {
  item: NotaRecibida;
  href: string;
  /** Si quien mira todavía no la abrió: se resalta el asunto y aparece un punto. */
  sinLeer: boolean;
}

export function TarjetaNota({ item, href, sinLeer }: Props) {
  const { nota, recepcion, remitente } = item;
  return (
    <Card sx={sinLeer ? { borderColor: 'primary.main' } : undefined}>
      <CardActionArea component={Link} to={href}>
        <CardContent>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', mb: 0.5 }}>
            {sinLeer && (
              <Box
                aria-label="Sin leer"
                sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0, alignSelf: 'center' }}
              />
            )}
            <Typography sx={{ fontWeight: sinLeer ? 700 : 500, flexGrow: 1, minWidth: 0 }}>{nota.asunto}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
              {fechaCorta(nota.fechaEnvio)}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" noWrap>
            {remitente.nombre} {remitente.apellido}
          </Typography>
          {nota.requiereFirma && (
            <Box sx={{ mt: 1 }}>
              <ChipFirma nota={nota} recepcion={recepcion} />
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
