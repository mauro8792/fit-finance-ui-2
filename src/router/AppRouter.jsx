

import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import CoachDashboard from '../scene/coach/CoachDashboard';
import StudentDetail from '../scene/coach/StudentDetail';
import MacrocycleDetail from '../scene/coach/MacrocycleDetail';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<CoachDashboard />} />
        <Route path="coach" >
          <Route index element={<CoachDashboard />} />
        </Route>
        <Route path="student/:id" element={<StudentDetail />} />
        {/* Otras rutas aquí */}
        <Route path="*" element={<div style={{color:'red',fontWeight:800,fontSize:32,padding:40}}>Ruta no encontrada (catch-all)</div>} />
      </Route>
    </Routes>
  );
};
