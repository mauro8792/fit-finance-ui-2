import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getEnvVariables } from '../helpers/getEnvVariables';

const { VITE_API_URL } = getEnvVariables();

const EditMicrocycleSets = ({ open, microcycleId, microcycleName, onClose, onSave }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [replicateToNext, setReplicateToNext] = useState(false);

  useEffect(() => {
    if (open && microcycleId) {
      fetchMicrocycleData();
    }
  }, [open, microcycleId]);

  const fetchMicrocycleData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${VITE_API_URL}/microcycle/${microcycleId}`);
      const data = await response.json();
      
      // Organizar datos por día -> ejercicio -> sets
      const exercisesByDay = {};
      
      data.days?.forEach(day => {
        if (!day.esDescanso && day.exercises?.length > 0) {
          day.exercises.forEach(exercise => {
            if (!exercisesByDay[day.dia]) {
              exercisesByDay[day.dia] = [];
            }
            exercisesByDay[day.dia].push({
              ...exercise,
              dayName: day.nombre || `Día ${day.dia}`,
              dayId: day.id
            });
          });
        }
      });
      
      setExercises(exercisesByDay);
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
      newExercises[dayNumber][exerciseIndex].sets[setIndex][field] = value;
      return newExercises;
    });
  };

  const addSet = (dayNumber, exerciseIndex) => {
    setExercises(prev => {
      const newExercises = { ...prev };
      const exercise = newExercises[dayNumber][exerciseIndex];
      const lastSet = exercise.sets[exercise.sets.length - 1];
      const nextOrder = lastSet ? (lastSet.order || exercise.sets.length) + 1 : 1;
      
      // Crear un nuevo set con valores del último set o defaults
      const newSet = {
        id: null, // Sin ID porque es nuevo (se creará en el backend)
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
      
      newExercises[dayNumber][exerciseIndex].sets.push(newSet);
      return newExercises;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // Preparar los sets para actualizar y crear
      const setsToUpdate = [];
      const setsToCreate = [];
      
      Object.values(exercises).forEach(dayExercises => {
        dayExercises.forEach(exercise => {
          exercise.sets?.forEach(set => {
            if (set.id) {
              // Set existente - actualizar
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
              // Set nuevo - crear
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

      // Actualizar sets existentes en el backend
      if (setsToUpdate.length > 0) {
        const updateResponse = await fetch(`${VITE_API_URL}/microcycle/${microcycleId}/sets`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            sets: setsToUpdate,
            replicateToNext: replicateToNext // 🆕 Agregar flag de replicación
          }),
        });

        if (!updateResponse.ok) {
          throw new Error('Error al actualizar los sets');
        }
      }

      // Crear nuevos sets en el backend
      if (setsToCreate.length > 0) {
        const createResponse = await fetch(`${VITE_API_URL}/exercise/sets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sets: setsToCreate }),
        });

        if (!createResponse.ok) {
          throw new Error('Error al crear los nuevos sets');
        }
      }

      // Ya no necesitamos el response aquí arriba
      const response = { ok: true };

      if (!response.ok) {
        throw new Error('Error al guardar los cambios');
      }

      if (onSave) {
        onSave();
      }
      
      onClose();
    } catch (err) {
      console.error('Error saving sets:', err);
      setError('Error al guardar los cambios. Por favor, intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#1a1a1a',
          color: '#fff',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ bgcolor: '#2a2a2a', borderBottom: '1px solid #333' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            ✏️ Editar Sets - {microcycleName}
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: '#fff' }}>
            ✕
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        {loading && (
          <Box display="flex" justifyContent="center" p={4}>
            <Typography>Cargando...</Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && Object.keys(exercises).length === 0 && (
          <Typography color="text.secondary" textAlign="center" py={4}>
            No hay ejercicios programados en este microciclo
          </Typography>
        )}

        {!loading && Object.entries(exercises).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([dayNumber, dayExercises]) => (
          <Box key={dayNumber} mb={2}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: '#ffd700', 
                fontWeight: 'bold', 
                mb: 1,
                pb: 1,
                borderBottom: '2px solid #ffd700'
              }}
            >
              📅 {dayExercises[0]?.dayName || `Día ${dayNumber}`}
            </Typography>

            {dayExercises.map((exercise, exerciseIndex) => (
              <Accordion 
                key={exercise.id}
                defaultExpanded={exerciseIndex === 0}
                sx={{
                  bgcolor: '#2a2a2a',
                  mb: 1,
                  '&:before': { display: 'none' }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
                  sx={{
                    bgcolor: '#333',
                    '&:hover': { bgcolor: '#3a3a3a' }
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} flex={1}>
                    <Typography variant="body1" fontWeight="600">
                      {exercise.exerciseCatalog?.name || exercise.nombre || 'Sin nombre'}
                    </Typography>
                    <Chip 
                      label={exercise.exerciseCatalog?.muscleGroup || 'Sin grupo'}
                      size="small"
                      sx={{ 
                        bgcolor: '#2196f3',
                        color: '#fff',
                        fontSize: '0.65rem'
                      }}
                    />
                    <Chip 
                      label={`${exercises[dayNumber][exerciseIndex].sets?.length || 0} sets`}
                      size="small"
                      sx={{ 
                        bgcolor: '#4caf50',
                        color: '#fff',
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 2 }}>
                  {(exercises[dayNumber][exerciseIndex].sets || []).map((set, setIndex) => (
                    <Box
                      key={set.id || setIndex}
                      sx={{
                        mb: 2,
                        p: 2,
                        bgcolor: set.isAmrap ? 'rgba(255, 193, 7, 0.1)' : '#1a1a1a',
                        border: set.isAmrap ? '2px solid rgba(255, 193, 7, 0.3)' : '1px solid #444',
                        borderRadius: '8px'
                      }}
                    >
                      {/* Header del set */}
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2" fontWeight="600">
                          Set {setIndex + 1}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={set.isAmrap || false}
                              onChange={(e) => updateSet(dayNumber, exerciseIndex, setIndex, 'isAmrap', e.target.checked)}
                              sx={{ color: '#ffc107', '&.Mui-checked': { color: '#ffc107' } }}
                            />
                          }
                          label={<Typography variant="caption" sx={{ color: '#ffc107' }}>🔥 AMRAP</Typography>}
                        />
                      </Box>

                      {/* Campos del set */}
                      <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={1} mb={set.isAmrap ? 2 : 0}>
                        <TextField
                          label="Reps"
                          type="text"
                          placeholder="ej: 8-10"
                          value={set.reps || ''}
                          onChange={(e) => updateSet(dayNumber, exerciseIndex, setIndex, 'reps', e.target.value)}
                          size="small"
                          InputProps={{ sx: { color: '#fff' } }}
                          InputLabelProps={{ sx: { color: '#aaa' } }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: '#444' },
                              '&:hover fieldset': { borderColor: '#666' },
                            }
                          }}
                        />
                        <TextField
                          label="Carga (kg)"
                          type="number"
                          step="0.5"
                          placeholder="ej: 40"
                          value={set.load || ''}
                          onChange={(e) => updateSet(dayNumber, exerciseIndex, setIndex, 'load', e.target.value)}
                          size="small"
                          InputProps={{ sx: { color: '#fff' } }}
                          InputLabelProps={{ sx: { color: '#aaa' } }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: '#444' },
                              '&:hover fieldset': { borderColor: '#666' },
                            }
                          }}
                        />
                        <TextField
                          label="RIR"
                          value={set.expectedRir || ''}
                          onChange={(e) => updateSet(dayNumber, exerciseIndex, setIndex, 'expectedRir', e.target.value)}
                          size="small"
                          InputProps={{ sx: { color: '#fff' } }}
                          InputLabelProps={{ sx: { color: '#aaa' } }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: '#444' },
                              '&:hover fieldset': { borderColor: '#666' },
                            }
                          }}
                        />
                      </Box>

                      {/* Opciones AMRAP */}
                      {set.isAmrap && (
                        <Box 
                          sx={{ 
                            pt: 2, 
                            borderTop: '1px solid rgba(255, 193, 7, 0.2)',
                            display: 'grid',
                            gridTemplateColumns: '1fr 2fr',
                            gap: 1
                          }}
                        >
                          <FormControl size="small">
                            <InputLabel sx={{ color: '#aaa' }}>Instrucción</InputLabel>
                            <Select
                              value={set.amrapInstruction || 'misma_carga'}
                              onChange={(e) => updateSet(dayNumber, exerciseIndex, setIndex, 'amrapInstruction', e.target.value)}
                              label="Instrucción"
                              sx={{
                                color: '#fff',
                                '.MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                                '.MuiSvgIcon-root': { color: '#fff' }
                              }}
                            >
                              <MenuItem value="misma_carga">💪 Misma carga</MenuItem>
                              <MenuItem value="bajar_carga">⬇️ Bajar carga</MenuItem>
                              <MenuItem value="kg_serie_anterior">📊 Kg serie anterior</MenuItem>
                            </Select>
                          </FormControl>
                          <TextField
                            label="Notas AMRAP"
                            placeholder="ej: bajar 5kg, decir DOS, etc."
                            value={set.amrapNotes || ''}
                            onChange={(e) => updateSet(dayNumber, exerciseIndex, setIndex, 'amrapNotes', e.target.value)}
                            size="small"
                            InputProps={{ sx: { color: '#fff' } }}
                            InputLabelProps={{ sx: { color: '#aaa' } }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#444' },
                                '&:hover fieldset': { borderColor: '#666' },
                              }
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  ))}
                  
                  {/* Botón para agregar set */}
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                      onClick={() => addSet(dayNumber, exerciseIndex)}
                      variant="outlined"
                      size="small"
                      sx={{
                        color: '#4caf50',
                        borderColor: '#4caf50',
                        '&:hover': {
                          borderColor: '#66bb6a',
                          bgcolor: 'rgba(76, 175, 80, 0.08)'
                        }
                      }}
                    >
                      ➕ Agregar Set
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ))}
      </DialogContent>

      <DialogActions sx={{ bgcolor: '#2a2a2a', borderTop: '1px solid #333', p: 2, gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={replicateToNext}
                onChange={(e) => setReplicateToNext(e.target.checked)}
                sx={{ 
                  color: '#ffd700', 
                  '&.Mui-checked': { color: '#ffd700' } 
                }}
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                  🔄 Replicar cambios a microciclos posteriores
                </Typography>
                <Typography variant="caption" sx={{ color: '#aaa', fontSize: '0.7rem' }}>
                  Los cambios se aplicarán a todos los microciclos siguientes
                </Typography>
              </Box>
            }
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            onClick={onClose} 
            sx={{ color: '#fff' }}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            sx={{
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#66bb6a' }
            }}
            disabled={saving}
          >
            {saving ? 'Guardando...' : '💾 Guardar Cambios'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EditMicrocycleSets;

