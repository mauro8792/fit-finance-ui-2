/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  useTheme,
  Box,
  Typography,
  Tab,
  Tabs,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AttachMoney as AttachMoneyIcon,
  Sports as SportsIcon,
  FitnessCenter as FitnessCenterIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { tokens } from '../../../theme';
import { useSportPlansStore } from '../../../hooks';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`edit-tabpanel-${index}`}
      aria-labelledby={`edit-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const UpdateSportModal = ({ 
  openModal, 
  setOpenModal, 
  sportSelected, 
  onSaveChanges, 
  setSportSelected,
  onComplete // Nueva prop para recargar deportes
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { create: createSportPlan, update: updateSportPlan, deleteSportPlan } = useSportPlansStore();

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estado para el deporte
  const [sportData, setSportData] = useState({
    id: '',
    name: '',
    description: '',
  });

  // Estado para los planes
  const [sportPlans, setSportPlans] = useState([]);

  // Inicializar datos cuando se abre el modal
  useEffect(() => {
    if (sportSelected) {
      setSportData({
        id: sportSelected.id || '',
        name: sportSelected.name || '',
        description: sportSelected.description || '',
      });

      // Cargar los planes existentes
      setSportPlans(sportSelected.sportPlans || []);
    }
  }, [sportSelected]);

  const handleCloseModal = () => {
    setOpenModal(false);
    setSportSelected(null);
    setSportData({});
    setSportPlans([]);
    setTabValue(0);
    setError('');
  };

  const handleSportInputChange = (e) => {
    const { name, value } = e.target;
    setSportData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlanInputChange = (index, field, value) => {
    setSportPlans((prev) => 
      prev.map((plan, i) => 
        i === index ? { ...plan, [field]: value } : plan
      )
    );
  };

  const addNewPlan = () => {
    setSportPlans((prev) => [
      ...prev,
      {
        name: `Plan ${prev.length + 1}`,
        weeklyFrequency: 2,
        monthlyFee: '',
        description: '',
        isActive: true,
        isNew: true, // Marca para saber que es nuevo
      },
    ]);
  };

  const removePlan = async (index) => {
    const plan = sportPlans[index];
    
    try {
      // Si el plan tiene ID, eliminarlo del backend
      if (plan.id) {
        await deleteSportPlan(plan.id);
      }
      
      // Remover del estado local
      setSportPlans((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting plan:', error);
      setError('Error al eliminar el plan');
    }
  };

  const getFrequencyColor = (frequency) => {
    if (frequency <= 2) return colors.blueAccent[500];
    if (frequency <= 4) return colors.greenAccent[500];
    if (frequency <= 6) return colors.orangeAccent[500];
    return colors.redAccent[500];
  };

  const getFrequencyLabel = (frequency) => {
    if (frequency <= 2) return 'Básico';
    if (frequency <= 4) return 'Intermedio';
    if (frequency <= 6) return 'Avanzado';
    return 'Intensivo';
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      setError('');

      // Validar datos del deporte
      if (!sportData.name) {
        setError('Por favor completa el nombre de la disciplina');
        setLoading(false);
        return;
      }

      // Guardar cambios del deporte
      await onSaveChanges(sportData);

      // Procesar planes
      for (const plan of sportPlans) {
        console.log('Processing plan:', plan); // Para debug
        
        if (!plan.name || !plan.monthlyFee || !plan.weeklyFrequency) {
          console.log('Skipping incomplete plan:', plan); // Para debug
          continue; // Saltar planes incompletos
        }

        const planData = {
          name: plan.name,
          weeklyFrequency: parseInt(plan.weeklyFrequency),
          monthlyFee: parseFloat(plan.monthlyFee),
          description: plan.description || '',
          isActive: plan.isActive !== undefined ? plan.isActive : true,
          sportId: sportData.id,
        };

        console.log('Plan data to save:', planData); // Para debug

        try {
          if (plan.isNew) {
            // Crear nuevo plan
            console.log('Creating new plan...'); // Para debug
            await createSportPlan(planData);
          } else if (plan.id) {
            // Actualizar plan existente
            console.log('Updating existing plan with ID:', plan.id); // Para debug
            await updateSportPlan({ id: plan.id, ...planData });
          } else {
            console.log('Plan skipped - no ID and not marked as new:', plan); // Para debug
          }
        } catch (planError) {
          console.error('Error processing plan:', planError);
          throw new Error(`Error procesando plan "${plan.name}": ${planError.message}`);
        }
      }

      // Recargar deportes para reflejar los cambios
      if (onComplete) {
        await onComplete();
      }

      setOpenModal(false);
      setLoading(false);
    } catch (error) {
      setError('Error al guardar los cambios: ' + (error.message || 'Error desconocido'));
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={openModal} 
      onClose={handleCloseModal} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SportsIcon sx={{ color: colors.orangeAccent[500], fontSize: 32 }} />
          <Box>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              Editar Disciplina
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Modifica la información y planes de la disciplina
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Información Básica" />
            <Tab label={`Planes (${sportPlans.length})`} />
          </Tabs>
        </Box>

        {/* Tab 1: Información del Deporte */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nombre de la Disciplina"
                name="name"
                value={sportData.name}
                onChange={handleSportInputChange}
                variant="outlined"
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SportsIcon sx={{ color: colors.grey[500] }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descripción"
                name="description"
                value={sportData.description}
                onChange={handleSportInputChange}
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                placeholder="Describe la disciplina deportiva..."
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Planes */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FitnessCenterIcon /> Planes de Entrenamiento
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addNewPlan}
              variant="contained"
              sx={{
                backgroundColor: colors.blueAccent[500],
                '&:hover': { backgroundColor: colors.blueAccent[600] }
              }}
            >
              Agregar Plan
            </Button>
          </Box>

          {sportPlans.length === 0 ? (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 4,
                backgroundColor: colors.grey[100],
                borderRadius: 2,
                border: `1px dashed ${colors.grey[400]}`
              }}
            >
              <FitnessCenterIcon sx={{ fontSize: 48, color: colors.grey[400], mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                No hay planes configurados
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Haz clic en &ldquo;Agregar Plan&rdquo; para crear el primer plan
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {sportPlans.map((plan, index) => (
                <Grid item xs={12} md={6} key={plan.id || index}>
                  <Card 
                    sx={{ 
                      border: `2px solid ${getFrequencyColor(plan.weeklyFrequency)}`,
                      borderRadius: 2,
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Chip
                          label={getFrequencyLabel(plan.weeklyFrequency)}
                          size="small"
                          sx={{
                            backgroundColor: getFrequencyColor(plan.weeklyFrequency),
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removePlan(index)}
                          sx={{ color: colors.redAccent[500] }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            label="Nombre del Plan"
                            value={plan.name}
                            onChange={(e) => handlePlanInputChange(index, 'name', e.target.value)}
                            variant="outlined"
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Frecuencia Semanal"
                            value={plan.weeklyFrequency}
                            onChange={(e) => handlePlanInputChange(index, 'weeklyFrequency', e.target.value)}
                            variant="outlined"
                            fullWidth
                            size="small"
                            type="number"
                            inputProps={{ min: 1, max: 7 }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EventIcon fontSize="small" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Precio Mensual"
                            value={plan.monthlyFee}
                            onChange={(e) => handlePlanInputChange(index, 'monthlyFee', e.target.value)}
                            variant="outlined"
                            fullWidth
                            size="small"
                            type="number"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <AttachMoneyIcon fontSize="small" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Descripción"
                            value={plan.description}
                            onChange={(e) => handlePlanInputChange(index, 'description', e.target.value)}
                            variant="outlined"
                            fullWidth
                            size="small"
                            multiline
                            rows={2}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleCloseModal} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSaveChanges} 
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: colors.greenAccent[500],
            '&:hover': { backgroundColor: colors.greenAccent[600] }
          }}
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
