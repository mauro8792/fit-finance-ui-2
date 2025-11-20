import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';

const ConfirmDeleteExerciseModal = ({ open, exerciseName, onCancel, onConfirm }) => {
  const [scope, setScope] = useState('only-this'); // 'only-this' | 'forward'

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { bgcolor: '#1a1a1a', color: '#fff' } }}
    >
      <DialogTitle sx={{ bgcolor: '#2a2a2a', borderBottom: '1px solid #333' }}>
        🗑️ Eliminar ejercicio
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <Typography sx={{ mb: 1 }}>
          Vas a eliminar el ejercicio:
        </Typography>
        <Typography
          sx={{
            fontWeight: 800,
            color: '#ffd700',
            mb: 2,
            fontSize: { xs: '1.1rem', sm: '1.35rem' },
            lineHeight: 1.25,
          }}
        >
          {exerciseName}
        </Typography>

        <Typography variant="body2" sx={{ color: '#ccc', mb: 1 }}>
          ¿Dónde querés aplicar la eliminación?
        </Typography>

        <RadioGroup
          value={scope}
          onChange={(e) => setScope(e.target.value)}
        >
          <FormControlLabel
            value="only-this"
            control={<Radio sx={{ color: '#ffd700', '&.Mui-checked': { color: '#ffd700' } }} />}
            label={<Typography variant="body2" sx={{ color: '#fff' }}>Solo en este microciclo</Typography>}
          />
          <FormControlLabel
            value="forward"
            control={<Radio sx={{ color: '#ffd700', '&.Mui-checked': { color: '#ffd700' } }} />}
            label={
              <Box>
                <Typography variant="body2" sx={{ color: '#fff' }}>
                  Este microciclo y todos los posteriores
                </Typography>
                <Typography variant="caption" sx={{ color: '#aaa' }}>
                  Nunca se aplica hacia atrás
                </Typography>
              </Box>
            }
          />
        </RadioGroup>

        <Box sx={{ mt: 2, p: 1, bgcolor: '#331f20', border: '1px solid #522', borderRadius: 1 }}>
          <Typography variant="caption" sx={{ color: '#ff8a80' }}>
            Esta acción no se puede deshacer.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ bgcolor: '#2a2a2a', borderTop: '1px solid #333' }}>
        <Button onClick={onCancel} sx={{ color: '#fff' }}>Cancelar</Button>
        <Button
          onClick={() => onConfirm(scope === 'forward')}
          variant="contained"
          sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#e53935' } }}
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteExerciseModal;


