import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useMediaQuery } from '@mui/material';
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
  const isMobile = useMediaQuery('(max-width: 600px)');

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
      minHeight: '100vh', 
      padding: isMobile ? '12px 8px' : 16, 
      overflow: 'auto', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      {/* Botón volver */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#ffd700',
          fontSize: 14,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 12,
          padding: 0,
        }}
      >
        ← Volver
      </button>

      {/* Header compacto para mobile */}
      <div style={{ 
        flex: '0 0 auto', 
        marginBottom: isMobile ? 16 : 20 
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
          borderRadius: isMobile ? 12 : 18,
          color: '#fff',
          padding: isMobile ? 16 : 24,
          boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
        }}>
          {/* Título y badge en una fila */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 8
          }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: isMobile ? 20 : 28, 
              fontWeight: 700,
            }}>
              {mesocycle?.templateName || mesocycle?.name || `Mesociclo #${mesocycleId}`}
            </h1>
            {mesocycle?.isTemplate && (
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 11,
                whiteSpace: 'nowrap',
              }}>
                📚 PLANTILLA
              </span>
            )}
          </div>
          
          {mesocycle?.objetivo && (
            <p style={{ 
              margin: '0 0 8px 0', 
              fontSize: isMobile ? 13 : 15, 
              opacity: 0.9,
            }}>
              {mesocycle.objetivo}
            </p>
          )}
          
          {/* Info en una fila */}
          <div style={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: isMobile ? 8 : 16,
            fontSize: isMobile ? 12 : 13,
            opacity: 0.85,
          }}>
            <span>📅 {mesocycle?.startDate ? new Date(mesocycle.startDate).toLocaleDateString() : 'Sin fecha'}</span>
            <span>📊 {microcycles.length} semanas</span>
          </div>
        </div>
      </div>

      {/* Título de sección */}
      <h3 style={{ 
        color: '#ffd700', 
        fontWeight: 700, 
        fontSize: isMobile ? 16 : 18, 
        margin: '0 0 12px 0',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        📅 Microciclos ({microcycles.length})
      </h3>

      {/* Lista de microciclos */}
      {microcycles.length === 0 ? (
        <div style={{ 
          background: '#222',
          borderRadius: 12,
          padding: 24,
          textAlign: 'center',
        }}>
          <div style={{ color: '#aaa', fontSize: 14, marginBottom: 16 }}>
            No hay microciclos en este mesociclo.
          </div>
          {!showForm && (
            <button 
              onClick={() => setShowForm(true)}
              style={{
                padding: '12px 24px',
                borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
                color: '#222',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              📅 Crear Primer Microciclo
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {microcycles.map((micro, index) => (
            <div
              key={micro.id}
              onClick={() => navigate(`/coach/microcycle/${micro.id}`)}
              style={{
                background: '#222',
                borderRadius: 12,
                padding: isMobile ? 14 : 16,
                borderLeft: '4px solid #ff9800',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 8,
              }}>
                <span style={{ 
                  fontWeight: 700, 
                  fontSize: isMobile ? 16 : 18, 
                  color: '#ff9800',
                }}>
                  Semana {index + 1}
                </span>
                <span style={{
                  background: micro.isDeload ? '#ff9800' : '#4caf50',
                  color: '#fff',
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                }}>
                  {micro.isDeload ? '⏬ Descarga' : '💪 Normal'}
                </span>
              </div>
              
              {/* Fechas en una línea */}
              <div style={{ 
                display: 'flex', 
                gap: 16, 
                fontSize: 13, 
                color: '#aaa',
                marginBottom: 10,
              }}>
                <span>
                  📅 {(() => {
                    if (!micro.days || micro.days.length === 0) return 'Sin fechas';
                    const daysWithDates = micro.days.filter(day => day.fecha);
                    if (daysWithDates.length === 0) return 'Sin fechas';
                    const dates = daysWithDates.map(day => new Date(day.fecha)).sort((a, b) => a - b);
                    return `${dates[0].toLocaleDateString()} - ${dates[dates.length - 1].toLocaleDateString()}`;
                  })()}
                </span>
              </div>

              {micro.objetivo && (
                <div style={{ 
                  fontSize: 12, 
                  color: '#888', 
                  marginBottom: 10,
                }}>
                  {micro.objetivo}
                </div>
              )}

              {/* Botón */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/coach/microcycle/${micro.id}`);
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                Ver Rutina →
              </button>
            </div>
          ))}
          
          {/* Botón agregar */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                width: '100%',
                padding: 16,
                borderRadius: 12,
                border: '2px dashed #ffd700',
                background: 'rgba(255, 215, 0, 0.1)',
                color: '#ffd700',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              + Agregar Semana {microcycles.length + 1}
            </button>
          )}
        </div>
      )}

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
