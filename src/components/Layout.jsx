/* eslint-disable react/prop-types */
/* eslint-disable no-undef */


import React from 'react';
import BrandingHeader from './BrandingHeader';
import SidebarComponent from '../scene/global/SidebarComponent';
import { useAuthStore } from '../hooks';
import { InstallPWAAlert } from './InstallPWAAlert';
import { Outlet } from 'react-router-dom';
import { Box ,useMediaQuery} from '@mui/material';

export default function Layout({  showFooter = false }) {
  const { userType } = useAuthStore();
  // Sidebar solo para admin/superadmin (puedes agregar coach si lo deseas)
  const showSidebar = userType === 'admin' || userType === 'superadmin';
  const isMobile = useMediaQuery('(max-width:600px)');
  return (
   <Box sx={{ display: 'flex', flexDirection: 'column',  height: '100vh',overflow: 'hidden' }}>
      <BrandingHeader />
      <InstallPWAAlert />    
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden'}}>
        {showSidebar && <SidebarComponent />}
        <Box
          component="main"
          sx={{
              flex: 1,
            overflow: 'auto',
               height: 'calc(100vh - 64px)', // Restar altura del header
            backgroundColor: '#141414',
              padding: isMobile ? '8px' : '20px',
            transition: 'margin-left 0.3s ease',
          }}
        >
   
          <Outlet />
        </Box>
      </Box>
      
      {showFooter && (
        <footer style={{ background: '#181818ff', color: '#FFD700', textAlign: 'center', padding: 12 }}>
          © {new Date().getFullYear()} Fit Finance
        </footer>
      )}
    </Box>
  );
}
