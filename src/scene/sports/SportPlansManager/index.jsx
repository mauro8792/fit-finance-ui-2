/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Container
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FitnessCenter as FitnessCenterIcon
} from '@mui/icons-material';

import { useSportPlansStore, useSportsStore } from '../../../hooks';
import { AddSportPlanModal } from '../AddSportPlan';

export const SportPlansManager = () => {
  const { findAllSportPlans, deleteSportPlan, sportPlans } = useSportPlansStore();
  const { findAllSports, sports } = useSportsStore();
  
  const [openAddModal, setOpenAddModal] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({
    open: false,
    sportPlan: null
  });

  useEffect(() => {
    const loadData = async () => {
      await findAllSportPlans();
      await findAllSports();
    };
    loadData();
  }, [findAllSportPlans, findAllSports]);

  const fetchData = async () => {
    await findAllSportPlans();
    await findAllSports();
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmDialog.sportPlan) {
      await deleteSportPlan(deleteConfirmDialog.sportPlan.id);
      setDeleteConfirmDialog({ open: false, sportPlan: null });
      fetchData();
    }
  };

  const getSportName = (sportId) => {
    const sport = sports.find(s => s.id === sportId);
    return sport ? sport.name : 'Deporte no encontrado';
  };

  const getFrequencyText = (frequency) => {
    if (frequency === 1) return '1 vez por semana';
    if (frequency === 2) return '2 veces por semana';
    if (frequency === 3) return '3 veces por semana';
    return `${frequency} veces por semana`;
  };

  const groupedPlans = sportPlans.reduce((acc, plan) => {
    const sportName = getSportName(plan.sportId);
    if (!acc[sportName]) {
      acc[sportName] = [];
    }
    acc[sportName].push(plan);
    return acc;
  }, {});

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Planes de Disciplinas
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Administra los diferentes planes de precios y frecuencias para cada disciplina
        </Typography>
      </Box>

      {Object.keys(groupedPlans).length === 0 ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            mt: 8,
            textAlign: 'center'
          }}
        >
          <FitnessCenterIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay planes creados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Comienza creando tu primer plan de disciplina
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddModal(true)}
            size="large"
          >
            Crear Primer Plan
          </Button>
        </Box>
      ) : (
        Object.entries(groupedPlans).map(([sportName, plans]) => (
          <Box key={sportName} sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
              {sportName}
            </Typography>
            <Grid container spacing={2}>
              {plans.map((plan) => (
                <Grid item xs={12} sm={6} md={4} key={plan.id}>
                  <Card sx={{ height: '100%', position: 'relative' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="h3" noWrap>
                          {plan.name}
                        </Typography>
                        <Chip 
                          label={plan.isActive ? 'Activo' : 'Inactivo'} 
                          color={plan.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {getFrequencyText(plan.weeklyFrequency)}
                      </Typography>
                      
                      <Typography variant="h5" color="primary" sx={{ mb: 1 }}>
                        ${plan.monthlyFee}
                        <Typography component="span" variant="body2" color="text.secondary">
                          /mes
                        </Typography>
                      </Typography>
                      
                      {plan.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {plan.description}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <IconButton 
                          size="small" 
                          color="primary"
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => setDeleteConfirmDialog({ open: true, sportPlan: plan })}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}

      {/* FAB para agregar nuevo plan */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setOpenAddModal(true)}
      >
        <AddIcon />
      </Fab>

      {/* Modal para agregar plan */}
      <AddSportPlanModal
        openModal={openAddModal}
        setOpenModal={setOpenAddModal}
        fetchSportPlans={fetchData}
      />

      {/* Dialog de confirmación para eliminar */}
      <Dialog
        open={deleteConfirmDialog.open}
        onClose={() => setDeleteConfirmDialog({ open: false, sportPlan: null })}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar el plan &ldquo;{deleteConfirmDialog.sportPlan?.name}&rdquo;?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialog({ open: false, sportPlan: null })}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
