import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import fitFinanceApi from "../api/fitFinanceApi";
import EditSetModal from "./EditSetModal";
import EditMicrocycleSets from "./EditMicrocycleSets";
import RestTimerWidget from "./RestTimerWidget";
import './MicrocycleDetail.css';
import AddExerciseModal from "./AddExerciseModal";
import ConfirmDeleteExerciseModal from "./ConfirmDeleteExerciseModal";
import ConfirmDeleteSetModal from "./ConfirmDeleteSetModal";

const MicrocycleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [microcycle, setMicrocycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [selectedExerciseForSet, setSelectedExerciseForSet] = useState(null);
  
  // Timer de descanso
  const [showTimer, setShowTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  
  // Estados para edición de ejercicios por el entrenador
  const [exerciseEditModalOpen, setExerciseEditModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [editField, setEditField] = useState(''); // 'series', 'repeticiones', etc.
  const [editValue, setEditValue] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Estado para controlar días colapsados/expandidos
  const [collapsedDays, setCollapsedDays] = useState({});

  // Estado para modal de edición de sets del microciclo
  const [editSetsModalOpen, setEditSetsModalOpen] = useState(false);
  const [addExerciseModalOpen, setAddExerciseModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [setToDelete, setSetToDelete] = useState(null);
  const [confirmDeleteSetOpen, setConfirmDeleteSetOpen] = useState(false);

  // Estilos responsivos
  const isMobile = window.innerWidth < 600;

  // Función para toggle el colapso de un día
  const toggleDayCollapse = (dayId) => {
    setCollapsedDays(prev => ({
      ...prev,
      [dayId]: !prev[dayId]
    }));
  };

  const fetchMicrocycle = () => {
    setLoading(true);
    fitFinanceApi.get(`/microcycle/${id}`)
      .then((res) => setMicrocycle(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMicrocycle();
  }, [id]);

  const handleSaveEdits = () => {
    fetchMicrocycle();
  };

  const handleEditSet = (set, exercise) => {
    setSelectedSet(set);
    setSelectedExerciseForSet(exercise);
    setEditModalOpen(true);
  };

  const handleStartTimer = (duration) => {
    setTimerDuration(duration);
    setShowTimer(true);
  };

  const handleTimerComplete = () => {
    // Opcional: hacer algo cuando el timer termina
  };

  const handleTimerDismiss = () => {
    setShowTimer(false);
  };

  const handleConfirmDelete = async (replicateForward) => {
    if (!exerciseToDelete) return;
    try {
      const token = localStorage.getItem('token');
      if (replicateForward) {
        await fitFinanceApi.post(`/exercise/${exerciseToDelete.id}/delete-template`, {
          fromMicrocycle: parseInt(id)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await fitFinanceApi.delete(`/exercise/${exerciseToDelete.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setConfirmDeleteOpen(false);
      setExerciseToDelete(null);
      fetchMicrocycle();
    } catch (err) {
      console.error('Error eliminando ejercicio:', err);
      alert('Error al eliminar el ejercicio');
    }
  };

  const handleDeleteSet = async (setId, exerciseId) => {
    // Abrir modal de confirmación con opción de replicar
    const exercise = microcycle?.days
      ?.flatMap((d) => d.exercises || [])
      ?.find((ex) => ex.id === exerciseId);
    setSetToDelete({ setId, exercise });
    setConfirmDeleteSetOpen(true);
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

      // Preguntar si se replica a microciclos siguientes
      const replicate = window.confirm('¿Querés replicar este cambio a los microciclos posteriores? (Nunca hacia atrás)');

      if (replicate) {
        // Actualizar plantilla desde este microciclo hacia adelante
        await fitFinanceApi.put(`/exercise/${selectedExercise.id}/update-template`, {
          field: editField,
          value: editValue.toString(),
          fromMicrocycle: parseInt(id)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Crear override solo para el día/microciclo actual
        await fitFinanceApi.post(`/exercise/${selectedExercise.id}/override`, {
          field: editField,
          value: editValue.toString(),
          scope: 'solo-dia',
          microcycleId: parseInt(id)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Refresca el microciclo
      const res = await fitFinanceApi.get(`/microcycle/${id}`);
      setMicrocycle(res.data);
      
      // Cerrar modal
      setExerciseEditModalOpen(false);
      setSelectedExercise(null);
      setEditField('');
      setEditValue('');
      
      alert(replicate 
        ? '¡Ejercicio actualizado! Los cambios se aplicaron a este microciclo y los siguientes.'
        : '¡Ejercicio actualizado solo en este microciclo!');
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
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto',
      padding: isMobile ? 8 : 16, 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box'
    }}>
      {/* Header simplificado */}
      <div style={{ marginBottom: 16 }}>
        {/* Header del microciclo */}
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: isMobile ? 12 : 18,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10
          }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: isMobile ? 20 : 28, 
              fontWeight: 600, 
              color: '#2c3e50',
              flex: 1,
              textAlign: isMobile ? 'center' : 'left'
            }}>
              {microcycle.name}
            </h1>
            <button
              onClick={() => {
                // En mobile, navegar a página separada para mejor scroll
                if (isMobile) {
                  navigate(`/coach/microcycle/${id}/edit-sets`);
                } else {
                  setEditSetsModalOpen(true);
                }
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: '#4caf50',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#66bb6a'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#4caf50'}
            >
              ✏️ Editar Sets
            </button>

            <button
              onClick={() => setAddExerciseModalOpen(true)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: '#1976d2',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1e88e5'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#1976d2'}
            >
              ➕ Agregar ejercicio
            </button>
          </div>
          <div style={{ 
            fontSize: isMobile ? 14 : 16, 
            color: '#7f8c8d',
            textAlign: 'center'
          }}>
            <strong>Período:</strong> {(() => {
              if (!microcycle.days || microcycle.days.length === 0) return 'Sin días configurados';
              
              // Ordenar días por número de día (dia 1, dia 2, dia 3, etc.)
              const sortedDays = microcycle.days
                .filter(day => day.fecha && !day.esDescanso)
                .sort((a, b) => a.dia - b.dia);
              
              if (sortedDays.length === 0) return 'Sin fechas asignadas';
              
              // Formatear en DD/MM/YYYY - Parsear correctamente sin problema de zona horaria
              const formatDate = (dateString) => {
                // Si la fecha viene en formato YYYY-MM-DD, parseamos manualmente
                // para evitar problemas de zona horaria
                if (dateString.includes('-')) {
                  const [year, month, day] = dateString.split('T')[0].split('-');
                  return `${day}/${month}/${year}`;
                }
                
                // Fallback: usar Date si viene en otro formato
                const date = new Date(dateString);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
              };
              
              return `${formatDate(sortedDays[0].fecha)} - ${formatDate(sortedDays[sortedDays.length - 1].fecha)}`;
            })()}
          </div>
        </div>
      </div>

      {/* Contenido principal - días */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: isMobile ? 10 : 16,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e0e0e0'
      }}>
        {microcycle.days && microcycle.days.length > 0 ? (
          (() => {
            // Ordenar días por número de día y mostrar todos (con y sin ejercicios)
            const sortedDays = microcycle.days
              .sort((a, b) => a.dia - b.dia)
              .filter(day => !day.esDescanso && day.exercises && day.exercises.length > 0); // Solo días con ejercicios
            
            // Calcular estadísticas generales
            const allSets = sortedDays.flatMap(day => 
              day.exercises.flatMap(ex => ex.sets || [])
            );
            const totalExercises = sortedDays.reduce((sum, day) => sum + (day.exercises?.length || 0), 0);
            const totalSets = allSets.length;
            const completedSets = allSets.filter(s => s.status === 'completed').length;
            const extraSets = allSets.filter(s => s.isExtra).length;
            const failedSets = allSets.filter(s => s.status === 'failed').length;
            const skippedSets = allSets.filter(s => s.status === 'skipped').length;
            
            return sortedDays.length > 0 ? (
              <div style={{ 
                paddingBottom: showTimer ? '100px' : '20px'
              }}>
                {/* Resumen general del microciclo */}
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 12,
                  padding: isMobile ? 10 : 14,
                  marginBottom: 16,
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}>
                  <div style={{ 
                    fontSize: isMobile ? 14 : 16, 
                    fontWeight: 700, 
                    marginBottom: 12,
                    textAlign: 'center'
                  }}>
                    📊 Resumen del Microciclo
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 8, 
                    justifyContent: 'center',
                    fontSize: isMobile ? 10 : 11
                  }}>
                    <span style={{ 
                      background: '#5e72e4', 
                      padding: '6px 12px', 
                      borderRadius: 6,
                      fontWeight: 600,
                      border: '1px solid #4c63d2',
                      color: '#fff'
                    }}>
                      💪 {totalExercises} ejercicios
                    </span>
                    <span style={{ 
                      background: '#5e72e4', 
                      padding: '6px 12px', 
                      borderRadius: 6,
                      fontWeight: 600,
                      border: '1px solid #4c63d2',
                      color: '#fff'
                    }}>
                      📊 {totalSets} sets totales
                    </span>
                    {completedSets > 0 && (
                      <span style={{ 
                        background: '#4caf50', 
                        padding: '6px 12px', 
                        borderRadius: 6,
                        fontWeight: 600,
                        border: '1px solid #388e3c',
                        color: '#fff'
                      }}>
                        ✓ {completedSets} completados
                      </span>
                    )}
                    {extraSets > 0 && (
                      <span style={{ 
                        background: '#ffd700', 
                        padding: '6px 12px', 
                        borderRadius: 6,
                        fontWeight: 700,
                        border: '1px solid #ffc107',
                        color: '#1a1a1a'
                      }}>
                        ➕ {extraSets} extras
                      </span>
                    )}
                    {failedSets > 0 && (
                      <span style={{ 
                        background: '#f44336', 
                        padding: '6px 12px', 
                        borderRadius: 6,
                        fontWeight: 600,
                        border: '1px solid #d32f2f',
                        color: '#fff'
                      }}>
                        ❌ {failedSets} fallidos
                      </span>
                    )}
                    {skippedSets > 0 && (
                      <span style={{ 
                        background: '#ff9800', 
                        padding: '6px 12px', 
                        borderRadius: 6,
                        fontWeight: 600,
                        border: '1px solid #f57c00',
                        color: '#fff'
                      }}>
                        ⏭️ {skippedSets} saltados
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {sortedDays.map((day) => {
                    // Calcular estadísticas del día
                    const daySets = day.exercises.flatMap(ex => ex.sets || []);
                    const dayCompleted = daySets.filter(s => s.status === 'completed').length;
                    const dayExtras = daySets.filter(s => s.isExtra).length;
                    const dayFailed = daySets.filter(s => s.status === 'failed').length;
                    const daySkipped = daySets.filter(s => s.status === 'skipped').length;
                    const isCollapsed = collapsedDays[day.id];
                    
                    return (
                  <div key={day.id} style={{
                    background: '#f8f9fa',
                    borderRadius: 8,
                    border: '1px solid #dee2e6',
                    padding: isMobile ? 8 : 12,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}>
                    {/* Header del día - CLICKEABLE */}
                    <div 
                      onClick={() => toggleDayCollapse(day.id)}
                      style={{
                        background: isCollapsed ? '#6c757d' : 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)',
                        color: '#fff',
                        padding: isMobile ? '10px 12px' : '12px 16px',
                        borderRadius: 6,
                        fontWeight: 600,
                        fontSize: isMobile ? 13 : 15,
                        marginBottom: isCollapsed ? 0 : 12,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: isCollapsed ? 'none' : '0 2px 8px rgba(108, 117, 125, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = isCollapsed ? 'none' : '0 2px 8px rgba(108, 117, 125, 0.3)';
                      }}
                    >
                      {/* Nombre del día + icono collapse */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}>
                        <span>{day.nombre || `Día ${day.dia}`}</span>
                        <span style={{ 
                          fontSize: isMobile ? 16 : 18,
                          transition: 'transform 0.3s ease',
                          transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)'
                        }}>
                          ▼
                        </span>
                      </div>
                      
                      {/* Estadísticas del día */}
                      <div style={{ 
                        display: 'flex', 
                        gap: 6, 
                        flexWrap: 'wrap',
                        fontSize: isMobile ? 9 : 10
                      }}>
                        <span style={{ 
                          background: 'rgba(94, 114, 228, 0.4)', 
                          padding: '3px 8px', 
                          borderRadius: 4,
                          fontWeight: 600,
                          border: '1px solid rgba(94, 114, 228, 0.6)'
                        }}>
                          📊 {daySets.length} sets
                        </span>
                        {dayCompleted > 0 && (
                          <span style={{ 
                            background: '#4caf50', 
                            padding: '3px 8px', 
                            borderRadius: 4,
                            fontWeight: 600,
                            border: '1px solid #388e3c'
                          }}>
                            ✓ {dayCompleted}
                          </span>
                        )}
                        {dayExtras > 0 && (
                          <span style={{ 
                            background: '#ffd700', 
                            padding: '3px 8px', 
                            borderRadius: 4,
                            fontWeight: 700,
                            border: '1px solid #ffc107',
                            color: '#1a1a1a'
                          }}>
                            ➕ {dayExtras} extra{dayExtras > 1 ? 's' : ''}
                          </span>
                        )}
                        {dayFailed > 0 && (
                          <span style={{ 
                            background: '#f44336', 
                            padding: '3px 8px', 
                            borderRadius: 4,
                            fontWeight: 600,
                            border: '1px solid #d32f2f'
                          }}>
                            ❌ {dayFailed}
                          </span>
                        )}
                        {daySkipped > 0 && (
                          <span style={{ 
                            background: '#ff9800', 
                            padding: '3px 8px', 
                            borderRadius: 4,
                            fontWeight: 600,
                            border: '1px solid #f57c00'
                          }}>
                            ⏭️ {daySkipped}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contenido del día - Solo mostrar si NO está colapsado */}
                    {!isCollapsed && (
                      day.exercises && day.exercises.length > 0 ? (
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
                                width: '30%'
                              }}>
                                Ejercicio
                              </th>
                              <th style={{ 
                                padding: '8px 6px', 
                                textAlign: 'center', 
                                fontSize: isMobile ? 10 : 11,
                                width: '18%'
                              }}>
                                Músculo
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
                                width: '12%'
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
                              <th style={{ 
                                padding: '8px 6px', 
                                textAlign: 'center', 
                                fontSize: isMobile ? 10 : 11,
                                width: '10%'
                              }}>
                                Acciones
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
                                  {ex.exerciseCatalog?.name || ex.nombre || ex.name || 'Sin nombre'}
                                </td>
                                <td style={{ 
                                  padding: '8px 6px', 
                                  textAlign: 'center', 
                                  color: '#6c757d',
                                  fontSize: isMobile ? 10 : 11
                                }}>
                                  {ex.exerciseCatalog?.muscleGroup || ex.grupoMuscular || ex.muscle || '-'}
                                </td>
                                <td style={{ 
                                  padding: '8px 6px', 
                                  textAlign: 'center', 
                                  color: '#007bff',
                                  fontWeight: 600,
                                  fontSize: isMobile ? 10 : 11
                            }}
                            title="Clic para editar repeticiones"
                            onClick={() => handleEditExercise(ex, 'repeticiones')}
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
                                </td>
                                <td style={{ 
                                  padding: '8px 6px', 
                                  textAlign: 'center', 
                                  color: '#6f42c1',
                                  fontWeight: 600,
                                  fontSize: isMobile ? 10 : 11
                            }}
                            title="Clic para editar RIR esperado"
                            onClick={() => handleEditExercise(ex, 'rirEsperado')}
                            >
                                  {ex.rirEsperado || '-'}
                                </td>
                                <td style={{ 
                                  padding: '8px 6px', 
                                  textAlign: 'center', 
                                  color: '#fd7e14',
                                  fontSize: isMobile ? 10 : 11
                            }}
                            title="Clic para editar descanso"
                            onClick={() => handleEditExercise(ex, 'descanso')}
                            >
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
                                <td style={{ 
                                  padding: '8px 6px', 
                                  textAlign: 'center'
                                }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExerciseToDelete(ex);
                                      setConfirmDeleteOpen(true);
                                    }}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#ff4d4f',
                                      cursor: 'pointer',
                                      fontSize: isMobile ? 14 : 16,
                                    }}
                                    title="Eliminar ejercicio"
                                  >
                                    🗑️
                                  </button>
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
                                {/* Header con nombre y resumen */}
                                <div style={{ marginBottom: 8 }}>
                                  <div style={{ 
                                    color: '#ffd700', 
                                    fontSize: isMobile ? 10 : 11, 
                                    fontWeight: 600, 
                                    marginBottom: 4
                                  }}>
                                    {ex.exerciseCatalog?.name || ex.nombre || ex.name}
                                  </div>
                                  
                                  {/* Resumen de estadísticas */}
                                  {(() => {
                                    const totalSets = ex.sets.length;
                                    const completedSets = ex.sets.filter(s => s.status === 'completed').length;
                                    const failedSets = ex.sets.filter(s => s.status === 'failed').length;
                                    const skippedSets = ex.sets.filter(s => s.status === 'skipped').length;
                                    const extraSets = ex.sets.filter(s => s.isExtra).length;
                                    
                                    return (
                                      <div style={{ 
                                        display: 'flex', 
                                        gap: 8, 
                                        flexWrap: 'wrap',
                                        fontSize: isMobile ? 8 : 9,
                                        color: '#ccc'
                                      }}>
                                        <span style={{ 
                                          background: '#333', 
                                          padding: '2px 6px', 
                                          borderRadius: 4,
                                          border: '1px solid #555'
                                        }}>
                                          📊 {totalSets} total
                                        </span>
                                        
                                        {completedSets > 0 && (
                                          <span style={{ 
                                            background: 'rgba(76, 175, 80, 0.2)', 
                                            padding: '2px 6px', 
                                            borderRadius: 4,
                                            border: '1px solid #4caf50',
                                            color: '#4caf50'
                                          }}>
                                            ✓ {completedSets} completado{completedSets > 1 ? 's' : ''}
                                          </span>
                                        )}
                                        
                                        {extraSets > 0 && (
                                          <span style={{ 
                                            background: 'rgba(76, 175, 80, 0.3)', 
                                            padding: '2px 6px', 
                                            borderRadius: 4,
                                            border: '1px solid #4caf50',
                                            color: '#4caf50',
                                            fontWeight: 700
                                          }}>
                                            ➕ {extraSets} extra{extraSets > 1 ? 's' : ''}
                                          </span>
                                        )}
                                        
                                        {failedSets > 0 && (
                                          <span style={{ 
                                            background: 'rgba(244, 67, 54, 0.2)', 
                                            padding: '2px 6px', 
                                            borderRadius: 4,
                                            border: '1px solid #f44336',
                                            color: '#f44336'
                                          }}>
                                            ❌ {failedSets} fallido{failedSets > 1 ? 's' : ''}
                                          </span>
                                        )}
                                        
                                        {skippedSets > 0 && (
                                          <span style={{ 
                                            background: 'rgba(255, 152, 0, 0.2)', 
                                            padding: '2px 6px', 
                                            borderRadius: 4,
                                            border: '1px solid #ff9800',
                                            color: '#ff9800'
                                          }}>
                                            ⏭️ {skippedSets} saltado{skippedSets > 1 ? 's' : ''}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })()}
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
                                      <th style={{ padding: '4px 2px', textAlign: 'center', fontSize: isMobile ? 8 : 9 }}>Estado</th>
                                      <th style={{ padding: '4px 2px', textAlign: 'center', fontSize: isMobile ? 8 : 9 }}>Acciones</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {[...ex.sets].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((set, index) => {
                                      // Determinar el color de fondo según el estado
                                      let rowBackground = index % 2 === 0 ? '#444' : '#555';
                                      let rowColor = '#fff';
                                      let statusIcon = '';
                                      let statusText = '';
                                      
                                      // Si es AMRAP, siempre tiene un fondo especial
                                      if (set.isAmrap) {
                                        rowBackground = 'rgba(255, 152, 0, 0.15)'; // Naranja claro para AMRAP
                                      }
                                      
                                      if (set.status === 'pending') {
                                        if (!set.isAmrap) rowBackground = index % 2 === 0 ? '#444' : '#555'; // Color normal
                                        statusIcon = '⏳';
                                        statusText = 'Pendiente';
                                      } else if (set.status === 'failed') {
                                        rowBackground = 'rgba(244, 67, 54, 0.2)'; // Rojo claro
                                        statusIcon = '❌';
                                        statusText = 'Fallido';
                                      } else if (set.status === 'skipped') {
                                        rowBackground = 'rgba(255, 152, 0, 0.2)'; // Naranja claro
                                        statusIcon = '⏭️';
                                        statusText = 'Saltado';
                                      } else if (set.status === 'completed') {
                                        if (set.isExtra) {
                                          rowBackground = 'rgba(76, 175, 80, 0.15)'; // Verde claro para extras
                                        } else if (set.isAmrap) {
                                          rowBackground = 'rgba(255, 152, 0, 0.25)'; // Naranja más intenso para AMRAP completado
                                        } else {
                                          rowBackground = 'rgba(76, 175, 80, 0.08)'; // Verde muy claro para completados normales
                                        }
                                        statusIcon = '✓';
                                        statusText = 'Completado';
                                      } else {
                                        // Fallback por si acaso
                                        statusIcon = '⏳';
                                        statusText = 'Pendiente';
                                      }
                                      
                                      return (
                                        <tr 
                                          key={set.id} 
                                          style={{ 
                                            cursor: 'pointer',
                                            background: rowBackground,
                                            transition: 'background 0.2s ease',
                                            borderLeft: set.isExtra ? '3px solid #4caf50' : 'none'
                                          }} 
                                          onClick={() => handleEditSet(set, ex)}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.opacity = '0.8';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.opacity = '1';
                                          }}
                                        >
                                          <td style={{ padding: '4px 2px', textAlign: 'center', color: rowColor }}>
                                            {index + 1}
                                            {set.isExtra && (
                                              <span style={{
                                                marginLeft: 4,
                                                background: '#4caf50',
                                                color: '#fff',
                                                padding: '1px 4px',
                                                borderRadius: 3,
                                                fontSize: 7,
                                                fontWeight: 700
                                              }}>
                                                EXTRA
                                              </span>
                                            )}
                                            {set.isAmrap && (
                                              <span style={{
                                                marginLeft: 4,
                                                background: '#ff9800',
                                                color: '#000',
                                                padding: '1px 4px',
                                                borderRadius: 3,
                                                fontSize: 7,
                                                fontWeight: 700
                                              }}>
                                                🔥 AMRAP
                                              </span>
                                            )}
                                          </td>
                                          <td style={{ padding: '4px 2px', textAlign: 'center', color: rowColor }}>{set.reps || '-'}</td>
                                          <td style={{ padding: '4px 2px', textAlign: 'center', color: rowColor }}>{set.load ? `${set.load}kg` : '-'}</td>
                                          <td style={{ padding: '4px 2px', textAlign: 'center', color: rowColor }}>{set.actualRir || '-'}</td>
                                          <td style={{ padding: '4px 2px', textAlign: 'center', color: rowColor }}>{set.actualRpe || '-'}</td>
                                          <td style={{ padding: '4px 2px', textAlign: 'center', color: rowColor, fontSize: isMobile ? 7 : 8 }}>
                                            <span style={{ marginRight: 2 }}>{statusIcon}</span>
                                            {statusText}
                                          </td>
                                          <td 
                                            style={{ padding: '4px 2px', textAlign: 'center' }}
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <button
                                              onClick={() => handleDeleteSet(set.id, ex.id)}
                                              style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#ff4d4f',
                                                cursor: 'pointer',
                                                fontSize: isMobile ? 14 : 16,
                                                padding: '2px 4px',
                                                transition: 'transform 0.2s'
                                              }}
                                              onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                                              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                              title="Eliminar set"
                                            >
                                              🗑️
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
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
                    )
                    )}
                  </div>
                  );
                  })}
                </div>
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

      {/* Timer de descanso widget */}
      {showTimer && (
        <RestTimerWidget
          restTime={timerDuration}
          onComplete={handleTimerComplete}
          onDismiss={handleTimerDismiss}
        />
      )}

      {/* Modal de edición */}
      <EditSetModal
        open={editModalOpen}
        set={selectedSet || {}}
        restTime={selectedExerciseForSet ? (parseInt(selectedExerciseForSet.descanso) || 0) * 60 : 0}
        onSave={handleSaveSet}
        onClose={() => setEditModalOpen(false)}
        onStartTimer={handleStartTimer}
        canConfigureAmrap={true}
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
              Editar {editField === 'series' ? 'Sets' : 'Repeticiones'}
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

      {/* Modal de edición de sets del microciclo */}
      <EditMicrocycleSets
        open={editSetsModalOpen}
        microcycleId={id}
        microcycleName={microcycle?.name}
        onClose={() => setEditSetsModalOpen(false)}
        onSave={handleSaveEdits}
      />

      {/* Modal para agregar ejercicio */}
      <AddExerciseModal
        open={addExerciseModalOpen}
        microcycleId={id}
        days={microcycle?.days || []}
        onClose={() => setAddExerciseModalOpen(false)}
        onSaved={handleSaveEdits}
      />

      <ConfirmDeleteExerciseModal
        open={confirmDeleteOpen}
        exerciseName={exerciseToDelete ? (exerciseToDelete.exerciseCatalog?.name || exerciseToDelete.nombre || exerciseToDelete.name) : ''}
        onCancel={() => { setConfirmDeleteOpen(false); setExerciseToDelete(null); }}
        onConfirm={handleConfirmDelete}
      />

      <ConfirmDeleteSetModal
        open={confirmDeleteSetOpen}
        setLabel={setToDelete ? `Set de ${setToDelete.exercise?.exerciseCatalog?.name || setToDelete.exercise?.nombre || ''}` : ''}
        onCancel={() => { setConfirmDeleteSetOpen(false); setSetToDelete(null); }}
        onConfirm={async (replicateForward) => {
          if (!setToDelete) return;
          try {
            const token = localStorage.getItem('token');
            if (replicateForward) {
              await fitFinanceApi.post(`/set/${setToDelete.setId}/delete-template`, {
                fromMicrocycle: parseInt(id)
              }, {
                headers: { Authorization: `Bearer ${token}` }
              });
            } else {
              await fitFinanceApi.delete(`/set/${setToDelete.setId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
            }
            setConfirmDeleteSetOpen(false);
            setSetToDelete(null);
            fetchMicrocycle();
          } catch (err) {
            console.error('Error eliminando set:', err);
            alert('Error al eliminar el set');
          }
        }}
      />
    </div>
  );
};

export default MicrocycleDetail;
