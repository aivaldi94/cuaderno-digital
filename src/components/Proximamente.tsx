import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useSesion } from '../sesion/contexto';

/** Placeholder para las pantallas de inicio que todavía no se construyeron. */
export function Proximamente({ descripcion }: { descripcion: string }) {
  const { usuario } = useSesion();
  return (
    <>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
        Hola, {usuario?.nombre}
      </Typography>
      <Card>
        <CardContent>
          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Próximamente</Typography>
          <Typography color="text.secondary">{descripcion}</Typography>
        </CardContent>
      </Card>
    </>
  );
}
