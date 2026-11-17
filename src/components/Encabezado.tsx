import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { nombreRol } from '../rutas';
import { useSesion } from '../sesion/contexto';
import { LogoEscuela } from './LogoEscuela';

export function Encabezado() {
  const { usuario, salir } = useSesion();
  const navigate = useNavigate();

  async function handleSalir() {
    await salir();
    navigate('/', { replace: true });
  }

  return (
    <AppBar position="sticky" sx={{ borderBottom: 3, borderColor: 'primary.main' }}>
      <Toolbar sx={{ gap: 1.5, minHeight: { xs: 60 } }}>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <LogoEscuela alto={36} />
        </Box>
        {usuario && (
          <>
            <Box sx={{ textAlign: 'right', minWidth: 0 }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                {usuario.nombre} {usuario.apellido}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap component="p">
                {nombreRol[usuario.rol]}
              </Typography>
            </Box>
            <Tooltip title="Salir">
              <IconButton edge="end" onClick={handleSalir} aria-label="Salir">
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
