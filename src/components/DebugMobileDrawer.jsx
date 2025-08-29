import { Box, Typography, Drawer, useTheme } from '@mui/material';
import PropTypes from 'prop-types';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PaidIcon from '@mui/icons-material/Paid';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

import { tokens } from '../theme';
import { useAuthStore } from '../hooks';

// Componente Item ULTRA SIMPLE para debug
const DebugItem = ({ title, to, icon, onClose }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const handleClick = () => {
    console.log(`🔥🔥🔥 DEBUG CLICK DETECTADO EN: ${title}`);
    console.log('Navegando a:', to);
    
    // Cerrar drawer
    if (onClose) {
      console.log('🚪 Cerrando drawer...');
      onClose();
    }
    
    // Navegar usando window.location para debug
    console.log(`🚀 Navegando manualmente a: ${to}`);
    setTimeout(() => {
      window.location.href = to;
    }, 100);
  };
  
  return (
    <button
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 24px',
        margin: '4px 8px',
        borderRadius: '8px',
        minHeight: '56px',
        color: colors.grey[100],
        backgroundColor: 'transparent',
        cursor: 'pointer',
        border: 'none',
        width: '100%',
        textAlign: 'left',
        fontSize: '1rem',
        fontFamily: 'inherit'
      }}
      onClick={handleClick}
    >
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {icon}
      </span>
      <span>
        {title}
      </span>
    </button>
  );
};

DebugItem.propTypes = {
  title: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  onClose: PropTypes.func,
};

const DebugMobileDrawer = ({ open, onClose }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { userType } = useAuthStore();

  console.log('DebugMobileDrawer rendered:', { open, userType });

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
      <Box sx={{ padding: '20px' }}>
        <Typography variant="h6" sx={{ color: colors.orangeAccent[500], mb: 2 }}>
          DEBUG DRAWER
        </Typography>
        
        {userType === 'student' && (
          <>
            <DebugItem title='Dashboard' to='/student' icon={<DashboardIcon />} onClose={onClose} />
            <DebugItem title='Mi Rutina' to='/student/routine' icon={<FitnessCenterIcon />} onClose={onClose} />
            <DebugItem title='Mis Cuotas' to='/student/fees' icon={<PaidIcon />} onClose={onClose} />
            <DebugItem title='Mi Perfil' to='/student/profile' icon={<PersonSearchIcon />} onClose={onClose} />
          </>
        )}
      </Box>
    </Drawer>
  );
};

DebugMobileDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DebugMobileDrawer;
