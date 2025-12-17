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
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
  Fab
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { getEnvVariables } from '../../helpers';

const { VITE_API_URL } = getEnvVariables();

const ExerciseCatalogManager = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [exercises, setExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [importing, setImporting] = useState(false);
  
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

  const handleImportBase = async () => {
    setImporting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${VITE_API_URL}/exercise-catalog/import-base`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.skipped) {
          setError(data.message);
        } else {
          setSuccess(`✅ ${data.message}`);
          loadData();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al importar ejercicios');
      }
    } catch (err) {
      setError('Error de red');
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: '#181818', minHeight: '100vh', pb: isMobile ? 12 : 3 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FitnessCenterIcon sx={{ fontSize: { xs: 28, md: 40 }, color: '#ffd700' }} />
          <Typography variant="h4" sx={{ color: '#ffd700', fontWeight: 700, fontSize: { xs: '1.3rem', md: '2rem' } }}>
            {isMobile ? 'Ejercicios' : 'Catálogo de Ejercicios'}
          </Typography>
        </Box>
        {!isMobile && (
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
        )}
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
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
      }}>
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          style={{
            minWidth: isMobile ? '100%' : '200px',
            padding: isMobile ? '10px 12px' : '14px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.23)',
            background: '#1a1a1a',
            color: '#fff',
            fontSize: '1rem',
          }}
        >
          <option value="">Todos los grupos</option>
          {muscleGroups.map((group, index) => (
            <option key={index} value={group}>{group}</option>
          ))}
        </select>

        <TextField
          label="Buscar ejercicio"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size={isMobile ? 'small' : 'medium'}
          sx={{
            flex: 1,
            minWidth: { xs: '100%', sm: 200 },
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

      {/* Loading state */}
      {loading && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress size={40} sx={{ color: '#ffd700' }} />
          <Typography sx={{ mt: 2, color: '#aaa' }}>Cargando ejercicios...</Typography>
        </Box>
      )}

      {/* Empty state */}
      {!loading && exercises.length === 0 && (
        <Card sx={{ 
          maxWidth: 500, 
          mx: 'auto', 
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)',
          border: '2px dashed rgba(255, 215, 0, 0.3)',
        }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <FitnessCenterIcon sx={{ fontSize: 60, color: '#ffd700', mb: 2, opacity: 0.7 }} />
            <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
              Tu biblioteca está vacía
            </Typography>
            <Typography sx={{ color: '#aaa', mb: 3, px: 2 }}>
              Podés crear tus propios ejercicios o importar una base de 70 ejercicios para empezar.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={importing ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                onClick={handleImportBase}
                disabled={importing}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                  },
                  '&:disabled': {
                    background: '#555',
                    color: '#888',
                  }
                }}
              >
                {importing ? 'Importando...' : 'Importar ejercicios base'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenModal()}
                sx={{
                  borderColor: '#ffd700',
                  color: '#ffd700',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#ffb300',
                    background: 'rgba(255, 215, 0, 0.1)',
                  }
                }}
              >
                Crear desde cero
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Desktop: Tabla */}
      {!loading && exercises.length > 0 && !isMobile && (
        <TableContainer component={Paper} sx={{ background: '#222' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: '#2a2a2a' }}>
                <TableCell sx={{ color: '#ffd700', fontWeight: 700 }}>Nombre</TableCell>
                <TableCell sx={{ color: '#ffd700', fontWeight: 700 }}>Grupo Muscular</TableCell>
                <TableCell sx={{ color: '#ffd700', fontWeight: 700 }}>Descripción</TableCell>
                <TableCell sx={{ color: '#ffd700', fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exercises.map((exercise) => (
                <TableRow 
                  key={exercise.id}
                  sx={{ '&:hover': { background: 'rgba(255, 215, 0, 0.05)' } }}
                >
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>
                    {exercise.name}
                  </TableCell>
                  <TableCell>
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
                  <TableCell>
                    {exercise.videoUrl && (
                      <IconButton
                        onClick={() => window.open(exercise.videoUrl, '_blank')}
                        sx={{ color: '#ff4444' }}
                        title="Ver video"
                      >
                        <PlayArrowIcon />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={() => handleOpenModal(exercise)}
                      sx={{ color: '#4caf50' }}
                      title="Editar"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(exercise.id)}
                      sx={{ color: '#f44336' }}
                      title="Eliminar"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Mobile: Cards */}
      {!loading && exercises.length > 0 && isMobile && (
        <>
          <Grid container spacing={2}>
            {exercises.map((exercise) => (
              <Grid item xs={12} key={exercise.id}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                }}>
                  <CardContent sx={{ pb: '12px !important' }}>
                    {/* Header: Nombre y grupo muscular */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>
                          {exercise.name}
                        </Typography>
                        <Chip 
                          label={exercise.muscleGroup} 
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: 24,
                          }}
                        />
                      </Box>
                      
                      {/* Acciones */}
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {exercise.videoUrl && (
                          <IconButton
                            size="small"
                            onClick={() => window.open(exercise.videoUrl, '_blank')}
                            sx={{ 
                              color: '#ff4444',
                              bgcolor: 'rgba(255, 68, 68, 0.1)',
                              '&:hover': { bgcolor: 'rgba(255, 68, 68, 0.2)' }
                            }}
                          >
                            <PlayArrowIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleOpenModal(exercise)}
                          sx={{ 
                            color: '#4caf50',
                            bgcolor: 'rgba(76, 175, 80, 0.1)',
                            '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.2)' }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(exercise.id)}
                          sx={{ 
                            color: '#f44336',
                            bgcolor: 'rgba(244, 67, 54, 0.1)',
                            '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.2)' }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    {/* Descripción */}
                    {exercise.description && (
                      <Typography sx={{ color: '#888', fontSize: '0.85rem', mt: 1 }}>
                        {exercise.description}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* FAB para agregar en mobile */}
          <Fab
            color="primary"
            onClick={() => handleOpenModal()}
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 16,
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
              }
            }}
          >
            <AddIcon />
          </Fab>
        </>
      )}

      {/* Modal Crear/Editar - HTML nativo para PWA */}
      {openModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div
            style={{
              background: 'linear-gradient(145deg, #2a2a2a, #1f1f1f)',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ 
              padding: '16px 20px', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <h2 style={{ margin: 0, color: '#ffd700', fontSize: '1.25rem' }}>
                {editingExercise ? '✏️ Editar Ejercicio' : '➕ Nuevo Ejercicio'}
              </h2>
            </div>

            {/* Form */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Nombre */}
              <div>
                <label style={{ display: 'block', color: '#aaa', marginBottom: '6px', fontSize: '0.875rem' }}>
                  Nombre del ejercicio *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Press banca"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.23)',
                    background: '#1a1a1a',
                    color: '#fff',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Grupo muscular */}
              <div>
                <label style={{ display: 'block', color: '#aaa', marginBottom: '6px', fontSize: '0.875rem' }}>
                  Grupo muscular *
                </label>
                <select
                  value={formData.muscleGroup}
                  onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.23)',
                    background: '#1a1a1a',
                    color: '#fff',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">Seleccionar grupo...</option>
                  {muscleGroups.map((group, index) => (
                    <option key={index} value={group}>{group}</option>
                  ))}
                  <option value="__NEW__">+ Agregar nuevo grupo</option>
                </select>
              </div>

              {/* Nuevo grupo muscular */}
              {formData.muscleGroup === '__NEW__' && (
                <div>
                  <label style={{ display: 'block', color: '#ffd700', marginBottom: '6px', fontSize: '0.875rem' }}>
                    Nombre del nuevo grupo
                  </label>
                  <input
                    type="text"
                    onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value })}
                    placeholder="Ej: Trapecio"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #ffd700',
                      background: '#1a1a1a',
                      color: '#fff',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}

              {/* Descripción */}
              <div>
                <label style={{ display: 'block', color: '#aaa', marginBottom: '6px', fontSize: '0.875rem' }}>
                  Descripción (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descripción del ejercicio..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.23)',
                    background: '#1a1a1a',
                    color: '#fff',
                    fontSize: '1rem',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Video URL */}
              <div>
                <label style={{ display: 'block', color: '#aaa', marginBottom: '6px', fontSize: '0.875rem' }}>
                  URL del video (opcional)
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.23)',
                    background: '#1a1a1a',
                    color: '#fff',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
                {formData.videoUrl && (
                  <button
                    type="button"
                    onClick={() => window.open(formData.videoUrl, '_blank')}
                    style={{
                      marginTop: '8px',
                      padding: '8px 16px',
                      background: 'transparent',
                      border: 'none',
                      color: '#ff4444',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    ▶️ Ver video
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ 
              padding: '16px 20px', 
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
            }}>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!formData.name || !formData.muscleGroup || formData.muscleGroup === '__NEW__'}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: (!formData.name || !formData.muscleGroup || formData.muscleGroup === '__NEW__') 
                    ? '#555' 
                    : 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
                  color: (!formData.name || !formData.muscleGroup || formData.muscleGroup === '__NEW__') 
                    ? '#888' 
                    : '#1a1a1a',
                  cursor: (!formData.name || !formData.muscleGroup || formData.muscleGroup === '__NEW__') 
                    ? 'not-allowed' 
                    : 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                }}
              >
                {editingExercise ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Box>
  );
};

export default ExerciseCatalogManager;

