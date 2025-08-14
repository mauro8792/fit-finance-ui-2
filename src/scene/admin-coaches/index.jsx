import React, { useState, useEffect, useMemo } from 'react';
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
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useCoachesStore, useSportsStore } from '../../hooks';
import CoachWizard from './CoachWizard';
import NewCoachWizard from './NewCoachWizard';
import ViewCoach from './ViewCoach';
import UpdateCoach from './UpdateCoach';

const AdminCoaches = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [openWizard, setOpenWizard] = useState(false);
  const [openNewWizard, setOpenNewWizard] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState(null);

  const {
    coaches,
    loading,
    error,
    fetchCoaches,
    toggleCoachActive,
    clearError,
  } = useCoachesStore();

  const { sports, findAllSports } = useSportsStore();

  useEffect(() => {
    fetchCoaches();
    findAllSports();
  }, [fetchCoaches, findAllSports]);

  // Filter coaches based on search term
  const filteredCoaches = useMemo(() => {
    if (!searchTerm) return coaches;
    
    const searchLower = searchTerm.toLowerCase();
    return coaches.filter(coach => 
      coach.user?.fullName?.toLowerCase().includes(searchLower) ||
      coach.user?.email?.toLowerCase().includes(searchLower) ||
      coach.specialization?.toLowerCase().includes(searchLower) ||
      coach.sports?.some(sport => sport.name.toLowerCase().includes(searchLower))
    );
  }, [coaches, searchTerm]);

  const handleViewCoach = (coachId) => {
    setSelectedCoachId(coachId);
    setOpenView(true);
  };

  const handleEditCoach = (coachId) => {
    setSelectedCoachId(coachId);
    setOpenEdit(true);
  };

  const handleToggleActive = async (coachId) => {
    try {
      await toggleCoachActive(coachId);
    } catch (error) {
      console.error('Error al cambiar estado del coach:', error);
    }
  };

  const renderCoachCard = (coach) => (
    <Grid item xs={12} sm={6} md={4} key={coach.id}>
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
          opacity: coach.isActive ? 1 : 0.7,
        }}
      >
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header with Avatar and Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
              {coach.user?.fullName?.charAt(0) || 'C'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {coach.user?.fullName}
              </Typography>
              <Chip
                size="small"
                label={coach.isActive ? 'Activo' : 'Inactivo'}
                color={coach.isActive ? 'success' : 'default'}
                sx={{ fontSize: '0.75rem' }}
              />
            </Box>
          </Box>

          {/* Coach Info */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              <strong>Email:</strong> {coach.user?.email}
            </Typography>
            {coach.specialization && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                <strong>Especialización:</strong> {coach.specialization}
              </Typography>
            )}
            {coach.experience && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                <strong>Experiencia:</strong> {coach.experience}
              </Typography>
            )}
            {coach.salary && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                <strong>Salario:</strong> ${parseFloat(coach.salary).toLocaleString()}
              </Typography>
            )}
          </Box>

          {/* Sports */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Deportes ({coach.sports?.length || 0}):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {coach.sports?.length > 0 ? (
                coach.sports.slice(0, 3).map((sport) => (
                  <Chip
                    key={sport.id}
                    label={sport.name}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sin deportes asignados
                </Typography>
              )}
              {coach.sports?.length > 3 && (
                <Chip
                  label={`+${coach.sports.length - 3} más`}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              )}
            </Box>
          </Box>

          {/* Students Count */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Estudiantes:</strong> {coach.students?.length || 0}
          </Typography>

          {/* Actions */}
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            mt: 'auto',
            justifyContent: 'space-between',
            flexWrap: 'wrap'
          }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Ver detalles">
                <IconButton
                  size="small"
                  onClick={() => handleViewCoach(coach.id)}
                  sx={{ color: theme.palette.info.main }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Editar">
                <IconButton
                  size="small"
                  onClick={() => handleEditCoach(coach.id)}
                  sx={{ color: theme.palette.warning.main }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Tooltip title={coach.isActive ? 'Desactivar' : 'Activar'}>
              <IconButton
                size="small"
                onClick={() => handleToggleActive(coach.id)}
                sx={{ 
                  color: coach.isActive 
                    ? theme.palette.error.main 
                    : theme.palette.success.main 
                }}
              >
                {coach.isActive ? <PersonOffIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Administración de Coaches
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona los coaches del gimnasio, sus especializaciones y asignaciones de deportes
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Actions Bar */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 3, 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' }
      }}>
        <TextField
          placeholder="Buscar coaches..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenNewWizard(true)}
          sx={{ 
            minWidth: { xs: '100%', sm: 'auto' },
            py: 1.5
          }}
        >
          Nuevo Coach
        </Button>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ px: 3, py: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            {coaches.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Coaches
          </Typography>
        </Card>
        <Card sx={{ px: 3, py: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
            {coaches.filter(coach => coach.isActive).length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Activos
          </Typography>
        </Card>
        <Card sx={{ px: 3, py: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
            {coaches.reduce((total, coach) => total + (coach.students?.length || 0), 0)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Estudiantes
          </Typography>
        </Card>
      </Box>

      {/* Coaches Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography>Cargando coaches...</Typography>
        </Box>
      ) : filteredCoaches.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? 'No se encontraron coaches' : 'No hay coaches registrados'}
          </Typography>
          {!searchTerm && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenNewWizard(true)}
              sx={{ mt: 2 }}
            >
              Crear Primer Coach
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredCoaches.map(renderCoachCard)}
        </Grid>
      )}

      {/* Modals */}
      <CoachWizard
        open={openWizard}
        onClose={() => setOpenWizard(false)}
      />

      <NewCoachWizard
        open={openNewWizard}
        onClose={() => setOpenNewWizard(false)}
      />

      <ViewCoach
        open={openView}
        onClose={() => setOpenView(false)}
        coachId={selectedCoachId}
      />

      <UpdateCoach
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        coachId={selectedCoachId}
      />
    </Box>
  );
};

export default AdminCoaches;
