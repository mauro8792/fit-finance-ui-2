import PropTypes from 'prop-types';
import React from 'react';
import { useAuthStore } from '../hooks';
import { Drawer, Box, Typography, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
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
import { tokens } from '../theme';

// Componente Item similar al del SidebarComponent pero adaptado para mobile
const MobileItem = ({ title, to, icon, selected, setSelected, onClose }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  return (
    <Link 
      to={to} 
      style={{ textDecoration: 'none', color: 'inherit' }}
      onClick={() => {
        console.log(`🚀 Navegando a: ${to}`);
        setSelected(title);
        if (onClose) {
          onClose();
        }
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

MobileItem.propTypes = {
  title: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  selected: PropTypes.string,
  setSelected: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

const MobileDrawer = ({ open, onClose }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user, logout, userType, student } = useAuthStore();
  const [selected, setSelected] = React.useState('Dashboard');
  
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

  // Función para renderizar items según el tipo de usuario (usando la misma lógica del SidebarComponent)
  const renderMenuItems = () => {
    if (userType === 'student') {
      return (
        <>
          <MobileItem title='Dashboard' to='/student' icon={<DashboardIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileItem title='Mi Rutina' to='/student/routine' icon={<FitnessCenterIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileItem title='Mis Cuotas' to='/student/fees' icon={<PaidIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileItem title='Mi Perfil' to='/student/profile' icon={<PersonSearchIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
        </>
      );
    }
    
    if (userType === 'admin' || userType === 'superadmin') {
      return (
        <>
          <MobileItem title='HOME' to='/' icon={<HomeOutlinedIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileItem title='Disciplinas' to='/sports' icon={<SportsMartialArtsIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileItem title='Alumnos' to='/alumnos' icon={<PersonSearchIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileItem title='Pagos' to='/pagos' icon={<PaidIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileItem title='Cuotas' to='/cuotas' icon={<FeedIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileItem title='Usuarios' to='/usuarios' icon={<GroupIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileItem title='Coaches' to='/coaches' icon={<FitnessCenterIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
        </>
      );
    }
    
    if (userType === 'coach') {
      return (
        <>
          <MobileItem title='Dashboard' to='/coach/dashboard' icon={<DashboardIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileItem title='Mis Alumnos' to='/coach/students' icon={<PersonSearchIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileItem title='Rutinas' to='/coach/routines' icon={<FitnessCenterIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileItem title='Macrociclos' to='/coach/macrocycles' icon={<AssignmentIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
          <MobileItem title='Horarios' to='/coach/schedule' icon={<ScheduleIcon />} selected={selected} setSelected={setSelected} onClose={onClose} />
        </>
      );
    }
    
    return null;
  };

  // Componente separado para logout
  const LogoutItem = ({ onLogout }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    
    return (
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
        onClick={onLogout}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ExitToAppIcon />
        </Box>
        <Typography sx={{ fontSize: '1rem', fontWeight: 500 }}>
          Cerrar Sesión
        </Typography>
      </Box>
    );
  };

  LogoutItem.propTypes = {
    onLogout: PropTypes.func.isRequired,
  };

  const handleLogout = () => {
    console.log('=== LOGOUT INICIADO ===');
    onClose();
    logout();
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
        disableScrollLock: false,
        hideBackdrop: false
      }}
      SlideProps={{
        direction: "right"
      }}
      PaperProps={{
        sx: {
          width: 320,
          height: '100vh',
          maxHeight: '100vh',
          background: `linear-gradient(180deg, #181818 0%, ${colors.primary[900]} 40%, ${colors.orangeAccent[500]} 100%)`,
          border: 'none',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
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
          zIndex: 1501
        }} 
        role="presentation"
      >
        {/* Header */}
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
        >
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
        
        {/* Menu Items */}
        {renderMenuItems()}
        
        {/* Logout Button */}
        <Box 
          sx={{ 
            borderTop: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0,
            pl: '5%',
            pr: 1,
            minHeight: '80px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <LogoutItem onLogout={handleLogout} />
        </Box>
      </Box>
    </Drawer>
  );
};

MobileDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MobileDrawer;