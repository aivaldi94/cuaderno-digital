import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditNoteIcon from '@mui/icons-material/EditNote';
import type { Nota, Recepcion } from '../types';

/** Estado de firma de una nota para un alumno. No muestra nada si la nota no pide firma. */
export function ChipFirma({ nota, recepcion }: { nota: Nota; recepcion: Recepcion }) {
  if (!nota.requiereFirma) return null;
  return recepcion.firma ? (
    <Chip size="small" color="success" variant="outlined" icon={<CheckCircleIcon />} label="Firmada" />
  ) : (
    <Chip size="small" color="secondary" icon={<EditNoteIcon />} label="Falta firmar" />
  );
}
