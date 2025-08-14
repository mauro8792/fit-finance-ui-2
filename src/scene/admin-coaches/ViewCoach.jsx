import { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  Email as EmailIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  FitnessCenter as FitnessIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useCoachesStore } from '../../hooks';

const ViewCoach = ({ open, onClose, coachId }) => {
  const theme = useTheme();
  const { selectedCoach, loading, fetchCoach, clearSelectedCoach } = useCoachesStore();

  useEffect(() => {
    if (open && coachId) {
      fetchCoach(coachId);
    }
    return () => {
      if (!open) {
        clearSelectedCoach();
      }
    };
  }, [open, coachId, fetchCoach, clearSelectedCoach]);

  const coach = selectedCoach;

  if (loading || !coach) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography>Cargando información del coach...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return 'No especificado';
    return `$${parseFloat(salary).toLocaleString()}`;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              bgcolor: theme.palette.primary.main, 
              mr: 2, 
              width: 48, 
              height: 48 
            }}
          >
            {coach.user?.fullName?.charAt(0) || 'C'}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {coach.user?.fullName}
            </Typography>
            <Chip
              size="small"
              label={coach.isActive ? 'Activo' : 'Inactivo'}
              color={coach.isActive ? 'success' : 'default'}
            />
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Información Personal */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: 'fit-content' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  Información Personal
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{coach.user?.email}</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Fecha de registro</Typography>
                      <Typography variant="body1">{formatDate(coach.createdAt)}</Typography>
                    </Box>
                  </Box>
                  
                  {coach.salary && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MoneyIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Salario</Typography>
                        <Typography variant="body1">{formatSalary(coach.salary)}</Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Información Profesional */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: 'fit-content' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                  <WorkIcon sx={{ mr: 1 }} />
                  Información Profesional
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {coach.specialization && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Especialización</Typography>
                      <Typography variant="body1">{coach.specialization}</Typography>
                    </Box>
                  )}
                  
                  {coach.experience && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Experiencia</Typography>
                      <Typography variant="body1">{coach.experience}</Typography>
                    </Box>
                  )}
                  
                  {coach.certification && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SchoolIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Certificaciones</Typography>
                        <Typography variant="body1">{coach.certification}</Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Biografía */}
          {coach.bio && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Biografía
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {coach.bio}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Deportes Asignados */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: 'fit-content' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                  <FitnessIcon sx={{ mr: 1 }} />
                  Deportes Asignados ({coach.sports?.length || 0})
                </Typography>
                {coach.sports?.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {coach.sports.map((sport) => (
                      <Chip
                        key={sport.id}
                        label={sport.name}
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Sin deportes asignados
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Estudiantes */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: 'fit-content' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                  <GroupsIcon sx={{ mr: 1 }} />
                  Estudiantes ({coach.students?.length || 0})
                </Typography>
                {coach.students?.length > 0 ? (
                  <List dense>
                    {coach.students.slice(0, 5).map((student) => (
                      <ListItem key={student.id} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {student.firstName?.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${student.firstName} ${student.lastName}`}
                          secondary={student.sport?.name}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                    {coach.students.length > 5 && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={`+${coach.students.length - 5} estudiantes más`}
                          primaryTypographyProps={{ 
                            variant: 'body2', 
                            color: 'text.secondary',
                            fontStyle: 'italic' 
                          }}
                        />
                      </ListItem>
                    )}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Sin estudiantes asignados
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ViewCoach.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  coachId: PropTypes.number,
};

export default ViewCoach;
