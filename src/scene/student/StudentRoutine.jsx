import { Box } from '@mui/material';
// import { RoutineTable } from '../../components/RoutineTable';
import { RoutineMobileFullMock } from '../../components/RoutineMobileFullMock';
import { Header } from '../../components';
import { useNavigate } from 'react-router-dom';

export const StudentRoutine = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '100vw', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header title="Rutina de Entrenamiento" subtitle="Visualiza y edita tu rutina" />
      <Box mb={2}>
        <button onClick={() => navigate(-1)} style={{ padding: 8, borderRadius: 4, background: '#70d8bd', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Volver al Dashboard
        </button>
      </Box>
      <RoutineMobileFullMock />
    </Box>
  );
};
