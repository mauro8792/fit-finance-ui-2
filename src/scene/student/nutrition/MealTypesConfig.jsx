import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  useTheme,
  Card,
  CardContent,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { tokens } from '../../../theme';
import { getMealTypes, createMealType, updateMealType, deleteMealType } from '../../../api/nutritionApi';

const MealTypesConfig = ({ studentId }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [mealTypes, setMealTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [mealName, setMealName] = useState('');

  useEffect(() => {
    loadMealTypes();
  }, [studentId]);

  const loadMealTypes = async () => {
    try {
      setLoading(true);
      const data = await getMealTypes(studentId);
      setMealTypes(data);
    } catch (error) {
      console.error('Error loading meal types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (meal = null) => {
    if (meal) {
      setEditingMeal(meal);
      setMealName(meal.name);
    } else {
      setEditingMeal(null);
      setMealName('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMeal(null);
    setMealName('');
  };

  const handleSubmit = async () => {
    try {
      if (editingMeal) {
        await updateMealType(editingMeal.id, { name: mealName });
      } else {
        await createMealType(studentId, { name: mealName });
      }
      handleCloseDialog();
      loadMealTypes();
    } catch (error) {
      console.error('Error saving meal type:', error);
    }
  };

  const handleDelete = async (mealId) => {
    if (window.confirm('¿Estás seguro de eliminar este momento de comida?')) {
      try {
        await deleteMealType(mealId);
        loadMealTypes();
      } catch (error) {
        console.error('Error deleting meal type:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" fontWeight="bold" color={colors.grey[100]}>
            ⚙️ Configurar Momentos de Comida
          </Typography>
          <Typography variant="body2" color={colors.grey[400]}>
            Personalizá los momentos del día para registrar tus comidas
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: colors.orangeAccent[500],
            '&:hover': { backgroundColor: colors.orangeAccent[600] },
          }}
        >
          Agregar
        </Button>
      </Box>

      <Card sx={{ backgroundColor: colors.primary[600] }}>
        <CardContent>
          {mealTypes.length > 0 ? (
            <List>
              {mealTypes.map((meal, index) => (
                <ListItem
                  key={meal.id}
                  sx={{
                    borderBottom: index < mealTypes.length - 1 ? `1px solid ${colors.primary[500]}` : 'none',
                    py: 2,
                  }}
                >
                  <Box sx={{ mr: 2, color: colors.grey[500], cursor: 'grab' }}>
                    <DragIndicatorIcon />
                  </Box>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="bold" color={colors.grey[100]}>
                        {meal.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color={colors.grey[400]}>
                        Orden: {meal.displayOrder}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={() => handleOpenDialog(meal)}
                      sx={{ color: colors.blueAccent[400] }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(meal.id)}
                      sx={{ color: colors.redAccent[400] }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box textAlign="center" p={4}>
              <Typography variant="body1" color={colors.grey[400]} mb={2}>
                No hay momentos de comida configurados
              </Typography>
              <Button
                variant="outlined"
                onClick={() => handleOpenDialog()}
                sx={{
                  color: colors.orangeAccent[400],
                  borderColor: colors.orangeAccent[400],
                }}
              >
                Crear el primero
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Sugerencias */}
      <Box mt={3}>
        <Typography variant="body2" color={colors.grey[400]} mb={1}>
          💡 Sugerencias de momentos:
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {['Pre-entreno', 'Post-entreno', 'Colación', 'Snack nocturno'].map((suggestion) => (
            <Button
              key={suggestion}
              size="small"
              variant="outlined"
              onClick={() => {
                setMealName(suggestion);
                setDialogOpen(true);
              }}
              sx={{
                color: colors.grey[300],
                borderColor: colors.grey[600],
                fontSize: '12px',
                '&:hover': {
                  borderColor: colors.orangeAccent[400],
                  color: colors.orangeAccent[400],
                },
              }}
            >
              + {suggestion}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: colors.primary[500],
            backgroundImage: 'none',
          },
        }}
      >
        <DialogTitle sx={{ color: colors.grey[100] }}>
          {editingMeal ? 'Editar Momento' : 'Nuevo Momento de Comida'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Nombre"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            fullWidth
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                color: colors.grey[100],
                '& fieldset': { borderColor: colors.grey[600] },
              },
              '& .MuiInputLabel-root': { color: colors.grey[400] },
            }}
            placeholder="Ej: Pre-entreno, Colación..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ color: colors.grey[300] }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!mealName.trim()}
            sx={{
              backgroundColor: colors.orangeAccent[500],
              '&:hover': { backgroundColor: colors.orangeAccent[600] },
            }}
          >
            {editingMeal ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MealTypesConfig;

