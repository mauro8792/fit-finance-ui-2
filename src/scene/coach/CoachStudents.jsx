import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Group as GroupIcon,
  Email as EmailIcon,
  FitnessCenter as FitnessCenterIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const CoachStudents = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, getCoachStudentsData, status } = useAuthStore();
  const coachUserId = user?.id;
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // 'all', 'active', 'paused'
  const navigate = useNavigate();

  // Cargar alumnos (incluyendo pausados)
  const loadStudents = () => {
    if (status !== 'authenticated' || !coachUserId) return;
    setLoading(true);
    getCoachStudentsData(coachUserId, true) // includeInactive = true
      .then((data) => {
        setStudents(data);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStudents();
  }, [coachUserId, status]);

  // Filtrar alumnos por búsqueda y estado
  useEffect(() => {
    let filtered = students;
    
    // Filtrar por estado
    if (statusFilter === 'active') {
      filtered = filtered.filter(s => s.isActive !== false);
    } else if (statusFilter === 'paused') {
      filtered = filtered.filter(s => s.isActive === false);
    }
    
    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        (s.user?.fullName || `${s.firstName} ${s.lastName}`).toLowerCase().includes(term) ||
        s.user?.email?.toLowerCase().includes(term) ||
        s.sport?.name?.toLowerCase().includes(term)
      );
    }
    
    setFilteredStudents(filtered);
  }, [searchTerm, students, statusFilter]);

  // Contar alumnos por estado
  const activeCount = students.filter(s => s.isActive !== false).length;
  const pausedCount = students.filter(s => s.isActive === false).length;

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        gap: 2,
      }}>
        <CircularProgress size={60} sx={{ color: '#FFB300' }} />
        <Typography variant="body1" sx={{ color: '#aaa' }}>
          Cargando alumnos...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error al cargar los alumnos</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant={isMobile ? 'h5' : 'h4'} 
          sx={{ color: '#FFB300', fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <GroupIcon /> Mis Alumnos
        </Typography>
        <Typography variant="body2" sx={{ color: '#888' }}>
          {activeCount} activo{activeCount !== 1 ? 's' : ''}{pausedCount > 0 && ` · ${pausedCount} pausado${pausedCount !== 1 ? 's' : ''}`}
        </Typography>
      </Box>

      {/* Buscador y Filtro */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
        <TextField
          placeholder="Buscar por nombre, email o deporte..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#666' }} />
              </InputAdornment>
            ),
            sx: { 
              color: '#fff', 
              bgcolor: 'rgba(255,255,255,0.05)',
              borderRadius: 2,
              '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
              '&:hover fieldset': { borderColor: 'rgba(255,179,0,0.3)' },
            }
          }}
        />
        
        {/* Filtro de estado nativo */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            minWidth: isMobile ? '100%' : '180px',
            padding: '8px 12px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <option value="all" style={{ backgroundColor: '#1e1e1e' }}>Todos ({students.length})</option>
          <option value="active" style={{ backgroundColor: '#1e1e1e' }}>Activos ({activeCount})</option>
          <option value="paused" style={{ backgroundColor: '#1e1e1e' }}>Pausados ({pausedCount})</option>
        </select>
      </Box>

      {/* Lista de Alumnos */}
      {filteredStudents.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <GroupIcon sx={{ fontSize: 64, color: '#444', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
            {searchTerm ? 'No se encontraron alumnos' : 'No tenés alumnos asignados'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#555' }}>
            {searchTerm ? 'Probá con otro término de búsqueda' : 'Cuando tengas alumnos asignados, aparecerán aquí'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredStudents.map((student) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={student.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  background: student.isActive === false 
                    ? 'linear-gradient(135deg, #1a1a1a 0%, #151515 100%)' 
                    : 'linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%)',
                  border: student.isActive === false 
                    ? '1px solid #f44336' 
                    : '1px solid #333',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  opacity: student.isActive === false ? 0.8 : 1,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: student.isActive === false 
                      ? '0 12px 32px rgba(244, 67, 54, 0.2)'
                      : '0 12px 32px rgba(255, 179, 0, 0.2)',
                    borderColor: student.isActive === false ? '#f44336' : '#FFB300',
                    opacity: 1,
                  }
                }}
                onClick={() => navigate(`/coach/alumno/${student.id}`)}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Header del alumno */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: '#FFB300', 
                        color: '#000',
                        width: 56, 
                        height: 56,
                        fontWeight: 700,
                        fontSize: 24,
                        mr: 2 
                      }}
                    >
                      {(student.user?.fullName || student.firstName)?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: '#fff', 
                          fontWeight: 600, 
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {student.user?.fullName || `${student.firstName} ${student.lastName}`}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                        {student.sport && (
                          <Chip 
                            label={student.sport.name}
                            size="small"
                            sx={{ 
                              bgcolor: '#70d8bd',
                              color: '#000',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                        )}
                        {student.isActive === false && (
                          <Chip 
                            label="Pausado"
                            size="small"
                            sx={{ 
                              bgcolor: '#f44336',
                              color: '#fff',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2, borderColor: '#333' }} />

                  {/* Información del alumno */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ fontSize: 16, color: '#FFB300', mr: 1 }} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#ccc', 
                          fontSize: '0.85rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {student.user?.email || 'Sin email'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FitnessCenterIcon sx={{ fontSize: 16, color: '#70d8bd', mr: 1 }} />
                      <Typography variant="body2" sx={{ color: '#ccc', fontSize: '0.85rem' }}>
                        {student.macrocycles?.length > 0 
                          ? `${student.macrocycles.length} macrociclo(s)`
                          : 'Sin rutina asignada'
                        }
                      </Typography>
                    </Box>
                  </Box>

                  {/* Badge de estado */}
                  {student.macrocycles?.length > 0 ? (
                    <Chip 
                      label="✓ Con rutina" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(76,175,80,0.2)', 
                        color: '#66bb6a',
                        fontWeight: 600,
                      }} 
                    />
                  ) : (
                    <Chip 
                      label="⚠ Sin rutina" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,152,0,0.2)', 
                        color: '#ffb74d',
                        fontWeight: 600,
                      }} 
                    />
                  )}

                  {/* Botón Ver Detalle */}
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<VisibilityIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/coach/alumno/${student.id}`);
                      }}
                      sx={{
                        bgcolor: '#FFB300',
                        color: '#000',
                        fontWeight: 600,
                        '&:hover': { bgcolor: '#FF8F00' }
                      }}
                    >
                      Ver Detalle
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default CoachStudents;

