import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTheme } from '@mui/material';
import { tokens } from '../../../theme';
import { getTemplates, TEMPLATE_CATEGORIES, getCategoryInfo } from '../../../api/templateApi';
import TemplateCard from './TemplateCard';
import CreateTemplateModal from './CreateTemplateModal';
import AssignTemplateModal from './AssignTemplateModal';

const TemplateLibrary = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Estados
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Cargar plantillas
  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (searchQuery) filters.search = searchQuery;
      if (categoryFilter) filters.category = categoryFilter;
      
      const data = await getTemplates(filters);
      setTemplates(data);
    } catch (err) {
      console.error('Error cargando plantillas:', err);
      setError('Error al cargar las plantillas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [categoryFilter]);

  // Búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTemplates();
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
    window.open(`/coach/mesocycle/${template.id}/microcycles`, '_blank');
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadTemplates();
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

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        mb: 3,
      }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color={colors.grey[100]}>
            📚 Biblioteca de Rutinas
          </Typography>
          <Typography variant="body2" color={colors.grey[400]} mt={0.5}>
            Crea plantillas y asignalas a tus alumnos
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateModal(true)}
          sx={{
            background: `linear-gradient(135deg, ${colors.greenAccent[600]} 0%, ${colors.greenAccent[700]} 100%)`,
            fontWeight: 600,
            px: 3,
            '&:hover': {
              background: `linear-gradient(135deg, ${colors.greenAccent[500]} 0%, ${colors.greenAccent[600]} 100%)`,
            },
          }}
        >
          Nueva Plantilla
        </Button>
      </Box>

      {/* Filtros */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2, 
        mb: 3,
        p: 2,
        background: colors.primary[400],
        borderRadius: 2,
      }}>
        {/* Búsqueda */}
        <TextField
          placeholder="Buscar plantilla..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ 
            flex: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: colors.primary[500],
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: colors.grey[400] }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Filtro por categoría */}
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            displayEmpty
            sx={{ backgroundColor: colors.primary[500] }}
          >
            <MenuItem value="">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterListIcon fontSize="small" />
                Todas las categorías
              </Box>
            </MenuItem>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{cat.emoji}</span>
                  {cat.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Botón refresh */}
        <Tooltip title="Actualizar">
          <IconButton onClick={loadTemplates} sx={{ color: colors.grey[300] }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
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
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: colors.greenAccent[500] }} />
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
              onClick={() => setShowCreateModal(true)}
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
          {/* Contador */}
          <Typography variant="body2" color={colors.grey[400]} mb={2}>
            {templates.length} plantilla{templates.length !== 1 ? 's' : ''} encontrada{templates.length !== 1 ? 's' : ''}
          </Typography>

          {/* Grid de plantillas */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              lg: 'repeat(3, 1fr)' 
            },
            gap: 3,
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
      <CreateTemplateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

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

