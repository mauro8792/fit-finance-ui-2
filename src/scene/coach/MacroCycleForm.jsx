import { useState } from 'react';
import { useRoutineStore } from '../../hooks';

const MacroCycleForm = ({ studentId, onCreated, onCancel }) => {
  const [form, setForm] = useState({
    objetivo: '',
    fechaInicio: '',
    fechaFin: '',
    observaciones: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { createMacroCycle } = useRoutineStore();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const macro = await createMacroCycle(studentId, form);
      setLoading(false);
      onCreated(macro);
    } catch (err) {
      setError('Error al crear macro-ciclo');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 420, margin: '0 auto', background: '#222', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px #0002', color: '#fff' }}>
      <h3 style={{ marginBottom: 18, textAlign: 'center' }}>Crear Macro-ciclo</h3>
      <div style={{ marginBottom: 14 }}>
        <label>Objetivo general<br />
          <input name="objetivo" value={form.objetivo} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', marginTop: 4 }} />
        </label>
      </div>
      <div style={{ marginBottom: 14, display: 'flex', gap: 12 }}>
        <label style={{ flex: 1 }}>Inicio<br />
          <input type="date" name="fechaInicio" value={form.fechaInicio} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', marginTop: 4 }} />
        </label>
        <label style={{ flex: 1 }}>Fin<br />
          <input type="date" name="fechaFin" value={form.fechaFin} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', marginTop: 4 }} />
        </label>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label>Observaciones<br />
          <textarea name="observaciones" value={form.observaciones} onChange={handleChange} rows={3} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', marginTop: 4 }} />
        </label>
      </div>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
        <button type="button" onClick={onCancel} style={{ flex: 1, padding: '10px 0', borderRadius: 6, border: 'none', background: '#888', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
        <button type="submit" disabled={loading} style={{ flex: 2, padding: '10px 0', borderRadius: 6, border: 'none', background: '#ffd700', color: '#222', fontWeight: 700, cursor: 'pointer' }}>{loading ? 'Guardando...' : 'Guardar Macro-ciclo'}</button>
      </div>
    </form>
  );
};

export default MacroCycleForm;
