



import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks';
import MacroCycleForm from './MacroCycleForm';
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
    <div style={containerStyle}>
      <button onClick={() => navigate(-1)} style={volverBtnStyle}>Volver</button>
      <h2 style={{ marginBottom: 18, fontSize: isMobile ? 22 : 32, textAlign: 'center', fontWeight: 800, letterSpacing: 0.5 }}>{student.user?.fullName || student.firstName + ' ' + student.lastName}</h2>
      <div style={{ marginBottom: 24, color: '#e0e0e0', width: '100%', fontSize: isMobile ? 15 : 19, textAlign: isMobile ? 'left' : 'center', lineHeight: 1.7 }}>
      {/* Macro-ciclos del alumno */}
      <div style={{ width: '100%', margin: '32px 0 0 0' }}>
        <h3 style={{ color: '#ffd700', fontWeight: 700, fontSize: isMobile ? 18 : 24, marginBottom: 16, textAlign: 'center' }}>Macro-ciclos</h3>
        {loadingMacros ? (
          <div style={{ textAlign: 'center', color: '#aaa', margin: 16 }}>Cargando macro-ciclos...</div>
        ) : macros.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#aaa', margin: 16 }}>No hay macro-ciclos para este alumno.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
            {macros.map(macro => (
              <div key={macro.id} style={{
                background: '#232323',
                borderRadius: 12,
                boxShadow: '0 2px 12px #0003',
                padding: 18,
                minWidth: 220,
                maxWidth: 320,
                marginBottom: isMobile ? 16 : 0,
                border: '1.5px solid #333',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#ffd700', marginBottom: 6 }}>{macro.name}</div>
                <div style={{ fontSize: 15, marginBottom: 4 }}><b>Inicio:</b> {macro.startDate ? new Date(macro.startDate).toLocaleDateString() : '-'}</div>
                <div style={{ fontSize: 15, marginBottom: 4 }}><b>Fin:</b> {macro.endDate ? new Date(macro.endDate).toLocaleDateString() : '-'}</div>
                {macro.observaciones && <div style={{ fontSize: 14, marginTop: 8, color: '#ccc' }}><b>Obs.:</b> {macro.observaciones}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
        <div><b>Email:</b> {student.user?.email || student.email}</div>
        <div><b>Deporte:</b> {student.sport?.name}</div>
        {student.birthDate && <div><b>Nacimiento:</b> {new Date(student.birthDate).toLocaleDateString()}</div>}
        {student.startDate && <div><b>Alta:</b> {new Date(student.startDate).toLocaleDateString()}</div>}
        {typeof student.isActive === 'boolean' && <div><b>Estado:</b> {student.isActive ? 'Activo' : 'Inactivo'}</div>}
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
              // Aquí podrías avanzar al paso de meso-ciclo
              alert('Macro-ciclo creado: ' + macro.name);
            }}
            onCancel={() => setShowMacroForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default StudentDetail;
