import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import { tokens } from '../../../theme';
import fitFinanceApi from '../../../api/fitFinanceApi';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';

// Helper para obtener la fecha de hoy en formato DD/MM/YYYY
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
};

// Helper para convertir DD/MM/YYYY a YYYY-MM-DD
const convertToBackendFormat = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length !== 3) return '';
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// Helper para validar formato DD/MM/YYYY
const isValidDate = (dateStr) => {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  if (!regex.test(dateStr)) return false;
  const [, day, month, year] = dateStr.match(regex);
  const d = new Date(year, month - 1, day);
  return d.getDate() == day && d.getMonth() == month - 1 && d.getFullYear() == year;
};

const AnthropometryTracker = ({ studentId }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(true);
  const [measurements, setMeasurements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: getTodayDateString(),
    weight: '',
    // Pliegues cutáneos (mm)
    plieguePantorrilla: '',
    pliegueTriceps: '',
    pliegueSubescapular: '',
    pliegueSupraespinal: '',
    pliegueAbdominal: '',
    pliegueMusloMedial: '',
    // Perímetros (cm)
    perimetroBrazoRelajado: '',
    perimetroBrazoContraido: '',
    perimetroAntebrazo: '',
    perimetroTorax: '',
    perimetroCintura: '',
    perimetroCaderas: '',
    perimetroMusloSuperior: '',
    perimetroMusloMedial: '',
    perimetroPantorrilla: '',
    notes: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchMeasurements();
  }, [studentId]);

  const fetchMeasurements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fitFinanceApi.get(`/health/anthropometry/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMeasurements(response.data);
    } catch (err) {
      console.error('Error fetching anthropometry:', err);
      setError('Error al cargar las mediciones');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    let value = e.target.value;
    
    // Remover caracteres no numéricos excepto /
    value = value.replace(/[^\d/]/g, '');
    
    // Aplicar máscara DD/MM/YYYY
    if (value.length <= 2) {
      // Solo día
      setFormData((prev) => ({ ...prev, date: value }));
    } else if (value.length <= 5) {
      // Día y mes
      const parts = value.split('/');
      if (parts.length === 1 && value.length === 2) {
        setFormData((prev) => ({ ...prev, date: value + '/' }));
      } else if (parts.length === 2) {
        setFormData((prev) => ({ ...prev, date: value }));
      }
    } else {
      // Día, mes y año
      const parts = value.split('/');
      if (parts.length === 2 && value.length === 5) {
        setFormData((prev) => ({ ...prev, date: value + '/' }));
      } else if (parts.length === 3) {
        // Limitar año a 4 dígitos
        const [day, month, year] = parts;
        const limitedYear = year.substring(0, 4);
        setFormData((prev) => ({ ...prev, date: `${day}/${month}/${limitedYear}` }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidDate(formData.date)) {
      setError('Por favor ingresa una fecha válida en formato DD/MM/YYYY');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Convertir DD/MM/YYYY a YYYY-MM-DD para el backend
      const dateString = convertToBackendFormat(formData.date);
      
      // Filtrar solo los campos con valor
      const payload = Object.entries(formData).reduce((acc, [key, value]) => {
        if (key === 'date') {
          acc[key] = dateString;
        } else if (value !== '' && value !== null && value !== undefined) {
          acc[key] = key === 'notes' ? value : parseFloat(value);
        }
        return acc;
      }, {});

      await fitFinanceApi.post(
        `/health/anthropometry/${studentId}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess('Medición registrada exitosamente');
      resetForm();
      setShowForm(false);
      fetchMeasurements();
    } catch (err) {
      console.error('Error saving measurement:', err);
      setError('Error al guardar la medición');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta medición?')) return;

    try {
      const token = localStorage.getItem('token');
      await fitFinanceApi.delete(`/health/anthropometry/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Medición eliminada exitosamente');
      fetchMeasurements();
    } catch (err) {
      console.error('Error deleting measurement:', err);
      setError('Error al eliminar la medición');
    }
  };

  const resetForm = () => {
    setFormData({
      date: getTodayDateString(),
      weight: '',
      plieguePantorrilla: '',
      pliegueTriceps: '',
      pliegueSubescapular: '',
      pliegueSupraespinal: '',
      pliegueAbdominal: '',
      pliegueMusloMedial: '',
      perimetroBrazoRelajado: '',
      perimetroBrazoContraido: '',
      perimetroAntebrazo: '',
      perimetroTorax: '',
      perimetroCintura: '',
      perimetroCaderas: '',
      perimetroMusloSuperior: '',
      perimetroMusloMedial: '',
      perimetroPantorrilla: '',
      notes: '',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Mensajes */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Botón Agregar */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowForm(!showForm)}
          sx={{
            backgroundColor: colors.orangeAccent[500],
            '&:hover': { backgroundColor: colors.orangeAccent[600] },
          }}
        >
          {showForm ? 'Cancelar' : 'Nueva Medición'}
        </Button>
      </Box>

      {/* Formulario */}
      <Collapse in={showForm}>
        <Card sx={{ backgroundColor: colors.primary[400], mb: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" mb={2}>
              Nueva Medición Antropométrica
            </Typography>
            <form onSubmit={handleSubmit}>
              {/* Fecha y Peso */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fecha"
                    value={formData.date}
                    onChange={handleDateChange}
                    placeholder="DD/MM/YYYY"
                    helperText="Formato: DD/MM/YYYY (ej: 16/11/2025)"
                    required
                    inputProps={{
                      maxLength: 10,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Peso (kg)"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    inputProps={{ step: '0.1', min: '0' }}
                  />
                </Grid>
              </Grid>

              {/* Pliegues Cutáneos */}
              <Typography variant="h6" fontWeight="bold" mb={2} color={colors.orangeAccent[500]}>
                📏 Pliegues Cutáneos (mm)
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Pantorrilla"
                    value={formData.plieguePantorrilla}
                    onChange={(e) => setFormData({ ...formData, plieguePantorrilla: e.target.value })}
                    inputProps={{ step: '0.1', min: '0' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Tríceps"
                    value={formData.pliegueTriceps}
                    onChange={(e) => setFormData({ ...formData, pliegueTriceps: e.target.value })}
                    inputProps={{ step: '0.1', min: '0' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Subescapular"
                    value={formData.pliegueSubescapular}
                    onChange={(e) => setFormData({ ...formData, pliegueSubescapular: e.target.value })}
                    inputProps={{ step: '0.1', min: '0' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Supraespinal"
                    value={formData.pliegueSupraespinal}
                    onChange={(e) => setFormData({ ...formData, pliegueSupraespinal: e.target.value })}
                    inputProps={{ step: '0.1', min: '0' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Abdominal"
                    value={formData.pliegueAbdominal}
                    onChange={(e) => setFormData({ ...formData, pliegueAbdominal: e.target.value })}
                    inputProps={{ step: '0.1', min: '0' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Muslo Medial"
                    value={formData.pliegueMusloMedial}
                    onChange={(e) => setFormData({ ...formData, pliegueMusloMedial: e.target.value })}
                    inputProps={{ step: '0.1', min: '0' }}
                  />
                </Grid>
              </Grid>

              {/* Perímetros */}
              <Typography variant="h6" fontWeight="bold" mb={2} color={colors.blueAccent[500]}>
                📐 Perímetros (cm)
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Brazo Relajado"
                    value={formData.perimetroBrazoRelajado}
                    onChange={(e) => setFormData({ ...formData, perimetroBrazoRelajado: e.target.value })}
                    inputProps={{ step: '0.1', min: '0' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Brazo Contraído"
                    value={formData.perimetroBrazoContraido}
                    onChange={(e) => setFormData({ ...formData, perimetroBrazoContraido: e.target.value })}
                    inputProps={{ step: '0.1', min: '0' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Antebrazo"
                    value={formData.perimetroAntebrazo}
                    onChange={(e) => setFormData({ ...formData, perimetroAntebrazo: e.target.value })}
                    inputProps={{ step: '0.1', min: '0' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Tórax"
                    value={formData.perimetroTorax}
                    onChange={(e) => setFormData({ ...formData, perimetroTorax: e.target.value })}
                    inputProps={{ step: '0.1', min: '0' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cintura"
                    value={formData.perimetroCintura}
                    onChange={(e) => setFormData({ ...formData, perimetroCintura: e.target.value })}
                    inputProps={{ step: '0.1', min: '0' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Caderas"
                    value={formData.perimetroCaderas}
                    onChange={(e) => setFormData({ ...formData, perimetroCaderas: e.target.value })}
                    inputProps={{ step: '0.1', min: '0' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Muslo Superior"
                    value={formData.perimetroMusloSuperior}
                    onChange={(e) => setFormData({ ...formData, perimetroMusloSuperior: e.target.value })}
                    inputProps={{ step: '0.1', min: '0' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Muslo Medial"
                    value={formData.perimetroMusloMedial}
                    onChange={(e) => setFormData({ ...formData, perimetroMusloMedial: e.target.value })}
                    inputProps={{ step: '0.1', min: '0' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Pantorrilla"
                    value={formData.perimetroPantorrilla}
                    onChange={(e) => setFormData({ ...formData, perimetroPantorrilla: e.target.value })}
                    inputProps={{ step: '0.1', min: '0' }}
                  />
                </Grid>
              </Grid>

              {/* Notas */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notas (opcional)"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: colors.greenAccent[600],
                  '&:hover': { backgroundColor: colors.greenAccent[700] },
                }}
              >
                Guardar Medición
              </Button>
            </form>
          </CardContent>
        </Card>
      </Collapse>

      {/* Historial */}
      <Card sx={{ backgroundColor: colors.primary[400] }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Historial de Mediciones
          </Typography>
          {measurements.length === 0 ? (
            <Typography color={colors.grey[300]}>
              No hay mediciones registradas aún. ¡Comienza registrando tu primera medición!
            </Typography>
          ) : (
            <Box>
              {measurements.map((measurement) => (
                <Accordion
                  key={measurement.id}
                  sx={{
                    backgroundColor: colors.primary[500],
                    mb: 1,
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pr: 2 }}>
                      <Box>
                        <Typography fontWeight="bold">
                          {formatDateToDDMMYYYY(measurement.date)}
                        </Typography>
                        <Typography variant="caption" color={colors.grey[300]}>
                          {measurement.porcentajeGrasa && `${measurement.porcentajeGrasa}% grasa`}
                          {measurement.weight && ` • ${measurement.weight} kg`}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(measurement.id);
                        }}
                        sx={{ color: colors.redAccent[500] }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {/* Composición Corporal */}
                      {measurement.porcentajeGrasa && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" fontWeight="bold" mb={1} color={colors.orangeAccent[500]}>
                            Composición Corporal
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="caption">% Grasa:</Typography>
                              <Typography fontWeight="bold">{measurement.porcentajeGrasa}%</Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="caption">% Muscular:</Typography>
                              <Typography fontWeight="bold">{measurement.porcentajeMuscular}%</Typography>
                            </Grid>
                            {measurement.masaGrasaKg && (
                              <>
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="caption">Masa Grasa:</Typography>
                                  <Typography fontWeight="bold">{measurement.masaGrasaKg} kg</Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="caption">Masa Magra:</Typography>
                                  <Typography fontWeight="bold">{measurement.masaMagraKg} kg</Typography>
                                </Grid>
                              </>
                            )}
                          </Grid>
                          <Divider sx={{ my: 2 }} />
                        </Grid>
                      )}

                      {/* Pliegues */}
                      {measurement.sumaPliegues && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" fontWeight="bold" mb={1} color={colors.blueAccent[500]}>
                            Pliegues (mm)
                          </Typography>
                          <Grid container spacing={1}>
                            {measurement.plieguePantorrilla && (
                              <Grid item xs={6}>
                                <Typography variant="caption">Pantorrilla: {measurement.plieguePantorrilla}</Typography>
                              </Grid>
                            )}
                            {measurement.pliegueTriceps && (
                              <Grid item xs={6}>
                                <Typography variant="caption">Tríceps: {measurement.pliegueTriceps}</Typography>
                              </Grid>
                            )}
                            {measurement.pliegueSubescapular && (
                              <Grid item xs={6}>
                                <Typography variant="caption">Subescapular: {measurement.pliegueSubescapular}</Typography>
                              </Grid>
                            )}
                            {measurement.pliegueSupraespinal && (
                              <Grid item xs={6}>
                                <Typography variant="caption">Supraespinal: {measurement.pliegueSupraespinal}</Typography>
                              </Grid>
                            )}
                            {measurement.pliegueAbdominal && (
                              <Grid item xs={6}>
                                <Typography variant="caption">Abdominal: {measurement.pliegueAbdominal}</Typography>
                              </Grid>
                            )}
                            {measurement.pliegueMusloMedial && (
                              <Grid item xs={6}>
                                <Typography variant="caption">Muslo: {measurement.pliegueMusloMedial}</Typography>
                              </Grid>
                            )}
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" fontWeight="bold" mt={1}>
                                Suma Total: {measurement.sumaPliegues} mm
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      )}

                      {/* Perímetros */}
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" fontWeight="bold" mb={1} color={colors.greenAccent[500]}>
                          Perímetros (cm)
                        </Typography>
                        <Grid container spacing={1}>
                          {measurement.perimetroBrazoRelajado && (
                            <Grid item xs={6}>
                              <Typography variant="caption">Brazo Relaj: {measurement.perimetroBrazoRelajado}</Typography>
                            </Grid>
                          )}
                          {measurement.perimetroBrazoContraido && (
                            <Grid item xs={6}>
                              <Typography variant="caption">Brazo Contr: {measurement.perimetroBrazoContraido}</Typography>
                            </Grid>
                          )}
                          {measurement.perimetroAntebrazo && (
                            <Grid item xs={6}>
                              <Typography variant="caption">Antebrazo: {measurement.perimetroAntebrazo}</Typography>
                            </Grid>
                          )}
                          {measurement.perimetroTorax && (
                            <Grid item xs={6}>
                              <Typography variant="caption">Tórax: {measurement.perimetroTorax}</Typography>
                            </Grid>
                          )}
                          {measurement.perimetroCintura && (
                            <Grid item xs={6}>
                              <Typography variant="caption">Cintura: {measurement.perimetroCintura}</Typography>
                            </Grid>
                          )}
                          {measurement.perimetroCaderas && (
                            <Grid item xs={6}>
                              <Typography variant="caption">Caderas: {measurement.perimetroCaderas}</Typography>
                            </Grid>
                          )}
                          {measurement.perimetroMusloSuperior && (
                            <Grid item xs={6}>
                              <Typography variant="caption">Muslo Sup: {measurement.perimetroMusloSuperior}</Typography>
                            </Grid>
                          )}
                          {measurement.perimetroMusloMedial && (
                            <Grid item xs={6}>
                              <Typography variant="caption">Muslo Med: {measurement.perimetroMusloMedial}</Typography>
                            </Grid>
                          )}
                          {measurement.perimetroPantorrilla && (
                            <Grid item xs={6}>
                              <Typography variant="caption">Pantorrilla: {measurement.perimetroPantorrilla}</Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Grid>

                      {/* Notas */}
                      {measurement.notes && (
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="caption" color={colors.grey[300]}>
                            <strong>Notas:</strong> {measurement.notes}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AnthropometryTracker;

