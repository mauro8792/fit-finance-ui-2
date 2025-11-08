
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useRoutineStore } from '../../hooks/useRoutineStore';
import MesocycleWizard from './MesocycleWizard';
import { getEnvVariables } from '../../helpers/getEnvVariables';

const { VITE_API_URL } = getEnvVariables();

const MacrocycleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mesocycles, setMesocycles] = useState([]);
  const [macrocycle, setMacrocycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { getMesocyclesByMacro, createMesocycle, getMacrocycleById } = useRoutineStore();
  const [error, setError] = useState(null);

  // Estilos responsivos
  const isMobile = window.innerWidth < 600;

  // 🆕 Funciones helper para estados
  const getStatusLabel = (status) => {
    const labels = {
      'draft': '📝 BORRADOR',
      'published': '✅ PUBLICADA',
      'active': '🟢 ACTIVA',
      'paused': '⏸️ PAUSADA',
      'completed': '✓ COMPLETADA',
      'archived': '📦 ARCHIVADA'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': '#777',
      'published': '#2196f3',
      'active': '#4caf50',
      'paused': '#ff9800',
      'completed': '#9e9e9e',
      'archived': '#555'
    };
    return colors[status] || '#777';
  };

  const getStatusBgColor = (status) => {
    const bgColors = {
      'draft': 'rgba(119, 119, 119, 0.2)',
      'published': 'rgba(33, 150, 243, 0.2)',
      'active': 'rgba(76, 175, 80, 0.2)',
      'paused': 'rgba(255, 152, 0, 0.2)',
      'completed': 'rgba(158, 158, 158, 0.2)',
      'archived': 'rgba(85, 85, 85, 0.2)'
    };
    return bgColors[status] || 'rgba(119, 119, 119, 0.2)';
  };

  // 🆕 Handler para cambiar estado de mesociclo
  const handleChangeStatus = async (mesocycleId, newStatus) => {
    try {
      const response = await fetch(`${VITE_API_URL}/mesocycle/${mesocycleId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert(`✅ Mesociclo actualizado a ${getStatusLabel(newStatus)}`);
        // Recargar mesociclos
        const updatedMesocycles = await getMesocyclesByMacro(id);
        setMesocycles(updatedMesocycles);
      } else {
        alert('❌ Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al actualizar el estado');
    }
  };

  // Cargar macrociclo y mesociclos
  useEffect(() => {
    console.log('[MacrocycleDetail] MONTADO para macrocycleId:', id);
    setLoading(true);
    
    Promise.all([
      getMacrocycleById ? getMacrocycleById(id) : Promise.resolve({ id, name: `Macrociclo ${id}` }),
      getMesocyclesByMacro(id)
    ])
      .then(([macroData, mesoData]) => {
        setMacrocycle(macroData);
        setMesocycles(mesoData);
        console.log('[MacrocycleDetail] Datos cargados:', { macroData, mesoData });
      })
      .catch((e) => {
        setError('Error al cargar datos');
        console.error('[MacrocycleDetail] Error al cargar datos', e);
      })
      .finally(() => setLoading(false));
  }, [id, getMesocyclesByMacro, getMacrocycleById]);

  if (loading) return (
    <div style={{ background: '#181818', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#ffd700', fontSize: 18 }}>Cargando macrociclo...</div>
    </div>
  );

  if (error) return (
    <div style={{ background: '#181818', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#ff4d4f', fontSize: 18 }}>{error}</div>
    </div>
  );

  return (
    <div style={{ 
      background: '#181818', 
      minHeight: '100vh',
      height: '100vh',
      padding: isMobile ? 8 : 16, 
      overflow: 'auto', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      {/* Header con información del macrociclo */}
      <div style={{ flex: '0 0 auto', marginBottom: 20 }}>
        {/* Botón volver */}
        <button 
          onClick={() => navigate(-1)} 
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: isMobile ? 13 : 14,
            marginBottom: 16,
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

        {/* Card con información del macrociclo */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 18,
          color: '#fff',
          padding: isMobile ? 20 : 24,
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: isMobile ? 24 : 32, 
            fontWeight: 700, 
            marginBottom: 8 
          }}>
            {macrocycle?.name || `Macrociclo #${id}`}
          </h1>
          {macrocycle?.objetivo && (
            <p style={{ 
              margin: 0, 
              fontSize: isMobile ? 14 : 16, 
              opacity: 0.9 
            }}>
              {macrocycle.objetivo}
            </p>
          )}
          {macrocycle?.startDate && macrocycle?.endDate && (
            <div style={{ 
              fontSize: isMobile ? 13 : 14, 
              opacity: 0.8, 
              marginTop: 8 
            }}>
              {new Date(macrocycle.startDate).toLocaleDateString()} - {new Date(macrocycle.endDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Sección de mesociclos */}
      <div style={{
        background: '#222',
        borderRadius: 16,
        padding: isMobile ? 6 : 8,
        boxShadow: '0 2px 16px #0002',
        flex: '0 0 auto',
        position: 'relative'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 12 
        }}>
          <h3 style={{ 
            color: '#ffd700', 
            fontWeight: 700, 
            fontSize: isMobile ? 16 : 18, 
            margin: 0 
          }}>
            Mesociclos ({mesocycles.length})
          </h3>
        </div>

        {mesocycles.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: 120, 
            gap: 12 
          }}>
            <div style={{ textAlign: 'center', color: '#aaa', fontSize: 14 }}>
              No hay mesociclos en este macrociclo.
            </div>
            {!showForm && (
              <button 
                onClick={() => setShowForm(true)}
                style={{
                  padding: isMobile ? '10px 20px' : '12px 24px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
                  color: '#222',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: isMobile ? 14 : 16,
                  boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(255, 215, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.3)';
                }}
              >
                🎯 Crear Primer Mesociclo
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Grid de mesociclos */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 12, 
              justifyContent: 'flex-start', 
              marginBottom: 16,
              maxWidth: '100%',
              overflow: 'visible'
            }}>
              {mesocycles.map((meso, index) => {
                const status = meso.status || 'draft';
                return (
                <div
                  key={meso.id}
                  style={{
                    background: '#181818',
                    borderRadius: 12,
                    boxShadow: '0 2px 12px #0003',
                    padding: isMobile ? 12 : 16,
                    minWidth: isMobile ? 160 : 220,
                    maxWidth: isMobile ? 200 : 280,
                    flex: isMobile ? '0 0 calc(50% - 6px)' : '0 0 auto',
                    border: `2px solid ${getStatusColor(status)}`,
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    fontSize: isMobile ? 11 : 13,
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  {/* Badge de número */}
                  <div style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    background: getStatusColor(status),
                    color: '#fff',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700
                  }}>
                    {index + 1}
                  </div>

                  {/* Badge de estado */}
                  <div style={{
                    backgroundColor: getStatusBgColor(status),
                    color: getStatusColor(status),
                    border: `1px solid ${getStatusColor(status)}`,
                    borderRadius: 6,
                    padding: '4px 8px',
                    fontSize: 10,
                    fontWeight: 700,
                    marginBottom: 12,
                    alignSelf: 'flex-start'
                  }}>
                    {getStatusLabel(status)}
                  </div>

                  <div style={{ 
                    fontWeight: 700, 
                    fontSize: isMobile ? 13 : 16, 
                    color: getStatusColor(status), 
                    marginBottom: 8,
                    cursor: 'pointer',
                    wordBreak: 'break-word'
                  }}
                  onClick={() => navigate(`/coach/mesocycle/${meso.id}/microcycles`)}
                  >
                    {meso.name}
                  </div>
                  
                  <div style={{ 
                    fontSize: isMobile ? 10 : 12, 
                    marginBottom: 4, 
                    color: '#ccc' 
                  }}>
                    <b>Inicio:</b> {meso.startDate ? new Date(meso.startDate).toLocaleDateString() : '-'}
                  </div>
                  
                  <div style={{ 
                    fontSize: isMobile ? 10 : 12, 
                    marginBottom: 8, 
                    color: '#ccc' 
                  }}>
                    <b>Fin:</b> {meso.endDate ? new Date(meso.endDate).toLocaleDateString() : '-'}
                  </div>

                  {meso.objetivo && (
                    <div style={{ 
                      fontSize: isMobile ? 9 : 11, 
                      color: '#aaa', 
                      marginBottom: 12,
                      lineHeight: 1.4,
                      wordBreak: 'break-word'
                    }}>
                      <b>Objetivo:</b> {meso.objetivo}
                    </div>
                  )}

                  {/* Botones de acción según estado */}
                  <div style={{ 
                    marginTop: 'auto',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}>
                    {status === 'draft' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChangeStatus(meso.id, 'published');
                          }}
                          style={{
                            background: '#4caf50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: isMobile ? '5px 8px' : '6px 12px',
                            fontSize: isMobile ? 9 : 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          ✅ Publicar
                        </button>
                      </>
                    )}

                    {status === 'published' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChangeStatus(meso.id, 'active');
                        }}
                        style={{
                          background: '#4caf50',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: isMobile ? '5px 8px' : '6px 12px',
                          fontSize: isMobile ? 9 : 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        🟢 Activar
                      </button>
                    )}

                    {status === 'active' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChangeStatus(meso.id, 'paused');
                          }}
                          style={{
                            background: '#ff9800',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 12px',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          ⏸️ Pausar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChangeStatus(meso.id, 'completed');
                          }}
                          style={{
                            background: '#9e9e9e',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 12px',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          ✓ Completar
                        </button>
                      </>
                    )}

                    {status === 'paused' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChangeStatus(meso.id, 'active');
                        }}
                        style={{
                          background: '#4caf50',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: isMobile ? '5px 8px' : '6px 12px',
                          fontSize: isMobile ? 9 : 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        🟢 Reanudar
                      </button>
                    )}

                    {status === 'completed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChangeStatus(meso.id, 'archived');
                        }}
                        style={{
                          background: '#555',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: isMobile ? '5px 8px' : '6px 12px',
                          fontSize: isMobile ? 9 : 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        📦 Archivar
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/coach/mesocycle/${meso.id}/microcycles`)}
                      style={{
                        background: 'transparent',
                        color: getStatusColor(status),
                        border: `1px solid ${getStatusColor(status)}`,
                        borderRadius: 6,
                        padding: '6px 12px',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      👁️ Ver Detalles
                    </button>
                  </div>
                </div>
              );
              })}
              
              {/* Card para crear nuevo mesociclo */}
              {!showForm && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
                    borderRadius: 12,
                    boxShadow: '0 2px 12px rgba(255, 215, 0, 0.3)',
                    padding: 16,
                    minWidth: 220,
                    maxWidth: 280,
                    border: '2px dashed rgba(0, 0, 0, 0.2)',
                    color: '#222',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 150,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => setShowForm(true)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.4)';
                    e.target.style.borderColor = 'rgba(0, 0, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 12px rgba(255, 215, 0, 0.3)';
                    e.target.style.borderColor = 'rgba(0, 0, 0, 0.2)';
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>+</div>
                  <div style={{ 
                    fontSize: 14, 
                    fontWeight: 700, 
                    textAlign: 'center' 
                  }}>
                    Nuevo Mesociclo
                  </div>
                  <div style={{ 
                    fontSize: 11, 
                    opacity: 0.8, 
                    textAlign: 'center', 
                    marginTop: 4 
                  }}>
                    Agregar fase
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Wizard de creación de mesociclo */}
      {showForm && (
        <MesocycleWizard
          macrocycleId={id}
          studentId={macrocycle?.studentId}
          studentName={macrocycle?.studentName || "Alumno"}
          onCancel={() => setShowForm(false)}
          onComplete={async () => {
            setShowForm(false);
            setLoading(true);
            try {
              const nuevos = await getMesocyclesByMacro(id);
              setMesocycles(nuevos);
            } catch {
              setError('Error al cargar mesociclos');
            } finally {
              setLoading(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default MacrocycleDetail;
