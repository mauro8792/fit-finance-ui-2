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
  // Sidebar para admin/superadmin, coaches y estudiantes
  const showSidebar = userType === 'admin' || userType === 'superadmin' || userType === 'coach' || userType === 'student';
  const isMobile = useMediaQuery('(max-width:768px)'); // Cambiado de 600px a 768px
  return (
   <Box sx={{ 
     display: 'flex', 
     flexDirection: 'column',  
     height: '100vh',
     overflow: 'hidden',
     background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0d1421 100%)'
   }}>
      <BrandingHeader />
      <InstallPWAAlert />    
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden'}}>
        {showSidebar && !isMobile && <SidebarComponent />}
        <Box
          component="main"
          sx={{
              flex: 1,
            overflow: 'auto',
               height: 'calc(100vh - 64px)', // Restar altura del header
            background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0d1421 100%)',
              padding: isMobile ? '8px' : '20px',
            transition: 'margin-left 0.3s ease',
          }}
        >
   
          <Outlet />
        </Box>
      </Box>
      
      {showFooter && (
        <footer style={{ 
          background: 'linear-gradient(135deg, #181818 0%, #1f2a40 100%)', 
          color: '#FFD700', 
          textAlign: 'center', 
          padding: 12 
        }}>
          © {new Date().getFullYear()} Fit Finance
        </footer>
      )}
    </Box>
  );
}
