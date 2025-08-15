import PropTypes from 'prop-types';
import { useAuthStore } from '../hooks';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import GroupIcon from '@mui/icons-material/Group';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import PaidIcon from '@mui/icons-material/Paid';
import FeedIcon from '@mui/icons-material/Feed';
import { useNavigate } from 'react-router-dom';

export default function MobileDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const { user, logout, userType, student } = useAuthStore();
  
  // Menús diferentes según el tipo de usuario
  const getMenuItems = () => {
    if (userType === 'student') {
      return [
        { text: 'Cuotas', icon: <PaymentIcon />, to: '/student/fees' },
        { text: 'Rutina', icon: <FitnessCenterIcon />, to: '/student/routine' },
        { text: 'Info personal', icon: <PersonIcon />, to: '/student/profile' },
      ];
    }
    
    if (userType === 'admin' || userType === 'superadmin') {
      return [
        { text: 'HOME', icon: <HomeOutlinedIcon />, to: '/' },
        { text: 'Disciplinas', icon: <SportsMartialArtsIcon />, to: '/sports' },
        { text: 'Alumnos', icon: <PersonSearchIcon />, to: '/alumnos' },
        { text: 'Pagos', icon: <PaidIcon />, to: '/pagos' },
        { text: 'Cuotas', icon: <FeedIcon />, to: '/cuotas' },
        { text: 'Usuarios', icon: <GroupIcon />, to: '/usuarios' },
        { text: 'Coaches', icon: <FitnessCenterIcon />, to: '/coaches' },
      ];
    }
    
    if (userType === 'coach') {
      return [
        { text: 'Dashboard', icon: <HomeOutlinedIcon />, to: '/coach/dashboard' },
        { text: 'Estudiantes', icon: <PersonSearchIcon />, to: '/coach/students' },
        { text: 'Rutinas', icon: <FitnessCenterIcon />, to: '/coach/routines' },
      ];
    }
    
    return [];
  };

  const menuItems = getMenuItems();
  
  const handleItemClick = (to) => {
    navigate(to);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  // Nombre a mostrar según el tipo de usuario
  const getUserDisplayName = () => {
    if (userType === 'student' && student) {
      return `${student.firstName} ${student.lastName}`;
    }
    return user?.fullName || user?.name || user?.username || 'Usuario';
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 250 }} role="presentation">
        {/* Header del drawer con nombre del usuario */}
        <Box 
          className="mobile-drawer-header"
          sx={{ 
            px: 2, 
            py: 3, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            backgroundColor: '#1976d2',
            color: 'white'
          }}
        >
          <PersonIcon />
          <Box>
            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
              {getUserDisplayName()}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
              {userType === 'student' ? 'Estudiante' : 
               userType === 'coach' ? 'Coach' : 'Administrador'}
            </div>
          </Box>
        </Box>
        
        <List>
          {menuItems.map((item) => (
            <ListItem button key={item.text} onClick={() => handleItemClick(item.to)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          
          {/* Botón de salir */}
          <ListItem button onClick={handleLogout}>
            <ListItemIcon><ExitToAppIcon /></ListItemIcon>
            <ListItemText primary="Salir" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}

MobileDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
