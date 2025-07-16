import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MicrocycleForm from './MicrocycleForm';
import { useRoutineStore } from '../../hooks/useRoutineStore';

const MicrocycleManager = () => {
  const { mesocycleId } = useParams();
  const navigate = useNavigate();
  const [microcycles, setMicrocycles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { createMicrocycle, fetchMicrocyclesByMesocycle } = useRoutineStore();
  useEffect(() => {
    setLoading(true);
    fetchMicrocyclesByMesocycle(mesocycleId)
      .then(data => setMicrocycles(data))
      .catch(() => setError('Error al cargar microciclos'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [mesocycleId]);

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

  return (
    <div style={{ background: '#181818', minHeight: '100vh', padding: 32 }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 24, background: '#ffd700', color: '#222', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}>Volver</button>
      <h2 style={{ color: '#ffd700', fontWeight: 800, fontSize: 32, textAlign: 'center', marginBottom: 32 }}>
        Microciclos del Mesociclo #{mesocycleId}
      </h2>
      {error && <div style={{ color: 'red', textAlign: 'center', margin: 12 }}>{error}</div>}
      {loading ? (
        <div style={{ color: '#aaa', textAlign: 'center', margin: 24 }}>Cargando microciclos...</div>
      ) : microcycles.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', margin: 24 }}>No hay microciclos para este mesociclo.</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', marginBottom: 32 }}>
          {microcycles.map(micro => (
            <div key={micro.id} style={{ background: '#232323', borderRadius: 14, border: '2px solid #ffd700', color: '#fff', padding: 22, minWidth: 220, maxWidth: 320, position: 'relative' }}>
              <div style={{ fontWeight: 700, fontSize: 20, color: '#ffd700', marginBottom: 8 }}>{micro.name}</div>
              <div style={{ fontSize: 15, marginBottom: 4 }}><b>Inicio:</b> {micro.startDate}</div>
              <div style={{ fontSize: 15, marginBottom: 4 }}><b>Fin:</b> {micro.endDate}</div>
              <div style={{ fontSize: 14, marginTop: 8, color: '#ccc' }}><b>Objetivo:</b> {micro.name}</div>
              <button
                onClick={() => navigate(`/coach/mesocycle/${mesocycleId}/microcycle/${micro.id}/edit`)}
                style={{ position: 'absolute', top: 12, right: 12, background: '#ffd700', color: '#222', border: 'none', borderRadius: 6, padding: '4px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
              >
                Editar
              </button>
              <button
                onClick={() => navigate(`/coach/microcycle/${micro.id}`)}
                style={{ marginTop: 16, background: '#ffd700', color: '#222', border: 'none', borderRadius: 6, padding: '7px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 15, width: '100%' }}
              >
                Ver rutina
              </button>
            </div>
          ))}
        </div>
      )}
      {showForm ? (
        <MicrocycleForm
          onCreated={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button onClick={() => setShowForm(true)} style={{ background: '#ffd700', color: '#222', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 700, fontSize: 18, cursor: 'pointer', display: 'block', margin: '0 auto' }}>
          Crear Microciclo
        </button>
      )}
    </div>
  );
};

export default MicrocycleManager;
