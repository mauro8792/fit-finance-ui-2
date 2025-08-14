/* eslint-disable react/prop-types */
import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  useTheme,
  Alert,
  DialogActions,
} from '@mui/material';
import { SportBasicForm } from './SportBasicForm';
import { SportPlansForm } from './SportPlansForm';
import { useSportsStore, useSportPlansStore } from '../../../hooks';
import { tokens } from '../../../theme';

const steps = [
  'Información Básica',
  'Configurar Planes'
];

export const SportWizard = ({ open, onClose, onComplete }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { create: createSport } = useSportsStore();
  const { create: createSportPlan } = useSportPlansStore();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Datos del wizard
  const [sportData, setSportData] = useState({
    name: '',
    description: ''
  });
  
  const [sportPlans, setSportPlans] = useState([
    {
      name: 'Plan Básico',
      weeklyFrequency: 2,
      monthlyFee: '',
      description: 'Plan básico para principiantes',
      isActive: true
    }
  ]);
  
  const [createdSportId, setCreatedSportId] = useState(null);

  const handleNext = useCallback(async () => {
    if (activeStep === 0) {
      // Validar datos básicos
      if (!sportData.name) {
        setError('Por favor completa el nombre de la disciplina');
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        // Crear el deporte y obtener su ID real
        const createdSport = await createSport(sportData);
        
        if (createdSport && createdSport.id) {
          setCreatedSportId(createdSport.id); // Usar el ID real del deporte creado
          setActiveStep(1);
          setLoading(false);
        } else {
          throw new Error('No se pudo obtener el ID del deporte creado');
        }
        
      } catch (error) {
        setError('Error al crear el deporte: ' + (error.message || 'Error desconocido'));
        setLoading(false);
        return;
      }
    } else if (activeStep === 1) {
      // Crear planes deportivos
      try {
        setLoading(true);
        setError('');
        
        const validPlans = sportPlans.filter(plan => 
          plan.name && plan.monthlyFee && plan.weeklyFrequency
        );
        
        if (validPlans.length === 0) {
          setError('Debe crear al menos un plan válido');
          setLoading(false);
          return;
        }
        
        // Crear cada plan
        for (const plan of validPlans) {
          await createSportPlan({
            ...plan,
            sportId: createdSportId,
          });
        }
        
        // Completar el wizard
        await onComplete?.();
        setActiveStep(0);
        setSportData({
          name: '',
          description: ''
        });
        setSportPlans([
          {
            name: 'Plan Básico',
            weeklyFrequency: 2,
            monthlyFee: '',
            description: 'Plan básico para principiantes',
            isActive: true
          }
        ]);
        setCreatedSportId(null);
        setError('');
        onClose?.();
        
      } catch (error) {
        setError('Error al crear los planes: ' + (error.message || 'Error desconocido'));
        setLoading(false);
        return;
      }
    }
  }, [activeStep, sportData, sportPlans, createSport, createSportPlan, createdSportId, onComplete, onClose]);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => prev - 1);
    setError('');
  }, []);

  const handleClose = useCallback(() => {
    setActiveStep(0);
    setSportData({
      name: '',
      description: ''
    });
    setSportPlans([
      {
        name: 'Plan Básico',
        weeklyFrequency: 2,
        monthlyFee: '',
        description: 'Plan básico para principiantes',
        isActive: true
      }
    ]);
    setCreatedSportId(null);
    setError('');
    onClose?.();
  }, [onClose]);

  const isStepValid = useCallback(() => {
    if (activeStep === 0) {
      return sportData.name && sportData.monthlyFee;
    } else if (activeStep === 1) {
      return sportPlans.some(plan => 
        plan.name && plan.monthlyFee && plan.weeklyFrequency
      );
    }
    return false;
  }, [activeStep, sportData, sportPlans]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            🏃‍♂️ Crear Nueva Disciplina
          </Typography>
        </Box>
        
        <Stepper activeStep={activeStep} sx={{ mt: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <SportBasicForm
            data={sportData}
            onChange={setSportData}
          />
        )}

        {activeStep === 1 && (
          <SportPlansForm
            sportData={sportData}
            plans={sportPlans}
            onChange={setSportPlans}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          Cancelar
        </Button>
        
        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            Anterior
          </Button>
        )}
        
        <Button
          onClick={handleNext}
          variant="contained"
          disabled={!isStepValid() || loading}
          sx={{
            minWidth: 120,
            backgroundColor: colors.orangeAccent[500],
            '&:hover': {
              backgroundColor: colors.orangeAccent[600],
            }
          }}
        >
          {loading ? 'Guardando...' : activeStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
