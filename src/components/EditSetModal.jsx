import React, { useState, useEffect } from "react";

const EditSetModal = ({ open, set, onSave, onClose }) => {
  const [form, setForm] = useState({
    reps: set.reps || 0,
    load: set.load || 0,
    actualRir: set.actualRir || 0,
    actualRpe: set.actualRpe || 0,
    notes: set.notes || '',
    // El campo 'order' se conserva pero no se edita
    order: typeof set.order === 'number' ? set.order : 0,
  });

  useEffect(() => {
    setForm({
      reps: set.reps || 0,
      load: set.load || 0,
      actualRir: set.actualRir || 0,
      actualRpe: set.actualRpe || 0,
      notes: set.notes || '',
      // El campo 'order' se conserva pero no se edita
      order: typeof set.order === 'number' ? set.order : 0,
    });
  }, [set]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const handleChange = (e) => {
    // No permitir editar el campo 'order'
    if (e.target.name === 'order') return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave(form);
      setLoading(false);
      onClose();
    } catch (err) {
      setError(err?.message || "Error al guardar");
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
    }}>
      <form onSubmit={handleSubmit} style={{ background: "#222", padding: 24, borderRadius: 12, minWidth: 320, color: "#fff", boxShadow: "0 2px 16px #0008" }}>
        <h3 style={{ marginBottom: 18, textAlign: "center" }}>Editar Set</h3>
        <div style={{ marginBottom: 14 }}>
          <label>Reps<br />
            <input name="reps" type="number" value={form.reps} onChange={handleChange} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #444", marginTop: 4 }} />
          </label>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label>Carga (kg)<br />
            <input name="load" type="number" value={form.load} onChange={handleChange} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #444", marginTop: 4 }} />
          </label>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label>RIR Real<br />
            <input name="actualRir" type="number" value={form.actualRir} onChange={handleChange} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #444", marginTop: 4 }} />
          </label>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label>RPE Real<br />
            <input name="actualRpe" type="number" value={form.actualRpe} onChange={handleChange} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #444", marginTop: 4 }} />
          </label>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label>Notas<br />
            <textarea name="notes" value={form.notes} onChange={handleChange} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #444", marginTop: 4, minHeight: 48, resize: "vertical" }} />
          </label>
        </div>
        {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
        <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: 6, border: "none", background: "#888", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
          <button type="submit" disabled={loading} style={{ flex: 2, padding: "10px 0", borderRadius: 6, border: "none", background: "#ffd700", color: "#222", fontWeight: 700, cursor: "pointer" }}>{loading ? "Guardando..." : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
};

export default EditSetModal;
