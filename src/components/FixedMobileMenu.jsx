import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PaidIcon from '@mui/icons-material/Paid';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

import { useAuthStore } from '../hooks';

// Componente Item súper simple
const SimpleItem = ({ title, to, icon, onClose }) => {
  const handleClick = () => {
    console.log(`🔥 SIMPLE ITEM CLICK: ${title}`);
    console.log('Navegando a:', to);
    
    if (onClose) {
      onClose();
    }
    
    window.location.href = to;
  };
  
  return (
    <button
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 24px',
        margin: '8px',
        borderRadius: '8px',
        minHeight: '56px',
        color: 'white',
        backgroundColor: '#333',
        cursor: 'pointer',
        border: '2px solid #ff9800',
        width: 'calc(100% - 16px)',
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

SimpleItem.propTypes = {
  title: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  onClose: PropTypes.func,
};

const FixedMobileMenu = ({ open, onClose }) => {
  const { userType } = useAuthStore();

  console.log('FixedMobileMenu rendered:', { open, userType });

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
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1300,
        }}
        onClick={onClose}
      />
      
      {/* Menu */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '320px',
          height: '100vh',
          backgroundColor: '#1a1a1a',
          zIndex: 1400,
          padding: '20px',
          boxShadow: '2px 0 10px rgba(0,0,0,0.3)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#ff9800', 
            mb: 3,
            textAlign: 'center',
            border: '2px solid #ff9800',
            padding: '10px',
            borderRadius: '8px'
          }}
        >
          FIXED MENU TEST
        </Typography>
        
        {userType === 'student' && (
          <>
            <SimpleItem title='Dashboard' to='/student' icon={<DashboardIcon />} onClose={onClose} />
            <SimpleItem title='Mi Rutina' to='/student/routine' icon={<FitnessCenterIcon />} onClose={onClose} />
            <SimpleItem title='Mis Cuotas' to='/student/fees' icon={<PaidIcon />} onClose={onClose} />
            <SimpleItem title='Mi Perfil' to='/student/profile' icon={<PersonSearchIcon />} onClose={onClose} />
          </>
        )}
        
        <button
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: '#ff9800',
            color: 'black',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '20px',
            cursor: 'pointer'
          }}
          onClick={onClose}
        >
          ×
        </button>
      </Box>
    </>
  );
};

FixedMobileMenu.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FixedMobileMenu;
