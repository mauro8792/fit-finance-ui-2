import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PaidIcon from '@mui/icons-material/Paid';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import HistoryIcon from '@mui/icons-material/History';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import FeedIcon from '@mui/icons-material/Feed';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import { tokens } from '../theme';
import { useAuthStore } from '../hooks';
import { useTheme } from '@mui/material';

// Componente Item final - con Link de React Router
const MobileMenuItem = ({ title, to, icon, selected, setSelected, onClose }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const handleClick = () => {
    console.log(`🚀 Navegando a: ${to}`);
    setSelected(title);
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <Link 
      to={to} 
      style={{ 
        textDecoration: 'none', 
        color: 'inherit',
        display: 'block'
      }}
      onClick={handleClick}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 24px',
          margin: '4px 8px',
          borderRadius: '8px',
          minHeight: '56px',
          color: colors.grey[100],
          backgroundColor: selected === title ? colors.orangeAccent[500] : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: selected === title ? colors.orangeAccent[500] : 'rgba(255, 152, 0, 0.1)',
            transform: 'translateX(5px)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {icon}
        </Box>
        <Typography sx={{ fontSize: '1rem', fontWeight: 500 }}>
          {title}
        </Typography>
      </Box>
    </Link>
  );
};

MobileMenuItem.propTypes = {
  title: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  selected: PropTypes.string,
  setSelected: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

const FinalMobileDrawer = ({ open, onClose }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user, startLogout, userType, student } = useAuthStore();
  const [selected, setSelected] = useState('Dashboard');

  console.log('FinalMobileDrawer rendered:', { open, userType });

  // Función para manejar logout
  const handleLogout = () => {
    console.log('=== LOGOUT INICIADO ===');
    onClose();
    startLogout();
  };

  // Función para renderizar items según el tipo de usuario
  const renderMenuItems = () => {
    if (userType === 'student') {
      return (
        <>
          <MobileMenuItem title='Dashboard' to='/student' icon={<DashboardIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileMenuItem title='Mi Rutina' to='/student/routine' icon={<FitnessCenterIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileMenuItem title='Mi Progreso' to='/student/progress' icon={<MonitorHeartIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileMenuItem title='Nutrición' to='/student/nutrition' icon={<RestaurantIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileMenuItem title='Cardio' to='/student/cardio' icon={<DirectionsRunIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileMenuItem title='Mi Historial' to='/student/history' icon={<HistoryIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileMenuItem title='Mis Cuotas' to='/student/fees' icon={<PaidIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileMenuItem title='Mi Perfil' to='/student/profile' icon={<PersonSearchIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
        </>
      );
    }

    if (userType === 'coach') {
      return (
        <>
          <MobileMenuItem title='Dashboard' to='/coach/dashboard' icon={<DashboardIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileMenuItem title='Mis Alumnos' to='/coach/students' icon={<PersonSearchIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileMenuItem title='Rutinas' to='/coach/routines' icon={<FitnessCenterIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileMenuItem title='Macrociclos' to='/coach/macrocycles' icon={<AssignmentIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileMenuItem title='Horarios' to='/coach/schedule' icon={<ScheduleIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
        </>
      );
    }

    // Menú por defecto para admin/superadmin
    return (
      <>
        <MobileMenuItem title='HOME' to='/' icon={<HomeOutlinedIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
        <MobileMenuItem title='Disciplinas' to='/sports' icon={<SportsMartialArtsIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
        <MobileMenuItem title='Alumnos' to='/alumnos' icon={<PersonSearchIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
        <MobileMenuItem title='Pagos' to='/pagos' icon={<PaidIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
        <MobileMenuItem title='Cuotas' to='/cuotas' icon={<FeedIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
        <MobileMenuItem title='Usuarios' to='/usuarios' icon={<GroupIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
        <MobileMenuItem title='Coaches' to='/coaches' icon={<FitnessCenterIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
      </>
    );
  };

  // Nombre a mostrar según el tipo de usuario
  const getUserDisplayName = () => {
    if (userType === 'student' && student) {
      return `${student.firstName} ${student.lastName}`;
    }
    return user?.fullName || user?.name || user?.username || 'Usuario';
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100dvh', // Dynamic viewport height para móviles
          minHeight: '100vh', // Fallback
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1300,
        }}
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '320px',
          height: '100dvh', // Dynamic viewport height para móviles
          minHeight: '100vh', // Fallback
          background: `linear-gradient(180deg, #181818 0%, ${colors.primary[900]} 40%, ${colors.orangeAccent[500]} 100%)`,
          color: colors.grey[100],
          zIndex: 1400,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
          boxShadow: '2px 0 10px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header con información del usuario */}
        <Box 
          sx={{ 
            padding: '24px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
            flexShrink: 0
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              color: colors.orangeAccent[500], 
              fontWeight: 700,
              fontSize: '1.2rem'
            }}
          >
            {getUserDisplayName()}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: colors.grey[100], 
              fontSize: '0.85rem',
              mt: 0.5
            }}
          >
            {userType === 'student' ? 'Estudiante' : 
             userType === 'coach' ? 'Coach' : 'Administrador'}
          </Typography>
        </Box>
        
        {/* Menu Items */}
        <Box 
          sx={{ 
            flex: 1, 
            overflow: 'auto',
            padding: '16px 8px'
          }}
        >
          {renderMenuItems()}
        </Box>
        
        {/* Logout Button */}
        <Box 
          sx={{ 
            borderTop: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0,
            padding: '16px 8px'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px 24px',
              margin: '4px 8px',
              borderRadius: '8px',
              minHeight: '56px',
              color: colors.grey[100],
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                transform: 'translateX(5px)',
              },
              '&:active': {
                transform: 'scale(0.98)',
              }
            }}
            onClick={handleLogout}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ExitToAppIcon />
            </Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 500 }}>
              Cerrar Sesión
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
};

FinalMobileDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FinalMobileDrawer;
