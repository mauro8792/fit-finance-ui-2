import React, { useState, useEffect } from "react";
import './EditSetModal.css';

const EditSetModal = ({ open, set, restTime, onSave, onClose, onStartTimer }) => {
  const [form, setForm] = useState({
    reps: set.reps || 0,
    load: set.load || 0,
    actualRir: set.actualRir || 0,
    actualRpe: set.actualRpe || 0,
    notes: set.notes || '',
    order: typeof set.order === 'number' ? set.order : 0,
  });

  useEffect(() => {
    setForm({
      reps: set.reps || 0,
      load: set.load || 0,
      actualRir: set.actualRir || 0,
      actualRpe: set.actualRpe || 0,
      notes: set.notes || '',
      order: typeof set.order === 'number' ? set.order : 0,
    });
  }, [set]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const handleChange = (e) => {
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
      
      // Si hay tiempo de descanso configurado, iniciar el timer en el componente padre
      if (restTime && restTime > 0 && onStartTimer) {
        onStartTimer(restTime);
      }
    } catch (err) {
      setError(err?.message || "Error al guardar");
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-container">
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Header */}
          <div className="modal-header">
            <h3 className="modal-title">✏️ Editar Set</h3>
            <button 
              type="button" 
              onClick={onClose} 
              className="modal-close"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Grid de campos numéricos con sliders */}
          <div className="form-grid">
            {/* REPS */}
            <div className="form-field">
              <label className="form-label">
                <span className="label-icon">🔢</span>
                Reps
                <span className="value-badge">{form.reps}</span>
              </label>
              <input 
                name="reps" 
                type="range" 
                value={form.reps} 
                onChange={handleChange} 
                className="form-slider"
                min="0"
                max="25"
              />
              <input 
                name="reps" 
                type="number" 
                value={form.reps} 
                onChange={handleChange} 
                className="form-input-small"
                min="0"
              />
            </div>

            {/* CARGA */}
            <div className="form-field">
              <label className="form-label">
                <span className="label-icon">⚖️</span>
                Carga (kg)
                <span className="value-badge">{form.load}</span>
              </label>
              <input 
                name="load" 
                type="range" 
                step="2.5"
                value={form.load} 
                onChange={handleChange} 
                className="form-slider"
                min="0"
                max="200"
              />
              <input 
                name="load" 
                type="number" 
                step="0.5"
                value={form.load} 
                onChange={handleChange} 
                className="form-input-small"
                min="0"
              />
            </div>

            {/* RIR */}
            <div className="form-field">
              <label className="form-label">
                <span className="label-icon">💪</span>
                RIR Real
                <span className="value-badge">{form.actualRir}</span>
              </label>
              <input 
                name="actualRir" 
                type="range" 
                value={form.actualRir} 
                onChange={handleChange} 
                className="form-slider"
                min="0"
                max="10"
              />
              <div className="slider-labels">
                <span>0</span>
                <span>10</span>
              </div>
            </div>

            {/* RPE */}
            <div className="form-field">
              <label className="form-label">
                <span className="label-icon">🔥</span>
                RPE Real
                <span className="value-badge">{form.actualRpe}</span>
              </label>
              <input 
                name="actualRpe" 
                type="range" 
                value={form.actualRpe} 
                onChange={handleChange} 
                className="form-slider"
                min="0"
                max="10"
              />
              <div className="slider-labels">
                <span>0</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {/* Campo de notas */}
          <div className="form-field form-field-full">
            <label className="form-label">
              <span className="label-icon">📝</span>
              Notas
            </label>
            <textarea 
              name="notes" 
              value={form.notes} 
              onChange={handleChange} 
              className="form-textarea"
              placeholder="Agrega tus observaciones..."
              rows="3"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Botones de acción */}
          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-cancel"
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn btn-submit"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Guardando...
                </>
              ) : (
                '💾 Guardar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSetModal;
