import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  Chip,
} from '@mui/material';
import { getEnvVariables } from '../../helpers/getEnvVariables';

const { VITE_API_URL } = getEnvVariables();

const EditMicrocycleSetsPage = () => {
  const { microcycleId } = useParams();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState({});
  const [microcycleName, setMicrocycleName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [expandedDays, setExpandedDays] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    fetchMicrocycleData();
  }, [microcycleId]);

  const fetchMicrocycleData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${VITE_API_URL}/microcycle/${microcycleId}`);
      const data = await response.json();
      
      setMicrocycleName(data.name || `Microciclo ${microcycleId}`);
      
      const exercisesByDay = {};
      const initialExpanded = {};
      
      data.days?.forEach((day) => {
        if (!day.esDescanso && day.exercises?.length > 0) {
          initialExpanded[day.dia] = true;
          day.exercises.forEach((exercise) => {
            if (!exercisesByDay[day.dia]) {
              exercisesByDay[day.dia] = [];
            }
            // Ordenar sets por order antes de guardar
            const sortedSets = [...(exercise.sets || [])].sort(
              (a, b) => (a.order ?? 0) - (b.order ?? 0)
            );
            exercisesByDay[day.dia].push({
              ...exercise,
              sets: sortedSets,
              dayName: day.nombre || `Día ${day.dia}`,
              dayId: day.id,
            });
          });
        }
      });
      
      setExercises(exercisesByDay);
      setExpandedDays(initialExpanded);
    } catch (err) {
      console.error('Error fetching microcycle data:', err);
      setError('Error al cargar los datos del microciclo');
    } finally {
      setLoading(false);
    }
  };

  const updateSet = (dayNumber, exerciseIndex, setIndex, field, value) => {
    setExercises(prev => {
      const newExercises = { ...prev };
      newExercises[dayNumber] = [...newExercises[dayNumber]];
      newExercises[dayNumber][exerciseIndex] = {
        ...newExercises[dayNumber][exerciseIndex],
        sets: [...newExercises[dayNumber][exerciseIndex].sets]
      };
      newExercises[dayNumber][exerciseIndex].sets[setIndex] = {
        ...newExercises[dayNumber][exerciseIndex].sets[setIndex],
        [field]: value
      };
      return newExercises;
    });
  };

  const addSet = (dayNumber, exerciseIndex) => {
    setExercises(prev => {
      const newExercises = { ...prev };
      newExercises[dayNumber] = [...newExercises[dayNumber]];
      const exercise = newExercises[dayNumber][exerciseIndex];
      const lastSet = exercise.sets[exercise.sets.length - 1];
      const nextOrder = lastSet ? (lastSet.order || exercise.sets.length) + 1 : 1;
      
      const newSet = {
        id: null,
        reps: lastSet?.reps || exercise.repeticiones || '8-10',
        load: 0,
        expectedRir: lastSet?.expectedRir || exercise.rirEsperado || '3',
        order: nextOrder,
        isAmrap: false,
        amrapInstruction: null,
        amrapNotes: null,
        status: 'pending',
        isExtra: false
      };
      
      newExercises[dayNumber][exerciseIndex] = {
        ...exercise,
        sets: [...exercise.sets, newSet]
      };
      return newExercises;
    });
  };

  const toggleDay = (dayNumber) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayNumber]: !prev[dayNumber]
    }));
  };

  // Mostrar dialog de confirmación antes de guardar
  const handleSaveClick = () => {
    setShowConfirmDialog(true);
  };

  // Guardar con o sin replicación
  const handleSave = async (replicateToNext = false) => {
    setShowConfirmDialog(false);
    setSaving(true);
    setError(null);
    
    try {
      const setsToUpdate = [];
      const setsToCreate = [];
      
      Object.values(exercises).forEach(dayExercises => {
        dayExercises.forEach(exercise => {
          exercise.sets?.forEach(set => {
            if (set.id) {
              setsToUpdate.push({
                id: set.id,
                reps: set.reps || '0',
                load: parseFloat(set.load) || 0,
                expectedRir: set.expectedRir || '',
                isAmrap: set.isAmrap || false,
                amrapInstruction: set.isAmrap ? set.amrapInstruction : null,
                amrapNotes: set.isAmrap ? set.amrapNotes : null
              });
            } else {
              setsToCreate.push({
                exerciseId: exercise.id,
                reps: set.reps || '0',
                load: parseFloat(set.load) || 0,
                expectedRir: set.expectedRir || '',
                order: set.order || 1,
                isAmrap: set.isAmrap || false,
                amrapInstruction: set.isAmrap ? set.amrapInstruction : null,
                amrapNotes: set.isAmrap ? set.amrapNotes : null,
                isExtra: set.isExtra || false,
                status: 'pending'
              });
            }
          });
        });
      });

      if (setsToUpdate.length > 0) {
        const updateResponse = await fetch(`${VITE_API_URL}/microcycle/${microcycleId}/sets`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sets: setsToUpdate,
            replicateToNext: replicateToNext 
          }),
        });
        if (!updateResponse.ok) throw new Error('Error al actualizar los sets');
      }

      if (setsToCreate.length > 0) {
        const createResponse = await fetch(`${VITE_API_URL}/exercise/sets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sets: setsToCreate }),
        });
        if (!createResponse.ok) throw new Error('Error al crear los nuevos sets');
      }

      setSuccess(true);
      setTimeout(() => navigate(-1), 1000);
    } catch (err) {
      console.error('Error saving sets:', err);
      setError('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: '#121212', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Typography color="#ffd700">Cargando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#121212', 
      pb: '80px' // Espacio para el footer fijo
    }}>
      {/* Header fijo */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        bgcolor: '#1a1a1a',
        borderBottom: '1px solid #333',
        p: 2,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffd700',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ←
          </button>
          <Typography variant="body1" fontWeight="600" color="#fff">
            ✏️ Editar Sets
          </Typography>
        </Box>
        <Chip 
          label={microcycleName} 
          size="small" 
          sx={{ bgcolor: '#333', color: '#fff' }} 
        />
      </Box>

      {/* Contenido scrolleable */}
      <Box sx={{ p: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>¡Cambios guardados!</Alert>
        )}

        {Object.keys(exercises).length === 0 && (
          <Typography color="#888" textAlign="center" py={4}>
            No hay ejercicios en este microciclo
          </Typography>
        )}

        {Object.entries(exercises)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([dayNumber, dayExercises]) => (
            <Box key={dayNumber} sx={{ mb: 3 }}>
              {/* Header del día */}
              <Box
                onClick={() => toggleDay(dayNumber)}
                sx={{
                  bgcolor: '#2a2a2a',
                  p: 1.5,
                  borderRadius: '8px 8px 0 0',
                  borderBottom: '2px solid #ffd700',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <Typography color="#ffd700" fontWeight="600">
                  📅 {dayExercises[0]?.dayName || `Día ${dayNumber}`}
                </Typography>
                <Typography color="#888" fontSize="18px">
                  {expandedDays[dayNumber] ? '▲' : '▼'}
                </Typography>
              </Box>

              {/* Ejercicios del día */}
              {expandedDays[dayNumber] && dayExercises.map((exercise, exerciseIndex) => (
                <Box
                  key={exercise.id}
                  sx={{
                    bgcolor: '#1e1e1e',
                    border: '1px solid #333',
                    borderTop: 'none',
                    p: 2,
                    '&:last-child': {
                      borderRadius: '0 0 8px 8px',
                    }
                  }}
                >
                  {/* Nombre del ejercicio */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mb: 2,
                    flexWrap: 'wrap'
                  }}>
                    <Typography fontWeight="600" color="#fff">
                      {exercise.exerciseCatalog?.name || exercise.nombre || 'Sin nombre'}
                    </Typography>
                    <Chip
                      label={exercise.exerciseCatalog?.muscleGroup || 'N/A'}
                      size="small"
                      sx={{ bgcolor: '#2196f3', color: '#fff', fontSize: '11px' }}
                    />
                    <Chip
                      label={`${exercise.sets?.length || 0} sets`}
                      size="small"
                      sx={{ bgcolor: '#4caf50', color: '#fff', fontSize: '11px' }}
                    />
                  </Box>

                  {/* Sets */}
                  {(exercise.sets || []).map((set, setIndex) => (
                    <Box
                      key={set.id || setIndex}
                      sx={{
                        mb: 2,
                        p: 2,
                        bgcolor: set.isAmrap ? 'rgba(255, 193, 7, 0.1)' : '#252525',
                        border: set.isAmrap ? '2px solid rgba(255, 193, 7, 0.3)' : '1px solid #444',
                        borderRadius: '8px',
                      }}
                    >
                      {/* Header del set */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 2 
                      }}>
                        <Typography fontWeight="600" color="#fff">
                          Set {setIndex + 1}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={set.isAmrap || false}
                              onChange={(e) => updateSet(dayNumber, exerciseIndex, setIndex, 'isAmrap', e.target.checked)}
                              sx={{ color: '#ffc107', '&.Mui-checked': { color: '#ffc107' } }}
                              size="small"
                            />
                          }
                          label={<Typography fontSize="12px" color="#ffc107">🔥 AMRAP</Typography>}
                        />
                      </Box>

                      {/* Campos del set */}
                      <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(3, 1fr)', 
                        gap: 1.5 
                      }}>
                        <TextField
                          label="Reps"
                          value={set.reps || ''}
                          onChange={(e) => updateSet(dayNumber, exerciseIndex, setIndex, 'reps', e.target.value)}
                          size="small"
                          InputProps={{ sx: { color: '#fff' } }}
                          InputLabelProps={{ sx: { color: '#888' } }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: '#555' },
                            }
                          }}
                        />
                        <TextField
                          label="Carga (kg)"
                          type="number"
                          value={set.load || ''}
                          onChange={(e) => updateSet(dayNumber, exerciseIndex, setIndex, 'load', e.target.value)}
                          size="small"
                          InputProps={{ sx: { color: '#fff' } }}
                          InputLabelProps={{ sx: { color: '#888' } }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: '#555' },
                            }
                          }}
                        />
                        <TextField
                          label="RIR"
                          value={set.expectedRir || ''}
                          onChange={(e) => updateSet(dayNumber, exerciseIndex, setIndex, 'expectedRir', e.target.value)}
                          size="small"
                          InputProps={{ sx: { color: '#fff' } }}
                          InputLabelProps={{ sx: { color: '#888' } }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: '#555' },
                            }
                          }}
                        />
                      </Box>

                      {/* Opciones AMRAP */}
                      {set.isAmrap && (
                        <Box sx={{ 
                          mt: 2, 
                          pt: 2, 
                          borderTop: '1px solid rgba(255, 193, 7, 0.2)',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 1.5
                        }}>
                          <FormControl size="small" fullWidth>
                            <InputLabel sx={{ color: '#888' }}>Instrucción</InputLabel>
                            <Select
                              value={set.amrapInstruction || 'misma_carga'}
                              onChange={(e) => updateSet(dayNumber, exerciseIndex, setIndex, 'amrapInstruction', e.target.value)}
                              label="Instrucción"
                              sx={{
                                color: '#fff',
                                '.MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                                '.MuiSvgIcon-root': { color: '#fff' }
                              }}
                            >
                              <MenuItem value="misma_carga">💪 Misma</MenuItem>
                              <MenuItem value="bajar_carga">⬇️ Bajar</MenuItem>
                              <MenuItem value="kg_serie_anterior">📊 Anterior</MenuItem>
                            </Select>
                          </FormControl>
                          <TextField
                            label="Notas"
                            value={set.amrapNotes || ''}
                            onChange={(e) => updateSet(dayNumber, exerciseIndex, setIndex, 'amrapNotes', e.target.value)}
                            size="small"
                            InputProps={{ sx: { color: '#fff' } }}
                            InputLabelProps={{ sx: { color: '#888' } }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#555' },
                              }
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  ))}

                  {/* Botón agregar set */}
                  <Button
                    onClick={() => addSet(dayNumber, exerciseIndex)}
                    fullWidth
                    sx={{
                      color: '#4caf50',
                      borderColor: '#4caf50',
                      border: '1px dashed #4caf50',
                      mt: 1,
                    }}
                  >
                    + Agregar Set
                  </Button>
                </Box>
              ))}
            </Box>
          ))}
      </Box>

      {/* Footer fijo */}
      <Box sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: '#1a1a1a',
        borderTop: '1px solid #333',
        p: 2,
        zIndex: 10,
        display: 'flex',
        gap: 2,
      }}>
        <Button
          onClick={() => navigate(-1)}
          fullWidth
          sx={{ color: '#fff' }}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSaveClick}
          variant="contained"
          fullWidth
          sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#66bb6a' } }}
          disabled={saving}
        >
          {saving ? 'Guardando...' : '💾 Guardar'}
        </Button>
      </Box>

      {/* Dialog de confirmación */}
      {showConfirmDialog && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}>
          <Box sx={{
            bgcolor: '#1e1e1e',
            borderRadius: 3,
            p: 3,
            maxWidth: 340,
            width: '100%',
            border: '1px solid #333',
          }}>
            <Typography variant="h6" color="#fff" mb={2} textAlign="center">
              💾 Guardar Cambios
            </Typography>
            <Typography color="#aaa" fontSize={14} mb={3} textAlign="center">
              ¿Querés aplicar estos cambios también a los microciclos posteriores?
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleSave(true)}
                sx={{ 
                  bgcolor: '#ffd700', 
                  color: '#000',
                  '&:hover': { bgcolor: '#ffed4a' },
                  fontWeight: 600,
                }}
              >
                🔄 Sí, aplicar a todos
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleSave(false)}
                sx={{ 
                  bgcolor: '#4caf50',
                  '&:hover': { bgcolor: '#66bb6a' },
                  fontWeight: 600,
                }}
              >
                📝 Solo este microciclo
              </Button>
              <Button
                fullWidth
                onClick={() => setShowConfirmDialog(false)}
                sx={{ color: '#888' }}
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default EditMicrocycleSetsPage;

