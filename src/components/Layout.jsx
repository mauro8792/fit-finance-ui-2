import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Topbar from '../scene/global/Topbar';
import { SidebarComponent } from '../scene/global/SidebarComponent';
import { useAuthStore } from '../hooks';

export const Layout = () => {
  const { userType } = useAuthStore();

  return (
    <Box display="flex" sx={{ flexDirection: { xs: 'column', md: 'row' }, minHeight: '100vh' }}>
      {userType === 'admin' && <SidebarComponent />}
      <Box flexGrow={1} display="flex" flexDirection="column">
        <Topbar />
        <Box 
          flexGrow={1}
          sx={{
            maxWidth: '100vw', // Evitar overflow horizontal
            overflowX: 'hidden',
            // Permitir scroll natural en mobile sin restricciones de altura
            height: { xs: 'auto', md: 'calc(100vh - 80px)' },
            maxHeight: { xs: 'none', md: 'calc(100vh - 80px)' },
            overflowY: { xs: 'visible', md: 'auto' }
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
