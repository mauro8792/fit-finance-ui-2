import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Topbar from '../scene/global/Topbar';
import { SidebarComponent } from '../scene/global/SidebarComponent';
import { useAuthStore } from '../hooks';

export const Layout = () => {
  const { userType } = useAuthStore();

  return (
    <Box display="flex" height="100vh">
      {userType === 'admin' && <SidebarComponent />}
      <Box flexGrow={1} display="flex" flexDirection="column">
        <Topbar />
        <Box flexGrow={1} overflow="auto" p={2}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
