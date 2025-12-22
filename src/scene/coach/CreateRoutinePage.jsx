import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Autocomplete,
  Divider,
  Tooltip,
  Collapse,
  useMediaQuery,
  MobileStepper,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  FitnessCenter as FitnessCenterIcon,
  CalendarMonth as CalendarIcon,
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Hotel as HotelIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { createCompleteRoutine as createCompleteRoutineAPI } from '../../api/fitFinanceApi';
import { getEnvVariables } from '../../helpers';

const { VITE_API_URL } = getEnvVariables();

const steps = ['Macrociclo', 'Mesociclos', 'Microciclos', 'Preview', 'Crear'];

const CreateRoutinePage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [existingMacrocycles, setExistingMacrocycles] = useState([]);
  
  // Catálogo de ejercicios
  const [exerciseCatalog, setExerciseCatalog] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  
  // Estado del wizard
  const [wizardData, setWizardData] = useState({
    macrocycle: {
      nombre: '',
      fechaInicio: '',
      objetivo: '',
      numero: null, // Número opcional para continuar numeración
    },
    cantidadMesociclos: 1,
    mesociclos: [],
    microciclos: [],
  });

  // Cargar ejercicios del catálogo
  useEffect(() => {
    const loadExerciseCatalog = async () => {
      setLoadingExercises(true);
      try {
        const token = localStorage.getItem('token');
        console.log('🔍 Cargando catálogo de ejercicios...');
        const response = await fetch(`${VITE_API_URL}/exercise-catalog`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          let data = await response.json();
          console.log('✅ Ejercicios cargados:', data.length);
          
          // Si no hay ejercicios, importar los base automáticamente
          if (data.length === 0) {
            console.log('📦 No hay ejercicios, importando base...');
            const importResponse = await fetch(`${VITE_API_URL}/exercise-catalog/import-base`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (importResponse.ok) {
              const importResult = await importResponse.json();
              console.log('✅ Ejercicios importados:', importResult);
              
              // Recargar el catálogo
              const reloadResponse = await fetch(`${VITE_API_URL}/exercise-catalog`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (reloadResponse.ok) {
                data = await reloadResponse.json();
                console.log('✅ Ejercicios recargados:', data.length);
              }
            }
          }
          
          setExerciseCatalog(data);
          
          // Extraer grupos musculares únicos
          const groups = [...new Set(data.map(e => e.muscleGroup).filter(Boolean))];
          console.log('✅ Grupos musculares:', groups);
          setMuscleGroups(groups);
        } else {
          console.error('❌ Error response:', response.status);
        }
      } catch (err) {
        console.error('❌ Error loading exercises:', err);
      } finally {
        setLoadingExercises(false);
      }
    };

    const loadStudentInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${VITE_API_URL}/students/${studentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStudentName(data.user?.fullName || `${data.firstName} ${data.lastName}`);
        }
      } catch (err) {
        console.error('Error loading student:', err);
      }
    };

    const loadExistingMacrocycles = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${VITE_API_URL}/macrocycle/student/${studentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setExistingMacrocycles(data || []);
          console.log('📋 Macrociclos existentes:', data?.length || 0);
        }
      } catch (err) {
        console.error('Error loading macrocycles:', err);
      }
    };

    if (studentId) {
      loadExerciseCatalog();
      loadStudentInfo();
      loadExistingMacrocycles();
    }
  }, [studentId]);

  // Inicializar mesociclos cuando cambia la cantidad
  useEffect(() => {
    const cantidad = wizardData.cantidadMesociclos;
    if (cantidad > 0 && wizardData.mesociclos.length !== cantidad) {
      const nuevosMesociclos = Array.from({ length: cantidad }, (_, i) => ({
        nombre: `Mesociclo ${i + 1}`,
        fechaInicio: '',
        objetivo: ''
      }));
      setWizardData(prev => ({ ...prev, mesociclos: nuevosMesociclos }));
    }
  }, [wizardData.cantidadMesociclos]);

  // Validación por paso
  const validateStep = (step) => {
    switch (step) {
      case 0: {
        const { nombre, fechaInicio, objetivo } = wizardData.macrocycle;
        return nombre?.trim() && fechaInicio && objetivo?.trim();
      }
      case 1:
        return wizardData.mesociclos.length > 0 &&
               wizardData.mesociclos.every(m => m.fechaInicio && m.objetivo?.trim());
      case 2: {
        // Verificar que cada mesociclo tenga al menos un día con ejercicios completos
        return wizardData.microciclos.length > 0 &&
               wizardData.microciclos.every(micro => {
                 if (!micro.cantidadMicrociclos || micro.cantidadMicrociclos < 1) return false;
                 // Al menos un día debe tener ejercicios con nombre
                 const diasConEjercicios = micro.plantillaDias?.filter(dia => 
                   !dia.esDescanso && 
                   dia.ejercicios?.length > 0 &&
                   dia.ejercicios.some(ej => ej.nombre?.trim())
                 );
                 return diasConEjercicios && diasConEjercicios.length > 0;
               });
      }
      default:
        return true;
    }
  };

  const getValidationError = () => {
    if (activeStep === 2) {
      for (const micro of wizardData.microciclos) {
        const diasConEjercicios = micro.plantillaDias?.filter(dia => 
          !dia.esDescanso && dia.ejercicios?.length > 0 && dia.ejercicios.some(ej => ej.nombre?.trim())
        );
        if (!diasConEjercicios || diasConEjercicios.length === 0) {
          return `${micro.mesocicloNombre || 'Mesociclo'}: Agregá al menos un ejercicio completo`;
        }
      }
    }
    return 'Por favor completá todos los campos requeridos';
  };

  const handleNext = () => {
    if (activeStep < 3 && !validateStep(activeStep)) {
      setError(getValidationError());
      return;
    }
    setError(null);
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep(prev => prev - 1);
  };

  const handleCancel = () => {
    if (window.confirm('¿Seguro que querés cancelar? Se perderán los datos ingresados.')) {
      navigate(`/coach/alumno/${studentId}`);
    }
  };

  // Crear rutina completa
  const handleCreateRoutine = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        studentId: parseInt(studentId),
        macrocycle: wizardData.macrocycle,
        mesociclos: wizardData.mesociclos,
        microciclos: wizardData.microciclos.map(micro => ({
          mesocicloIndex: micro.mesocicloIndex,
          cantidadMicrociclos: micro.cantidadMicrociclos,
          plantillaDias: micro.plantillaDias.map(dia => ({
            dia: dia.dia,
            nombre: dia.nombre,
            esDescanso: dia.esDescanso,
            ejercicios: dia.esDescanso ? [] : dia.ejercicios
              .filter(ej => ej.nombre?.trim()) // Solo ejercicios con nombre
              .map((ej, idx) => ({
                nombre: ej.nombre,
                grupoMuscular: ej.grupoMuscular,
                // Calcular series desde la cantidad de sets
                series: String(ej.sets?.length || 1),
                // Usar reps del primer set como referencia general
                repeticiones: ej.sets?.[0]?.reps || '8-10',
                descanso: ej.descanso || '2',
                // Usar RIR del primer set como referencia general
                rirEsperado: ej.sets?.[0]?.rir || '2',
                orden: idx + 1,
                // Sets individuales con soporte AMRAP
                sets: ej.sets?.map((set, setIdx) => ({
                  order: setIdx,
                  reps: set.reps || '8-10',
                  expectedRir: set.rir || '2',
                  isAmrap: set.isAmrap || false,
                  amrapInstruction: set.isAmrap ? (set.amrapInstruction || null) : null,
                })) || [],
              })),
          })),
        })),
      };

      await createCompleteRoutineAPI(payload);
      setSuccess(true);
      
      setTimeout(() => {
        navigate(`/coach/alumno/${studentId}`);
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al crear la rutina');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar contenido según el paso
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <StepMacrocycle 
            data={wizardData.macrocycle}
            existingMacrocycles={existingMacrocycles}
            onChange={(data) => setWizardData(prev => ({ 
              ...prev, 
              macrocycle: { ...prev.macrocycle, ...data } 
            }))}
          />
        );
      case 1:
        return (
          <StepMesociclos
            cantidadMesociclos={wizardData.cantidadMesociclos}
            mesociclos={wizardData.mesociclos}
            onCantidadChange={(cant) => setWizardData(prev => ({ ...prev, cantidadMesociclos: cant }))}
            onMesocicloChange={(index, field, value) => {
              const nuevosMeso = [...wizardData.mesociclos];
              nuevosMeso[index] = { ...nuevosMeso[index], [field]: value };
              setWizardData(prev => ({ ...prev, mesociclos: nuevosMeso }));
            }}
          />
        );
      case 2:
        return (
          <StepMicrociclos
            mesociclos={wizardData.mesociclos}
            microciclos={wizardData.microciclos}
            exerciseCatalog={exerciseCatalog}
            muscleGroups={muscleGroups}
            loadingExercises={loadingExercises}
            onMicrocicloUpdate={(mesocicloIndex, data) => {
              const nuevosMicro = [...wizardData.microciclos];
              nuevosMicro[mesocicloIndex] = data;
              setWizardData(prev => ({ ...prev, microciclos: nuevosMicro }));
            }}
          />
        );
      case 3:
        return (
          <StepPreview 
            wizardData={wizardData}
            onEdit={(step) => setActiveStep(step)}
          />
        );
      case 4:
        return (
          <StepCreation 
            loading={loading}
            success={success}
            onComplete={handleCreateRoutine}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#121212', 
      p: { xs: 2, md: 4 },
      maxWidth: 1200,
      mx: 'auto',
    }}>
      {/* Header */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
              🏋️ Crear Rutina Completa
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
              Alumno: <strong>{studentName || 'Cargando...'}</strong>
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleCancel}
            sx={{ 
              color: '#fff', 
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            Cancelar
          </Button>
        </Box>

        {/* Stepper - Adaptado para móvil */}
        {isMobile ? (
          // Stepper compacto para móvil
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            {steps.map((label, index) => (
              <Box
                key={label}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: index === activeStep 
                    ? '#ffd700' 
                    : index < activeStep 
                      ? '#4caf50' 
                      : 'rgba(255,255,255,0.15)',
                  color: index <= activeStep ? '#000' : 'rgba(255,255,255,0.5)',
                  fontWeight: 700,
                  fontSize: 14,
                  transition: 'all 0.3s ease',
                }}
              >
                {index < activeStep ? '✓' : index + 1}
              </Box>
            ))}
          </Box>
        ) : (
          // Stepper completo para desktop
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel 
                  sx={{
                    '& .MuiStepLabel-label': { 
                      color: 'rgba(255,255,255,0.7)',
                      '&.Mui-active': { color: '#ffd700', fontWeight: 600 },
                      '&.Mui-completed': { color: '#4caf50' },
                    },
                    '& .MuiStepIcon-root': {
                      color: 'rgba(255,255,255,0.3)',
                      '&.Mui-active': { color: '#ffd700' },
                      '&.Mui-completed': { color: '#4caf50' },
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        )}
        
        {/* Indicador de paso actual en móvil */}
        {isMobile && (
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              textAlign: 'center', 
              mt: 1, 
              color: '#ffd700',
              fontWeight: 600,
            }}
          >
            {steps[activeStep]}
          </Typography>
        )}
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Content */}
      <Paper sx={{ p: { xs: 2, md: 4 }, bgcolor: '#1e1e1e', borderRadius: 3, mb: isMobile ? 12 : 3 }}>
        {renderStepContent()}
      </Paper>

      {/* Navigation Buttons - Adaptados para móvil */}
      {activeStep < 4 && (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column-reverse' : 'row',
            justifyContent: 'space-between', 
            gap: 2,
            position: isMobile ? 'sticky' : 'static',
            bottom: isMobile ? 0 : 'auto',
            left: 0,
            right: 0,
            p: isMobile ? 2 : 0,
            bgcolor: isMobile ? '#121212' : 'transparent',
            borderTop: isMobile ? '1px solid rgba(255,255,255,0.1)' : 'none',
            zIndex: 10,
          }}
        >
          <Button
            variant="outlined"
            startIcon={!isMobile && <ArrowBackIcon />}
            onClick={activeStep === 0 ? handleCancel : handleBack}
            fullWidth={isMobile}
            sx={{ 
              color: '#aaa', 
              borderColor: '#444',
              py: isMobile ? 1.5 : 1,
              fontSize: isMobile ? '0.95rem' : '0.875rem',
            }}
          >
            {activeStep === 0 ? 'Cancelar' : '← Anterior'}
          </Button>

          {activeStep < 3 ? (
            <Button
              variant="contained"
              endIcon={!isMobile && <ArrowForwardIcon />}
              onClick={handleNext}
              fullWidth={isMobile}
              sx={{ 
                bgcolor: '#ffd700', 
                color: '#000', 
                '&:hover': { bgcolor: '#ffb300' },
                py: isMobile ? 1.5 : 1,
                fontSize: isMobile ? '0.95rem' : '0.875rem',
                fontWeight: 600,
              }}
            >
              Siguiente →
            </Button>
          ) : activeStep === 3 ? (
            <Button
              variant="contained"
              endIcon={!isMobile && <PlayArrowIcon />}
              onClick={() => setActiveStep(4)}
              fullWidth={isMobile}
              sx={{ 
                bgcolor: '#4caf50', 
                color: '#fff', 
                '&:hover': { bgcolor: '#388e3c' },
                py: isMobile ? 1.5 : 1,
                fontSize: isMobile ? '0.95rem' : '0.875rem',
                fontWeight: 600,
              }}
            >
              🚀 Crear Rutina
            </Button>
          ) : null}
        </Box>
      )}
    </Box>
  );
};

// Estilos para el DatePicker (tema oscuro)
const datePickerStyles = `
  .react-datepicker {
    background-color: #1a1a2e;
    border: 1px solid #444;
    font-family: inherit;
  }
  .react-datepicker__header {
    background-color: #2a2a3e;
    border-bottom: 1px solid #444;
  }
  .react-datepicker__current-month,
  .react-datepicker__day-name,
  .react-datepicker__day {
    color: #e0e0e0;
  }
  .react-datepicker__day:hover {
    background-color: #ffd700;
    color: #000;
  }
  .react-datepicker__day--selected,
  .react-datepicker__day--keyboard-selected {
    background-color: #ffd700;
    color: #000;
  }
  .react-datepicker__navigation-icon::before {
    border-color: #e0e0e0;
  }
  .react-datepicker__triangle {
    display: none;
  }
`;

// Helper para parsear fecha string a Date
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Helper para formatear Date a string YYYY-MM-DD (para el backend)
const formatDateToString = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ============================================
// STEP 1: MACROCICLO
// ============================================
const StepMacrocycle = ({ data, existingMacrocycles = [], onChange }) => {
  const nextNumber = existingMacrocycles.length + 1;
  
  return (
    <Box>
      <style>{datePickerStyles}</style>
      <Typography variant="h5" sx={{ color: '#ffd700', mb: 3, fontWeight: 600 }}>
        📝 Configuración del Macrociclo
      </Typography>

      {/* Info de macrociclos existentes */}
      {existingMacrocycles.length > 0 && (
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3, 
            bgcolor: 'rgba(102, 126, 234, 0.1)', 
            border: '1px solid #667eea',
            '& .MuiAlert-icon': { color: '#667eea' }
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            📊 Este alumno ya tiene {existingMacrocycles.length} macrociclo(s)
          </Typography>
          <Typography variant="caption" sx={{ color: '#aaa' }}>
            Último: {existingMacrocycles[0]?.name || 'Sin nombre'} 
            {existingMacrocycles[0]?.status === 'in_progress' ? ' (en progreso)' : ''}
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label="Nombre del Macrociclo *"
            placeholder="ej: Hipertrofia General, Fuerza Máxima..."
            value={data.nombre}
            onChange={(e) => onChange({ nombre: e.target.value })}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a' } }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            type="number"
            label="N° Macrociclo"
            placeholder={`${nextNumber}`}
            value={data.numero || ''}
            onChange={(e) => onChange({ numero: e.target.value ? parseInt(e.target.value) : null })}
            helperText={`Sugerido: ${nextNumber}`}
            inputProps={{ min: 1 }}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a' } }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography sx={{ color: '#b3b3b3', fontSize: '0.75rem', mb: 0.5 }}>
            Fecha de Inicio *
          </Typography>
          <DatePicker
            selected={parseDate(data.fechaInicio)}
            onChange={(date) => onChange({ fechaInicio: formatDateToString(date) })}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/aaaa"
            className="custom-datepicker"
            wrapperClassName="datepicker-wrapper"
            customInput={
              <Box
                sx={{
                  width: '100%',
                  padding: '16.5px 14px',
                  bgcolor: '#2a2a2a',
                  border: '1px solid rgba(255,255,255,0.23)',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  '&:hover': { borderColor: 'rgba(255,255,255,0.5)' },
                }}
              >
                <span>{data.fechaInicio ? parseDate(data.fechaInicio)?.toLocaleDateString('es-AR') : 'dd/mm/aaaa'}</span>
                <span style={{ opacity: 0.5 }}>📅</span>
              </Box>
            }
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Objetivo *"
            placeholder="Describe el objetivo principal de este macrociclo"
            value={data.objetivo}
            onChange={(e) => onChange({ objetivo: e.target.value })}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a' } }}
          />
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mt: 3 }}>
        💡 <strong>Consejo:</strong> El número de macrociclo es opcional. Si lo dejás vacío, se asignará automáticamente el siguiente ({nextNumber}).
      </Alert>
    </Box>
  );
};

// ============================================
// STEP 2: MESOCICLOS
// ============================================
const StepMesociclos = ({ cantidadMesociclos, mesociclos, onCantidadChange, onMesocicloChange }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ color: '#ffd700', mb: 3, fontWeight: 600 }}>
        📅 Configuración de Mesociclos
      </Typography>

      <Paper sx={{ p: 3, bgcolor: '#2a2a2a', borderRadius: 2, mb: 3 }}>
        <Typography variant="body1" sx={{ color: '#ffd700', mb: 1 }}>
          ¿Cuántos mesociclos querés crear?
        </Typography>
        <TextField
          type="number"
          inputProps={{ min: 1, max: 6 }}
          value={cantidadMesociclos}
          onChange={(e) => {
            const val = e.target.value;
            // Permitir campo vacío temporalmente, validar en blur
            if (val === '') {
              onCantidadChange(1);
            } else {
              const num = parseInt(val);
              if (!isNaN(num) && num >= 1 && num <= 6) {
                onCantidadChange(num);
              }
            }
          }}
          sx={{ 
            width: 120,
            '& .MuiOutlinedInput-root': { bgcolor: '#333' } 
          }}
        />
        <Typography variant="caption" sx={{ display: 'block', color: '#888', mt: 1 }}>
          Recomendado: 2-4 mesociclos por macrociclo
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {mesociclos.map((meso, index) => (
          <Grid item xs={12} key={index}>
            <Card sx={{ bgcolor: '#2a2a2a', border: '2px solid #667eea' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#667eea' }}>
                    📋 {meso.nombre}
                  </Typography>
                  <TextField
                    type="number"
                    label="N°"
                    placeholder={`${index + 1}`}
                    value={meso.numero || ''}
                    onChange={(e) => onMesocicloChange(index, 'numero', e.target.value ? parseInt(e.target.value) : null)}
                    inputProps={{ min: 1, style: { textAlign: 'center' } }}
                    sx={{ 
                      width: 80,
                      '& .MuiOutlinedInput-root': { bgcolor: '#333' },
                      '& .MuiInputLabel-root': { fontSize: '0.8rem' }
                    }}
                    size="small"
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ color: '#b3b3b3', fontSize: '0.75rem', mb: 0.5 }}>
                      Fecha de Inicio *
                    </Typography>
                    <DatePicker
                      selected={parseDate(meso.fechaInicio)}
                      onChange={(date) => onMesocicloChange(index, 'fechaInicio', formatDateToString(date))}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="dd/mm/aaaa"
                      customInput={
                        <Box
                          sx={{
                            width: '100%',
                            padding: '12px 14px',
                            bgcolor: '#333',
                            border: '1px solid rgba(255,255,255,0.23)',
                            borderRadius: '4px',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            '&:hover': { borderColor: 'rgba(255,255,255,0.5)' },
                          }}
                        >
                          <span>{meso.fechaInicio ? parseDate(meso.fechaInicio)?.toLocaleDateString('es-AR') : 'dd/mm/aaaa'}</span>
                          <span style={{ opacity: 0.5 }}>📅</span>
                        </Box>
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Objetivo del Mesociclo *"
                      placeholder="ej: Adaptación anatómica, Desarrollo de fuerza..."
                      value={meso.objetivo}
                      onChange={(e) => onMesocicloChange(index, 'objetivo', e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#333' } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Alert severity="info" sx={{ mt: 3 }}>
        💡 <strong>Tip:</strong> Cada mesociclo debe tener un objetivo específico.
        En el siguiente paso configurarás los microciclos para cada mesociclo.
      </Alert>
    </Box>
  );
};

// ============================================
// STEP 3: MICROCICLOS (CON DROPDOWN DE EJERCICIOS)
// ============================================
const StepMicrociclos = ({ 
  mesociclos, 
  microciclos, 
  exerciseCatalog, 
  muscleGroups,
  loadingExercises,
  onMicrocicloUpdate 
}) => {
  const [expandedDays, setExpandedDays] = useState({});
  const [initialized, setInitialized] = useState(false);

  // Inicializar microciclos SOLO UNA VEZ cuando no existen
  useEffect(() => {
    // Solo inicializar si hay mesociclos y NO hay microciclos todavía
    if (!initialized && mesociclos.length > 0 && (!microciclos || microciclos.length === 0)) {
      mesociclos.forEach((meso, index) => {
        onMicrocicloUpdate(index, {
          mesocicloIndex: index,
          mesocicloNombre: meso.nombre,
          cantidadMicrociclos: 4,
          plantillaDias: Array.from({ length: 3 }, (_, i) => ({
            dia: i + 1,
            nombre: `Día ${i + 1}`,
            ejercicios: [],
            esDescanso: false
          }))
        });
      });
      setInitialized(true);
    } else if (microciclos && microciclos.length > 0) {
      // Si ya hay datos, marcar como inicializado para no sobrescribir
      setInitialized(true);
    }
  }, [mesociclos]); // Solo depende de mesociclos, no de microciclos ni onMicrocicloUpdate

  const toggleDayExpand = (mesoIndex, dayIndex) => {
    const key = `${mesoIndex}-${dayIndex}`;
    setExpandedDays(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCantidadChange = (mesoIndex, cantidad) => {
    const micro = microciclos[mesoIndex] || {};
    onMicrocicloUpdate(mesoIndex, { ...micro, cantidadMicrociclos: cantidad });
  };

  const handleToggleDescanso = (mesoIndex, diaIndex) => {
    const micro = microciclos[mesoIndex] || {};
    const plantilla = [...(micro.plantillaDias || [])];
    plantilla[diaIndex] = {
      ...plantilla[diaIndex],
      esDescanso: !plantilla[diaIndex].esDescanso,
      ejercicios: []
    };
    onMicrocicloUpdate(mesoIndex, { ...micro, plantillaDias: plantilla });
  };

  const handleAddExercise = (mesoIndex, diaIndex) => {
    const micro = microciclos[mesoIndex] || {};
    const plantilla = [...(micro.plantillaDias || [])];
    if (!plantilla[diaIndex].ejercicios) {
      plantilla[diaIndex].ejercicios = [];
    }
    plantilla[diaIndex].ejercicios.push({
      nombre: '',
      grupoMuscular: '',
      descanso: '',
      // Array de sets individuales
      sets: [
        { reps: '', rir: '', isAmrap: false, amrapInstruction: '' }
      ]
    });
    onMicrocicloUpdate(mesoIndex, { ...micro, plantillaDias: plantilla });
  };

  const handleRemoveExercise = (mesoIndex, diaIndex, ejercicioIndex) => {
    const micro = microciclos[mesoIndex] || {};
    const plantilla = [...(micro.plantillaDias || [])];
    plantilla[diaIndex].ejercicios.splice(ejercicioIndex, 1);
    onMicrocicloUpdate(mesoIndex, { ...micro, plantillaDias: plantilla });
  };

  const handleExerciseChange = (mesoIndex, diaIndex, ejercicioIndex, field, value) => {
    const micro = microciclos[mesoIndex] || {};
    const plantilla = [...(micro.plantillaDias || [])];
    plantilla[diaIndex].ejercicios[ejercicioIndex][field] = value;
    onMicrocicloUpdate(mesoIndex, { ...micro, plantillaDias: plantilla });
  };

  const handleExerciseSelect = (mesoIndex, diaIndex, ejercicioIndex, selectedExercise) => {
    if (selectedExercise) {
      handleExerciseChange(mesoIndex, diaIndex, ejercicioIndex, 'nombre', selectedExercise.name);
    }
  };

  const handleGroupChange = (mesoIndex, diaIndex, ejercicioIndex, grupo) => {
    handleExerciseChange(mesoIndex, diaIndex, ejercicioIndex, 'grupoMuscular', grupo);
    handleExerciseChange(mesoIndex, diaIndex, ejercicioIndex, 'nombre', '');
  };

  // Agregar un nuevo día de entrenamiento
  const handleAddDay = (mesoIndex) => {
    const micro = microciclos[mesoIndex] || {};
    const plantilla = [...(micro.plantillaDias || [])];
    const newDayNumber = plantilla.length + 1;
    plantilla.push({
      dia: newDayNumber,
      nombre: `Día ${newDayNumber}`,
      ejercicios: [],
      esDescanso: false
    });
    onMicrocicloUpdate(mesoIndex, { ...micro, plantillaDias: plantilla });
  };

  // Eliminar el último día
  const handleRemoveDay = (mesoIndex) => {
    const micro = microciclos[mesoIndex] || {};
    const plantilla = [...(micro.plantillaDias || [])];
    if (plantilla.length > 1) {
      plantilla.pop();
      onMicrocicloUpdate(mesoIndex, { ...micro, plantillaDias: plantilla });
    }
  };

  // Manejar sets individuales
  const handleAddSet = (mesoIndex, diaIndex, ejercicioIndex) => {
    const micro = microciclos[mesoIndex] || {};
    const plantilla = [...(micro.plantillaDias || [])];
    const ejercicio = plantilla[diaIndex].ejercicios[ejercicioIndex];
    if (!ejercicio.sets) ejercicio.sets = [];
    
    // Copiar valores del último set como default
    const lastSet = ejercicio.sets[ejercicio.sets.length - 1];
    ejercicio.sets.push({
      reps: lastSet?.reps || '',
      rir: lastSet?.rir || '',
      isAmrap: false,
      amrapInstruction: ''
    });
    onMicrocicloUpdate(mesoIndex, { ...micro, plantillaDias: plantilla });
  };

  const handleRemoveSet = (mesoIndex, diaIndex, ejercicioIndex, setIndex) => {
    const micro = microciclos[mesoIndex] || {};
    const plantilla = [...(micro.plantillaDias || [])];
    plantilla[diaIndex].ejercicios[ejercicioIndex].sets.splice(setIndex, 1);
    onMicrocicloUpdate(mesoIndex, { ...micro, plantillaDias: plantilla });
  };

  const handleSetChange = (mesoIndex, diaIndex, ejercicioIndex, setIndex, field, value) => {
    const micro = microciclos[mesoIndex] || {};
    const plantilla = [...(micro.plantillaDias || [])];
    plantilla[diaIndex].ejercicios[ejercicioIndex].sets[setIndex][field] = value;
    onMicrocicloUpdate(mesoIndex, { ...micro, plantillaDias: plantilla });
  };

  // Filtrar ejercicios por grupo muscular
  const getExercisesByGroup = (grupo) => {
    if (!grupo) return [];
    return exerciseCatalog.filter(e => e.muscleGroup === grupo);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ color: '#ffd700', mb: 1, fontWeight: 600 }}>
        🗓️ Configurar Microciclos (Plantilla)
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        💡 Configurá 1 microciclo plantilla con sus días y ejercicios. Este patrón se repetirá automáticamente.
      </Alert>

      {loadingExercises && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CircularProgress size={20} sx={{ color: '#ffd700' }} />
          <Typography variant="body2" sx={{ color: '#888' }}>Cargando catálogo de ejercicios...</Typography>
        </Box>
      )}

      {mesociclos.map((meso, mesoIndex) => {
        const microData = microciclos[mesoIndex] || {};
        
        return (
          <Card 
            key={mesoIndex} 
            sx={{ 
              mb: 4, 
              bgcolor: '#2a2a2a', 
              border: '2px solid #667eea',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 600 }}>
                  📋 {meso.nombre}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#aaa' }}>
                    Cantidad de microciclos:
                  </Typography>
                  <TextField
                    type="number"
                    inputProps={{ min: 1, max: 12 }}
                    value={microData.cantidadMicrociclos || 4}
                    onChange={(e) => handleCantidadChange(mesoIndex, parseInt(e.target.value) || 1)}
                    sx={{ 
                      width: 80,
                      '& .MuiOutlinedInput-root': { bgcolor: '#333' },
                      '& input': { textAlign: 'center', py: 1 }
                    }}
                    size="small"
                  />
                </Box>
              </Box>

              {/* Días de la semana */}
              {(microData.plantillaDias || []).map((dia, diaIndex) => {
                const isExpanded = expandedDays[`${mesoIndex}-${diaIndex}`];
                const ejerciciosCount = dia.ejercicios?.length || 0;

                return (
                  <Paper 
                    key={diaIndex}
                    sx={{ 
                      mb: 2, 
                      bgcolor: '#1a1a1a',
                      border: dia.esDescanso ? '2px solid #ff9800' : '2px solid #4caf50',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Header del día - ADAPTADO PARA MÓVIL */}
                    <Box 
                      sx={{ 
                        p: { xs: 1.5, md: 2 }, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        bgcolor: dia.esDescanso ? 'rgba(255,152,0,0.1)' : 'rgba(76,175,80,0.1)',
                        cursor: 'pointer',
                        gap: 1,
                      }}
                      onClick={() => !dia.esDescanso && toggleDayExpand(mesoIndex, diaIndex)}
                    >
                      {/* Izquierda: Icono + Nombre */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                        {dia.esDescanso ? (
                          <HotelIcon sx={{ color: '#ff9800', fontSize: { xs: 20, md: 24 } }} />
                        ) : (
                          <FitnessCenterIcon sx={{ color: '#4caf50', fontSize: { xs: 20, md: 24 } }} />
                        )}
                        <Box sx={{ minWidth: 0 }}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: 600, 
                              color: dia.esDescanso ? '#ff9800' : '#4caf50',
                              fontSize: { xs: '0.85rem', md: '1rem' },
                              lineHeight: 1.2,
                            }}
                          >
                            {dia.nombre}
                          </Typography>
                          {/* Info secundaria en móvil */}
                          {!dia.esDescanso && (
                            <Typography 
                              variant="caption" 
                              sx={{ color: '#888', display: { xs: 'block', md: 'none' } }}
                            >
                              {ejerciciosCount} ejercicio{ejerciciosCount !== 1 ? 's' : ''}
                            </Typography>
                          )}
                          {dia.esDescanso && (
                            <Typography 
                              variant="caption" 
                              sx={{ color: '#ff9800', display: { xs: 'block', md: 'none' } }}
                            >
                              Descanso
                            </Typography>
                          )}
                        </Box>
                        {/* Chip solo en desktop */}
                        {!dia.esDescanso && (
                          <Chip 
                            label={`${ejerciciosCount} ejercicio${ejerciciosCount !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{ bgcolor: '#333', color: '#aaa', display: { xs: 'none', md: 'flex' } }}
                          />
                        )}
                      </Box>

                      {/* Derecha: Acciones */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 }, flexShrink: 0 }}>
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleDescanso(mesoIndex, diaIndex);
                          }}
                          sx={{ 
                            color: dia.esDescanso ? '#4caf50' : '#ff9800',
                            fontSize: { xs: '0.65rem', md: '0.75rem' },
                            minWidth: { xs: 'auto', md: 64 },
                            px: { xs: 1, md: 1.5 },
                          }}
                        >
                          {dia.esDescanso ? 'Activar' : 'Desc'}
                        </Button>
                        
                        {!dia.esDescanso && (
                          <>
                            <IconButton 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddExercise(mesoIndex, diaIndex);
                                if (!isExpanded) toggleDayExpand(mesoIndex, diaIndex);
                              }}
                              sx={{ color: '#4caf50', p: { xs: 0.5, md: 1 } }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDayExpand(mesoIndex, diaIndex);
                              }}
                              sx={{ color: '#aaa' }}
                            >
                              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </Box>

                    {/* Ejercicios del día */}
                    <Collapse in={isExpanded && !dia.esDescanso}>
                      <Box sx={{ p: 2 }}>
                        {dia.ejercicios?.length === 0 && (
                          <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', py: 2 }}>
                            Hacé clic en + para agregar ejercicios
                          </Typography>
                        )}

                        {dia.ejercicios?.map((ejercicio, ejercicioIndex) => (
                          <Box 
                            key={ejercicioIndex}
                            sx={{ 
                              mb: 2, 
                              p: 2, 
                              bgcolor: '#252525', 
                              borderRadius: 2,
                              border: '1px solid #333',
                            }}
                          >
                            {/* Fila principal: Grupo, Ejercicio, Descanso, Eliminar */}
                            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                              <Grid item xs={12} sm={4} md={3}>
                                <Autocomplete
                                  options={muscleGroups}
                                  value={ejercicio.grupoMuscular || null}
                                  onChange={(e, value) => handleGroupChange(mesoIndex, diaIndex, ejercicioIndex, value || '')}
                                  renderInput={(params) => (
                                    <TextField 
                                      {...params} 
                                      label="Grupo *" 
                                      size="small"
                                      placeholder="Seleccionar..."
                                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#333' } }}
                                    />
                                  )}
                                  noOptionsText="Sin grupos"
                                />
                              </Grid>

                              <Grid item xs={12} sm={4} md={4}>
                                <Autocomplete
                                  options={getExercisesByGroup(ejercicio.grupoMuscular)}
                                  getOptionLabel={(option) => option.name || ''}
                                  value={getExercisesByGroup(ejercicio.grupoMuscular).find(e => e.name === ejercicio.nombre) || null}
                                  onChange={(e, value) => handleExerciseSelect(mesoIndex, diaIndex, ejercicioIndex, value)}
                                  disabled={!ejercicio.grupoMuscular}
                                  renderInput={(params) => (
                                    <TextField 
                                      {...params} 
                                      label="Ejercicio *" 
                                      size="small"
                                      placeholder={ejercicio.grupoMuscular ? "Seleccionar..." : "Primero elegí grupo"}
                                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#333' } }}
                                    />
                                  )}
                                  noOptionsText="No hay ejercicios"
                                  loading={loadingExercises}
                                />
                              </Grid>

                              <Grid item xs={6} sm={2} md={2}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Desc (min)"
                                  placeholder="2"
                                  value={ejercicio.descanso}
                                  onChange={(e) => handleExerciseChange(mesoIndex, diaIndex, ejercicioIndex, 'descanso', e.target.value)}
                                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#333' } }}
                                />
                              </Grid>

                              <Grid item xs={6} sm={2} md={1}>
                                <IconButton 
                                  color="error" 
                                  onClick={() => handleRemoveExercise(mesoIndex, diaIndex, ejercicioIndex)}
                                  size="small"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Grid>
                            </Grid>

                            {/* Sets individuales - ADAPTADO PARA MÓVIL */}
                            <Box sx={{ pl: { xs: 1, md: 2 }, borderLeft: '3px solid #4caf50' }}>
                              <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 1 }}>
                                Sets ({ejercicio.sets?.length || 0})
                              </Typography>
                              
                              {(ejercicio.sets || []).map((set, setIndex) => (
                                <Box 
                                  key={setIndex} 
                                  sx={{ 
                                    mb: 1.5,
                                    p: { xs: 1.5, md: 1 },
                                    bgcolor: set.isAmrap ? 'rgba(255,152,0,0.1)' : '#1a1a1a',
                                    borderRadius: 1,
                                    border: set.isAmrap ? '1px solid #ff9800' : '1px solid #333',
                                  }}
                                >
                                  {/* Header del set */}
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="body2" sx={{ color: '#aaa', fontWeight: 600 }}>
                                      Set {setIndex + 1}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                      <Chip
                                        label={set.isAmrap ? "🔥 AMRAP" : "AMRAP"}
                                        size="small"
                                        onClick={() => handleSetChange(mesoIndex, diaIndex, ejercicioIndex, setIndex, 'isAmrap', !set.isAmrap)}
                                        sx={{ 
                                          cursor: 'pointer',
                                          bgcolor: set.isAmrap ? '#ff9800' : '#333',
                                          color: set.isAmrap ? '#000' : '#888',
                                          fontWeight: set.isAmrap ? 600 : 400,
                                          fontSize: { xs: 11, md: 12 },
                                          height: { xs: 26, md: 24 },
                                          '&:hover': { bgcolor: set.isAmrap ? '#ffa726' : '#444' }
                                        }}
                                      />
                                      {(ejercicio.sets?.length || 0) > 1 && (
                                        <IconButton 
                                          size="small" 
                                          onClick={() => handleRemoveSet(mesoIndex, diaIndex, ejercicioIndex, setIndex)}
                                          sx={{ color: '#d32f2f', p: 0.5 }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      )}
                                    </Box>
                                  </Box>
                                  
                                  {/* Campos del set - Grid responsive */}
                                  <Grid container spacing={1}>
                                    <Grid item xs={6} sm={3}>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        label="Reps"
                                        placeholder="6-10"
                                        value={set.reps}
                                        onChange={(e) => handleSetChange(mesoIndex, diaIndex, ejercicioIndex, setIndex, 'reps', e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#333' } }}
                                        disabled={set.isAmrap}
                                      />
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        label="RIR"
                                        placeholder="1-2"
                                        value={set.rir}
                                        onChange={(e) => handleSetChange(mesoIndex, diaIndex, ejercicioIndex, setIndex, 'rir', e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#333' } }}
                                        disabled={set.isAmrap}
                                      />
                                    </Grid>
                                    {set.isAmrap && (
                                      <Grid item xs={12} sm={6}>
                                        <TextField
                                          fullWidth
                                          size="small"
                                          label="Instrucción AMRAP"
                                          placeholder="ej: máximo reps"
                                          value={set.amrapInstruction || ''}
                                          onChange={(e) => handleSetChange(mesoIndex, diaIndex, ejercicioIndex, setIndex, 'amrapInstruction', e.target.value)}
                                          sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#333' } }}
                                        />
                                      </Grid>
                                    )}
                                  </Grid>
                                </Box>
                              ))}

                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => handleAddSet(mesoIndex, diaIndex, ejercicioIndex)}
                                fullWidth
                                sx={{ 
                                  color: '#4caf50', 
                                  borderColor: '#4caf50',
                                  mt: 1,
                                  py: { xs: 1, md: 0.5 },
                                  '&:hover': { borderColor: '#66bb6a', bgcolor: 'rgba(76,175,80,0.1)' }
                                }}
                              >
                                + Agregar Set
                              </Button>
                            </Box>
                          </Box>
                        ))}

                        {/* Botón agregar ejercicio - más visible en móvil */}
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddExercise(mesoIndex, diaIndex)}
                          fullWidth
                          sx={{ 
                            bgcolor: '#4caf50', 
                            color: '#fff',
                            mt: 2,
                            py: { xs: 1.2, md: 1 },
                            '&:hover': { bgcolor: '#388e3c' }
                          }}
                        >
                          + Agregar Ejercicio
                        </Button>
                      </Box>
                    </Collapse>
                  </Paper>
                );
              })}

              {/* Botones para agregar/quitar días */}
              <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddDay(mesoIndex)}
                  disabled={(microData.plantillaDias || []).length >= 7}
                  sx={{
                    bgcolor: '#4caf50',
                    color: '#fff',
                    '&:hover': { bgcolor: '#388e3c' },
                    '&:disabled': { bgcolor: '#333', color: '#666' },
                  }}
                >
                  Agregar Día
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleRemoveDay(mesoIndex)}
                  disabled={(microData.plantillaDias || []).length <= 1}
                  sx={{
                    borderColor: '#d32f2f',
                    color: '#d32f2f',
                    '&:hover': { borderColor: '#f44336', bgcolor: 'rgba(211,47,47,0.1)' },
                    '&:disabled': { borderColor: '#333', color: '#666' },
                  }}
                >
                  Quitar Día
                </Button>
                <Typography variant="body2" sx={{ color: '#888', alignSelf: 'center' }}>
                  {(microData.plantillaDias || []).length}/7 días configurados
                </Typography>
              </Box>

              {/* Resumen */}
              <Alert severity="success" sx={{ mt: 2 }}>
                📊 Se crearán <strong>{microData.cantidadMicrociclos || 4}</strong> microciclos idénticos. 
                Total días de entrenamiento: <strong>
                  {((microData.plantillaDias || []).filter(d => !d.esDescanso && d.ejercicios?.length > 0 && d.ejercicios.some(ej => ej.nombre?.trim())).length * (microData.cantidadMicrociclos || 4))}
                </strong>
              </Alert>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

// ============================================
// STEP 4: PREVIEW
// ============================================
const StepPreview = ({ wizardData, onEdit }) => {
  const totalMesociclos = wizardData.mesociclos.length;
  const totalMicrociclos = wizardData.microciclos.reduce((t, m) => t + (m.cantidadMicrociclos || 0), 0);
  
  // Solo contar días que tienen ejercicios con nombre (completos)
  const getDiasActivos = (plantillaDias) => {
    return (plantillaDias || []).filter(d => 
      !d.esDescanso && 
      d.ejercicios?.length > 0 && 
      d.ejercicios.some(ej => ej.nombre?.trim())
    );
  };
  
  const totalDias = wizardData.microciclos.reduce((t, m) => {
    const dias = getDiasActivos(m.plantillaDias).length;
    return t + (dias * (m.cantidadMicrociclos || 0));
  }, 0);

  return (
    <Box>
      <Typography variant="h5" sx={{ color: '#ffd700', mb: 3, fontWeight: 600 }}>
        👀 Preview de la Rutina Completa
      </Typography>

      {/* Resumen General */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: '#fff', textAlign: 'center', mb: 2 }}>
          📊 Resumen General
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={4} sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ color: '#ffd700', fontWeight: 700 }}>{totalMesociclos}</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Mesociclos</Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ color: '#ffd700', fontWeight: 700 }}>{totalMicrociclos}</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Microciclos</Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ color: '#ffd700', fontWeight: 700 }}>{totalDias}</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Días Entreno</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Macrociclo */}
      <Card sx={{ mb: 2, bgcolor: '#2a2a2a' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6" sx={{ color: '#ffd700' }}>🎯 Macrociclo</Typography>
            <Button size="small" onClick={() => onEdit(0)} sx={{ color: '#ffd700' }}>Editar</Button>
          </Box>
          <Typography sx={{ color: '#ccc' }}><strong>Nombre:</strong> {wizardData.macrocycle.nombre}</Typography>
          <Typography sx={{ color: '#ccc' }}><strong>Objetivo:</strong> {wizardData.macrocycle.objetivo}</Typography>
          <Typography sx={{ color: '#ccc' }}><strong>Inicio:</strong> {wizardData.macrocycle.fechaInicio} <Chip label="En progreso" size="small" sx={{ ml: 1, bgcolor: '#4caf50', color: '#fff', fontSize: 10 }} /></Typography>
        </CardContent>
      </Card>

      {/* Mesociclos */}
      <Card sx={{ mb: 2, bgcolor: '#2a2a2a' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#667eea' }}>📅 Mesociclos ({totalMesociclos})</Typography>
            <Button size="small" onClick={() => onEdit(1)} sx={{ color: '#ffd700' }}>Editar</Button>
          </Box>
          {wizardData.mesociclos.map((meso, i) => (
            <Paper key={i} sx={{ p: 2, mb: 1, bgcolor: '#1a1a1a', border: '1px solid #667eea' }}>
              <Typography sx={{ color: '#667eea', fontWeight: 600 }}>{meso.nombre}</Typography>
              <Typography variant="body2" sx={{ color: '#aaa' }}>{meso.objetivo}</Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>Desde {meso.fechaInicio}</Typography>
            </Paper>
          ))}
        </CardContent>
      </Card>

      {/* Microciclos */}
      <Card sx={{ bgcolor: '#2a2a2a' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#4caf50' }}>🗓️ Plantillas de Microciclos</Typography>
            <Button size="small" onClick={() => onEdit(2)} sx={{ color: '#ffd700' }}>Editar</Button>
          </Box>
          {wizardData.microciclos.map((micro, i) => {
            const diasActivos = getDiasActivos(micro.plantillaDias);
            return (
              <Paper key={i} sx={{ p: 2, mb: 1, bgcolor: '#1a1a1a', border: '1px solid #4caf50' }}>
                <Typography sx={{ color: '#4caf50', fontWeight: 600, mb: 1 }}>
                  {micro.mesocicloNombre} - {micro.cantidadMicrociclos} microciclos × {diasActivos.length} días = {diasActivos.length * micro.cantidadMicrociclos} entrenamientos
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {/* Solo mostrar días que tienen ejercicios */}
                  {diasActivos.map((dia, j) => (
                    <Chip 
                      key={j}
                      label={`${dia.nombre}: ${dia.ejercicios.filter(e => e.nombre?.trim()).length} ej.`}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(76,175,80,0.2)',
                        color: '#4caf50',
                      }}
                    />
                  ))}
                  {diasActivos.length === 0 && (
                    <Typography variant="body2" sx={{ color: '#f44336' }}>
                      ⚠️ Sin días configurados
                    </Typography>
                  )}
                </Box>
              </Paper>
            );
          })}
        </CardContent>
      </Card>

      <Alert severity="success" sx={{ mt: 3 }}>
        ✅ <strong>¿Todo se ve correcto?</strong> Una vez que hagas clic en "Crear Rutina Completa", se creará todo el plan de entrenamiento.
      </Alert>
    </Box>
  );
};

// ============================================
// STEP 5: CREATION
// ============================================
const StepCreation = ({ loading, success, onComplete }) => {
  useEffect(() => {
    if (!loading && !success) {
      onComplete();
    }
  }, []);

  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      {loading ? (
        <>
          <CircularProgress size={80} sx={{ color: '#ffd700', mb: 3 }} />
          <Typography variant="h5" sx={{ color: '#ffd700', mb: 2 }}>
            🚀 Creando rutina completa...
          </Typography>
          <Typography sx={{ color: '#888' }}>
            Por favor esperá mientras procesamos toda la información.
          </Typography>
        </>
      ) : success ? (
        <>
          <CheckIcon sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
          <Typography variant="h5" sx={{ color: '#4caf50', mb: 2 }}>
            ✅ ¡Rutina creada exitosamente!
          </Typography>
          <Typography sx={{ color: '#888', mb: 3 }}>
            La rutina completa ha sido creada y asignada al alumno.
          </Typography>
          <Typography sx={{ color: '#666' }}>
            Redirigiendo...
          </Typography>
        </>
      ) : null}
    </Box>
  );
};

export default CreateRoutinePage;

