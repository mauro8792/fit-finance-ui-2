import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useStudentsStore } from '../../hooks';

const ViewStudent = ({ open, onClose, studentId }) => {
  const { getStudentById } = useStudentsStore();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudent = async () => {
      if (studentId && open) {
        setLoading(true);
        try {
          const data = await getStudentById(studentId);
          setStudent(data);
        } catch (error) {
          console.error('Error loading student:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadStudent();
  }, [studentId, open, getStudentById]);

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold">
          👤 Detalle del Estudiante
        </Typography>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Typography>Cargando...</Typography>
        ) : student ? (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">
                  {student.firstName} {student.lastName}
                </Typography>
                <Chip
                  label={student.isActive ? 'Activo' : 'Inactivo'}
                  color={student.isActive ? 'success' : 'error'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {student.user?.email || 'No disponible'}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Documento
                </Typography>
                <Typography variant="body1">{student.document || '-'}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Teléfono
                </Typography>
                <Typography variant="body1">{student.phone || '-'}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Fecha de Nacimiento
                </Typography>
                <Typography variant="body1">{student.birthDate || '-'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Deporte
                </Typography>
                <Typography variant="body1">
                  {student.sport?.name || 'No asignado'}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Coach
                </Typography>
                <Typography variant="body1">
                  {student.coach?.user?.fullName || 'No asignado'}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Fecha de Inicio
                </Typography>
                <Typography variant="body1">{student.startDate || '-'}</Typography>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Typography>No se encontró el estudiante</Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewStudent;

