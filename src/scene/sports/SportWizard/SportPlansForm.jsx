/* eslint-disable react/prop-types */
import { 
  Box, 
  TextField, 
  Typography, 
  Alert,
  Card,
  CardContent,
  Button,
  Grid,
  IconButton,
  Chip,
  Divider,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FitnessCenter from '@mui/icons-material/FitnessCenter';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import { useTheme } from '@mui/material';
import { tokens } from '../../../theme';

export const SportPlansForm = ({ sportData, plans, onChange }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handlePlanChange = (index, field, value) => {
    const updatedPlans = [...plans];
    updatedPlans[index] = {
      ...updatedPlans[index],
      [field]: value
    };
    onChange(updatedPlans);
  };

  const addPlan = () => {
    const newPlan = {
      name: `Plan ${plans.length + 1}`,
      weeklyFrequency: 3,
      monthlyFee: '',
      description: '',
      isActive: true
    };
    onChange([...plans, newPlan]);
  };

  const removePlan = (index) => {
    if (plans.length > 1) {
      const updatedPlans = plans.filter((_, i) => i !== index);
      onChange(updatedPlans);
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

  return (
    <Box sx={{ mt: 2 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Paso 2:</strong> Configura los diferentes planes para <strong>{sportData.name}</strong>. 
          Puedes crear múltiples opciones con diferentes frecuencias y precios.
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Planes Disponibles
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addPlan}
          sx={{
            borderColor: colors.orangeAccent[500],
            color: colors.orangeAccent[500],
            '&:hover': {
              borderColor: colors.orangeAccent[600],
              backgroundColor: colors.orangeAccent[50],
            }
          }}
        >
          Agregar Plan
        </Button>
      </Box>

      <Grid container spacing={2}>
        {plans.map((plan, index) => (
          <Grid item xs={12} key={index}>
            <Card 
              sx={{ 
                border: `2px solid ${colors.grey[700]}`,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: colors.orangeAccent[500],
                  boxShadow: `0 4px 20px ${colors.orangeAccent[200]}20`
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Plan #{index + 1}
                    </Typography>
                    {plan.weeklyFrequency && (
                      <Chip
                        label={getFrequencyLabel(plan.weeklyFrequency)}
                        size="small"
                        sx={{
                          backgroundColor: getFrequencyColor(plan.weeklyFrequency),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                  </Box>
                  
                  {plans.length > 1 && (
                    <IconButton
                      onClick={() => removePlan(index)}
                      sx={{ 
                        color: colors.redAccent[500],
                        '&:hover': { backgroundColor: colors.redAccent[50] }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Nombre del Plan"
                      value={plan.name}
                      onChange={(e) => handlePlanChange(index, 'name', e.target.value)}
                      fullWidth
                      variant="outlined"
                      placeholder="ej: Plan Básico, Plan Intensivo"
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Frecuencia Semanal"
                      type="number"
                      value={plan.weeklyFrequency}
                      onChange={(e) => handlePlanChange(index, 'weeklyFrequency', parseInt(e.target.value) || 1)}
                      fullWidth
                      variant="outlined"
                      size="small"
                      inputProps={{ min: 1, max: 7 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FitnessCenter fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Precio Mensual"
                      type="number"
                      value={plan.monthlyFee}
                      onChange={(e) => handlePlanChange(index, 'monthlyFee', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                      inputProps={{ min: 0, step: "0.01" }}
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
                      label="Descripción del Plan"
                      value={plan.description}
                      onChange={(e) => handlePlanChange(index, 'description', e.target.value)}
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={2}
                      size="small"
                      placeholder="Describe las características de este plan..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 0.5 }}>
                            <DescriptionIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Alert severity="success">
        <Typography variant="body2">
          <strong>✨ Resumen:</strong> Se crearán {plans.filter(p => p.name && p.monthlyFee).length} planes 
          para la disciplina <strong>{sportData.name}</strong>. Los estudiantes podrán elegir entre estas opciones 
          al momento de inscribirse.
        </Typography>
      </Alert>
    </Box>
  );
};
