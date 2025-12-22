import React, { useEffect, useState } from "react";
import "./EditSetModal.css";

const EditSetModal = ({
  open,
  set,
  restTime,
  onSave,
  onClose,
  onStartTimer,
  canConfigureAmrap = true,
}) => {
  const [form, setForm] = useState({
    reps: set.reps || 0,
    load: set.load || 0,
    actualRir: set.actualRir || 0,
    actualRpe: set.actualRpe || 0,
    notes: set.notes || "",
    order: typeof set.order === "number" ? set.order : 0,
    isExtra: set.isExtra || false,
    status: set.status || "", // Sin estado por defecto, debe seleccionar
    isAmrap: set.isAmrap || false,
    amrapInstruction: set.amrapInstruction || "misma_carga",
    amrapNotes: set.amrapNotes || "",
  });

  useEffect(() => {
    setForm({
      reps: set.reps || 0,
      load: set.load || 0,
      actualRir: set.actualRir || 0,
      actualRpe: set.actualRpe || 0,
      notes: set.notes || "",
      order: typeof set.order === "number" ? set.order : 0,
      isExtra: set.isExtra || false,
      status: set.status || "", // Sin estado por defecto
      isAmrap: set.isAmrap || false,
      amrapInstruction: set.amrapInstruction || "misma_carga",
      amrapNotes: set.amrapNotes || "",
    });
  }, [set]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const handleChange = (e) => {
    if (e.target.name === "order") return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validaciones
    if (!form.reps || form.reps <= 0) {
      setError("Debes ingresar las repeticiones realizadas");
      return;
    }
    if (!form.load || form.load <= 0) {
      setError("Debes ingresar la carga utilizada");
      return;
    }
    if (!form.status) {
      setError("Debes seleccionar el estado del set (Completado, Fallido o Saltado)");
      return;
    }
    
    setLoading(true);
    try {
      const payload = { ...form };
      if (!canConfigureAmrap) {
        delete payload.isAmrap;
        delete payload.amrapInstruction;
        delete payload.amrapNotes;
      }
      await onSave(payload);
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
            <h3 className="modal-title">
              ✏️ Editar Set
              {set.isExtra && (
                <span
                  style={{
                    marginLeft: "8px",
                    fontSize: "0.7em",
                    backgroundColor: "#4caf50",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    verticalAlign: "middle",
                  }}
                >
                  EXTRA
                </span>
              )}
            </h3>
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
                Reps <span style={{ color: '#f44336', fontWeight: 'bold' }}>*</span>
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
                Carga (kg) <span style={{ color: '#f44336', fontWeight: 'bold' }}>*</span>
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

          {/* Estado del Set */}
          <div className="form-field form-field-full">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="label-icon">🎯</span>
              Estado del Set
              <span style={{ color: '#f44336', fontWeight: 'bold' }}>*</span>
              {!form.status && (
                <span style={{ 
                  fontSize: 10, 
                  color: '#ff9800', 
                  marginLeft: 8,
                  fontWeight: 'normal'
                }}>
                  (Seleccioná uno)
                </span>
              )}
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                marginTop: "8px",
              }}
            >
              <button
                type="button"
                onClick={() => setForm({ ...form, status: "completed" })}
                style={{
                  padding: "10px 6px",
                  border:
                    form.status === "completed"
                      ? "2px solid #4caf50"
                      : "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "10px",
                  backgroundColor:
                    form.status === "completed"
                      ? "rgba(76, 175, 80, 0.25)"
                      : "rgba(255,255,255,0.03)",
                  color:
                    form.status === "completed"
                      ? "#4caf50"
                      : "rgba(255,255,255,0.6)",
                  fontSize: "11px",
                  fontWeight: form.status === "completed" ? "bold" : "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "3px",
                  minHeight: "55px",
                  boxShadow:
                    form.status === "completed"
                      ? "0 2px 8px rgba(76, 175, 80, 0.3)"
                      : "none",
                }}
              >
                <span style={{ fontSize: "20px" }}>✅</span>
                <span>Completado</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, status: "failed" })}
                style={{
                  padding: "10px 6px",
                  border:
                    form.status === "failed"
                      ? "2px solid #f44336"
                      : "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "10px",
                  backgroundColor:
                    form.status === "failed"
                      ? "rgba(244, 67, 54, 0.25)"
                      : "rgba(255,255,255,0.03)",
                  color:
                    form.status === "failed"
                      ? "#f44336"
                      : "rgba(255,255,255,0.6)",
                  fontSize: "11px",
                  fontWeight: form.status === "failed" ? "bold" : "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "3px",
                  minHeight: "55px",
                  boxShadow:
                    form.status === "failed"
                      ? "0 2px 8px rgba(244, 67, 54, 0.3)"
                      : "none",
                }}
              >
                <span style={{ fontSize: "20px" }}>❌</span>
                <span>Fallido</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, status: "skipped" })}
                style={{
                  padding: "10px 6px",
                  border:
                    form.status === "skipped"
                      ? "2px solid #ff9800"
                      : "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "10px",
                  backgroundColor:
                    form.status === "skipped"
                      ? "rgba(255, 152, 0, 0.25)"
                      : "rgba(255,255,255,0.03)",
                  color:
                    form.status === "skipped"
                      ? "#ff9800"
                      : "rgba(255,255,255,0.6)",
                  fontSize: "11px",
                  fontWeight: form.status === "skipped" ? "bold" : "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "3px",
                  minHeight: "55px",
                  boxShadow:
                    form.status === "skipped"
                      ? "0 2px 8px rgba(255, 152, 0, 0.3)"
                      : "none",
                }}
              >
                <span style={{ fontSize: "20px" }}>⏭️</span>
                <span>Saltado</span>
              </button>
            </div>
          </div>

          {/* AMRAP Configuration (solo coach) */}
          {canConfigureAmrap && (
          <div
            className="form-field form-field-full"
            style={{
              backgroundColor: form.isAmrap
                ? "rgba(255, 193, 7, 0.1)"
                : "transparent",
              border: form.isAmrap
                ? "2px solid rgba(255, 193, 7, 0.3)"
                : "none",
              borderRadius: "10px",
              padding: form.isAmrap ? "12px" : "0",
              transition: "all 0.3s ease",
            }}
          >
            <label
              className="form-label"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                marginBottom: form.isAmrap ? "12px" : "0",
              }}
              onClick={() => setForm({ ...form, isAmrap: !form.isAmrap })}
            >
              <span>
                <span className="label-icon">🔥</span>
                AMRAP (Las que salgan)
              </span>
              <div
                style={{
                  width: "48px",
                  height: "24px",
                  borderRadius: "12px",
                  backgroundColor: form.isAmrap
                    ? "#ffc107"
                    : "rgba(255,255,255,0.1)",
                  position: "relative",
                  transition: "all 0.3s ease",
                  border:
                    "1px solid " +
                    (form.isAmrap ? "#ffc107" : "rgba(255,255,255,0.2)"),
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#fff",
                    position: "absolute",
                    top: "2px",
                    left: form.isAmrap ? "26px" : "2px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                />
              </div>
            </label>

            {form.isAmrap && (
              <>
                <div style={{ marginBottom: "12px" }}>
                  <label
                    className="form-label"
                    style={{
                      fontSize: "12px",
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    Instrucción de carga
                  </label>
                  <select
                    value={form.amrapInstruction}
                    onChange={(e) =>
                      setForm({ ...form, amrapInstruction: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 193, 7, 0.3)",
                      backgroundColor: "rgba(255, 193, 7, 0.05)",
                      color: "#fff",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    <option value="misma_carga">
                      💪 Misma carga que serie anterior
                    </option>
                    <option value="bajar_carga">⬇️ Bajar carga</option>
                    <option value="kg_serie_anterior">
                      📊 Usar kg de la serie anterior
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    className="form-label"
                    style={{
                      fontSize: "12px",
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    Notas del coach (opcional)
                  </label>
                  <textarea
                    value={form.amrapNotes}
                    onChange={(e) =>
                      setForm({ ...form, amrapNotes: e.target.value })
                    }
                    placeholder="ej: bajar 5kg, usar 80% de la carga anterior"
                    rows="2"
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 193, 7, 0.3)",
                      backgroundColor: "rgba(255, 193, 7, 0.05)",
                      color: "#fff",
                      fontSize: "12px",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: "10px",
                    padding: "8px",
                    backgroundColor: "rgba(255, 193, 7, 0.15)",
                    borderRadius: "6px",
                    fontSize: "11px",
                    color: "#ffc107",
                    lineHeight: "1.4",
                  }}
                >
                  💡 <strong>AMRAP:</strong> Realiza la mayor cantidad de
                  repeticiones posibles manteniendo buena técnica.
                </div>
              </>
            )}
          </div>
          )}

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
            <button type="submit" disabled={loading} className="btn btn-submit">
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Guardando...
                </>
              ) : (
                "💾 Guardar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSetModal;
