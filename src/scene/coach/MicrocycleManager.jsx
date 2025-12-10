import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MicrocycleForm from './MicrocycleForm';
import { useRoutineStore } from '../../hooks/useRoutineStore';

const MicrocycleManager = () => {
  const { mesocycleId } = useParams();
  const navigate = useNavigate();
  const [microcycles, setMicrocycles] = useState([]);
  const [mesocycle, setMesocycle] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { createMicrocycle, fetchMicrocyclesByMesocycle, getMesocycleById } = useRoutineStore();

  // Estilos responsivos
  const isMobile = window.innerWidth < 600;

  useEffect(() => {
    setLoading(true);
    
    Promise.all([
      getMesocycleById ? getMesocycleById(mesocycleId) : Promise.resolve({ id: mesocycleId, name: `Mesociclo ${mesocycleId}` }),
      fetchMicrocyclesByMesocycle(mesocycleId)
    ])
      .then(([mesoData, microData]) => {
        setMesocycle(mesoData);
        setMicrocycles(microData);
      })
      .catch(() => setError('Error al cargar datos'))
      .finally(() => setLoading(false));
  }, [mesocycleId, fetchMicrocyclesByMesocycle, getMesocycleById]);

  const handleCreate = async (microcycle) => {
    setError(null);
    try {
      const created = await createMicrocycle(mesocycleId, microcycle);
      setMicrocycles(prev => [...prev, created]);
      setShowForm(false);
    } catch (e) {
      setError('Error al crear microciclo');
    }
  };

  if (loading) return (
    <div style={{ background: '#181818', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#ffd700', fontSize: 18 }}>Cargando microciclos...</div>
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
      height: '100vh', 
      padding: isMobile ? 8 : 16, 
      overflow: 'hidden', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      {/* Header con información del mesociclo */}
      <div style={{ flex: '0 0 auto', marginBottom: 20 }}>
        {/* Card con información del mesociclo */}
        <div style={{
          background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
          borderRadius: 18,
          color: '#fff',
          padding: isMobile ? 20 : 24,
          boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: isMobile ? 24 : 32, 
            fontWeight: 700, 
            marginBottom: 8 
          }}>
            {mesocycle?.templateName || mesocycle?.name || `Mesociclo #${mesocycleId}`}
          </h1>
          {mesocycle?.isTemplate && (
            <span style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.2)',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              marginBottom: 8,
            }}>
              📚 PLANTILLA
            </span>
          )}
          {mesocycle?.objetivo && (
            <p style={{ 
              margin: 0, 
              fontSize: isMobile ? 14 : 16, 
              opacity: 0.9,
              marginBottom: 8
            }}>
              {mesocycle.objetivo}
            </p>
          )}
          <div style={{ 
            fontSize: isMobile ? 13 : 14, 
            opacity: 0.8, 
            marginTop: 8 
          }}>
            <strong>Fechas:</strong> {mesocycle?.startDate ? new Date(mesocycle.startDate).toLocaleDateString() : 'No definida'} - {mesocycle?.endDate ? new Date(mesocycle.endDate).toLocaleDateString() : 'No definida'}
          </div>
          <div style={{ 
            fontSize: isMobile ? 12 : 13, 
            opacity: 0.7, 
            marginTop: 4
          }}>
            Total microciclos: {microcycles.length}
          </div>
        </div>
      </div>

      {/* Sección de microciclos */}
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
            Microciclos ({microcycles.length})
          </h3>
        </div>

        {microcycles.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: 120, 
            gap: 12 
          }}>
            <div style={{ textAlign: 'center', color: '#aaa', fontSize: 14 }}>
              No hay microciclos en este mesociclo.
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
                📅 Crear Primer Microciclo
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Grid de microciclos */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 12, 
              justifyContent: 'flex-start', 
              marginBottom: 16 
            }}>
              {microcycles.map((micro, index) => (
                <div
                  key={micro.id}
                  style={{
                    background: '#181818',
                    borderRadius: 12,
                    boxShadow: '0 2px 12px #0003',
                    padding: 16,
                    minWidth: 200,
                    maxWidth: 250,
                    border: '2px solid #ff9800',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onClick={() => navigate(`/coach/microcycle/${micro.id}`)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 16px rgba(255, 152, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 12px #0003';
                  }}
                >
                  {/* Título secuencial */}
                  <div style={{ 
                    fontWeight: 700, 
                    fontSize: 16, 
                    color: '#ff9800', 
                    marginBottom: 8 
                  }}>
                    Microciclo {index + 1}
                  </div>
                  
                  <div style={{ 
                    fontSize: 12, 
                    marginBottom: 4, 
                    color: '#ccc' 
                  }}>
                    <b>Inicio:</b> {(() => {
                      if (!micro.days || micro.days.length === 0) return 'Sin días';
                      const daysWithDates = micro.days.filter(day => day.fecha);
                      if (daysWithDates.length === 0) return 'Sin fechas';
                      const dates = daysWithDates.map(day => new Date(day.fecha)).sort((a, b) => a - b);
                      return dates[0].toLocaleDateString();
                    })()}
                  </div>
                  
                  <div style={{ 
                    fontSize: 12, 
                    marginBottom: 8, 
                    color: '#ccc' 
                  }}>
                    <b>Fin:</b> {(() => {
                      if (!micro.days || micro.days.length === 0) return 'Sin días';
                      const daysWithDates = micro.days.filter(day => day.fecha);
                      if (daysWithDates.length === 0) return 'Sin fechas';
                      const dates = daysWithDates.map(day => new Date(day.fecha)).sort((a, b) => a - b);
                      return dates[dates.length - 1].toLocaleDateString();
                    })()}
                  </div>

                  {micro.objetivo && (
                    <div style={{ 
                      fontSize: 11, 
                      color: '#aaa', 
                      marginBottom: 12,
                      lineHeight: 1.4
                    }}>
                      <b>Objetivo:</b> {micro.objetivo}
                    </div>
                  )}

                  {/* Botón de acción */}
                  <div style={{ 
                    marginTop: 'auto',
                    display: 'flex',
                    width: '100%'
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/coach/microcycle/${micro.id}`);
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: 'none',
                        background: '#4caf50',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: 12,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#66bb6a';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#4caf50';
                      }}
                    >
                      Ver Rutina
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Card para crear nuevo microciclo */}
              {!showForm && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
                    borderRadius: 12,
                    boxShadow: '0 2px 12px rgba(255, 215, 0, 0.3)',
                    padding: 16,
                    minWidth: 200,
                    maxWidth: 250,
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
                    Nuevo Microciclo
                  </div>
                  <div style={{ 
                    fontSize: 11, 
                    opacity: 0.8, 
                    textAlign: 'center', 
                    marginTop: 4 
                  }}>
                    Microciclo {microcycles.length + 1}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Formulario de creación */}
      {showForm && (
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
            maxWidth: 500,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <MicrocycleForm
              onCreated={handleCreate}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MicrocycleManager;
