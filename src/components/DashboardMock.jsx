import { Box, Typography, Grid, Paper } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PaidIcon from '@mui/icons-material/Paid';
import FeedIcon from '@mui/icons-material/Feed';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';

// Mocked dashboard cards (sin asistencia, con profesores)
const DashboardMock = () => {
  return (
    <Box sx={{ p: { xs: 1, md: 4 }, width: '100%', minHeight: '90vh' }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#FFB300', fontWeight: 700 }}>
        Resumen General
      </Typography>
      <Grid container spacing={2} justifyContent="center" alignItems="stretch">
        {[{
          icon: <GroupIcon sx={{ fontSize: 44, color: '#FFB300', mb: 1 }} />, label: 'Alumnos activos', value: 128
        }, {
          icon: <SportsMartialArtsIcon sx={{ fontSize: 44, color: '#FFB300', mb: 1 }} />, label: 'Profesores', value: 8
        }, {
          icon: <FeedIcon sx={{ fontSize: 44, color: '#FFB300', mb: 1 }} />, label: 'Cuotas a vencer', value: 7
        }, {
          icon: <PaidIcon sx={{ fontSize: 44, color: '#FFB300', mb: 1 }} />, label: 'Pagos recientes', value: '$12.500'
        }].map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} lg={2.5} key={card.label} sx={{ display: 'flex' }}>
            <Paper elevation={6} sx={{
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(30,30,30,0.98)',
              color: '#fff',
              width: '100%',
              minHeight: 140,
              borderRadius: 3,
              boxShadow: '0 4px 24px 0 rgba(255,179,0,0.12)',
              border: '1.5px solid #FFB300',
              transition: 'transform 0.15s',
              '&:hover': { transform: 'scale(1.04)', boxShadow: '0 8px 32px 0 rgba(255,179,0,0.22)' }
            }}>
              {card.icon}
              <Typography variant="h6" fontWeight={600} align="center">{card.label}</Typography>
              <Typography variant="h4" fontWeight={700} align="center">{card.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      {/* Mocked chart area */}
      <Box sx={{ mt: 5, p: 3, background: '#181818', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ color: '#FFB300', mb: 2 }}>
          Estado de Pagos (Mock)
        </Typography>
        <Box sx={{ width: '100%', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, opacity: 0.7 }}>
          [Aquí iría un gráfico de barras o torta]
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardMock;
