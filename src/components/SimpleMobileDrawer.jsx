import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Drawer, useTheme } from '@mui/material';
import PropTypes from 'prop-types';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PaidIcon from '@mui/icons-material/Paid';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import FeedIcon from '@mui/icons-material/Feed';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import { tokens } from '../theme';
import { useAuthStore } from '../hooks';

// Componente Item - Usando Link como wrapper igual que react-router-dom
const Item = ({ title, to, icon, selected, setSelected, onClose }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const handleClick = (e) => {
    console.log(`🔥🔥🔥 CLICK DETECTADO EN: ${title}`);
    console.log('Event:', e);
    console.log('To:', to);
    console.log('Selected:', selected);
    
    // Prevenir propagación por si acaso
    e.stopPropagation();
    
    setSelected(title);
    
    // Cerrar drawer inmediatamente
    if (onClose) {
      console.log('🚪 Cerrando drawer...');
      onClose();
    }
    
    console.log(`� Navegación completada a: ${to}`);
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
        onTouchStart={() => console.log(`👆 TOUCH START en ${title}`)}
        onTouchEnd={() => console.log(`👆 TOUCH END en ${title}`)}
        onClick={(e) => {
          console.log(`📦 BOX CLICK en ${title}`);
          e.stopPropagation();
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

Item.propTypes = {
  title: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  selected: PropTypes.string,
  setSelected: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

const SimpleMobileDrawer = ({ open, onClose }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user, logout, userType, student } = useAuthStore();
  const [selected, setSelected] = useState('Dashboard');

  console.log('SimpleMobileDrawer rendered:', { open, userType });

  // Log adicional para debug
  useEffect(() => {
    console.log('SimpleMobileDrawer - open state changed:', open);
  }, [open]);

  // Función para manejar logout
  const handleLogout = () => {
    console.log('=== LOGOUT INICIADO ===');
    onClose();
    logout();
  };

  // Función para renderizar items según el tipo de usuario - EXACTA del SidebarComponent
  const renderMenuItems = () => {
    if (userType === 'student') {
      return (
        <>
          <Item title='Dashboard' to='/student' icon={<DashboardIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <Item title='Mi Rutina' to='/student/routine' icon={<FitnessCenterIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <Item title='Mis Cuotas' to='/student/fees' icon={<PaidIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <Item title='Mi Perfil' to='/student/profile' icon={<PersonSearchIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
        </>
      );
    }

    if (userType === 'coach') {
      return (
        <>
          <Item title='Dashboard' to='/coach/dashboard' icon={<DashboardIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <Item title='Mis Alumnos' to='/coach/students' icon={<PersonSearchIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <Item title='Rutinas' to='/coach/routines' icon={<FitnessCenterIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <Item title='Macrociclos' to='/coach/macrocycles' icon={<AssignmentIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <Item title='Horarios' to='/coach/schedule' icon={<ScheduleIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
        </>
      );
    }

    // Menú por defecto para admin/superadmin
    return (
      <>
        <Item title='HOME' to='/' icon={<HomeOutlinedIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
        <Item title='Disciplinas' to='/sports' icon={<SportsMartialArtsIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
        <Item title='Alumnos' to='/alumnos' icon={<PersonSearchIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
        <Item title='Pagos' to='/pagos' icon={<PaidIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
        <Item title='Cuotas' to='/cuotas' icon={<FeedIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
        <Item title='Usuarios' to='/usuarios' icon={<GroupIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
        <Item title='Coaches' to='/coaches' icon={<FitnessCenterIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
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

  return (
    <Drawer 
      anchor="left" 
      open={open} 
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
        style: { zIndex: 1500 },
      }}
      PaperProps={{
        sx: {
          width: 320,
          background: `linear-gradient(180deg, #181818 0%, ${colors.primary[900]} 40%, ${colors.orangeAccent[500]} 100%)`,
          color: colors.grey[100],
        }
      }}
    >
      <Box 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
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
    </Drawer>
  );
};

SimpleMobileDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SimpleMobileDrawer;
