/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useAuthStore } from '../../hooks';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Link } from 'react-router-dom';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { ProSidebar, Menu, MenuItem } from 'react-pro-sidebar';
import DashboardMock from '../../components/DashboardMock';

import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import GroupIcon from '@mui/icons-material/Group';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PaidIcon from '@mui/icons-material/Paid';
import FeedIcon from '@mui/icons-material/Feed';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

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
  const { user } = useAuthStore();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isCollapsed, setIsCollapsed } = useSidebar(); // ← USAR EL CONTEX
  const [selected, setSelected] = useState('dashboard');

 if (isMobile) {
    // En móvil, el sidebar no se renderiza aquí
    // Se maneja desde BrandingHeader con MobileDrawer
    return null;
  }

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
            <Item title='HOME' to='/' icon={<HomeOutlinedIcon />} selected={selected} setSelected={setSelected} />
            <Item title='Disciplinas' to='/sports' icon={<SportsMartialArtsIcon />} selected={selected} setSelected={setSelected} />
            <Item title='Alumnos' to='/alumnos' icon={<PersonSearchIcon />} selected={selected} setSelected={setSelected} />
            <Item title='Pagos' to='/pagos' icon={<PaidIcon />} selected={selected} setSelected={setSelected} />
            <Item title='Cuotas' to='/cuotas' icon={<FeedIcon />} selected={selected} setSelected={setSelected} />
            <Item title='Usuarios' to='/usuarios' icon={<GroupIcon />} selected={selected} setSelected={setSelected} />
            <Item title='Coaches' to='/coaches' icon={<FitnessCenterIcon />} selected={selected} setSelected={setSelected} />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};
export default SidebarComponent;
