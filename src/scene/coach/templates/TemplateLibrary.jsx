import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import { useTheme } from '@mui/material';
import { tokens } from '../../../theme';
import { getTemplates, TEMPLATE_CATEGORIES, getCategoryInfo } from '../../../api/templateApi';
import TemplateCard from './TemplateCard';
import AssignTemplateModal from './AssignTemplateModal';

const TemplateLibrary = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  // Estados
  const [templates, setTemplates] = useState([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false); // Track si ya cargó una vez
  const [loading, setLoading] = useState(true); // Solo para carga inicial
  const [refreshing, setRefreshing] = useState(false); // Para actualizaciones
  const [error, setError] = useState(null);
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modales
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Cargar plantillas
  const loadTemplates = async (isInitial = false) => {
    try {
      // Si ya se hizo la carga inicial, solo mostrar indicador de refresh
      if (initialLoadDone && !isInitial) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const filters = {};
      if (searchQuery) filters.search = searchQuery;
      if (categoryFilter) filters.category = categoryFilter;
      
      const data = await getTemplates(filters);
      setTemplates(data);
      setInitialLoadDone(true);
    } catch (err) {
      console.error('Error cargando plantillas:', err);
      setError('Error al cargar las plantillas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    loadTemplates(true);
  }, []);

  // Cuando cambia el filtro de categoría
  useEffect(() => {
    if (templates.length > 0 || categoryFilter) {
      loadTemplates(false);
    }
  }, [categoryFilter]);

  // Búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (templates.length > 0 || searchQuery) {
        loadTemplates(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handlers
  const handleAssign = (template) => {
    setSelectedTemplate(template);
    setShowAssignModal(true);
  };

  const handleEdit = (template) => {
    // Navegar a la gestión de microciclos de la plantilla
    navigate(`/coach/mesocycle/${template.id}/microcycles`);
  };

  const handleCreateClick = () => {
    navigate('/coach/templates/new');
  };

  const handleAssignSuccess = () => {
    setShowAssignModal(false);
    setSelectedTemplate(null);
    loadTemplates();
  };

  const handleDeleteSuccess = () => {
    loadTemplates();
  };

  const handleDuplicateSuccess = () => {
    loadTemplates();
  };

  // Calcular estadísticas
  const totalExercises = templates.reduce((acc, t) => acc + (t.totalExercises || 0), 0);
  const totalWeeks = templates.reduce((acc, t) => acc + (t.microcyclesCount || 0), 0);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header mejorado */}
      <Box sx={{ 
        background: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`,
        borderRadius: 3,
        p: { xs: 2, md: 3 },
        mb: 3,
        border: `1px solid ${colors.primary[300]}`,
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
        }}>
          <Box>
            <Typography 
              variant="h4" 
              fontWeight={700} 
              color={colors.grey[100]}
              sx={{ fontSize: { xs: 22, md: 28 } }}
            >
              📚 Biblioteca de Rutinas
            </Typography>
            <Typography variant="body2" color={colors.grey[400]} mt={0.5}>
              Crea plantillas y asígnalas a tus alumnos
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
            sx={{
              background: `linear-gradient(135deg, ${colors.greenAccent[600]} 0%, ${colors.greenAccent[700]} 100%)`,
              fontWeight: 600,
              px: 3,
              py: 1.2,
              fontSize: { xs: 13, md: 14 },
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.greenAccent[500]} 0%, ${colors.greenAccent[600]} 100%)`,
              },
            }}
          >
            Nueva Plantilla
          </Button>
        </Box>

        {/* Stats rápidos - siempre visible para evitar saltos */}
        {!loading && (
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 2, md: 4 }, 
            mt: 2.5,
            pt: 2,
            borderTop: `1px solid ${colors.primary[300]}`,
            flexWrap: 'wrap',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 36, 
                height: 36, 
                borderRadius: 2, 
                background: `${colors.greenAccent[600]}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <FitnessCenterIcon sx={{ color: colors.greenAccent[500], fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} color={colors.grey[100]} sx={{ lineHeight: 1.1 }}>
                  {templates.length}
                </Typography>
                <Typography variant="caption" color={colors.grey[500]}>
                  Plantillas
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 36, 
                height: 36, 
                borderRadius: 2, 
                background: `${colors.blueAccent[500]}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CalendarMonthIcon sx={{ color: colors.blueAccent[400], fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} color={colors.grey[100]} sx={{ lineHeight: 1.1 }}>
                  {totalWeeks}
                </Typography>
                <Typography variant="caption" color={colors.grey[500]}>
                  Semanas totales
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 36, 
                height: 36, 
                borderRadius: 2, 
                background: `${colors.orangeAccent?.[500] || '#ff9800'}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <PeopleIcon sx={{ color: colors.orangeAccent?.[400] || '#ffa726', fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} color={colors.grey[100]} sx={{ lineHeight: 1.1 }}>
                  {totalExercises}
                </Typography>
                <Typography variant="caption" color={colors.grey[500]}>
                  Ejercicios
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Filtros - más compacto */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1.5, 
        mb: 2,
        alignItems: 'stretch',
      }}>
        {/* Búsqueda */}
        <TextField
          placeholder="🔍 Buscar plantilla..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ 
            flex: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: colors.primary[400],
              borderRadius: 2,
              '& fieldset': { borderColor: colors.primary[300] },
              '&:hover fieldset': { borderColor: colors.grey[500] },
            },
          }}
        />

        {/* Filtro por categoría - select nativo */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              flex: 1,
              minWidth: 180,
              padding: '10px 12px',
              borderRadius: '8px',
              border: `1px solid ${colors.primary[300]}`,
              backgroundColor: colors.primary[400],
              color: colors.grey[100],
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="" style={{ backgroundColor: colors.primary[500] }}>
              ☰ Todas las categorías
            </option>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value} style={{ backgroundColor: colors.primary[500] }}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </select>

          {/* Botón refresh */}
          <Tooltip title="Actualizar">
            <IconButton 
              onClick={() => loadTemplates(false)} 
              disabled={refreshing}
              sx={{ 
                color: colors.grey[300],
                backgroundColor: colors.primary[400],
                borderRadius: 2,
                border: `1px solid ${colors.primary[300]}`,
                '&:hover': { backgroundColor: colors.primary[500] },
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Chips de filtro activo */}
      {(searchQuery || categoryFilter) && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {searchQuery && (
            <Chip
              label={`Búsqueda: "${searchQuery}"`}
              onDelete={() => setSearchQuery('')}
              size="small"
              sx={{ backgroundColor: colors.blueAccent[700] }}
            />
          )}
          {categoryFilter && (
            <Chip
              label={`Categoría: ${getCategoryInfo(categoryFilter).label}`}
              onDelete={() => setCategoryFilter('')}
              size="small"
              sx={{ backgroundColor: getCategoryInfo(categoryFilter).color + '40' }}
            />
          )}
        </Box>
      )}

      {/* Contenido */}
      {loading ? (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 3,
        }}>
          {[1, 2, 3].map((i) => (
            <Box 
              key={i}
              sx={{ 
                background: colors.primary[400], 
                borderRadius: 3, 
                p: 2.5,
                border: `1px solid ${colors.primary[300]}`,
              }}
            >
              <Skeleton variant="rectangular" height={6} sx={{ borderRadius: 1, mb: 2 }} />
              <Skeleton variant="rounded" width={100} height={24} sx={{ mb: 1.5 }} />
              <Skeleton variant="text" width="80%" height={28} />
              <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Skeleton variant="text" width={80} />
                <Skeleton variant="text" width={80} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Skeleton variant="rounded" height={36} sx={{ flex: 1 }} />
                <Skeleton variant="rounded" width={40} height={36} />
              </Box>
            </Box>
          ))}
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="error" mb={2}>{error}</Typography>
          <Button onClick={loadTemplates} variant="outlined">
            Reintentar
          </Button>
        </Box>
      ) : templates.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          background: colors.primary[400],
          borderRadius: 3,
        }}>
          <Typography fontSize={64} mb={2}>📚</Typography>
          <Typography variant="h5" color={colors.grey[100]} mb={1}>
            {searchQuery || categoryFilter ? 'No se encontraron plantillas' : 'No tenés plantillas todavía'}
          </Typography>
          <Typography color={colors.grey[400]} mb={3}>
            {searchQuery || categoryFilter 
              ? 'Probá cambiando los filtros de búsqueda'
              : 'Creá tu primera plantilla para empezar a ahorrar tiempo'
            }
          </Typography>
          {!searchQuery && !categoryFilter && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
              sx={{
                background: `linear-gradient(135deg, ${colors.greenAccent[600]} 0%, ${colors.greenAccent[700]} 100%)`,
              }}
            >
              Crear mi primera plantilla
            </Button>
          )}
        </Box>
      ) : (
        <>
          {/* Contador sutil con indicador de refresh */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color={colors.grey[500]} fontSize={13}>
                {templates.length} plantilla{templates.length !== 1 ? 's' : ''}
              </Typography>
              {refreshing && (
                <CircularProgress size={14} sx={{ color: colors.greenAccent[500] }} />
              )}
            </Box>
          </Box>

          {/* Grid de plantillas */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              lg: 'repeat(3, 1fr)' 
            },
            gap: { xs: 2, md: 3 },
          }}>
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onAssign={() => handleAssign(template)}
                onEdit={() => handleEdit(template)}
                onDelete={handleDeleteSuccess}
                onDuplicate={handleDuplicateSuccess}
              />
            ))}
          </Box>
        </>
      )}

      {/* Modales */}
      <AssignTemplateModal
        open={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
        onSuccess={handleAssignSuccess}
      />
    </Box>
  );
};

export default TemplateLibrary;

