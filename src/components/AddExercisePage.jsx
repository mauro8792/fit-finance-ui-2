import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Alert,
  Button,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import fitFinanceApi from '../api/fitFinanceApi';

const COLORS = {
  background: '#121212',
  surface: '#1e1e1e',
  surfaceLight: '#2a2a2a',
  text: '#fff',
  textMuted: '#999',
  orange: '#ff9800',
  green: '#4cceac',
  red: '#ef5350',
  border: '#333',
};

const AddExercisePage = () => {
  const { microcycleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener los días del state de navegación
  const days = location.state?.days || [];
  
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
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [microcycleName, setMicrocycleName] = useState('');

  useEffect(() => {
    // Cargar grupos musculares
    fitFinanceApi
      .get('/exercise-catalog/muscle-groups')
      .then((r) => setMuscleGroups(Array.isArray(r.data) ? r.data : []))
      .catch(() => setMuscleGroups([]))
      .finally(() => setLoading(false));
      
    // Si no hay días, cargar el microciclo
    if (days.length === 0) {
      fitFinanceApi.get(`/microcycle/${microcycleId}`)
        .then((res) => {
          setMicrocycleName(res.data.name || `Semana ${res.data.number || ''}`);
        })
        .catch(() => {});
    }
  }, [microcycleId, days.length]);

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
      
      setSuccess(true);
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (e) {
      setError(e.message || 'Error al crear el ejercicio');
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: COLORS.background,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Typography fontSize={64} mb={2}>✅</Typography>
        <Typography variant="h5" color={COLORS.green} fontWeight={700} mb={1}>
          ¡Ejercicio agregado!
        </Typography>
        <Typography color={COLORS.textMuted}>Volviendo...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.background, pb: 10 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          borderBottom: `1px solid ${COLORS.border}`,
          bgcolor: COLORS.surface,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <IconButton onClick={() => navigate(-1)} sx={{ color: COLORS.text }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h6" fontWeight={700} color={COLORS.text}>
            ➕ Agregar Ejercicio
          </Typography>
          <Typography fontSize={12} color={COLORS.textMuted}>
            {microcycleName || 'Microciclo'}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress sx={{ color: COLORS.orange }} />
          </Box>
        ) : (
          <>
            <Card sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: COLORS.orange }}>
                  📋 Seleccionar ejercicio
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted, mb: 0.5, display: 'block' }}>
                    Día
                  </Typography>
                  <select
                    value={dayNumber}
                    onChange={(e) => setDayNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${COLORS.border}`,
                      backgroundColor: COLORS.surfaceLight,
                      color: COLORS.text,
                      fontSize: '16px',
                      outline: 'none',
                    }}
                  >
                    <option value="" style={{ backgroundColor: COLORS.surface }}>Seleccionar día...</option>
                    {selectableDays.length > 0 ? (
                      selectableDays.map((d) => (
                        <option value={String(d.dia)} key={d.id || d.dia} style={{ backgroundColor: COLORS.surface }}>
                          {d.nombre || `Día ${d.dia}`}
                        </option>
                      ))
                    ) : (
                      [1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <option value={String(num)} key={num} style={{ backgroundColor: COLORS.surface }}>
                          Día {num}
                        </option>
                      ))
                    )}
                  </select>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted, mb: 0.5, display: 'block' }}>
                    Grupo muscular
                  </Typography>
                  <select
                    value={muscle}
                    onChange={(e) => setMuscle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${COLORS.border}`,
                      backgroundColor: COLORS.surfaceLight,
                      color: COLORS.text,
                      fontSize: '16px',
                      outline: 'none',
                    }}
                  >
                    <option value="" style={{ backgroundColor: COLORS.surface }}>Seleccionar grupo...</option>
                    {muscleGroups.map((mg) => (
                      <option key={mg} value={mg} style={{ backgroundColor: COLORS.surface }}>{mg}</option>
                    ))}
                  </select>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted, mb: 0.5, display: 'block' }}>
                    Ejercicio
                  </Typography>
                  <select
                    value={exerciseId}
                    onChange={(e) => setExerciseId(e.target.value)}
                    disabled={!muscle}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${COLORS.border}`,
                      backgroundColor: !muscle ? COLORS.surface : COLORS.surfaceLight,
                      color: !muscle ? COLORS.textMuted : COLORS.text,
                      fontSize: '16px',
                      outline: 'none',
                      opacity: !muscle ? 0.5 : 1,
                    }}
                  >
                    <option value="" style={{ backgroundColor: COLORS.surface }}>Seleccionar ejercicio...</option>
                    {catalogExercises.map((ex) => (
                      <option key={ex.id} value={String(ex.id)} style={{ backgroundColor: COLORS.surface }}>{ex.name}</option>
                    ))}
                  </select>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: COLORS.orange }}>
                  ⚙️ Configuración
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: COLORS.textMuted, mb: 0.5, display: 'block' }}>
                      Reps (ej: 6-10)
                    </Typography>
                    <TextField
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      size="small"
                      fullWidth
                      placeholder="10-12"
                      InputProps={{ sx: { color: COLORS.text } }}
                      sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: COLORS.border }, '&:hover fieldset': { borderColor: COLORS.textMuted } } }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: COLORS.textMuted, mb: 0.5, display: 'block' }}>
                      RIR
                    </Typography>
                    <TextField
                      value={rir}
                      onChange={(e) => setRir(e.target.value)}
                      size="small"
                      fullWidth
                      placeholder="2-3"
                      InputProps={{ sx: { color: COLORS.text } }}
                      sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: COLORS.border }, '&:hover fieldset': { borderColor: COLORS.textMuted } } }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: COLORS.textMuted, mb: 0.5, display: 'block' }}>
                      Descanso (min)
                    </Typography>
                    <TextField
                      value={rest}
                      onChange={(e) => setRest(e.target.value)}
                      size="small"
                      fullWidth
                      placeholder="90"
                      InputProps={{ sx: { color: COLORS.text } }}
                      sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: COLORS.border }, '&:hover fieldset': { borderColor: COLORS.textMuted } } }}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: COLORS.textMuted, mb: 0.5, display: 'block' }}>
                      Cantidad de sets
                    </Typography>
                    <TextField
                      type="number"
                      inputProps={{ min: 0 }}
                      value={numSets}
                      onChange={(e) => setNumSets(Number(e.target.value) || 0)}
                      size="small"
                      fullWidth
                      placeholder="3"
                      InputProps={{ sx: { color: COLORS.text } }}
                      sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: COLORS.border }, '&:hover fieldset': { borderColor: COLORS.textMuted } } }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: COLORS.textMuted, mb: 0.5, display: 'block' }}>
                      Carga sugerida (kg)
                    </Typography>
                    <TextField
                      type="number"
                      inputProps={{ min: 0, step: 0.5 }}
                      value={suggestedLoad}
                      onChange={(e) => setSuggestedLoad(e.target.value)}
                      size="small"
                      fullWidth
                      disabled={numSets === 0}
                      placeholder="20"
                      InputProps={{ sx: { color: COLORS.text } }}
                      sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: COLORS.border }, '&:hover fieldset': { borderColor: COLORS.textMuted } } }}
                    />
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                  💡 Si indicás sets y carga, se crearán con esos valores.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
              <CardContent>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={replicate}
                      onChange={(e) => setReplicate(e.target.checked)}
                      sx={{ color: COLORS.orange, '&.Mui-checked': { color: COLORS.orange } }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.text, fontWeight: 600 }}>
                        🔄 Replicar a microciclos posteriores
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                        Nunca se aplica hacia atrás
                      </Typography>
                    </Box>
                  }
                />
              </CardContent>
            </Card>
          </>
        )}
      </Box>

      {/* Actions - Fixed at bottom */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          bgcolor: COLORS.surface,
          borderTop: `1px solid ${COLORS.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Button onClick={() => navigate(-1)} sx={{ color: COLORS.red }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!canSave || saving}
          sx={{
            bgcolor: COLORS.green,
            color: '#000',
            fontWeight: 700,
            px: 4,
            '&:hover': { bgcolor: '#3db897' },
            '&:disabled': { bgcolor: COLORS.surfaceLight, color: COLORS.textMuted },
          }}
        >
          {saving ? 'Guardando...' : '✓ Guardar'}
        </Button>
      </Box>
    </Box>
  );
};

export default AddExercisePage;

