import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  PersonOff as PersonOffIcon,
  Person as PersonIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useStudentsStore, useSportsStore, useCoachesStore } from '../../hooks';
import StudentWizard from './StudentWizard';
import ViewStudent from './ViewStudent';

const AdminStudents = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [openWizard, setOpenWizard] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const {
    students,
    loading,
    error,
    fetchStudents,
    toggleStudentActive,
    clearError,
  } = useStudentsStore();

  const { findAllSports } = useSportsStore();
  const { fetchCoaches } = useCoachesStore();

  useEffect(() => {
    fetchStudents();
    findAllSports();
    fetchCoaches();
  }, [fetchStudents, findAllSports, fetchCoaches]);

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    
    const searchLower = searchTerm.toLowerCase();
    return students.filter(student => 
      student.user?.fullName?.toLowerCase().includes(searchLower) ||
      student.user?.email?.toLowerCase().includes(searchLower) ||
      student.firstName?.toLowerCase().includes(searchLower) ||
      student.lastName?.toLowerCase().includes(searchLower) ||
      student.document?.toLowerCase().includes(searchLower) ||
      student.sport?.name?.toLowerCase().includes(searchLower)
    );
  }, [students, searchTerm]);

  const handleViewStudent = (studentId) => {
    setSelectedStudentId(studentId);
    setOpenView(true);
  };

  const handleEditStudent = (studentId) => {
    navigate(`/admin-students/edit/${studentId}`);
  };

  const handleToggleActive = async (studentId) => {
    try {
      await toggleStudentActive(studentId);
    } catch (error) {
      console.error('Error al cambiar estado del estudiante:', error);
    }
  };

  const renderStudentCard = (student) => (
    <Grid item xs={12} sm={6} md={4} key={student.id}>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
          },
          opacity: student.isActive ? 1 : 0.7,
        }}
      >
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header with Avatar and Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
              {(student.user?.fullName || student.firstName)?.charAt(0) || 'S'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {student.user?.fullName || `${student.firstName} ${student.lastName}`}
              </Typography>
              <Chip
                size="small"
                label={student.isActive ? 'Activo' : 'Inactivo'}
                color={student.isActive ? 'success' : 'default'}
                sx={{ fontSize: '0.75rem' }}
              />
            </Box>
          </Box>

          {/* Student Info */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              <strong>Email:</strong> {student.user?.email || 'No disponible'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              <strong>Documento:</strong> {student.document || 'No disponible'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Teléfono:</strong> {student.phone || 'No disponible'}
            </Typography>
          </Box>

          {/* Sport and Plan */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Deporte:</strong>
            </Typography>
            {student.sport ? (
              <Chip
                icon={<SchoolIcon />}
                label={student.sport.name}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ mb: 1 }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Sin deporte asignado
              </Typography>
            )}
            
            {student.sportPlan && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Plan:</strong> {student.sportPlan.name}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Coach */}
          {student.coach && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>Coach:</strong> {student.coach.user?.fullName || 'No asignado'}
            </Typography>
          )}

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
            <Tooltip title="Ver detalles">
              <IconButton
                size="small"
                onClick={() => handleViewStudent(student.id)}
                sx={{ color: theme.palette.info.main }}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar">
              <IconButton
                size="small"
                onClick={() => handleEditStudent(student.id)}
                sx={{ color: theme.palette.warning.main }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={student.isActive ? 'Desactivar' : 'Activar'}>
              <IconButton
                size="small"
                onClick={() => handleToggleActive(student.id)}
                sx={{ 
                  color: student.isActive ? theme.palette.error.main : theme.palette.success.main 
                }}
              >
                {student.isActive ? <PersonOffIcon /> : <PersonIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  if (loading && students.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Cargando estudiantes...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Gestión de Estudiantes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra los estudiantes del gimnasio, sus datos personales y asignaciones de deportes.
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ px: 3, py: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              {students.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Estudiantes
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ px: 3, py: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
              {students.filter(student => student.isActive).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Activos
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ px: 3, py: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
              {new Set(students.map(student => student.sport?.id).filter(Boolean)).size}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Deportes Únicos
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ px: 3, py: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
              {students.filter(student => !student.isActive).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Inactivos
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar estudiantes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, minWidth: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenWizard(true)}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Asignar Usuario Existente
        </Button>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin-students/new')}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Crear Nuevo Estudiante
        </Button>
      </Box>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? 'No se encontraron estudiantes que coincidan con la búsqueda' : 'No hay estudiantes registrados'}
          </Typography>
          {!searchTerm && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Comienza agregando tu primer estudiante
            </Typography>
          )}
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredStudents.map(renderStudentCard)}
        </Grid>
      )}

      {/* Modals */}
      <StudentWizard
        open={openWizard}
        onClose={() => setOpenWizard(false)}
      />

      <ViewStudent
        open={openView}
        onClose={() => setOpenView(false)}
        studentId={selectedStudentId}
      />

    </Box>
  );
};

export default AdminStudents;
