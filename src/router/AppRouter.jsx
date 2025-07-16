
import { Routes, Route } from 'react-router-dom';
import { Layout } from '../components/Layout';
import CoachDashboard from '../scene/coach/CoachDashboard';
import StudentDetail from '../scene/coach/StudentDetail';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<CoachDashboard />} />
        <Route path="coach" element={<CoachDashboard />} />
        <Route path="coach/alumno/:id" element={<StudentDetail />} />
        {/* Otras rutas aquí */}
      </Route>
    </Routes>
  );
};
