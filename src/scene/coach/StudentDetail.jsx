



import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks';
import MacroCycleForm from './MacroCycleForm';
import MesocycleForm from './MesocycleForm';
import MicrocycleForm from './MicrocycleForm';
import { useRoutineStore } from '../../hooks/useRoutineStore';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getStudentById } = useAuthStore();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMacroForm, setShowMacroForm] = useState(false);
  const [macros, setMacros] = useState([]);
  const [loadingMacros, setLoadingMacros] = useState(true);
  const [showMesocycleForm, setShowMesocycleForm] = useState(false);
  const [currentMacroId, setCurrentMacroId] = useState(null);
  const [showMicrocycleForm, setShowMicrocycleForm] = useState(false);
  const [currentMesocycleId, setCurrentMesocycleId] = useState(null);
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


  // Simulación: si student.routine existe, mostrar Ver Rutina, si no, Crear Rutina
  const hasRoutine = !!student.routine; // Cambia esto según tu backend

  // Estilos responsivos inline (CSS-in-JS)
  const isMobile = window.innerWidth < 600;
  const containerStyle = {

    background: isMobile ? '#181818' : 'rgba(30,30,30,0.97)',
    borderRadius: 18,
    boxShadow: isMobile ? '0 2px 16px #0002' : '0 8px 32px #0005',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: isMobile ? '98vw' : '100%',
    justifyContent: isMobile ? 'flex-start' : 'center',
    minHeight: isMobile ? 'unset' : '60vh',
    color: '#f5f5f5',
    border: isMobile ? 'none' : '1.5px solid #222',
    transition: 'all 0.2s',
  };
  const buttonStyle = {
    padding: isMobile ? '12px 24px' : '16px 40px',
    borderRadius: 10,
    border: 'none',
    background: '#ffd700',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: isMobile ? 16 : 20,
    width: isMobile ? '100%' : 220,
    marginBottom: isMobile ? 10 : 0,
    boxShadow: isMobile ? 'none' : '0 2px 12px #0002',
    color: '#222',
    letterSpacing: 0.5,
    transition: 'background 0.2s',
  };
  const volverBtnStyle = {
    marginBottom: 32,
    padding: isMobile ? '10px 20px' : '12px 32px',
    borderRadius: 8,
    border: 'none',
    background: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: isMobile ? 15 : 18,
    alignSelf: isMobile ? 'flex-start' : 'center',
    color: '#222',
    boxShadow: isMobile ? 'none' : '0 2px 8px #0001',
  };

  return (
    <div style={{ background: '#181818', minHeight: '100vh', padding: isMobile ? 8 : 32 }}>
      <button onClick={() => navigate(-1)} style={volverBtnStyle}>Volver</button>
      <h2 style={{ marginBottom: 24, fontSize: isMobile ? 28 : 40, textAlign: 'center', fontWeight: 800, letterSpacing: 0.5 }}>Detalle del Alumno</h2>
      {/* Cards superiores */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 24, marginBottom: 32, justifyContent: 'center' }}>
        {/* Card Alumno */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg,#7b6be6 60%,#5e4bb7)', borderRadius: 18, color: '#fff', padding: 28, minWidth: 260, boxShadow: '0 2px 16px #0002', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{student.user?.fullName || student.firstName + ' ' + student.lastName}</div>
          <div style={{ fontSize: 16, marginBottom: 8 }}><b>Email:</b> {student.user?.email || student.email}</div>
          <div style={{ fontSize: 16, marginBottom: 8 }}><b>Teléfono:</b> {student.user?.phone || student.phone || '-'}</div>
          {student.birthDate && <div style={{ fontSize: 16, marginBottom: 8 }}><b>Nacimiento:</b> {new Date(student.birthDate).toLocaleDateString()}</div>}
          {student.startDate && <div style={{ fontSize: 16, marginBottom: 8 }}><b>Alta:</b> {new Date(student.startDate).toLocaleDateString()}</div>}
          {typeof student.isActive === 'boolean' && <div style={{ fontSize: 16, marginBottom: 8 }}><b>Estado:</b> {student.isActive ? 'Activo' : 'Inactivo'}</div>}
        </div>
        {/* Card Deporte */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg,#ffb86c 60%,#ff7e5f)', borderRadius: 18, color: '#222', padding: 28, minWidth: 260, boxShadow: '0 2px 16px #0002', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Deporte</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{student.sport?.name || '-'}</div>
          {/* Puedes agregar más info del deporte aquí */}
        </div>
        {/* Card vacía */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg,#43e97b 60%,#38f9d7)', borderRadius: 18, color: '#222', padding: 28, minWidth: 260, boxShadow: '0 2px 16px #0002', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {/* Placeholder para futuro */}
        </div>
      </div>

      {/* Grid de macro-ciclos */}
      <div style={{ background: '#222', borderRadius: 16, padding: isMobile ? 12 : 28, margin: '0 auto', maxWidth: 1200, boxShadow: '0 2px 16px #0002' }}>
        <h3 style={{ color: '#ffd700', fontWeight: 700, fontSize: isMobile ? 20 : 28, marginBottom: 24, textAlign: 'center' }}>Rutinas (Macro-ciclos)</h3>
        {loadingMacros ? (
          <div style={{ textAlign: 'center', color: '#aaa', margin: 16 }}>Cargando macro-ciclos...</div>
        ) : macros.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#aaa', margin: 16 }}>No hay rutinas para este alumno.</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
            {macros.map(macro => (
              <div
                key={macro.id}
                style={{
                  background: '#181818',
                  borderRadius: 14,
                  boxShadow: '0 2px 12px #0003',
                  padding: 22,
                  minWidth: 260,
                  maxWidth: 320,
                  border: '2px solid #ffd700',
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  fontSize: 17,
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                }}
                onClick={() => navigate(`/coach/macrocycle/${macro.id}`)}
                title="Ver detalle del macro-ciclo"
              >
                <div style={{ fontWeight: 700, fontSize: 20, color: '#ffd700', marginBottom: 8 }}>{macro.name}</div>
                <div style={{ fontSize: 15, marginBottom: 4 }}><b>Inicio:</b> {macro.startDate ? new Date(macro.startDate).toLocaleDateString() : '-'}</div>
                <div style={{ fontSize: 15, marginBottom: 4 }}><b>Fin:</b> {macro.endDate ? new Date(macro.endDate).toLocaleDateString() : '-'}</div>
                {macro.observaciones && <div style={{ fontSize: 14, marginTop: 8, color: '#ccc' }}><b>Obs.:</b> {macro.observaciones}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 32, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 24, width: '100%', justifyContent: 'center' }}>
        {hasRoutine ? (
          <button style={buttonStyle}
            onClick={() => alert('Ver rutina de ' + (student.user?.fullName || student.firstName))}>
            Ver Rutina
          </button>
        ) : (
          !showMacroForm && (
            <button style={buttonStyle}
              onClick={() => setShowMacroForm(true)}>
              Crear Rutina
            </button>
          )
        )}
      </div>


      {/* Wizard: Macro-ciclo */}
      {showMacroForm && (
        <div style={{ marginTop: 32, width: '100%' }}>
          <MacroCycleForm
            studentId={student.id}
            onCreated={(macro) => {
              setShowMacroForm(false);
              setCurrentMacroId(macro.id);
              setShowMesocycleForm(true);
            }}
            onCancel={() => setShowMacroForm(false)}
          />
        </div>
      )}

      {/* Wizard: Mesociclo */}
      {showMesocycleForm && (
        <div style={{ marginTop: 32, width: '100%' }}>
          <MesocycleForm
            macrocycleId={currentMacroId}
            onCreated={(meso) => {
              setShowMesocycleForm(false);
              setCurrentMesocycleId(meso.id || 1); // Simulado, reemplazar por el id real si lo tienes
              setShowMicrocycleForm(true);
            }}
            onCancel={() => setShowMesocycleForm(false)}
          />
        </div>
      )}

      {/* Wizard: Microciclo */}
      {showMicrocycleForm && (
        <div style={{ marginTop: 32, width: '100%' }}>
          <MicrocycleForm
            mesocycleId={currentMesocycleId}
            onCreated={(micro) => {
              alert('Microciclo creado: ' + micro.name);
              setShowMicrocycleForm(false); // O dejarlo en true para crear más
            }}
            onCancel={() => setShowMicrocycleForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default StudentDetail;
