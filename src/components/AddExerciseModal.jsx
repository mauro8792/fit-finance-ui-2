import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Alert,
} from '@mui/material';
import fitFinanceApi from '../api/fitFinanceApi';

const AddExerciseModal = ({ open, microcycleId, days, onClose, onSaved }) => {
  const [dayNumber, setDayNumber] = useState('');
  const [muscle, setMuscle] = useState('');
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [exerciseId, setExerciseId] = useState('');
  const [catalogExercises, setCatalogExercises] = useState([]);
  const [reps, setReps] = useState('');
  const [rir, setRir] = useState('');
  const [rest, setRest] = useState('');
  const [replicate, setReplicate] = useState(false);
  const [numSets, setNumSets] = useState(0);
  const [suggestedLoad, setSuggestedLoad] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setDayNumber('');
      setMuscle('');
      setMuscleGroups([]);
      setExerciseId('');
      setCatalogExercises([]);
      setReps('');
      setRir('');
      setRest('');
      setReplicate(false);
      setError(null);
      setNumSets(0);
      setSuggestedLoad('');

      // Cargar grupos musculares disponibles (con auth)
      fitFinanceApi
        .get('/exercise-catalog/muscle-groups')
        .then((r) => setMuscleGroups(Array.isArray(r.data) ? r.data : []))
        .catch(() => setMuscleGroups([]));
    }
  }, [open]);

  useEffect(() => {
    if (!muscle) {
      setCatalogExercises([]);
      setExerciseId('');
      return;
    }
    fitFinanceApi
      .get('/exercise-catalog', { params: { muscleGroup: muscle } })
      .then((r) => setCatalogExercises(Array.isArray(r.data) ? r.data : []))
      .catch(() => setCatalogExercises([]));
    return () => {};
  }, [muscle]);

  const selectableDays = useMemo(() => {
    const sorted = (days || [])
      .filter((d) => !d.esDescanso)
      .sort((a, b) => a.dia - b.dia);
    return sorted;
  }, [days]);

  const canSave = dayNumber !== '' && muscle.trim() && exerciseId !== '';

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      // Construir sets iniciales (opcionales)
      const loadValue = suggestedLoad ? parseFloat(suggestedLoad) : 0;
      const sets =
        numSets > 0
          ? Array.from({ length: numSets }).map((_, idx) => ({
              reps: reps || '0',
              load: loadValue,
              expectedRir: rir || null,
              order: idx + 1,
              isAmrap: false,
              amrapInstruction: null,
              amrapNotes: null,
            }))
          : undefined;

      await fitFinanceApi.post(`/microcycle/${microcycleId}/exercises`, {
        dayNumber: Number(dayNumber),
        exerciseCatalogId: Number(exerciseId),
        repeticiones: reps || '',
        rirEsperado: rir || '',
        descanso: rest || '',
        replicateToNext: replicate,
        sets,
      });
      if (onSaved) onSaved();
      onClose();
    } catch (e) {
      setError(e.message || 'Error al crear el ejercicio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { bgcolor: '#1a1a1a', color: '#fff', maxHeight: '95vh' }
      }}
    >
      <DialogTitle sx={{ bgcolor: '#2a2a2a', borderBottom: '1px solid #333' }}>
        ➕ Agregar ejercicio
      </DialogTitle>
      <DialogContent sx={{ p: 2, maxHeight: '70vh', overflowY: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        <Box display="grid" gridTemplateColumns="1fr" gap={2}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: '#aaa' }}>Día</InputLabel>
            <Select
              value={dayNumber}
              label="Día"
              onChange={(e) => setDayNumber(e.target.value)}
              sx={{
                color: '#fff',
                '.MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                '.MuiSvgIcon-root': { color: '#fff' }
              }}
            >
              {selectableDays.map((d) => (
                <MenuItem value={d.dia} key={d.id}>
                  {d.nombre || `Día ${d.dia}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: '#aaa' }}>Grupo muscular</InputLabel>
            <Select
              value={muscle}
              label="Grupo muscular"
              onChange={(e) => setMuscle(e.target.value)}
              sx={{
                color: '#fff',
                '.MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                '.MuiSvgIcon-root': { color: '#fff' }
              }}
            >
              {muscleGroups.map((mg) => (
                <MenuItem key={mg} value={mg}>{mg}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" disabled={!muscle}>
            <InputLabel sx={{ color: '#aaa' }}>Ejercicio</InputLabel>
            <Select
              value={exerciseId}
              label="Ejercicio"
              onChange={(e) => setExerciseId(e.target.value)}
              sx={{
                color: '#fff',
                '.MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                '.MuiSvgIcon-root': { color: '#fff' }
              }}
            >
              {catalogExercises.map((ex) => (
                <MenuItem key={ex.id} value={ex.id}>{ex.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={1}>
            <TextField
              label="Reps (ej: 6-10)"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              size="small"
              InputProps={{ sx: { color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#aaa' } }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#444' }, '&:hover fieldset': { borderColor: '#666' } } }}
            />
            <TextField
              label="RIR"
              value={rir}
              onChange={(e) => setRir(e.target.value)}
              size="small"
              InputProps={{ sx: { color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#aaa' } }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#444' }, '&:hover fieldset': { borderColor: '#666' } } }}
            />
            <TextField
              label="Descanso (min)"
              value={rest}
              onChange={(e) => setRest(e.target.value)}
              size="small"
              InputProps={{ sx: { color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#aaa' } }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#444' }, '&:hover fieldset': { borderColor: '#666' } } }}
            />
          </Box>

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
            <TextField
              label="Cantidad de sets"
              type="number"
              inputProps={{ min: 0 }}
              value={numSets}
              onChange={(e) => setNumSets(Number(e.target.value) || 0)}
              size="small"
              InputProps={{ sx: { color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#aaa' } }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#444' }, '&:hover fieldset': { borderColor: '#666' } } }}
            />
            <TextField
              label="Carga sugerida (kg)"
              type="number"
              inputProps={{ min: 0, step: 0.5 }}
              value={suggestedLoad}
              onChange={(e) => setSuggestedLoad(e.target.value)}
              size="small"
              disabled={numSets === 0}
              InputProps={{ sx: { color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#aaa' } }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#444' }, '&:hover fieldset': { borderColor: '#666' } } }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: '#888', mt: -1 }}>
            💡 Si indicás sets y carga, se crearán con esos valores. Al asignar la plantilla podés elegir "Mantener cargas sugeridas".
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={replicate}
                onChange={(e) => setReplicate(e.target.checked)}
                sx={{ color: '#ffd700', '&.Mui-checked': { color: '#ffd700' } }}
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                  🔄 Replicar a microciclos posteriores
                </Typography>
                <Typography variant="caption" sx={{ color: '#aaa' }}>
                  Nunca se aplica hacia atrás
                </Typography>
              </Box>
            }
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ bgcolor: '#2a2a2a', borderTop: '1px solid #333' }}>
        <Button onClick={onClose} sx={{ color: '#fff' }} disabled={saving}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={!canSave || saving}
          variant="contained"
          sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#66bb6a' } }}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddExerciseModal;


