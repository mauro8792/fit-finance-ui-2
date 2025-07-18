/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { ProSidebar, Menu, MenuItem } from 'react-pro-sidebar';

import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import GroupIcon from '@mui/icons-material/Group';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PaidIcon from '@mui/icons-material/Paid';
import FeedIcon from '@mui/icons-material/Feed';

import 'react-pro-sidebar/dist/css/styles.css';
import { tokens } from '../../theme';


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

export const SidebarComponent = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selected, setSelected] = useState('dashboard');

  return (
    <Box
      sx={{
        height: '100vh',
        '& .pro-sidebar-inner': {
          background: `linear-gradient(${colors.primary[900]}, ${colors.orangeAccent[500]}) !important`,
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
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: '10px 0 20px 0',
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box display='flex' justifyContent='space-between' alignItems='center' ml='15px' color={colors.orangeAccent[500]}>
                <Typography variant='h3'>Adrian Martinez</Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {/* {!isCollapsed && (
            <Box mb='25px'>
              <Box textAlign='center'>
                <Typography variant='h2' color={colors.orangeAccent[500]} fontWeight='bold' sx={{ m: '10px 0 0 0' }}>
                  Adrian Martinez
                </Typography>
              </Box>
            </Box>
          )} */}

          <Box paddingLeft={isCollapsed ? undefined : '10%'}>
            <Item title='HOME' to='/' icon={<HomeOutlinedIcon />} selected={selected} setSelected={setSelected} />

            <Item title='Disciplinas' to='/sports' icon={<SportsMartialArtsIcon />} selected={selected} setSelected={setSelected} />
            <Item title='Alumnos' to='/alumnos' icon={<PersonSearchIcon />} selected={selected} setSelected={setSelected} />
            <Item title='Pagos' to='/pagos' icon={<PaidIcon />} selected={selected} setSelected={setSelected} />
            <Item title='Cuotas' to='/cuotas' icon={<FeedIcon />} selected={selected} setSelected={setSelected} />
            <Item title='Usuarios' to='/usuarios' icon={<GroupIcon />} selected={selected} setSelected={setSelected} />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};
