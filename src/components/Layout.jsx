/* eslint-disable react/prop-types */
/* eslint-disable no-undef */


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
  const isMobile = useMediaQuery('(max-width:768px)');
  
  return (
   <Box sx={{ 
     display: 'flex', 
     flexDirection: 'column',  
     minHeight: '100vh',
     width: '100%',
     maxWidth: '100vw',
     overflow: 'hidden',
     background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0d1421 100%)',
     boxSizing: 'border-box'
   }}>
      <BrandingHeader />
      <InstallPWAAlert />    
      <Box sx={{ 
        display: 'flex', 
        flex: 1,
        minHeight: 0,
        maxWidth: '100vw',
        overflow: 'hidden',
        ...(isMobile && {
          flexDirection: 'column'
        })
      }}>
        {showSidebar && !isMobile && <SidebarComponent />}
        <Box
          component="main"
          sx={{
            flex: 1,
            width: '100%',
            maxWidth: '100%',
            minHeight: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 64px)',
            maxHeight: isMobile ? 'none' : 'calc(100vh - 64px)',
            overflow: isMobile ? 'visible' : 'auto',
            overflowX: 'hidden',
            background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0d1421 100%)',
            padding: isMobile ? '4px' : '20px',
            boxSizing: 'border-box',
            transition: 'all 0.3s ease',
            ...(isMobile && {
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            })
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
          padding: 12,
          marginTop: 'auto' // Empujar footer al bottom
        }}>
          © {new Date().getFullYear()} Fit Finance
        </footer>
      )}
    </Box>
  );
}
