import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Add as AddIcon,
  FitnessCenter as FitnessIcon,
} from '@mui/icons-material';
import fitFinanceApi from '../api/fitFinanceApi';

const MUSCLE_GROUPS = [
  { value: 'pecho', label: 'Pecho', color: '#ff6b6b' },
  { value: 'espalda', label: 'Espalda', color: '#4ecdc4' },
  { value: 'piernas', label: 'Piernas', color: '#45b7d1' },
  { value: 'hombros', label: 'Hombros', color: '#feca57' },
  { value: 'brazos', label: 'Brazos', color: '#ee5a6f' },
  { value: 'core', label: 'Core', color: '#ff9ff3' },
  { value: 'cardio', label: 'Cardio', color: '#54a0ff' },
];

const ExerciseCatalogSelector = ({ open, onClose, onSelect, onCreateNew }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');

  // Cargar ejercicios
  useEffect(() => {
    if (open) {
      loadExercises();
    }
  }, [open, selectedMuscleGroup]);

  const loadExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedMuscleGroup) {
        params.muscleGroup = selectedMuscleGroup;
      }

      const { data } = await fitFinanceApi.get('/exercise-catalog', { params });
      setExercises(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al cargar ejercicios');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar ejercicios por búsqueda local
  const filteredExercises = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectExercise = (exercise) => {
    onSelect(exercise);
    handleClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedMuscleGroup('');
    onClose();
  };

  const handleMuscleGroupClick = (group) => {
    if (selectedMuscleGroup === group) {
      setSelectedMuscleGroup(''); // Deseleccionar
    } else {
      setSelectedMuscleGroup(group);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <FitnessIcon />
          <span>Catálogo de Ejercicios</span>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Buscador */}
        <Box sx={{ p: 2, pb: 1, bgcolor: '#f5f5f5' }}>
          <TextField
            fullWidth
            placeholder="Buscar ejercicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: 'white',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Box>

        {/* Filtros de grupo muscular */}
        <Box sx={{ px: 2, pb: 2, bgcolor: '#f5f5f5' }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {MUSCLE_GROUPS.map((group) => (
              <Chip
                key={group.value}
                label={group.label}
                onClick={() => handleMuscleGroupClick(group.value)}
                sx={{
                  bgcolor:
                    selectedMuscleGroup === group.value
                      ? group.color
                      : 'white',
                  color:
                    selectedMuscleGroup === group.value ? 'white' : '#333',
                  fontWeight:
                    selectedMuscleGroup === group.value ? 'bold' : 'normal',
                  border: `2px solid ${group.color}`,
                  '&:hover': {
                    bgcolor:
                      selectedMuscleGroup === group.value
                        ? group.color
                        : '#f0f0f0',
                  },
                  transition: 'all 0.2s',
                  mb: 1,
                }}
              />
            ))}
            {selectedMuscleGroup && (
              <Chip
                label="Limpiar"
                onClick={() => setSelectedMuscleGroup('')}
                sx={{
                  bgcolor: '#666',
                  color: 'white',
                  '&:hover': { bgcolor: '#555' },
                  mb: 1,
                }}
              />
            )}
          </Stack>
        </Box>

        <Divider />

        {/* Lista de ejercicios */}
        <Box sx={{ minHeight: 300, maxHeight: 400, overflow: 'auto' }}>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              py={4}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          ) : filteredExercises.length === 0 ? (
            <Box textAlign="center" py={4}>
              <FitnessIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
              <Box color="text.secondary">
                {searchTerm
                  ? 'No se encontraron ejercicios'
                  : 'No hay ejercicios disponibles'}
              </Box>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredExercises.map((exercise) => (
                <ListItem key={exercise.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleSelectExercise(exercise)}
                    sx={{
                      py: 2,
                      '&:hover': {
                        bgcolor: '#e3f2fd',
                      },
                    }}
                  >
                    <ListItemText
                      primary={exercise.name}
                      secondary={
                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                          <Chip
                            label={exercise.muscleGroup}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: MUSCLE_GROUPS.find(
                                (g) => g.value === exercise.muscleGroup
                              )?.color || '#ccc',
                              color: 'white',
                            }}
                          />
                          {exercise.isCustom && (
                            <Chip
                              label="Personalizado"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                bgcolor: '#ff9800',
                                color: 'white',
                              }}
                            />
                          )}
                        </Box>
                      }
                      primaryTypographyProps={{
                        fontWeight: 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Divider />

        {/* Botón crear nuevo */}
        {onCreateNew && (
          <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                onCreateNew();
                handleClose();
              }}
              sx={{
                borderRadius: 2,
                py: 1.5,
                borderWidth: 2,
                fontWeight: 'bold',
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s',
              }}
            >
              Crear Ejercicio Personalizado
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseCatalogSelector;

