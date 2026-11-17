import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { escuelaConfig } from '../config/escuela.config';

interface Props {
  /** Alto del logo en px. */
  alto: number;
  /** Mostrar el subtítulo cuando no hay logo y se usa el nombre como texto. */
  conSubtitulo?: boolean;
}

/** Logo de la escuela. Si el archivo no existe, muestra el nombre como texto. */
export function LogoEscuela({ alto, conSubtitulo = false }: Props) {
  const [sinLogo, setSinLogo] = useState(false);

  if (sinLogo) {
    return (
      <Box sx={{ lineHeight: 1.1 }}>
        <Typography component="span" sx={{ display: 'block', fontWeight: 700, color: 'primary.main', fontSize: alto * 0.5 }}>
          {escuelaConfig.nombre}
        </Typography>
        {conSubtitulo && (
          <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block' }}>
            {escuelaConfig.subtitulo}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={escuelaConfig.logo}
      alt={`${escuelaConfig.nombre} — ${escuelaConfig.subtitulo}`}
      onError={() => setSinLogo(true)}
      sx={{ height: alto, maxWidth: '100%', objectFit: 'contain', display: 'block' }}
    />
  );
}
