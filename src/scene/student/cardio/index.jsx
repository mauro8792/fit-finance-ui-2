import { useAuthStore } from '../../../hooks';
import CardioSection from './CardioSection';

// Wrapper que obtiene el studentId del auth store
const CardioDashboard = () => {
  const { student } = useAuthStore();
  const studentId = student?.id;

  if (!studentId) {
    return (
      <div style={{ 
        padding: 40, 
        textAlign: 'center', 
        color: 'rgba(255,255,255,0.7)' 
      }}>
        Cargando información del estudiante...
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', maxWidth: 600, margin: '0 auto' }}>
      <CardioSection studentId={studentId} />
    </div>
  );
};

export { CardioDashboard };
export default CardioSection;

