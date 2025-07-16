
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks';

const CoachDashboard = () => {
  const { user, getCoachStudentsData, status } = useAuthStore();
  const coachUserId = user?.id;
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (status !== 'authenticated' || !coachUserId) return;
    setLoading(true);
    getCoachStudentsData(coachUserId)
      .then((data) => {
        setStudents(data);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [coachUserId, getCoachStudentsData, status]);

  if (loading) return <div>Cargando alumnos...</div>;
  if (error) return <div>Error al cargar alumnos</div>;

  return (
    <div>
      <h2>Mis Alumnos</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {students.map((student) => (
          <div
            key={student.id}
            style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, minWidth: 220, cursor: 'pointer' }}
            onClick={() => navigate(`/coach/alumno/${student.id}`)}
          >
            <h4>{student.user?.fullName || student.firstName + ' ' + student.lastName}</h4>
            <p>Deporte: {student.sport?.name}</p>
            <p>Email: {student.user?.email || student.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoachDashboard;
