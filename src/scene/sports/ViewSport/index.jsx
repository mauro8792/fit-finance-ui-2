/* eslint-disable react/prop-types */
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme
} from '@mui/material';
import SportsIcon from '@mui/icons-material/Sports';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import FitnessCenter from '@mui/icons-material/FitnessCenter';
import EventIcon from '@mui/icons-material/Event';
import { tokens } from '../../../theme';

export const ViewSportModal = ({ openModal, selectedUser: sport, handleCloseModal }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  if (!sport) return null;

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
    <Dialog 
      open={openModal} 
      onClose={handleCloseModal} 
      maxWidth="md" 
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
              {sport.name}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Información detallada de la disciplina
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Información Básica */}
        <Card sx={{ mb: 3, border: `1px solid ${colors.grey[700]}` }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon /> Información Básica
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField 
                  label="Nombre de la Disciplina" 
                  value={sport.name} 
                  variant="outlined" 
                  disabled 
                  fullWidth
                  InputProps={{
                    startAdornment: <SportsIcon sx={{ mr: 1, color: colors.grey[500] }} />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  label="Descripción" 
                  value={sport.description || 'Sin descripción'} 
                  variant="outlined" 
                  disabled 
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Planes Disponibles */}
        <Card sx={{ border: `1px solid ${colors.grey[700]}` }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FitnessCenter /> Planes Disponibles
              <Chip 
                label={`${sport.sportPlans?.length || 0} planes`}
                size="small"
                sx={{ 
                  backgroundColor: colors.blueAccent[500], 
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Typography>

            {sport.sportPlans && sport.sportPlans.length > 0 ? (
              <Grid container spacing={2}>
                {sport.sportPlans.map((plan, index) => (
                  <Grid item xs={12} md={6} key={plan.id || index}>
                    <Card 
                      sx={{ 
                        border: `2px solid ${getFrequencyColor(plan.weeklyFrequency)}`,
                        borderRadius: 2,
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-2px)' }
                      }}
                    >
                      <CardContent sx={{ pb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {plan.name}
                          </Typography>
                          <Chip
                            label={getFrequencyLabel(plan.weeklyFrequency)}
                            size="small"
                            sx={{
                              backgroundColor: getFrequencyColor(plan.weeklyFrequency),
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>

                        <List dense sx={{ py: 0 }}>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <EventIcon fontSize="small" sx={{ color: colors.grey[500] }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={`${plan.weeklyFrequency} ${plan.weeklyFrequency === 1 ? 'vez' : 'veces'} por semana`}
                              primaryTypographyProps={{ fontSize: '0.9rem' }}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <AttachMoneyIcon fontSize="small" sx={{ color: colors.grey[500] }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={`$${parseFloat(plan.monthlyFee).toLocaleString()} / mes`}
                              primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 'bold' }}
                            />
                          </ListItem>
                        </List>

                        {plan.description && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mt: 1, 
                              fontStyle: 'italic',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {plan.description}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  backgroundColor: colors.grey[100],
                  borderRadius: 2,
                  border: `1px dashed ${colors.grey[400]}`
                }}
              >
                <FitnessCenter sx={{ fontSize: 48, color: colors.grey[400], mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  No hay planes configurados para esta disciplina
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Los planes se pueden agregar usando el botón &ldquo;Editar&rdquo; de esta disciplina
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={handleCloseModal} 
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
