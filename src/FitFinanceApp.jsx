import { Navigate, Route, Routes } from 'react-router-dom';
import { ColorModeContext, useMode } from './theme';
import { Box, CssBaseline, ThemeProvider, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import SidebarComponent from './scene/global/SidebarComponent';
import { SportsMainView } from './scene/sports';
import { Payments } from './scene/payments';
import { Users } from './scene/users';
import {Dashboard} from './scene/dashboard'
import { AuthRoutes } from './scene/auth/routes/AuthRoutes';
import { useAuthStore } from './hooks';
import CoachDashboard from './scene/coach/CoachDashboard';
import { Students } from './scene/students';
import { Fees } from './scene/fees';
import AdminCoaches from './scene/admin-coaches';
import { StudentDashboard } from './scene/student/StudentDashboard';
import { StudentRoutine } from './scene/student/StudentRoutine';
import { StudentFees } from './scene/student/StudentFees';
import { PaymentSuccess } from './scene/payments/PaymentSuccess';
import { PaymentFailure } from './scene/payments/PaymentFailure';
import { PaymentPending } from './scene/payments/PaymentPending';
import StudentDetail from './scene/coach/StudentDetail';
import MacrocycleDetail from './scene/coach/MacrocycleDetail';
import MicrocycleManager from './scene/coach/MicrocycleManager';

import BrandingHeader from './components/BrandingHeader';
import MicrocycleEdit from './scene/coach/MicrocycleEdit';
import MicrocycleDetail from './components/MicrocycleDetail';

export const FitFinanceApp = () => {
  const [theme, colorMode] = useMode();
  const { status, userType, user, startCheckingAuthentication } = useAuthStore();
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
          minHeight: '100vh'
        }}>

          <main className='content' style={{
            display: 'flex',
            flexDirection: window.innerWidth < 900 ? 'column' : 'row',
            height: window.innerWidth < 900 ? 'auto' : '100vh'
          }}>
            {/* SidebarComponent removido para evitar doble render. El dashboard o el componente hijo lo renderiza internamente. */}
            <Box
              flexGrow={1}
              sx={{
                height: '100%',
                overflow: { xs: 'visible', md: 'auto' },
                paddingBottom: { xs: '100px', md: 0 }
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
                  <Route path='/student/routine' element={<StudentRoutine />} />
                  <Route path='/student/payment-success' element={<PaymentSuccess />} />
                  <Route path='/student/payment-failure' element={<PaymentFailure />} />
                  <Route path='/student/payment-pending' element={<PaymentPending />} />
                  <Route path='/auth/*' element={<Navigate to='/student' />} />
                  <Route path='/*' element={<StudentDashboard />} />
                  </>
                ) : status === 'authenticated' && userType === 'coach' ? (
                  <>
                    <Route path='/coach/dashboard' element={<CoachDashboard coachUserId={user?.id} />} />
                    <Route path='/coach/alumno/:id' element={<StudentDetail />} />
                    <Route path='/coach/macrocycle/:id' element={<MacrocycleDetail />} />
                    <Route path='/coach/microcycle/:id' element={<MicrocycleDetail />} />
                    <Route path='/coach/mesocycle/:mesocycleId/microcycles' element={<MicrocycleManager />} />
                    <Route path='/coach/mesocycle/:mesocycleId/microcycle/new' element={<MicrocycleEdit />} />
                    <Route path='/coach/mesocycle/:mesocycleId/microcycle/:microcycleId/edit' element={<MicrocycleEdit />} />
                    <Route path='/auth/*' element={<Navigate to='/coach/dashboard' />} />
                    <Route path='/*' element={<CoachDashboard coachUserId={user?.id} />} />
                  </>
                ) : status === 'authenticated' ? (
                  <>
                    <Route path='/sports' element={<SportsMainView />} />
                    <Route path='/usuarios' element={<Users />} />
                    <Route path='/cuotas' element={<Fees />} />
                    <Route path='/pagos' element={<Payments />} />
                    <Route path='/alumnos' element={<Students />} />
                    <Route path='/coaches' element={<AdminCoaches />} />
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
