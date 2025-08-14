/* eslint-disable react/prop-types */
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, FormControlLabel, Switch, Box, Typography, Chip, Divider } from '@mui/material';

export const ViewStudentModal = ({ openModal,  selectedUser, handleCloseModal }) => {
  return (
    <Dialog open={openModal} onClose={handleCloseModal} maxWidth={false} fullWidth style={{ position: 'absolute' }}>
      <DialogTitle>Información del Estudiante</DialogTitle>
      <DialogContent style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <FormControl fullWidth margin='normal'>
          <TextField label='Nombre' value={selectedUser.firstName} variant='outlined' disabled />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField label='Apellido' value={selectedUser.lastName} variant='outlined' disabled />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField
            label='Fecha de Nacimiento'
            value={selectedUser.birthDate}
            type='date'
            variant='outlined'
            InputLabelProps={{
              shrink: true,
            }}
            disabled
          />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField label='Teléfono' value={selectedUser.phone} variant='outlined' disabled />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField
            label='Fecha de Inicio'
            value={selectedUser.startDate}
            type='date'
            variant='outlined'
            InputLabelProps={{
              shrink: true,
            }}
            disabled
          />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField label='Documento' value={selectedUser.document} variant='outlined' disabled />
        </FormControl>
        
        {/* Información deportiva mejorada */}
        <Box sx={{ gridColumn: 'span 2', mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Información Deportiva
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Disciplina Base:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={selectedUser.sport?.name || selectedUser.sportName || 'Sin deporte'} 
                  color="primary" 
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  Precio base: ${selectedUser.sport?.monthlyFee || 'N/A'}
                </Typography>
              </Box>
            </Box>

            {selectedUser.sportPlan && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Plan Específico:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={selectedUser.sportPlan.name} 
                    color="success" 
                    variant="filled"
                  />
                  <Chip 
                    label={`$${selectedUser.sportPlan.monthlyFee}/mes`} 
                    color="success" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`${selectedUser.sportPlan.weeklyFrequency}x por semana`} 
                    color="info" 
                    variant="outlined"
                  />
                </Box>
                {selectedUser.sportPlan.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {selectedUser.sportPlan.description}
                  </Typography>
                )}
              </Box>
            )}

            {!selectedUser.sportPlan && selectedUser.sport && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Este estudiante usa el precio base de la disciplina (${selectedUser.sport.monthlyFee})
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        
        <FormControlLabel control={<Switch checked={selectedUser.isActive} name='isActive' color='primary' disabled />} label='Activo' />
      </DialogContent>
      <DialogActions style={{ justifyContent: 'flex-end' }}>
        <Button onClick={handleCloseModal} color='primary'>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
