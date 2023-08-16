import { Navigate, Route, Routes } from 'react-router-dom';
import { ColorModeContext, useMode } from './theme';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import Topbar from './scene/global/Topbar';
import { useEffect, useState } from 'react';
import { SidebarComponent } from './scene/global/SidebarComponent';
import { Sports } from './scene/sports';
import { Payments } from './scene/payments';
import { Users } from './scene/users';
import {Dashboard} from './scene/dashboard'
import { AuthRoutes } from './scene/auth/routes/AuthRoutes';
import { useAuthStore } from './hooks';
import { Students } from './scene/students';
import { Fees } from './scene/fees';

export const FitFinanceApp = () => {
  const [theme, colorMode] = useMode();
  const { status, checkAuthToken } = useAuthStore();
  const [isSidebar, setIsSidebar] = useState(true);

  useEffect(() => {
    checkAuthToken();
  }, []);
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className='app' style={{height:'100%'}}>
          {status === 'authenticated' && <Topbar setIsSidebar={setIsSidebar} />}

          <main className='content' style={{ display: 'flex' }}>
            {status === 'authenticated' && isSidebar && <SidebarComponent isSidebar={isSidebar} />}
            <Box flexGrow={1}>
              <Routes>
                {status === 'not-authenticated' ? (
                  <>
                    <Route path='/auth/*' element={<AuthRoutes />} />
                    <Route path='/*' element={<Navigate to='/auth/login' />} />
                  </>
                ) : (
                  <>
                    <Route path='/sports' element={<Sports />} />
                    <Route path='/usuarios' element={<Users />} />
                    <Route path='/cuotas' element={<Fees />} />
                    <Route path='/pagos' element={<Payments />} />
                    <Route path='/alumnos' element={<Students />} />
                    <Route path='/*' element={<Dashboard />} />
                  </>
                )}
              </Routes>
            </Box>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
