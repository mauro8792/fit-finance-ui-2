import { useState } from 'react';

const MesocycleForm = ({ macrocycleId, onCreated, onCancel }) => {
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    objetivo: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const body = {
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
        objetivo: form.objetivo,
      };
      const response = await fetch(`http://localhost:3000/api/mesocycle/${macrocycleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        const meso = await response.json();
        setLoading(false);
        onCreated(meso);
      } else {
        const error = await response.json();
        setError(error.message || 'Error al crear mesociclo');
        setLoading(false);
      }
    } catch (err) {
      setError('Error de red o servidor');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 420, margin: '0 auto', background: '#222', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px #0002', color: '#fff' }}>
      <h3 style={{ marginBottom: 18, textAlign: 'center' }}>Crear Mesociclo</h3>
      <div style={{ marginBottom: 14 }}>
        <label>Nombre<br />
          <input name="name" value={form.name} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', marginTop: 4 }} />
        </label>
      </div>
      <div style={{ marginBottom: 14, display: 'flex', gap: 12 }}>
        <label style={{ flex: 1 }}>Inicio<br />
          <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', marginTop: 4 }} />
        </label>
        <label style={{ flex: 1 }}>Fin<br />
          <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', marginTop: 4 }} />
        </label>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label>Objetivo<br />
          <input name="objetivo" value={form.objetivo} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', marginTop: 4 }} />
        </label>
      </div>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
        <button type="button" onClick={onCancel} style={{ flex: 1, padding: '10px 0', borderRadius: 6, border: 'none', background: '#888', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
        <button type="submit" disabled={loading} style={{ flex: 2, padding: '10px 0', borderRadius: 6, border: 'none', background: '#ffd700', color: '#222', fontWeight: 700, cursor: 'pointer' }}>{loading ? 'Guardando...' : 'Guardar Mesociclo'}</button>
      </div>
    </form>
  );
};

export default MesocycleForm;
