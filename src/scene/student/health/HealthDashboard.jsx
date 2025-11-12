import { useState } from 'react';
import { Box, Tabs, Tab, Typography, useTheme, useMediaQuery } from '@mui/material';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import StraightenIcon from '@mui/icons-material/Straighten';
import { tokens } from '../../../theme';
import { useAuthStore } from '../../../hooks';
import WeightTracker from './WeightTracker';
import AnthropometryTracker from './AnthropometryTracker';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`health-tabpanel-${index}`}
      aria-labelledby={`health-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const HealthDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { student } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const studentId = student?.id;

  if (!studentId) {
    return (
      <Box p={3}>
        <Typography variant="h5" color="error">
          Error: No se pudo identificar tu cuenta de estudiante.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: colors.primary[400],
        padding: isMobile ? '10px' : '20px',
      }}
    >
      {/* Header */}
      <Box mb={3}>
        <Typography
          variant={isMobile ? 'h4' : 'h3'}
          fontWeight="bold"
          color={colors.grey[100]}
          mb={1}
        >
          📊 Mi Progreso
        </Typography>
        <Typography variant="body1" color={colors.grey[300]}>
          Seguimiento de tu peso corporal, antropometría y composición física
        </Typography>
      </Box>

      {/* Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: colors.primary[500],
          borderRadius: '8px 8px 0 0',
          mb: 0,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? 'fullWidth' : 'standard'}
          sx={{
            '& .MuiTab-root': {
              color: colors.grey[300],
              fontWeight: '600',
              fontSize: isMobile ? '13px' : '15px',
              minHeight: isMobile ? '48px' : '56px',
            },
            '& .Mui-selected': {
              color: colors.orangeAccent[500],
            },
            '& .MuiTabs-indicator': {
              backgroundColor: colors.orangeAccent[500],
              height: '3px',
            },
          }}
        >
          <Tab
            icon={<MonitorWeightIcon />}
            iconPosition="start"
            label="Peso Corporal"
          />
          <Tab
            icon={<StraightenIcon />}
            iconPosition="start"
            label="Antropometría"
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box
        sx={{
          backgroundColor: colors.primary[500],
          borderRadius: '0 0 8px 8px',
          padding: isMobile ? '15px' : '20px',
        }}
      >
        <TabPanel value={tabValue} index={0}>
          <WeightTracker studentId={studentId} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <AnthropometryTracker studentId={studentId} />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default HealthDashboard;

