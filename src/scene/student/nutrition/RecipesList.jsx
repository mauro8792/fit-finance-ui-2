import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { tokens } from '../../../theme';
import { getRecipes, deleteRecipe } from '../../../api/nutritionApi';

const RecipesList = ({ studentId }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(null);

  // Recargar recetas cuando se vuelve de la página de crear/editar
  useEffect(() => {
    loadRecipes();
  }, [studentId, location.key]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecipes(studentId);
      setRecipes(data);
    } catch (err) {
      setError('Error al cargar las recetas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recipeId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta receta?')) return;
    
    try {
      setDeleting(recipeId);
      await deleteRecipe(recipeId);
      setRecipes(recipes.filter(r => r.id !== recipeId));
    } catch (err) {
      setError('Error al eliminar la receta');
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const handleNewRecipe = () => {
    navigate('/student/nutrition/recipe/new');
  };

  const handleEdit = (recipe) => {
    navigate('/student/nutrition/recipe/new', { state: { recipe } });
  };

  // Filtrar recetas por búsqueda
  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header con búsqueda y botón crear */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          mb: 3,
          alignItems: isMobile ? 'stretch' : 'center',
        }}
      >
        <TextField
          placeholder="Buscar receta..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: colors.primary[400],
              '& fieldset': { borderColor: colors.grey[600] },
              '&:hover fieldset': { borderColor: colors.orangeAccent[500] },
            },
            '& .MuiInputBase-input': { color: colors.grey[100] },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: colors.grey[400] }} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewRecipe}
          sx={{
            backgroundColor: colors.orangeAccent[500],
            color: '#fff',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: colors.orangeAccent[600],
            },
          }}
        >
          Nueva Receta
        </Button>
      </Box>

      {/* Lista de recetas */}
      {filteredRecipes.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            backgroundColor: colors.primary[400],
            borderRadius: '8px',
          }}
        >
          <RestaurantIcon sx={{ fontSize: 48, color: colors.grey[500], mb: 2 }} />
          <Typography variant="h6" color={colors.grey[300]}>
            {searchTerm ? 'No se encontraron recetas' : 'No tenés recetas creadas'}
          </Typography>
          <Typography variant="body2" color={colors.grey[500]} mb={2}>
            {searchTerm 
              ? 'Probá con otro término de búsqueda' 
              : 'Creá tu primera receta para agilizar el registro de comidas'
            }
          </Typography>
          {!searchTerm && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleNewRecipe}
              sx={{
                color: colors.orangeAccent[500],
                borderColor: colors.orangeAccent[500],
              }}
            >
              Crear primera receta
            </Button>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 2,
          }}
        >
          {filteredRecipes.map((recipe) => (
            <Card
              key={recipe.id}
              sx={{
                backgroundColor: colors.primary[400],
                border: `1px solid ${colors.grey[700]}`,
                '&:hover': {
                  borderColor: colors.orangeAccent[500],
                },
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color={colors.grey[100]}
                  mb={1}
                >
                  {recipe.name}
                </Typography>
                
                {recipe.description && (
                  <Typography
                    variant="body2"
                    color={colors.grey[400]}
                    mb={2}
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {recipe.description}
                  </Typography>
                )}

                {/* Macros por 100g */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip
                    size="small"
                    label={`${Math.round(recipe.caloriesPer100g)} kcal`}
                    sx={{
                      backgroundColor: colors.greenAccent[700],
                      color: colors.grey[100],
                    }}
                  />
                  <Chip
                    size="small"
                    label={`P: ${Math.round(recipe.proteinPer100g)}g 🥩`}
                    sx={{
                      backgroundColor: colors.redAccent[700],
                      color: colors.grey[100],
                    }}
                  />
                  <Chip
                    size="small"
                    label={`H: ${Math.round(recipe.carbsPer100g)}g 💧`}
                    sx={{
                      backgroundColor: colors.blueAccent[700],
                      color: colors.grey[100],
                    }}
                  />
                  <Chip
                    size="small"
                    label={`G: ${Math.round(recipe.fatPer100g)}g 🧈`}
                    sx={{
                      backgroundColor: colors.orangeAccent[700],
                      color: colors.grey[100],
                    }}
                  />
                </Box>

                {/* Info de ingredientes */}
                <Typography variant="caption" color={colors.grey[500]}>
                  {recipe.ingredients?.length || 0} ingredientes • {recipe.totalGrams}g total
                </Typography>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                <IconButton
                  size="small"
                  onClick={() => handleEdit(recipe)}
                  sx={{ color: colors.blueAccent[400] }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(recipe.id)}
                  disabled={deleting === recipe.id}
                  sx={{ color: colors.redAccent[400] }}
                >
                  {deleting === recipe.id ? (
                    <CircularProgress size={18} />
                  ) : (
                    <DeleteIcon fontSize="small" />
                  )}
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

    </Box>
  );
};

export default RecipesList;

