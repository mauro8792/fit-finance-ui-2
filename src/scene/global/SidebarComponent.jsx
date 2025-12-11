/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useAuthStore } from '../../hooks';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Link } from 'react-router-dom';
import { Box, Typography, useTheme } from '@mui/material';
import { ProSidebar, Menu, MenuItem } from 'react-pro-sidebar';

import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import GroupIcon from '@mui/icons-material/Group';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import SchoolIcon from '@mui/icons-material/School';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PaidIcon from '@mui/icons-material/Paid';
import FeedIcon from '@mui/icons-material/Feed';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import HistoryIcon from '@mui/icons-material/History';

import 'react-pro-sidebar/dist/css/styles.css';
import { tokens } from '../../theme';
import { useSidebar } from '../../contexts/SideBarContext'; 


const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
        backgroundColor: selected === title ? colors.orangeAccent[500] : 'transparent',
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const SidebarComponent = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user, userType, student } = useAuthStore();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [selected, setSelected] = useState('dashboard');

  if (isMobile) {
    // En móvil, el sidebar no se renderiza aquí
    // Se maneja desde BrandingHeader con MobileDrawer
    return null;
  }

  // Función para renderizar items según el tipo de usuario
  const renderMenuItems = () => {
    if (userType === 'coach') {
      return (
        <>
          <Item title='Dashboard' to='/coach/dashboard' icon={<DashboardIcon />} selected={selected} setSelected={setSelected} />
          <Item title='Mis Alumnos' to='/coach/students' icon={<PersonSearchIcon />} selected={selected} setSelected={setSelected} />
          <Item title='Biblioteca' to='/coach/templates' icon={<CollectionsBookmarkIcon />} selected={selected} setSelected={setSelected} />
          <Item title='Ejercicios' to='/coach/exercise-catalog' icon={<LibraryBooksIcon />} selected={selected} setSelected={setSelected} />
          <Item title='Alimentos' to='/coach/food-catalog' icon={<RestaurantIcon />} selected={selected} setSelected={setSelected} />
          <Item title='Horarios' to='/coach/schedule' icon={<ScheduleIcon />} selected={selected} setSelected={setSelected} />
        </>
      );
    }

    if (userType === 'student') {
      // Obtener permisos del estudiante (por defecto todo habilitado)
      const permissions = student?.permissions || {};
      const canAccessRoutine = permissions.canAccessRoutine ?? true;
      const canAccessWeight = permissions.canAccessWeight ?? true; // Controla "Mi Progreso" (peso + antropometría)
      const canAccessNutrition = permissions.canAccessNutrition ?? true;
      const canAccessCardio = permissions.canAccessCardio ?? true;

      return (
        <>
          <Item title='Dashboard' to='/student' icon={<DashboardIcon />} selected={selected} setSelected={setSelected} />
          {canAccessRoutine && (
            <Item title='Mi Rutina' to='/student/routine' icon={<FitnessCenterIcon />} selected={selected} setSelected={setSelected} />
          )}
          {canAccessWeight && (
            <Item title='Mi Progreso' to='/student/progress' icon={<MonitorHeartIcon />} selected={selected} setSelected={setSelected} />
          )}
          {canAccessNutrition && (
            <Item title='Nutrición' to='/student/nutrition' icon={<RestaurantIcon />} selected={selected} setSelected={setSelected} />
          )}
          {canAccessCardio && (
            <Item title='Cardio' to='/student/cardio' icon={<DirectionsRunIcon />} selected={selected} setSelected={setSelected} />
          )}
          <Item title='Mis Cuotas' to='/student/fees' icon={<PaidIcon />} selected={selected} setSelected={setSelected} />
          <Item title='Mi Perfil' to='/student/profile' icon={<PersonSearchIcon />} selected={selected} setSelected={setSelected} />
        </>
      );
    }

    // Menú por defecto para admin/superadmin
    return (
      <>
        <Item title='HOME' to='/' icon={<HomeOutlinedIcon />} selected={selected} setSelected={setSelected} />
        <Item title='Disciplinas' to='/sports' icon={<SportsMartialArtsIcon />} selected={selected} setSelected={setSelected} />
        <Item title='Cuotas' to='/cuotas' icon={<FeedIcon />} selected={selected} setSelected={setSelected} />
        <Item title='Coaches' to='/coaches' icon={<FitnessCenterIcon />} selected={selected} setSelected={setSelected} />
        <Item title='Gestión Alumnos' to='/admin-students' icon={<SchoolIcon />} selected={selected} setSelected={setSelected} />
      </>
    );
  };

  // Para desktop, retornar directamente el Box del sidebar
  return (
    <Box
      sx={{
        height: '100vh',
        width: isCollapsed ? 80 : 250, // Ancho fijo basado en el estado
        transition: 'width 0.3s',
        overflow: 'hidden',
        flexShrink: 0, //  no permitir que se encoja
        '& .pro-sidebar-inner': {
          background: `linear-gradient(180deg, #181818 0%, ${colors.primary[900]} 40%, ${colors.orangeAccent[500]} 100%) !important`,
          height: '100vh',
          overflow: 'hidden',
        },
        '& .pro-icon-wrapper': {
          backgroundColor: 'transparent !important',
        },
        '& .pro-inner-item': {
          padding: '5px 35px 5px 20px !important',
        },
        '& .pro-inner-item:hover': {
          color: `${colors.orangeAccent[300]} !important`,
        },
        '& .pro-menu-item.active': {
          color: `${colors.primary[400]} !important`,
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed} style={{ height: '100vh' }}>
        <Menu iconShape='square'>
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={<MenuOutlinedIcon style={{ color: colors.orangeAccent[500] }} />}
            style={{
              margin: '10px 0 20px 0',
              color: colors.grey[100],
              background: 'none',
              cursor: 'pointer',
            }}
          >
            {!isCollapsed && (
              <Box display='flex' alignItems='center' ml='5px'>
                <Typography
                  variant='h5'
                  sx={{
                    color: colors.orangeAccent[500],
                    fontWeight: 700,
                    fontSize: { xs: '1rem', sm: '1.2rem' },
                    maxWidth: 160,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.fullName || user?.name || user?.username || 'Usuario'}
                </Typography>
              </Box>
            )}
          </MenuItem>
          <Box paddingLeft={isCollapsed ? undefined : '10%'}>
            {renderMenuItems()}
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default SidebarComponent;
