import React from 'react';
import themeConfig from '../theme/config';
import GymLogo from './GymLogo';
import { Box, IconButton, Typography, Chip } from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import { LogoutOutlined, Menu as MenuIcon } from '@mui/icons-material';
import { useAuthStore } from '../hooks';
import useMediaQuery from '@mui/material/useMediaQuery';
import FinalMobileDrawer from './FinalMobileDrawer';

export default function BrandingHeader() {
  const { startLogout, user, student, userType } = useAuthStore();
  const isMobile = useMediaQuery('(max-width:768px)'); // Cambiado de 600px a 768px
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  
  // Debug logs
  console.log('BrandingHeader Debug:', { isMobile, userType, showMobileMenu: isMobile && (userType === 'admin' || userType === 'superadmin' || userType === 'student' || userType === 'coach') });
  
  // Solo mostrar drawer para admin/superadmin/coach en móvil, o para estudiantes
  // Temporalmente mostrar siempre en mobile para debug
  const showMobileMenu = isMobile;
  
  return (
    <header style={{
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      background: themeConfig.primaryColor, 
      color: themeConfig.textColor, 
      padding: isMobile ? '8px 12px' : '12px 24px', // Menos padding en móvil
      fontFamily: themeConfig.fontFamily,
      width: '100%',
      boxSizing: 'border-box', // Incluir padding en el ancho total
      overflow: 'hidden' // Evitar que elementos se desborden
    }}>
      <Box display='flex' alignItems='center' gap={2}>
        {showMobileMenu && (
          <IconButton 
            color="inherit" 
            onClick={() => {
              console.log('Menu button clicked!');
              setDrawerOpen(true);
            }} 
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <GymLogo height={48} />
      </Box>
      <Box display='flex' alignItems='center' gap={2}>
        {/* Solo mostrar chip, nombre y logout en desktop */}
        {!isMobile && userType && (
          <Chip 
            label={
              userType === 'student'
                ? 'Estudiante'
                : userType === 'coach'
                  ? 'Coach'
                  : 'Administrador'
            }
            color={
              userType === 'student'
                ? 'secondary'
                : userType === 'coach'
                  ? 'success'
                  : 'primary'
            }
            variant="outlined"
            size="medium"
            sx={{ 
              color: themeConfig.textColor, 
              borderColor: themeConfig.textColor,
              fontWeight: 'bold',
              fontSize: '0.8rem'
            }}
          />
        )}
        {!isMobile && (
          <Typography 
            variant='body1' 
            sx={{ 
              color: themeConfig.textColor, 
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            {userType === 'student' && student ? 
              `${student.firstName} ${student.lastName}` : 
              user?.fullName || user?.email
            }
          </Typography>
        )}
        {!isMobile && (
          <IconButton color='inherit'>
            <PersonOutlinedIcon />
          </IconButton>
        )}
        {!isMobile && (
          <IconButton color='inherit' onClick={startLogout}>
            <LogoutOutlined />
          </IconButton>
        )}
      </Box>
      {showMobileMenu && (
        <FinalMobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      )}
    </header>
  );
}
