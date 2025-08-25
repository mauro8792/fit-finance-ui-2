import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import fitFinanceApi from "../api/fitFinanceApi";
import EditSetModal from "./EditSetModal";

const MicrocycleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [microcycle, setMicrocycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);

  // Estilos responsivos
  const isMobile = window.innerWidth < 600;

  useEffect(() => {
    fitFinanceApi.get(`/microcycle/${id}`)
      .then((res) => setMicrocycle(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEditSet = (set) => {
    setSelectedSet(set);
    setEditModalOpen(true);
  };

  const handleSaveSet = async (form) => {
    // Llama al backend para actualizar el set
    const token = localStorage.getItem('token');
    await fitFinanceApi.patch(`/set/${selectedSet.id}`, form, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Refresca el microciclo
    const res = await fitFinanceApi.get(`/microcycle/${id}`);
    setMicrocycle(res.data);
  };

  if (loading) return (
    <div style={{ background: '#181818', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#ffd700', fontSize: 18 }}>Cargando microciclo...</div>
    </div>
  );

  if (!microcycle) return (
    <div style={{ background: '#181818', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#ff4d4f', fontSize: 18 }}>No se encontró el microciclo.</div>
    </div>
  );

  return (
    <div style={{ 
      background: '#181818', 
      height: '100vh', 
      padding: isMobile ? 8 : 16, 
      overflow: 'hidden', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      {/* Header compacto */}
      <div style={{ flex: '0 0 auto', marginBottom: 16 }}>
        {/* Botón volver */}
        <button 
          onClick={() => navigate(-1)} 
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '6px 12px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: isMobile ? 12 : 13,
            marginBottom: 12,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          ← Volver
        </button>

        {/* Header del microciclo */}
        <div style={{
          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
          borderRadius: 12,
          color: '#fff',
          padding: isMobile ? 12 : 16,
          boxShadow: '0 4px 16px rgba(255, 152, 0, 0.3)',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: isMobile ? 18 : 22, 
            fontWeight: 700, 
            marginBottom: 6 
          }}>
            {microcycle.name}
          </h2>
          <div style={{ 
            fontSize: isMobile ? 12 : 13, 
            opacity: 0.9 
          }}>
            <strong>Período:</strong> {microcycle.startDate} - {microcycle.endDate}
          </div>
        </div>
      </div>

      {/* Contenido principal - días */}
      <div style={{
        background: '#222',
        borderRadius: 12,
        padding: isMobile ? 8 : 12,
        flex: '1 1 auto',
        overflow: 'auto',
        boxShadow: '0 2px 16px #0002'
      }}>
        {microcycle.days && microcycle.days.length > 0 ? (
          (() => {
            // Filtrar solo los días que tienen ejercicios
            const daysWithExercises = microcycle.days.filter(day => 
              day.exercises && day.exercises.length > 0
            );
            
            return daysWithExercises.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {daysWithExercises.map((day) => (
                  <div key={day.id} style={{
                    background: '#181818',
                    borderRadius: 10,
                    border: '2px solid #ff9800',
                    padding: isMobile ? 8 : 12,
                    boxShadow: '0 2px 8px #0003'
                  }}>
                    {/* Header del día */}
                    <div style={{
                      background: '#ff9800',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: isMobile ? 14 : 15,
                      marginBottom: 10,
                      textAlign: 'center'
                    }}>
                      {day.nombre || `Día ${day.number}`}
                    </div>

                    {/* Ejercicios en formato tabla unificada */}
                    <div style={{
                      background: '#2a2a2a',
                      borderRadius: 8,
                      padding: isMobile ? 8 : 10,
                      border: '1px solid #444'
                    }}>
                      {/* Tabla unificada de ejercicios */}
                      <div style={{ overflow: 'auto' }}>
                        <table style={{ 
                          width: "100%", 
                          fontSize: isMobile ? 11 : 12,
                          borderCollapse: "collapse",
                          background: '#333'
                        }}>
                          <thead>
                            <tr style={{ background: '#ffd700', color: '#222' }}>
                              <th style={{ 
                                padding: '8px 6px', 
                                textAlign: 'left', 
                                fontSize: isMobile ? 11 : 12,
                                fontWeight: 700,
                                width: '25%'
                              }}>
                                Ejercicio
                              </th>
                              <th style={{ 
                                padding: '8px 6px', 
                                textAlign: 'center', 
                                fontSize: isMobile ? 10 : 11,
                                width: '15%'
                              }}>
                                Músculo
                              </th>
                              <th style={{ 
                                padding: '8px 6px', 
                                textAlign: 'center', 
                                fontSize: isMobile ? 10 : 11,
                                width: '10%'
                              }}>
                                Series
                              </th>
                              <th style={{ 
                                padding: '8px 6px', 
                                textAlign: 'center', 
                                fontSize: isMobile ? 10 : 11,
                                width: '15%'
                              }}>
                                Reps
                              </th>
                              <th style={{ 
                                padding: '8px 6px', 
                                textAlign: 'center', 
                                fontSize: isMobile ? 10 : 11,
                                width: '10%'
                              }}>
                                RIR
                              </th>
                              <th style={{ 
                                padding: '8px 6px', 
                                textAlign: 'center', 
                                fontSize: isMobile ? 10 : 11,
                                width: '15%'
                              }}>
                                Descanso
                              </th>
                              <th style={{ 
                                padding: '8px 6px', 
                                textAlign: 'center', 
                                fontSize: isMobile ? 10 : 11,
                                width: '10%'
                              }}>
                                Sets
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {day.exercises.map((ex, index) => (
                              <tr 
                                key={ex.id}
                                style={{ 
                                  background: index % 2 === 0 ? '#333' : '#3a3a3a',
                                  transition: 'background 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = '#444';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = index % 2 === 0 ? '#333' : '#3a3a3a';
                                }}
                              >
                                <td style={{ 
                                  padding: '8px 6px', 
                                  color: '#ffd700',
                                  fontWeight: 600,
                                  fontSize: isMobile ? 11 : 12
                                }}>
                                  {ex.nombre || ex.name || 'Sin nombre'}
                                </td>
                                <td style={{ 
                                  padding: '8px 6px', 
                                  textAlign: 'center', 
                                  color: '#ff9800',
                                  fontSize: isMobile ? 10 : 11
                                }}>
                                  {ex.grupoMuscular || ex.muscle || '-'}
                                </td>
                                <td style={{ 
                                  padding: '8px 6px', 
                                  textAlign: 'center', 
                                  color: '#4caf50',
                                  fontWeight: 600,
                                  fontSize: isMobile ? 10 : 11
                                }}>
                                  {ex.series || '-'}
                                </td>
                                <td style={{ 
                                  padding: '8px 6px', 
                                  textAlign: 'center', 
                                  color: '#2196f3',
                                  fontWeight: 600,
                                  fontSize: isMobile ? 10 : 11
                                }}>
                                  {ex.repeticiones || ex.repRange || '-'}
                                </td>
                                <td style={{ 
                                  padding: '8px 6px', 
                                  textAlign: 'center', 
                                  color: '#9c27b0',
                                  fontWeight: 600,
                                  fontSize: isMobile ? 10 : 11
                                }}>
                                  {ex.rirEsperado || '-'}
                                </td>
                                <td style={{ 
                                  padding: '8px 6px', 
                                  textAlign: 'center', 
                                  color: '#ff5722',
                                  fontSize: isMobile ? 10 : 11
                                }}>
                                  {ex.descanso ? `${ex.descanso}min` : '-'}
                                </td>
                                <td style={{ 
                                  padding: '8px 6px', 
                                  textAlign: 'center', 
                                  color: '#607d8b',
                                  fontSize: isMobile ? 10 : 11
                                }}>
                                  {ex.sets && ex.sets.length > 0 ? (
                                    <span 
                                      style={{ 
                                        background: '#4caf50', 
                                        color: '#fff', 
                                        padding: '2px 6px', 
                                        borderRadius: 4, 
                                        fontSize: 9,
                                        cursor: 'pointer'
                                      }}
                                      title="Ver sets registrados"
                                    >
                                      {ex.sets.length} sets
                                    </span>
                                  ) : (
                                    <span style={{ color: '#777', fontSize: 9 }}>Sin sets</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mostrar sets registrados si hay algún ejercicio con sets */}
                      {day.exercises.some(ex => ex.sets && ex.sets.length > 0) && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ 
                            color: '#ffd700', 
                            fontSize: isMobile ? 11 : 12, 
                            fontWeight: 600, 
                            marginBottom: 6,
                            textAlign: 'center'
                          }}>
                            Sets Registrados
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {day.exercises.filter(ex => ex.sets && ex.sets.length > 0).map((ex) => (
                              <div key={`sets-${ex.id}`} style={{
                                background: '#1a1a1a',
                                borderRadius: 6,
                                padding: 8,
                                border: '1px solid #555'
                              }}>
                                <div style={{ 
                                  color: '#ffd700', 
                                  fontSize: isMobile ? 10 : 11, 
                                  fontWeight: 600, 
                                  marginBottom: 4
                                }}>
                                  {ex.nombre || ex.name} - Sets:
                                </div>
                                <table style={{ 
                                  width: "100%", 
                                  fontSize: isMobile ? 9 : 10,
                                  borderCollapse: "collapse",
                                  background: '#444'
                                }}>
                                  <thead>
                                    <tr style={{ background: '#666', color: '#fff' }}>
                                      <th style={{ padding: '4px 2px', textAlign: 'center', fontSize: isMobile ? 8 : 9 }}>Set</th>
                                      <th style={{ padding: '4px 2px', textAlign: 'center', fontSize: isMobile ? 8 : 9 }}>Reps</th>
                                      <th style={{ padding: '4px 2px', textAlign: 'center', fontSize: isMobile ? 8 : 9 }}>Carga</th>
                                      <th style={{ padding: '4px 2px', textAlign: 'center', fontSize: isMobile ? 8 : 9 }}>RIR Real</th>
                                      <th style={{ padding: '4px 2px', textAlign: 'center', fontSize: isMobile ? 8 : 9 }}>RPE</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {ex.sets.map((set, index) => (
                                      <tr 
                                        key={set.id} 
                                        style={{ 
                                          cursor: 'pointer',
                                          background: index % 2 === 0 ? '#444' : '#555',
                                          transition: 'background 0.2s ease'
                                        }} 
                                        onClick={() => handleEditSet(set)}
                                        onMouseEnter={(e) => {
                                          e.target.style.background = '#666';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.target.style.background = index % 2 === 0 ? '#444' : '#555';
                                        }}
                                      >
                                        <td style={{ padding: '4px 2px', textAlign: 'center', color: '#fff' }}>{index + 1}</td>
                                        <td style={{ padding: '4px 2px', textAlign: 'center', color: '#fff' }}>{set.reps || '-'}</td>
                                        <td style={{ padding: '4px 2px', textAlign: 'center', color: '#fff' }}>{set.load ? `${set.load}kg` : '-'}</td>
                                        <td style={{ padding: '4px 2px', textAlign: 'center', color: '#fff' }}>{set.actualRir || '-'}</td>
                                        <td style={{ padding: '4px 2px', textAlign: 'center', color: '#fff' }}>{set.actualRpe || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: 200,
                color: '#aaa',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>💪</div>
                <div style={{ fontSize: 16, marginBottom: 8 }}>No hay ejercicios programados</div>
                <div style={{ fontSize: 14, opacity: 0.7 }}>Este microciclo no tiene días con ejercicios configurados</div>
              </div>
            );
          })()
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: 200,
            color: '#aaa',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
            <div style={{ fontSize: 16, marginBottom: 8 }}>No hay días programados</div>
            <div style={{ fontSize: 14, opacity: 0.7 }}>Este microciclo aún no tiene días de entrenamiento configurados</div>
          </div>
        )}
      </div>

      {/* Modal de edición */}
      <EditSetModal
        open={editModalOpen}
        set={selectedSet || {}}
        onSave={handleSaveSet}
        onClose={() => setEditModalOpen(false)}
      />
    </div>
  );
};

export default MicrocycleDetail;
