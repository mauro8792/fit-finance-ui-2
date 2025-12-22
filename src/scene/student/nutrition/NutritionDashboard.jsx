import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import BlenderIcon from '@mui/icons-material/Blender';
import { tokens } from '../../../theme';
import { useAuthStore } from '../../../hooks';
import DailyTracker from './DailyTracker';
import FoodLibrary from './FoodLibrary';
import WeeklySummary from './WeeklySummary';
import MealTypesConfig from './MealTypesConfig';
import RecipesList from './RecipesList';
import { initializeFoodLibrary, initializeMealTypes, getNutritionProfile, getFoodItems, getRecipes, getMealTypes } from '../../../api/nutritionApi';

// Contexto para compartir los alimentos cacheados
export const NutritionCacheContext = createContext(null);

export const useNutritionCache = () => useContext(NutritionCacheContext);

// Tiempo de expiración del caché (5 minutos)
const CACHE_DURATION = 5 * 60 * 1000;

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`nutrition-tabpanel-${index}`}
      aria-labelledby={`nutrition-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const NutritionDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { student } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [hasFoods, setHasFoods] = useState(true);
  
  // Caché de datos nutricionales
  const [cachedFoods, setCachedFoods] = useState([]);
  const [cachedRecipes, setCachedRecipes] = useState([]);
  const [cachedMealTypes, setCachedMealTypes] = useState([]);
  const [cacheTimestamp, setCacheTimestamp] = useState(null);

  const studentId = student?.id;

  // Función para cargar y cachear todos los datos
  const loadAndCacheData = useCallback(async (forceRefresh = false) => {
    // Si hay caché válido y no forzamos refresh, no recargar
    if (!forceRefresh && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
      return;
    }

    try {
      const [foods, recipes, mealTypes] = await Promise.all([
        getFoodItems(studentId),
        getRecipes(studentId),
        getMealTypes(studentId),
      ]);

      setCachedFoods(foods || []);
      setCachedRecipes(recipes || []);
      
      // Meal types por defecto si no hay
      const defaultMealTypes = [
        { id: 'desayuno', name: 'Desayuno' },
        { id: 'almuerzo', name: 'Almuerzo' },
        { id: 'merienda', name: 'Merienda' },
        { id: 'cena', name: 'Cena' },
        { id: 'snack', name: 'Snack' },
      ];
      setCachedMealTypes((mealTypes && mealTypes.length > 0) ? mealTypes : defaultMealTypes);
      setCacheTimestamp(Date.now());
      
      return { foods, recipes, mealTypes };
    } catch (err) {
      console.error('Error caching nutrition data:', err);
    }
  }, [studentId, cacheTimestamp]);

  // Función para invalidar caché (después de agregar/editar)
  const invalidateCache = useCallback(() => {
    setCacheTimestamp(null);
  }, []);

  useEffect(() => {
    if (studentId) {
      loadInitialData();
    }
  }, [studentId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar y cachear alimentos
      const data = await loadAndCacheData(true);
      setHasFoods(data?.foods && data.foods.length > 0);
      
      // Intentar cargar el perfil nutricional
      const profileData = await getNutritionProfile(studentId);
      setProfile(profileData);
    } catch (err) {
      console.log('No hay perfil nutricional configurado aún');
    } finally {
      setLoading(false);
    }
  };

  // Valor del contexto de caché
  const cacheValue = {
    foods: cachedFoods,
    recipes: cachedRecipes,
    mealTypes: cachedMealTypes,
    refreshCache: () => loadAndCacheData(true),
    invalidateCache,
    isLoaded: cacheTimestamp !== null,
  };

  const handleInitialize = async () => {
    try {
      setInitializing(true);
      setError(null);
      setSuccessMessage(null);
      
      // Inicializar biblioteca de alimentos y momentos de comida
      await Promise.all([
        initializeFoodLibrary(studentId),
        initializeMealTypes(studentId),
      ]);
      
      // Marcar que ya tiene alimentos
      setHasFoods(true);
      
      // Recargar datos
      await loadInitialData();
      
      setSuccessMessage('✅ ¡Alimentos y momentos de comida cargados correctamente!');
      
      // Ocultar mensaje después de 5 segundos
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError('Error al inicializar. Puede que ya tengas datos cargados.');
      console.error(err);
    } finally {
      setInitializing(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!studentId) {
    return (
      <Box p={3}>
        <Typography variant="h5" color="error">
          Error: No se pudo identificar tu cuenta de estudiante.
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <NutritionCacheContext.Provider value={cacheValue}>
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: colors.primary[400],
        padding: isMobile ? '10px' : '20px',
      }}
    >
      {/* Header */}
      <Box mb={3}>
        <Typography
          variant={isMobile ? 'h4' : 'h3'}
          fontWeight="bold"
          color={colors.grey[100]}
          mb={1}
        >
          🥗 Mi Nutrición
        </Typography>
        <Typography variant="body1" color={colors.grey[300]}>
          Registra tus comidas y controla tus macros diarios
        </Typography>
        
        {/* Mostrar objetivos si hay perfil - DESTACADO */}
        {profile && (
          <Box
            sx={{
              mt: 2,
              p: 2.5,
              backgroundColor: colors.primary[600],
              borderRadius: '12px',
              border: `2px solid ${colors.orangeAccent[700]}`,
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {/* Calorías - Principal */}
            <Box sx={{ textAlign: 'center', minWidth: '90px' }}>
              <Typography variant="caption" color={colors.grey[400]} sx={{ fontSize: '11px' }}>
                Objetivo diario
              </Typography>
              <Typography 
                variant="h4" 
                fontWeight="bold" 
                color={colors.greenAccent[400]}
                sx={{ lineHeight: 1.2 }}
              >
                {profile.targetDailyCalories}
              </Typography>
              <Typography variant="caption" color={colors.greenAccent[500]}>
                kcal
              </Typography>
            </Box>
            
            {/* Separador */}
            <Box sx={{ 
              width: '1px', 
              height: '50px', 
              backgroundColor: colors.primary[400],
              display: { xs: 'none', sm: 'block' }
            }} />
            
            {/* Proteínas */}
            <Box sx={{ textAlign: 'center', minWidth: '70px' }}>
              <Typography variant="caption" color={colors.grey[400]} sx={{ fontSize: '11px' }}>
                Proteínas
              </Typography>
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                color={colors.redAccent[400]}
                sx={{ lineHeight: 1.2 }}
              >
                {profile.targetProteinGrams}g
              </Typography>
            </Box>
            
            {/* Grasas */}
            <Box sx={{ textAlign: 'center', minWidth: '70px' }}>
              <Typography variant="caption" color={colors.grey[400]} sx={{ fontSize: '11px' }}>
                Grasas
              </Typography>
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                color={colors.orangeAccent[400]}
                sx={{ lineHeight: 1.2 }}
              >
                {profile.targetFatGrams}g
              </Typography>
            </Box>
            
            {/* Hidratos */}
            <Box sx={{ textAlign: 'center', minWidth: '70px' }}>
              <Typography variant="caption" color={colors.grey[400]} sx={{ fontSize: '11px' }}>
                Hidratos
              </Typography>
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                color={colors.blueAccent[400]}
                sx={{ lineHeight: 1.2 }}
              >
                {profile.targetCarbsGrams}g
              </Typography>
            </Box>
          </Box>
        )}
        
        {!profile && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Tu coach aún no ha configurado tus objetivos nutricionales. 
            Mientras tanto, podés registrar tus comidas.
          </Alert>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Botón de inicialización - solo si no hay alimentos */}
      {!hasFoods && (
        <Box mb={2}>
          <Button
            variant="contained"
            size="small"
            onClick={handleInitialize}
            disabled={initializing}
            sx={{ 
              backgroundColor: colors.orangeAccent[600],
              color: '#fff',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: colors.orangeAccent[700],
              }
            }}
          >
            {initializing ? 'Cargando...' : '📦 Cargar alimentos base'}
          </Button>
        </Box>
      )}

      {/* Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: colors.primary[500],
          borderRadius: '8px 8px 0 0',
          mb: 0,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : false}
          sx={{
            '& .MuiTab-root': {
              color: colors.grey[300],
              fontWeight: '600',
              fontSize: isMobile ? '12px' : '14px',
              minHeight: isMobile ? '48px' : '56px',
              minWidth: isMobile ? 'auto' : '120px',
            },
            '& .Mui-selected': {
              color: colors.orangeAccent[500],
            },
            '& .MuiTabs-indicator': {
              backgroundColor: colors.orangeAccent[500],
              height: '3px',
            },
          }}
        >
          <Tab
            icon={<RestaurantIcon />}
            iconPosition="start"
            label="Hoy"
          />
          <Tab
            icon={<BarChartIcon />}
            iconPosition="start"
            label="Semana"
          />
          <Tab
            icon={<MenuBookIcon />}
            iconPosition="start"
            label="Alimentos"
          />
          <Tab
            icon={<BlenderIcon />}
            iconPosition="start"
            label="Recetas"
          />
          <Tab
            icon={<SettingsIcon />}
            iconPosition="start"
            label="Comidas"
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box
        sx={{
          backgroundColor: colors.primary[500],
          borderRadius: '0 0 8px 8px',
          padding: isMobile ? '15px' : '20px',
          minHeight: '400px',
        }}
      >
        <TabPanel value={tabValue} index={0}>
          <DailyTracker studentId={studentId} profile={profile} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <WeeklySummary studentId={studentId} profile={profile} />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <FoodLibrary studentId={studentId} />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <RecipesList studentId={studentId} />
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <MealTypesConfig studentId={studentId} />
        </TabPanel>
      </Box>
    </Box>
    </NutritionCacheContext.Provider>
  );
};

export default NutritionDashboard;

