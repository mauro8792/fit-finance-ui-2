import { Navigate, Route, Routes } from 'react-router-dom';
import { ColorModeContext, useMode } from './theme';
import { Box, CssBaseline, ThemeProvider, CircularProgress, Typography } from '@mui/material';
import Topbar from './scene/global/Topbar';
import { useEffect, useState, useRef } from 'react';
import { SidebarComponent } from './scene/global/SidebarComponent';
import { Sports } from './scene/sports';
import { Payments } from './scene/payments';
import { Users } from './scene/users';
import {Dashboard} from './scene/dashboard'
import { AuthRoutes } from './scene/auth/routes/AuthRoutes';
import { useAuthStore } from './hooks';
import { Students } from './scene/students';
import { Fees } from './scene/fees';
import { StudentDashboard } from './scene/student/StudentDashboard';
import { StudentFees } from './scene/student/StudentFees';
import { PaymentSuccess } from './scene/payments/PaymentSuccess';
import { PaymentFailure } from './scene/payments/PaymentFailure';
import { PaymentPending } from './scene/payments/PaymentPending';

export const FitFinanceApp = () => {
  const [theme, colorMode] = useMode();
  const { status, userType, startCheckingAuthentication } = useAuthStore();
  const [isSidebar, setIsSidebar] = useState(true);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // Solo ejecutar una vez al montar el componente
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      startCheckingAuthentication();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  // Pantalla de carga mientras se verifica la autenticación
  if (status === 'checking') {
    return (
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            height="100vh"
            flexDirection="column"
            gap={2}
          >
            <CircularProgress size={60} />
            <Typography variant="h6">Verificando autenticación...</Typography>
          </Box>
        </ThemeProvider>
      </ColorModeContext.Provider>
    );
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className='app' style={{ 
          height: window.innerWidth < 900 ? 'auto' : '100%',
          minHeight: '100vh'
        }}>
          {status === 'authenticated' && <Topbar setIsSidebar={setIsSidebar} />}

          <main className='content' style={{ 
            display: 'flex',
            flexDirection: window.innerWidth < 900 ? 'column' : 'row',
            minHeight: window.innerWidth < 900 ? 'auto' : '100vh'
          }}>
            {status === 'authenticated' && isSidebar && userType === 'admin' && <SidebarComponent isSidebar={isSidebar} />}
            <Box 
              flexGrow={1}
              sx={{
                height: { xs: 'auto', md: '100vh' },
                maxHeight: { xs: 'none', md: '100vh' },
                overflow: { xs: 'visible', md: 'auto' },
                paddingBottom: { xs: '100px', md: 0 } // Mucho más padding extra en mobile
              }}
            >
              <Routes>
                {status === 'not-authenticated' ? (
                  <>
                    <Route path='/auth/*' element={<AuthRoutes />} />
                    <Route path='/*' element={<Navigate to='/auth/login' />} />
                  </>
                ) : status === 'authenticated' && userType === 'student' ? (
                  <>
                    <Route path='/student/fees' element={<StudentFees />} />
                    <Route path='/student/payment-success' element={<PaymentSuccess />} />
                    <Route path='/student/payment-failure' element={<PaymentFailure />} />
                    <Route path='/student/payment-pending' element={<PaymentPending />} />
                    <Route path='/auth/*' element={<Navigate to='/student' />} />
                    <Route path='/*' element={<StudentDashboard />} />
                  </>
                ) : status === 'authenticated' ? (
                  <>
                    <Route path='/sports' element={<Sports />} />
                    <Route path='/usuarios' element={<Users />} />
                    <Route path='/cuotas' element={<Fees />} />
                    <Route path='/pagos' element={<Payments />} />
                    <Route path='/alumnos' element={<Students />} />
                    <Route path='/auth/*' element={<Navigate to='/' />} />
                    <Route path='/*' element={<Dashboard />} />
                  </>
                ) : (
                  <Route path='/*' element={<Navigate to='/auth/login' />} />
                )}
              </Routes>
            </Box>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
