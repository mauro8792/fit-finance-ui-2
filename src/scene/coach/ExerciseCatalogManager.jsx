import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { getEnvVariables } from '../../helpers';

const { VITE_API_URL } = getEnvVariables();

const ExerciseCatalogManager = () => {
  const [exercises, setExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Filtros
  const [filterGroup, setFilterGroup] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    muscleGroup: '',
    description: '',
    videoUrl: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, [filterGroup, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadExercises(),
        loadMuscleGroups()
      ]);
    } catch (err) {
      setError('Error al cargar datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadExercises = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = `${VITE_API_URL}/exercise-catalog`;
      const params = new URLSearchParams();
      
      if (filterGroup) params.append('muscleGroup', filterGroup);
      if (searchTerm) params.append('search', searchTerm);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setExercises(data);
      }
    } catch (err) {
      console.error('Error loading exercises:', err);
    }
  };

  const loadMuscleGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${VITE_API_URL}/exercise-catalog/muscle-groups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMuscleGroups(data);
      }
    } catch (err) {
      console.error('Error loading muscle groups:', err);
    }
  };

  const handleOpenModal = (exercise = null) => {
    if (exercise) {
      setEditingExercise(exercise);
      setFormData({
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        description: exercise.description || '',
        videoUrl: exercise.videoUrl || ''
      });
    } else {
      setEditingExercise(null);
      setFormData({
        name: '',
        muscleGroup: '',
        description: '',
        videoUrl: ''
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingExercise(null);
    setFormData({
      name: '',
      muscleGroup: '',
      description: '',
      videoUrl: ''
    });
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const url = editingExercise 
        ? `${VITE_API_URL}/exercise-catalog/${editingExercise.id}`
        : `${VITE_API_URL}/exercise-catalog`;
      
      const method = editingExercise ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(editingExercise ? 'Ejercicio actualizado' : 'Ejercicio creado');
        handleCloseModal();
        loadData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al guardar ejercicio');
      }
    } catch (err) {
      setError('Error de red');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este ejercicio?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${VITE_API_URL}/exercise-catalog/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('Ejercicio eliminado');
        loadData();
      } else {
        setError('Error al eliminar ejercicio');
      }
    } catch (err) {
      setError('Error de red');
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 3, background: '#181818', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FitnessCenterIcon sx={{ fontSize: 40, color: '#ffd700' }} />
          <Typography variant="h4" sx={{ color: '#ffd700', fontWeight: 700 }}>
            Catálogo de Ejercicios
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            color: '#fff',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
            }
          }}
        >
          Nuevo Ejercicio
        </Button>
      </Box>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Filtros */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 3,
        flexWrap: 'wrap'
      }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel sx={{ color: '#aaa' }}>Filtrar por grupo</InputLabel>
          <Select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            label="Filtrar por grupo"
            sx={{
              color: '#fff',
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.23)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
            }}
          >
            <MenuItem value="">Todos los grupos</MenuItem>
            {muscleGroups.map((group, index) => (
              <MenuItem key={index} value={group}>
                {group}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Buscar ejercicio"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            minWidth: 300,
            '& .MuiInputLabel-root': { color: '#aaa' },
            '& .MuiOutlinedInput-root': {
              color: '#fff',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.23)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
            },
          }}
        />
      </Box>

      {/* Tabla de ejercicios */}
      <TableContainer component={Paper} sx={{ background: '#222' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#2a2a2a' }}>
              <TableCell sx={{ color: '#ffd700', fontWeight: 700 }}>Nombre</TableCell>
              <TableCell sx={{ color: '#ffd700', fontWeight: 700 }}>Grupo Muscular</TableCell>
              <TableCell sx={{ color: '#ffd700', fontWeight: 700 }}>Descripción</TableCell>
              <TableCell sx={{ color: '#ffd700', fontWeight: 700 }}>Tipo</TableCell>
              <TableCell sx={{ color: '#ffd700', fontWeight: 700 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: '#aaa', py: 4 }}>
                  Cargando...
                </TableCell>
              </TableRow>
            ) : exercises.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: '#aaa', py: 4 }}>
                  No hay ejercicios. ¡Crea el primero!
                </TableCell>
              </TableRow>
            ) : (
              exercises.map((exercise) => (
                <TableRow 
                  key={exercise.id}
                  sx={{
                    '&:hover': {
                      background: 'rgba(255, 215, 0, 0.05)',
                    },
                  }}
                >
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>
                    {exercise.name}
                  </TableCell>
                  <TableCell sx={{ color: '#fff' }}>
                    <Chip 
                      label={exercise.muscleGroup} 
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#aaa', fontSize: '0.9em' }}>
                    {exercise.description || '-'}
                  </TableCell>
                  <TableCell sx={{ color: '#fff' }}>
                    <Chip 
                      label={exercise.isCustom ? 'Custom' : 'Sistema'} 
                      size="small"
                      color={exercise.isCustom ? 'warning' : 'success'}
                    />
                  </TableCell>
                  <TableCell>
                    {exercise.videoUrl && (
                      <IconButton
                        onClick={() => window.open(exercise.videoUrl, '_blank')}
                        sx={{ 
                          color: '#ff4444',
                          '&:hover': {
                            color: '#ff6666',
                            background: 'rgba(255, 68, 68, 0.1)'
                          }
                        }}
                        title="Ver video tutorial"
                      >
                        <span style={{ fontSize: '1.2em' }}>▶️</span>
                      </IconButton>
                    )}
                    <IconButton
                      onClick={() => handleOpenModal(exercise)}
                      sx={{ color: '#4caf50' }}
                      title="Editar ejercicio"
                    >
                      <EditIcon />
                    </IconButton>
                    {exercise.isCustom && (
                      <IconButton
                        onClick={() => handleDelete(exercise.id)}
                        sx={{ color: '#f44336' }}
                        title="Eliminar ejercicio"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal Crear/Editar */}
      <Dialog 
        open={openModal} 
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(145deg, #2a2a2a, #1f1f1f)',
            color: '#fff'
          }
        }}
      >
        <DialogTitle sx={{ color: '#ffd700', fontWeight: 700 }}>
          {editingExercise ? '✏️ Editar Ejercicio' : '➕ Nuevo Ejercicio'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Nombre del ejercicio *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              sx={{
                '& .MuiInputLabel-root': { color: '#aaa' },
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                },
              }}
            />

            <FormControl fullWidth required>
              <InputLabel sx={{ color: '#aaa' }}>Grupo muscular *</InputLabel>
              <Select
                value={formData.muscleGroup}
                onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value })}
                label="Grupo muscular *"
                sx={{
                  color: '#fff',
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                }}
              >
                {muscleGroups.map((group, index) => (
                  <MenuItem key={index} value={group}>
                    {group}
                  </MenuItem>
                ))}
                <MenuItem value="__NEW__" sx={{ color: '#4caf50', fontWeight: 600 }}>
                  + Agregar nuevo grupo
                </MenuItem>
              </Select>
            </FormControl>

            {formData.muscleGroup === '__NEW__' && (
              <TextField
                label="Nombre del nuevo grupo"
                onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value })}
                fullWidth
                sx={{
                  '& .MuiInputLabel-root': { color: '#aaa' },
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255, 215, 0, 0.5)' },
                    '&:hover fieldset': { borderColor: '#ffd700' },
                  },
                }}
              />
            )}

            <TextField
              label="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              sx={{
                '& .MuiInputLabel-root': { color: '#aaa' },
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                },
              }}
            />

            <Box>
              <TextField
                label="URL del video (opcional)"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                fullWidth
                placeholder="https://youtube.com/..."
                sx={{
                  '& .MuiInputLabel-root': { color: '#aaa' },
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  },
                }}
              />
              {formData.videoUrl && (
                <Button
                  startIcon={<span style={{ fontSize: '1.2em' }}>▶️</span>}
                  onClick={() => window.open(formData.videoUrl, '_blank')}
                  sx={{
                    mt: 1,
                    color: '#ff4444',
                    '&:hover': {
                      background: 'rgba(255, 68, 68, 0.1)',
                    }
                  }}
                >
                  Previsualizar Video
                </Button>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} sx={{ color: '#aaa' }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name || !formData.muscleGroup || formData.muscleGroup === '__NEW__'}
            sx={{
              background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
              color: '#1a1a1a',
              fontWeight: 700,
              '&:hover': {
                background: 'linear-gradient(135deg, #ffb300 0%, #ff8f00 100%)',
              }
            }}
          >
            {editingExercise ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExerciseCatalogManager;

