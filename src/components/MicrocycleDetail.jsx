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
  
  // Estados para edición de ejercicios por el entrenador
  const [exerciseEditModalOpen, setExerciseEditModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [editField, setEditField] = useState(''); // 'series', 'repeticiones', etc.
  const [editValue, setEditValue] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState(false);

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

  // Función para manejar la edición de ejercicios por el entrenador
  const handleEditExercise = (exercise, field) => {
    setSelectedExercise(exercise);
    setEditField(field);
    setEditValue(exercise[field] || '');
    setExerciseEditModalOpen(true);
  };

  // Función para guardar los cambios del ejercicio y replicarlos
  const handleSaveExerciseUpdate = async () => {
    if (!selectedExercise || !editField || !editValue.trim()) return;
    
    setLoadingUpdate(true);
    try {
      const token = localStorage.getItem('token');
      
      // Usar el endpoint update-template para que se replique a microciclos siguientes
      await fitFinanceApi.put(`/exercise/${selectedExercise.id}/update-template`, {
        field: editField,
        value: editValue.toString(),
        fromMicrocycle: parseInt(id) // desde este microciclo hacia adelante
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresca el microciclo
      const res = await fitFinanceApi.get(`/microcycle/${id}`);
      setMicrocycle(res.data);
      
      // Cerrar modal
      setExerciseEditModalOpen(false);
      setSelectedExercise(null);
      setEditField('');
      setEditValue('');
      
      alert('¡Ejercicio actualizado! Los cambios se aplicaron a este microciclo y todos los siguientes.');
    } catch (error) {
      console.error('Error al actualizar ejercicio:', error);
      alert('Error al actualizar el ejercicio');
    } finally {
      setLoadingUpdate(false);
    }
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
      background: '#f5f5f5', 
      minHeight: '100vh', 
      padding: isMobile ? 12 : 20, 
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header simplificado */}
      <div style={{ marginBottom: 24 }}>
        {/* Header del microciclo */}
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: isMobile ? 16 : 24,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: isMobile ? 20 : 28, 
            fontWeight: 600, 
            color: '#2c3e50',
            marginBottom: 8,
            textAlign: 'center'
          }}>
            {microcycle.name}
          </h1>
          <div style={{ 
            fontSize: isMobile ? 14 : 16, 
            color: '#7f8c8d',
            textAlign: 'center'
          }}>
            <strong>Período:</strong> {(() => {
              if (!microcycle.days || microcycle.days.length === 0) return 'Sin días configurados';
              const daysWithDates = microcycle.days.filter(day => day.fecha);
              if (daysWithDates.length === 0) return 'Sin fechas asignadas';
              const dates = daysWithDates.map(day => new Date(day.fecha)).sort((a, b) => a - b);
              const startDate = dates[0].toLocaleDateString();
              const endDate = dates[dates.length - 1].toLocaleDateString();
              return `${startDate} - ${endDate}`;
            })()}
          </div>
        </div>
      </div>

      {/* Contenido principal - días */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: isMobile ? 12 : 20,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e0e0e0'
      }}>
        {microcycle.days && microcycle.days.length > 0 ? (
          (() => {
            // Ordenar días por número de día y mostrar todos (con y sin ejercicios)
            const sortedDays = microcycle.days
              .sort((a, b) => a.dia - b.dia)
              .filter(day => !day.esDescanso && day.exercises && day.exercises.length > 0); // Solo días con ejercicios
            
            return sortedDays.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {sortedDays.map((day) => (
                  <div key={day.id} style={{
                    background: '#f8f9fa',
                    borderRadius: 8,
                    border: '1px solid #dee2e6',
                    padding: isMobile ? 12 : 16,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}>
                    {/* Header del día */}
                    <div style={{
                      background: '#6c757d',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: isMobile ? 14 : 16,
                      marginBottom: 12,
                      textAlign: 'center'
                    }}>
                      {day.nombre || `Día ${day.dia}`}
                    </div>

                    {/* Verificar si hay ejercicios */}
                    {day.exercises && day.exercises.length > 0 ? (
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
                                  background: index % 2 === 0 ? '#f8f9fa' : '#ffffff'
                                }}
                              >
                                <td style={{ 
                                  padding: '8px 6px', 
                                  color: '#2c3e50',
                                  fontWeight: 600,
                                  fontSize: isMobile ? 11 : 12
                                }}>
                                  {ex.nombre || ex.name || 'Sin nombre'}
                                </td>
                                <td style={{ 
                                  padding: '8px 6px', 
                                  textAlign: 'center', 
                                  color: '#6c757d',
                                  fontSize: isMobile ? 10 : 11
                                }}>
                                  {ex.grupoMuscular || ex.muscle || '-'}
                                </td>
                                <td style={{ 
                                  padding: '8px 6px', 
                                  textAlign: 'center', 
                                  color: '#28a745',
                                  fontWeight: 600,
                                  fontSize: isMobile ? 10 : 11,
                                  cursor: 'pointer',
                                  position: 'relative'
                                }}
                                onClick={() => handleEditExercise(ex, 'series')}
                                title="Click para editar series"
                                >
                                  {/* Verificar si los datos están intercambiados y corregir */}
                                  {(() => {
                                    const series = ex.series || '';
                                    const reps = ex.repeticiones || ex.repRange || '';
                                    
                                    // Si series contiene un guión (ej: "10-12"), probablemente son repeticiones intercambiadas
                                    if (series.includes('-') && !reps.includes('-')) {
                                      return reps || '-';
                                    }
                                    return series || '-';
                                  })()}
                                  <span style={{
                                    position: 'absolute',
                                    top: '2px',
                                    right: '4px',
                                    fontSize: '8px',
                                    color: '#6c757d',
                                    opacity: 0.5
                                  }}>✏️</span>
                                </td>
                                <td style={{ 
                                  padding: '8px 6px', 
                                  textAlign: 'center', 
                                  color: '#007bff',
                                  fontWeight: 600,
                                  fontSize: isMobile ? 10 : 11,
                                  cursor: 'pointer',
                                  position: 'relative'
                                }}
                                onClick={() => handleEditExercise(ex, 'repeticiones')}
                                title="Click para editar repeticiones"
                                >
                                  {/* Verificar si los datos están intercambiados y corregir */}
                                  {(() => {
                                    const series = ex.series || '';
                                    const reps = ex.repeticiones || ex.repRange || '';
                                    
                                    // Si series contiene un guión (ej: "10-12"), probablemente son repeticiones intercambiadas
                                    if (series.includes('-') && !reps.includes('-')) {
                                      return series || '-';
                                    }
                                    return reps || '-';
                                  })()}
                                  <span style={{
                                    position: 'absolute',
                                    top: '2px',
                                    right: '4px',
                                    fontSize: '8px',
                                    color: '#6c757d',
                                    opacity: 0.5
                                  }}>✏️</span>
                                </td>
                                <td style={{ 
                                  padding: '8px 6px', 
                                  textAlign: 'center', 
                                  color: '#6f42c1',
                                  fontWeight: 600,
                                  fontSize: isMobile ? 10 : 11
                                }}>
                                  {ex.rirEsperado || '-'}
                                </td>
                                <td style={{ 
                                  padding: '8px 6px', 
                                  textAlign: 'center', 
                                  color: '#fd7e14',
                                  fontSize: isMobile ? 10 : 11
                                }}>
                                  {ex.descanso ? `${ex.descanso}min` : '-'}
                                </td>
                                <td style={{ 
                                  padding: '8px 6px', 
                                  textAlign: 'center', 
                                  color: '#6c757d',
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
                    ) : (
                      /* Día sin ejercicios */
                      <div style={{
                        background: '#ffffff',
                        borderRadius: 6,
                        padding: isMobile ? 12 : 16,
                        border: '1px solid #dee2e6',
                        textAlign: 'center',
                        color: '#6c757d'
                      }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>⏸️</div>
                        <div style={{ fontSize: isMobile ? 12 : 14, marginBottom: 4 }}>Sin ejercicios programados</div>
                        <div style={{ fontSize: isMobile ? 10 : 12, opacity: 0.7 }}>Este día no tiene ejercicios configurados</div>
                      </div>
                    )}
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

      {/* Modal de edición de ejercicios para entrenador */}
      {exerciseEditModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#222',
            borderRadius: 16,
            padding: 24,
            maxWidth: 400,
            width: '100%',
            border: '2px solid #ff9800'
          }}>
            <h3 style={{ 
              color: '#ff9800', 
              margin: '0 0 16px 0', 
              textAlign: 'center',
              fontSize: 18
            }}>
              Editar {editField === 'series' ? 'Series' : 'Repeticiones'}
            </h3>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ 
                color: '#fff', 
                fontSize: 14, 
                marginBottom: 8 
              }}>
                <strong>Ejercicio:</strong> {selectedExercise?.nombre || selectedExercise?.name}
              </div>
              <div style={{ 
                color: '#aaa', 
                fontSize: 12, 
                marginBottom: 12,
                padding: 8,
                background: '#333',
                borderRadius: 6,
                border: '1px solid #555'
              }}>
                ⚠️ <strong>Importante:</strong> Este cambio se aplicará a este microciclo y todos los microciclos siguientes del mesociclo.
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                color: '#fff', 
                fontSize: 14, 
                display: 'block', 
                marginBottom: 8 
              }}>
                Nuevo valor para {editField === 'series' ? 'series' : 'repeticiones'}:
              </label>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={editField === 'series' ? 'Ej: 4' : 'Ej: 8-12'}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 8,
                  border: '2px solid #555',
                  background: '#333',
                  color: '#fff',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ff9800';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#555';
                }}
              />
            </div>

            <div style={{ 
              display: 'flex', 
              gap: 12, 
              justifyContent: 'flex-end' 
            }}>
              <button
                onClick={() => {
                  setExerciseEditModalOpen(false);
                  setSelectedExercise(null);
                  setEditField('');
                  setEditValue('');
                }}
                disabled={loadingUpdate}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#666',
                  color: '#fff',
                  cursor: loadingUpdate ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  opacity: loadingUpdate ? 0.6 : 1
                }}
              >
                Cancelar
              </button>
              
              <button
                onClick={handleSaveExerciseUpdate}
                disabled={loadingUpdate || !editValue.trim()}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: loadingUpdate || !editValue.trim() ? '#666' : '#4caf50',
                  color: '#fff',
                  cursor: loadingUpdate || !editValue.trim() ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  opacity: loadingUpdate || !editValue.trim() ? 0.6 : 1
                }}
              >
                {loadingUpdate ? 'Guardando...' : 'Guardar y Replicar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MicrocycleDetail;
