

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useRoutineStore } from '../../hooks/useRoutineStore';
import MesocycleForm from './MesocycleForm';

const MacrocycleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mesocycles, setMesocycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { getMesocyclesByMacro, createMesocycle } = useRoutineStore();
  const [error, setError] = useState(null);

  // Cargar mesociclos al montar
  useEffect(() => {
    console.log('[MacrocycleDetail] MONTADO para macrocycleId:', id);
    setLoading(true);
    getMesocyclesByMacro(id)
      .then((data) => {
        setMesocycles(data);
        console.log('[MacrocycleDetail] Mesocycles cargados:', data);
      })
      .catch((e) => {
        setError('Error al cargar mesociclos');
        console.error('[MacrocycleDetail] Error al cargar mesociclos', e);
      })
      .finally(() => setLoading(false));
  }, [id, getMesocyclesByMacro]);

  return (
    <div style={{ background: '#181818', minHeight: '100vh', padding: 32 }}>
      <div style={{position:'fixed',top:0,left:0,zIndex:9999,background:'#ffd700',color:'#222',padding:8,fontWeight:700}}>
        DEBUG: MacrocycleDetail montado para macrocycleId: {id}
      </div>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 24, background: '#ffd700', color: '#222', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}>Volver</button>
      <h2 style={{ color: '#ffd700', fontWeight: 800, fontSize: 32, textAlign: 'center', marginBottom: 32 }}>Mesociclos del Macro-ciclo #{id}</h2>
      {loading ? (
        <div style={{ color: '#aaa', textAlign: 'center', margin: 24 }}>Cargando mesociclos...</div>
      ) : error ? (
        <div style={{ color: 'red', textAlign: 'center', margin: 24 }}>{error}</div>
      ) : mesocycles.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', margin: 24 }}>No hay mesociclos para este macro-ciclo.</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', marginBottom: 32 }}>
          {mesocycles.map(meso => (
            <div key={meso.id} style={{ background: '#232323', borderRadius: 14, border: '2px solid #ffd700', color: '#fff', padding: 22, minWidth: 220, maxWidth: 320 }}>
              <div style={{ fontWeight: 700, fontSize: 20, color: '#ffd700', marginBottom: 8 }}>{meso.name}</div>
              <div style={{ fontSize: 15, marginBottom: 4 }}><b>Inicio:</b> {meso.startDate ? new Date(meso.startDate).toLocaleDateString() : '-'}</div>
              <div style={{ fontSize: 15, marginBottom: 4 }}><b>Fin:</b> {meso.endDate ? new Date(meso.endDate).toLocaleDateString() : '-'}</div>
              <div style={{ fontSize: 14, marginTop: 8, color: '#ccc' }}><b>Objetivo:</b> {meso.objetivo}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button style={{ background: '#ffd700', color: '#222', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 700, cursor: 'pointer' }}>Editar</button>
                <button style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 700, cursor: 'not-allowed', opacity: 0.6 }}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setShowForm(true)} style={{ background: '#ffd700', color: '#222', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 700, fontSize: 18, cursor: 'pointer', display: 'block', margin: '0 auto' }}>Agregar Mesociclo</button>
      {showForm && (
        <div style={{ marginTop: 32 }}>
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
      )}
    </div>
  );
};

export default MacrocycleDetail;
