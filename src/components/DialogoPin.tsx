import { useState, type FormEvent } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

interface Props {
  open: boolean;
  /** Texto que explica qué se está firmando. */
  descripcion: string;
  onCerrar: () => void;
  /** Firma con el PIN. Si falla, tiene que tirar un Error con un mensaje para mostrar. */
  onConfirmar: (pin: string) => Promise<void>;
}

/** Pide el PIN de firma (4 a 6 dígitos) y muestra el error si no es correcto. */
export function DialogoPin({ open, descripcion, onCerrar, onConfirmar }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function cerrar() {
    setPin('');
    setError(null);
    onCerrar();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await onConfirmar(pin);
      setPin('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo firmar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onClose={cerrar} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Confirmá con tu PIN</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>{descripcion}</DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label="PIN de firma"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            error={!!error}
            helperText={error ?? 'En este prototipo el PIN es 1234.'}
            slotProps={{ htmlInput: { inputMode: 'numeric', autoComplete: 'off', maxLength: 6 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrar}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={pin.length < 4 || enviando}>
            Firmar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
