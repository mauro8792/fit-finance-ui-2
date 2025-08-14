/* eslint-disable react/prop-types */
import { 
  Box, 
  TextField, 
  Typography, 
  Alert,
  InputAdornment 
} from '@mui/material';
import SportsIcon from '@mui/icons-material/Sports';
import DescriptionIcon from '@mui/icons-material/Description';

export const SportBasicForm = ({ data, onChange }) => {
  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    onChange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Paso 1:</strong> Define la información básica de la disciplina deportiva. 
          En el siguiente paso configurarás los planes específicos con sus precios y frecuencias.
        </Typography>
      </Alert>

      <TextField
        label="Nombre de la Disciplina"
        value={data.name}
        onChange={handleInputChange('name')}
        fullWidth
        required
        margin="normal"
        variant="outlined"
        placeholder="ej: Boxeo, Yoga, CrossFit, Natación"
        helperText="Nombre que identifica la disciplina deportiva"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SportsIcon />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="Descripción"
        value={data.description}
        onChange={handleInputChange('description')}
        fullWidth
        margin="normal"
        variant="outlined"
        multiline
        rows={3}
        placeholder="Describe la disciplina deportiva, su enfoque, beneficios, etc."
        helperText="Descripción opcional de la disciplina"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
              <DescriptionIcon />
            </InputAdornment>
          ),
        }}
      />

      <Alert severity="success" sx={{ mt: 2 }}>
        <Typography variant="body2">
          💡 <strong>Importante:</strong> En el siguiente paso deberás crear al menos un plan específico 
          (ej: &ldquo;2 veces por semana&rdquo;, &ldquo;Plan ilimitado&rdquo;) con su precio correspondiente, 
          ya que los estudiantes se inscribirán a planes específicos, no a la disciplina general.
        </Typography>
      </Alert>
    </Box>
  );
};
