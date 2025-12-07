import { Navigate, Route, Routes } from 'react-router-dom';
import { ColorModeContext, useMode } from './theme';
import { Box, CssBaseline, ThemeProvider, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import SidebarComponent from './scene/global/SidebarComponent';
import { Sports, SportsMainView } from './scene/sports';
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
import TrainingHistory from './scene/student/TrainingHistory';
import { HealthDashboard } from './scene/student/health';
import { NutritionDashboard } from './scene/student/nutrition';
import { CardioDashboard } from './scene/student/cardio';
import { PaymentSuccess } from './scene/payments/PaymentSuccess';
import { PaymentFailure } from './scene/payments/PaymentFailure';
import { PaymentPending } from './scene/payments/PaymentPending';
import StudentDetail from './scene/coach/StudentDetail';
import MacrocycleDetail from './scene/coach/MacrocycleDetail';
import MicrocycleManager from './scene/coach/MicrocycleManager';
import StudentNutritionView from './scene/coach/StudentNutritionView';

import MicrocycleEdit from './scene/coach/MicrocycleEdit';
import MicrocycleDetail from './components/MicrocycleDetail';
import ExerciseCatalogManager from './scene/coach/ExerciseCatalogManager';
import DashboardMock from './components/DashboardMock';
import Layout from './components/Layout';
import { InstallPWABanner } from './components/InstallPWABanner';

export const FitFinanceApp = () => {
  const [theme, colorMode] = useMode();
  const { status, userType, user, startCheckingAuthentication } = useAuthStore();
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
        <InstallPWABanner />
        <Routes>
          {status === 'not-authenticated' ? (
            <>
              <Route path="/auth/*" element={<AuthRoutes />} />
              <Route path="*" element={<Navigate to="/auth/login" />} />
            </>
          ) : (
            <Route element={<Layout showFooter={false} />}>
              {userType === 'student' && (
                <>
                  <Route path="/" element={<DashboardMock />} />
                  <Route path="/student" element={<StudentDashboard />} />
                  <Route path="/student/fees" element={<StudentFees />} />
                  <Route path="/student/routine" element={<StudentRoutine />} />
                  <Route path="/student/progress" element={<HealthDashboard />} />
                  <Route path="/student/nutrition" element={<NutritionDashboard />} />
                  <Route path="/student/cardio" element={<CardioDashboard />} />
                  <Route path="/student/history" element={<TrainingHistory />} />
                  <Route path="/student/payment-success" element={<PaymentSuccess />} />
                  <Route path="/student/payment-failure" element={<PaymentFailure />} />
                  <Route path="/student/payment-pending" element={<PaymentPending />} />
                  <Route path="*" element={<Navigate to="/student" />} />
                </>
              )}
              
              {userType === 'coach' && (
                <>
                  <Route path="/" element={<CoachDashboard coachUserId={user?.id} />} />
                  <Route path="/coach/dashboard" element={<CoachDashboard coachUserId={user?.id} />} />
                  <Route path="/coach/alumno/:id" element={<StudentDetail />} />
                  <Route path="/coach/alumno/:studentId/nutricion" element={<StudentNutritionView />} />
                  <Route path="/coach/macrocycle/:id" element={<MacrocycleDetail />} />
                  <Route path="/coach/microcycle/:id" element={<MicrocycleDetail />} />
                  <Route path="/coach/mesocycle/:mesocycleId/microcycles" element={<MicrocycleManager />} />
                  <Route path="/coach/mesocycle/:mesocycleId/microcycle/new" element={<MicrocycleEdit />} />
                  <Route path="/coach/mesocycle/:mesocycleId/microcycle/:microcycleId/edit" element={<MicrocycleEdit />} />
                  <Route path="/coach/exercise-catalog" element={<ExerciseCatalogManager />} />
                  <Route path="*" element={<Navigate to="/coach/dashboard" />} />
                </>
              )}
              
              {(userType === 'admin' || userType === 'superadmin') && (
                <>
                  <Route path="/" element={<DashboardMock />} />
                  <Route path="/sports" element={<Sports />} />
                  <Route path="/usuarios" element={<Users />} />
                  <Route path="/cuotas" element={<Fees />} />
                  <Route path="/pagos" element={<Payments />} />
                  <Route path="/alumnos" element={<Students />} />
                   <Route path="/coaches" element={<AdminCoaches />} />
                  <Route path="*" element={<Navigate to="/" />} />
                 
                </>
              )}
            </Route>
          )}
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
