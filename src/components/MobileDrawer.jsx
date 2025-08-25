import PropTypes from 'prop-types';
import React from 'react';
import { useAuthStore } from '../hooks';
import { Drawer, Box, Typography, useTheme } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import GroupIcon from '@mui/icons-material/Group';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import PaidIcon from '@mui/icons-material/Paid';
import FeedIcon from '@mui/icons-material/Feed';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../theme';

export default function MobileDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user, logout, userType, student } = useAuthStore();
  
  // Debug log
  console.log('MobileDrawer rendered:', { open, userType });
  
  React.useEffect(() => {
    console.log('MobileDrawer open state changed:', open);
    
    // Prevenir scroll del body cuando el drawer está abierto
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100vh';
      document.body.classList.add('drawer-open');
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.classList.remove('drawer-open');
    }
    
    // Cleanup cuando el componente se desmonta
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.classList.remove('drawer-open');
    };
  }, [open]);
  
  // Función para renderizar items según el tipo de usuario
  const getMenuItems = () => {
    if (userType === 'student') {
      return [
        { title: 'Dashboard', to: '/student', icon: <DashboardIcon /> },
        { title: 'Mi Rutina', to: '/student/routine', icon: <FitnessCenterIcon /> },
        { title: 'Mis Cuotas', to: '/student/fees', icon: <PaidIcon /> },
        { title: 'Mi Perfil', to: '/student/profile', icon: <PersonSearchIcon /> },
      ];
    }
    
    if (userType === 'admin' || userType === 'superadmin') {
      return [
        { title: 'HOME', to: '/', icon: <HomeOutlinedIcon /> },
        { title: 'Disciplinas', to: '/sports', icon: <SportsMartialArtsIcon /> },
        { title: 'Alumnos', to: '/alumnos', icon: <PersonSearchIcon /> },
        { title: 'Pagos', to: '/pagos', icon: <PaidIcon /> },
        { title: 'Cuotas', to: '/cuotas', icon: <FeedIcon /> },
        { title: 'Usuarios', to: '/usuarios', icon: <GroupIcon /> },
        { title: 'Coaches', to: '/coaches', icon: <FitnessCenterIcon /> },
      ];
    }
    
    if (userType === 'coach') {
      return [
        { title: 'Dashboard', to: '/coach/dashboard', icon: <DashboardIcon /> },
        { title: 'Mis Alumnos', to: '/coach/students', icon: <PersonSearchIcon /> },
        { title: 'Rutinas', to: '/coach/routines', icon: <FitnessCenterIcon /> },
        { title: 'Macrociclos', to: '/coach/macrocycles', icon: <AssignmentIcon /> },
        { title: 'Horarios', to: '/coach/schedule', icon: <ScheduleIcon /> },
      ];
    }
    
    return [];
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleNavigation = (to) => {
    navigate(to);
    onClose();
  };

  // Nombre a mostrar según el tipo de usuario
  const getUserDisplayName = () => {
    if (userType === 'student' && student) {
      return `${student.firstName} ${student.lastName}`;
    }
    return user?.fullName || user?.name || user?.username || 'Usuario';
  };

  const menuItems = getMenuItems();

  return (
    <Drawer 
      anchor="left" 
      open={open} 
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
        style: { zIndex: 1400 }
      }}
      PaperProps={{
        sx: {
          width: 320,
          height: '100vh',
          maxHeight: '100vh',
          background: `linear-gradient(180deg, #181818 0%, ${colors.primary[900]} 40%, ${colors.orangeAccent[500]} 100%)`,
          border: 'none',
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <Box 
        sx={{ 
          width: '100%',
          height: '100vh',
          minHeight: '100vh',
          background: `linear-gradient(180deg, #181818 0%, ${colors.primary[900]} 40%, ${colors.orangeAccent[500]} 100%)`,
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1401
        }} 
        role="presentation"
      >
        {/* Header - replicando el estilo del ProSidebar */}
        <Box 
          sx={{ 
            p: '15px 0 25px 0',
            borderBottom: 'none',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            minHeight: '100px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            ml: '5px',
            px: 3
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                color: colors.orangeAccent[500], 
                fontWeight: 700,
                fontSize: '1.2rem',
                maxWidth: 200,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'center'
              }}
            >
              {getUserDisplayName()}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ 
            color: colors.grey[100], 
            fontSize: '0.85rem',
            mt: 0.5,
            textAlign: 'center'
          }}>
            {userType === 'student' ? 'Estudiante' : 
             userType === 'coach' ? 'Coach' : 'Administrador'}
          </Typography>
        </Box>
        
        {/* Menu Items - replicando el estilo del ProSidebar */}
        <Box 
          sx={{ 
            flex: 1, 
            overflow: 'auto',
            pl: '10%', // Igual que el ProSidebar
            pr: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            minHeight: 0
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {menuItems.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0,
                padding: '8px 40px 8px 25px', // Aumentar padding para mejor apariencia
                cursor: 'pointer',
                color: colors.grey[100],
                transition: 'color 0.2s ease',
                '&:hover': { 
                  color: `${colors.orangeAccent[300]} !important`
                },
                '&.active': {
                  backgroundColor: colors.orangeAccent[500],
                  color: `${colors.primary[400]} !important`
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                console.log('Menu item clicked:', item.title);
                handleNavigation(item.to);
              }}
            >
              <Box sx={{ 
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                minWidth: 24,
                mr: 2
              }}>
                {item.icon}
              </Box>
              <Typography sx={{ 
                fontSize: '1rem',
                fontWeight: 400,
                color: 'inherit'
              }}>
                {item.title}
              </Typography>
            </Box>
          ))}
        </Box>
        
        {/* Logout Button - estilo consistente con el menú */}
        <Box 
          sx={{ 
            borderTop: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0,
            pl: '10%',
            pr: 1,
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              padding: '8px 40px 8px 25px',
              cursor: 'pointer',
              color: colors.grey[100],
              transition: 'color 0.2s ease',
              '&:hover': { 
                color: `${colors.orangeAccent[300]} !important`
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              console.log('Logout clicked');
              handleLogout();
            }}
          >
            <Box sx={{ 
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              minWidth: 24,
              mr: 2
            }}>
              <ExitToAppIcon />
            </Box>
            <Typography sx={{ 
              fontSize: '1rem',
              fontWeight: 400,
              color: 'inherit'
            }}>
              Salir
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}

MobileDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
