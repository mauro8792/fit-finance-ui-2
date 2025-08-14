/* eslint-disable react/prop-types */
import { 
  Container, 
  Box, 
  Typography,
  Paper
} from '@mui/material';
import { Sports } from '../index.jsx';

export const SportsMainView = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Gestión de Deportes
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Administra las disciplinas deportivas y sus planes de precios desde el asistente y los formularios de edición
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ height: 'calc(100vh - 150px)', overflow: 'hidden' }}>
          <Sports />
        </Box>
      </Paper>
    </Container>
  );
};
