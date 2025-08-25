
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useRoutineStore } from '../../hooks/useRoutineStore';
import MesocycleForm from './MesocycleForm';

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
      height: '100vh', 
      padding: isMobile ? 8 : 16, 
      overflow: 'hidden', 
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
              marginBottom: 16 
            }}>
              {mesocycles.map((meso, index) => (
                <div
                  key={meso.id}
                  style={{
                    background: '#181818',
                    borderRadius: 12,
                    boxShadow: '0 2px 12px #0003',
                    padding: 16,
                    minWidth: 220,
                    maxWidth: 280,
                    border: '2px solid #4caf50',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onClick={() => navigate(`/coach/mesocycle/${meso.id}/microcycles`)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 16px rgba(76, 175, 80, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 12px #0003';
                  }}
                >
                  {/* Badge de número */}
                  <div style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    background: '#4caf50',
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

                  <div style={{ 
                    fontWeight: 700, 
                    fontSize: 16, 
                    color: '#4caf50', 
                    marginBottom: 8 
                  }}>
                    {meso.name}
                  </div>
                  
                  <div style={{ 
                    fontSize: 12, 
                    marginBottom: 4, 
                    color: '#ccc' 
                  }}>
                    <b>Inicio:</b> {meso.startDate ? new Date(meso.startDate).toLocaleDateString() : '-'}
                  </div>
                  
                  <div style={{ 
                    fontSize: 12, 
                    marginBottom: 8, 
                    color: '#ccc' 
                  }}>
                    <b>Fin:</b> {meso.endDate ? new Date(meso.endDate).toLocaleDateString() : '-'}
                  </div>

                  {meso.objetivo && (
                    <div style={{ 
                      fontSize: 11, 
                      color: '#aaa', 
                      marginBottom: 12,
                      lineHeight: 1.4
                    }}>
                      <b>Objetivo:</b> {meso.objetivo}
                    </div>
                  )}

                  <div style={{ 
                    marginTop: 'auto',
                    fontSize: 11,
                    color: '#4caf50',
                    fontWeight: 600
                  }}>
                    Click para ver microciclos →
                  </div>
                </div>
              ))}
              
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
            <MesocycleForm
              macrocycleId={id}
              onCreated={async (meso) => {
                setShowForm(false);
                setLoading(true);
                try {
                  await createMesocycle(id, meso);
                  const nuevos = await getMesocyclesByMacro(id);
                  setMesocycles(nuevos);
                } catch {
                  setError('Error al crear mesociclo');
                } finally {
                  setLoading(false);
                }
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MacrocycleDetail;
