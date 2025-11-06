import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import fitFinanceApi from '../api/fitFinanceApi';

const MUSCLE_GROUPS = [
  { value: 'pecho', label: 'Pecho' },
  { value: 'espalda', label: 'Espalda' },
  { value: 'piernas', label: 'Piernas' },
  { value: 'hombros', label: 'Hombros' },
  { value: 'brazos', label: 'Brazos' },
  { value: 'core', label: 'Core' },
  { value: 'cardio', label: 'Cardio' },
];

const CreateExerciseDialog = ({ open, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: '',
    muscleGroup: '',
    description: '',
    videoUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name.trim() || !form.muscleGroup) {
      setError('Nombre y grupo muscular son obligatorios');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await fitFinanceApi.post('/exercise-catalog', form);
      onSuccess && onSuccess(data);
      handleClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Error al crear ejercicio'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      name: '',
      muscleGroup: '',
      description: '',
      videoUrl: '',
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>Crear Ejercicio Personalizado</span>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              name="name"
              label="Nombre del ejercicio"
              value={form.name}
              onChange={handleChange}
              required
              fullWidth
              placeholder="Ej: Press Banca con Mancuernas"
            />

            <TextField
              name="muscleGroup"
              label="Grupo muscular"
              value={form.muscleGroup}
              onChange={handleChange}
              required
              fullWidth
              select
            >
              {MUSCLE_GROUPS.map((group) => (
                <MenuItem key={group.value} value={group.value}>
                  {group.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              name="description"
              label="Descripción (opcional)"
              value={form.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              placeholder="Describe cómo realizar el ejercicio..."
            />

            <TextField
              name="videoUrl"
              label="URL del video (opcional)"
              value={form.videoUrl}
              onChange={handleChange}
              fullWidth
              placeholder="https://youtube.com/..."
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              px: 3,
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Crear Ejercicio'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateExerciseDialog;

