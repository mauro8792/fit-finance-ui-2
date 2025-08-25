import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks';
import RoutineWizard from './RoutineWizard';
import { useRoutineStore } from '../../hooks/useRoutineStore';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getStudentById } = useAuthStore();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [macros, setMacros] = useState([]);
  const [loadingMacros, setLoadingMacros] = useState(true);
  const [showRoutineWizard, setShowRoutineWizard] = useState(false);
  const { getAllMacroCycles } = useRoutineStore();

  useEffect(() => {
    setLoading(true);
    getStudentById(id)
      .then((data) => {
        setStudent(data);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => setLoading(false));

    // Traer macro-ciclos del alumno
    setLoadingMacros(true);
    getAllMacroCycles()
      .then((allMacros) => {
        setMacros(allMacros.filter(m => m.studentId == id));
      })
      .finally(() => setLoadingMacros(false));
  }, [id, getStudentById, getAllMacroCycles]);

  if (loading) return <div style={{textAlign:'center',marginTop:40}}>Cargando datos del alumno...</div>;
  if (error) return <div style={{textAlign:'center',marginTop:40}}>Error al cargar datos del alumno</div>;
  if (!student) return <div style={{textAlign:'center',marginTop:40}}>No se encontró el alumno</div>;

  // Estilos responsivos inline (CSS-in-JS)
  const isMobile = window.innerWidth < 600;

  return (
    <div style={{ background: '#181818', height: '100vh', padding: isMobile ? 8 : 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Cards superiores */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16, marginBottom: 20, justifyContent: 'center', flex: '0 0 auto' }}>
        {/* Card Alumno */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg,#7b6be6 60%,#5e4bb7)', borderRadius: 18, color: '#fff', padding: isMobile ? 16 : 20, minWidth: 220, boxShadow: '0 2px 16px #0002', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, marginBottom: 6 }}>{student.user?.fullName || student.firstName + ' ' + student.lastName}</div>
          <div style={{ fontSize: isMobile ? 13 : 14, marginBottom: 4 }}><b>Email:</b> {student.user?.email || student.email}</div>
          <div style={{ fontSize: isMobile ? 13 : 14, marginBottom: 4 }}><b>Teléfono:</b> {student.user?.phone || student.phone || '-'}</div>
          {student.birthDate && <div style={{ fontSize: isMobile ? 13 : 14, marginBottom: 4 }}><b>Nacimiento:</b> {new Date(student.birthDate).toLocaleDateString()}</div>}
          {student.startDate && <div style={{ fontSize: isMobile ? 13 : 14, marginBottom: 4 }}><b>Alta:</b> {new Date(student.startDate).toLocaleDateString()}</div>}
          {typeof student.isActive === 'boolean' && <div style={{ fontSize: isMobile ? 13 : 14, marginBottom: 4 }}><b>Estado:</b> {student.isActive ? 'Activo' : 'Inactivo'}</div>}
        </div>
        {/* Card Deporte */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg,#f093fb 60%,#f5576c)', borderRadius: 18, color: '#fff', padding: isMobile ? 16 : 20, minWidth: 220, boxShadow: '0 2px 16px #0002', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, marginBottom: 6 }}>Información Deportiva</div>
          
          <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 600, marginBottom: 6 }}>
            Disciplina: {student.sport?.name || '-'}
          </div>
          
          {student.sportPlan ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? 13 : 14, marginBottom: 3 }}>
                <b>Plan:</b> {student.sportPlan.name}
              </div>
              <div style={{ fontSize: isMobile ? 12 : 13, marginBottom: 3 }}>
                <b>Precio:</b> ${student.sportPlan.monthlyFee}/mes
              </div>
              <div style={{ fontSize: isMobile ? 12 : 13, marginBottom: 3 }}>
                <b>Frecuencia:</b> {student.sportPlan.weeklyFrequency}x por semana
              </div>
              {student.sportPlan.description && (
                <div style={{ fontSize: isMobile ? 11 : 12, marginTop: 6, fontStyle: 'italic' }}>
                  {student.sportPlan.description}
                </div>
              )}
            </div>
          ) : student.sport ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? 12 : 13, fontStyle: 'italic' }}>
                Usando precio base: ${student.sport.monthlyFee}/mes
              </div>
            </div>
          ) : null}
        </div>
        {/* Card vacía */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg,#43e97b 60%,#38f9d7)', borderRadius: 18, color: '#222', padding: isMobile ? 16 : 20, minWidth: 220, boxShadow: '0 2px 16px #0002', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {/* Placeholder para futuro */}
        </div>
      </div>

      {/* Grid de macro-ciclos */}
      <div style={{ background: '#222', borderRadius: 16, padding: isMobile ? 6 : 8, margin: '0 auto', maxWidth: 1200, boxShadow: '0 2px 16px #0002', flex: '0 0 auto', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ color: '#ffd700', fontWeight: 700, fontSize: isMobile ? 14 : 16, margin: 0 }}>Rutinas (Macro-ciclos)</h3>
        </div>
        
        {loadingMacros ? (
          <div style={{ textAlign: 'center', color: '#aaa', margin: 4, fontSize: 13 }}>Cargando macro-ciclos...</div>
        ) : macros.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 60, gap: 8 }}>
            <div style={{ textAlign: 'center', color: '#aaa', fontSize: 13 }}>No hay rutinas para este alumno.</div>
            {!showRoutineWizard && (
              <button 
                style={{
                  padding: isMobile ? '8px 16px' : '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: isMobile ? 12 : 14,
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                  color: '#fff',
                  letterSpacing: 0.3,
                  transition: 'all 0.2s ease',
                  transform: 'translateY(0)',
                }}
                onClick={() => setShowRoutineWizard(true)}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                }}
              >
                🚀 Crear Primera Rutina
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Grid de rutinas existentes */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-start', marginBottom: 16 }}>
              {macros.map(macro => (
                <div
                  key={macro.id}
                  style={{
                    background: '#181818',
                    borderRadius: 12,
                    boxShadow: '0 2px 12px #0003',
                    padding: 12,
                    minWidth: 200,
                    maxWidth: 240,
                    border: '2px solid #ffd700',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => navigate(`/coach/macrocycle/${macro.id}`)}
                  title="Ver detalle del macro-ciclo"
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 16px rgba(255, 215, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 12px #0003';
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#ffd700', marginBottom: 4 }}>{macro.name}</div>
                  <div style={{ fontSize: 12, marginBottom: 2, color: '#ccc' }}><b>Inicio:</b> {macro.startDate ? new Date(macro.startDate).toLocaleDateString() : '-'}</div>
                  <div style={{ fontSize: 12, marginBottom: 2, color: '#ccc' }}><b>Fin:</b> {macro.endDate ? new Date(macro.endDate).toLocaleDateString() : '-'}</div>
                  {macro.observaciones && <div style={{ fontSize: 11, marginTop: 4, color: '#aaa' }}><b>Obs.:</b> {macro.observaciones}</div>}
                </div>
              ))}
              
              {/* Card para crear nueva rutina */}
              {!showRoutineWizard && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 12,
                    boxShadow: '0 2px 12px rgba(102, 126, 234, 0.3)',
                    padding: 12,
                    minWidth: 200,
                    maxWidth: 240,
                    border: '2px dashed rgba(255, 255, 255, 0.3)',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 120,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => setShowRoutineWizard(true)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 12px rgba(102, 126, 234, 0.3)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>+</div>
                  <div style={{ fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
                    Nueva Rutina
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.8, textAlign: 'center', marginTop: 4 }}>
                    Crear macrociclo
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nuevo Wizard Completo */}
      {showRoutineWizard && (
        <RoutineWizard
          studentId={student.id}
          studentName={student.user?.fullName || `${student.firstName} ${student.lastName}`}
          onCancel={() => setShowRoutineWizard(false)}
          onComplete={() => {
            setShowRoutineWizard(false);
            // Recargar datos
            setLoading(true);
            getStudentById(id)
              .then((data) => setStudent(data))
              .catch((err) => setError(err))
              .finally(() => setLoading(false));
            
            setLoadingMacros(true);
            getAllMacroCycles()
              .then((allMacros) => setMacros(allMacros.filter(m => m.studentId == id)))
              .finally(() => setLoadingMacros(false));
          }}
        />
      )}
    </div>
  );
};

export default StudentDetail;
