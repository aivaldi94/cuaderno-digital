import Badge from '@mui/material/Badge';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import type { ResumenHijo } from '../types';

interface Props {
  hijos: ResumenHijo[];
  seleccionado: string;
  onCambiar: (hijoId: string) => void;
}

/** Para tutores con más de un hijo: elige de quién ver las notas. Muestra cuántas faltan firmar. */
export function SelectorHijo({ hijos, seleccionado, onCambiar }: Props) {
  if (hijos.length < 2) {
    const unico = hijos[0];
    return unico ? (
      <Typography color="text.secondary">
        {unico.hijo.nombre} {unico.hijo.apellido}
        {unico.curso && ` · ${unico.curso.nombre}`}
      </Typography>
    ) : null;
  }

  return (
    <ToggleButtonGroup
      exclusive
      fullWidth
      color="primary"
      value={seleccionado}
      onChange={(_, valor: string | null) => valor && onCambiar(valor)}
      aria-label="Elegí de quién ver las notas"
    >
      {hijos.map(({ hijo, curso, pendientesDeFirma }) => (
        <ToggleButton key={hijo.id} value={hijo.id} sx={{ flexDirection: 'column', py: 1, lineHeight: 1.2 }}>
          <Badge color="secondary" badgeContent={pendientesDeFirma} sx={{ '& .MuiBadge-badge': { right: -10 } }}>
            <Typography component="span" sx={{ fontWeight: 600 }}>
              {hijo.nombre}
            </Typography>
          </Badge>
          {curso && (
            <Typography component="span" variant="caption" color="text.secondary">
              {curso.nombre}
            </Typography>
          )}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
