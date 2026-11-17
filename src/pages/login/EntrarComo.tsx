import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useNavigate } from 'react-router-dom';
import { LogoEscuela } from '../../components/LogoEscuela';
import { escuelaConfig } from '../../config/escuela.config';
import { usuariosParaEntrar, type UsuarioConDetalle } from '../../services/personas';
import { resetearDatos } from '../../services/storage';
import { inicioPorRol } from '../../rutas';
import { useSesion } from '../../sesion/contexto';
import type { Rol } from '../../types';

const GRUPOS: { rol: Rol; titulo: string }[] = [
  { rol: 'tutor', titulo: 'Familias' },
  { rol: 'alumno', titulo: 'Alumnos' },
  { rol: 'docente', titulo: 'Docentes' },
  { rol: 'admin', titulo: 'Administración' },
];

function iniciales(u: UsuarioConDetalle['usuario']) {
  return `${u.nombre[0]}${u.apellido[0]}`;
}

export function EntrarComo() {
  const { entrar } = useSesion();
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState<Record<Rol, UsuarioConDetalle[]> | null>(null);
  const [confirmarReset, setConfirmarReset] = useState(false);
  const [avisoReset, setAvisoReset] = useState(false);

  useEffect(() => {
    usuariosParaEntrar().then(setGrupos);
  }, []);

  async function handleEntrar(usuarioId: string) {
    const usuario = await entrar(usuarioId);
    navigate(inicioPorRol[usuario.rol]);
  }

  async function handleReset() {
    await resetearDatos();
    setGrupos(await usuariosParaEntrar());
    setConfirmarReset(false);
    setAvisoReset(true);
  }

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center', mb: 3 }}>
        <LogoEscuela alto={56} conSubtitulo />
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, pt: 2 }}>
          Cuaderno de comunicaciones
        </Typography>
      </Stack>

      <Alert severity="info" sx={{ mb: 3 }}>
        Esto es un prototipo. Elegí con quién querés entrar; no hace falta contraseña.
      </Alert>

      <Stack spacing={3}>
        {GRUPOS.map(({ rol, titulo }) => (
          <Box key={rol} component="section">
            <Typography variant="overline" component="h2" color="text.secondary" sx={{ fontWeight: 700 }}>
              {titulo}
            </Typography>
            <Card>
              <List disablePadding>
                {grupos?.[rol].map(({ usuario, detalle }, i) => (
                  <Box key={usuario.id}>
                    {i > 0 && <Divider component="li" variant="inset" />}
                    <ListItemButton onClick={() => handleEntrar(usuario.id)}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: rol === 'tutor' || rol === 'alumno' ? 'primary.main' : 'text.primary' }}>
                          {iniciales(usuario)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={`${usuario.nombre} ${usuario.apellido}`} secondary={detalle} />
                    </ListItemButton>
                  </Box>
                ))}
              </List>
            </Card>
          </Box>
        ))}
      </Stack>

      <Stack sx={{ alignItems: 'center', mt: 4 }}>
        <Button startIcon={<RestartAltIcon />} color="inherit" onClick={() => setConfirmarReset(true)}>
          Restablecer datos de ejemplo
        </Button>
        <Typography variant="caption" color="text.secondary">
          {escuelaConfig.nombre} · {escuelaConfig.subtitulo}
        </Typography>
      </Stack>

      <Dialog open={confirmarReset} onClose={() => setConfirmarReset(false)}>
        <DialogTitle>¿Restablecer los datos?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Se borran las notas, firmas y emails que se hayan creado en la demo, y vuelven los datos de ejemplo.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmarReset(false)}>Cancelar</Button>
          <Button variant="contained" color="secondary" onClick={handleReset}>
            Restablecer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={avisoReset}
        autoHideDuration={3000}
        onClose={() => setAvisoReset(false)}
        message="Listo, volvieron los datos de ejemplo."
      />
    </Container>
  );
}
