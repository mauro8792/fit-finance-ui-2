import React, { useState } from "react";
import { createCompleteRoutine as createCompleteRoutineAPI } from "../../api/fitFinanceApi";
import ExerciseCatalogSelector from "../../components/ExerciseCatalogSelector";
import { getEnvVariables } from "../../helpers/getEnvVariables";

const { VITE_API_URL } = getEnvVariables();

const MesocycleWizard = ({
  macrocycleId,
  studentId,
  studentName,
  mesocycleNumber = 1,
  onCancel,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estado del wizard
  const [wizardData, setWizardData] = useState({
    // Step 1: Mesociclo
    mesocycle: {
      name: "",
      startDate: "",
      objetivo: "",
      numero: null, // Número opcional para continuar numeración
    },
    // Step 2: Cantidad de microciclos
    microcycleCount: 4,
    deloadIndices: [], // Índices de microciclos marcados como descarga
    // Step 3: Plantilla de días (7 días por defecto)
    microcycleDays: 7,
    // Step 4: Días con ejercicios
    days: [],
  });

  // Inicializar días cuando se configure la cantidad
  React.useEffect(() => {
    if (wizardData.days.length === 0 && wizardData.microcycleDays > 0) {
      const initialDays = [];
      for (let i = 1; i <= wizardData.microcycleDays; i++) {
        initialDays.push({
          dia: i,
          nombre: `Día ${i}`,
          esDescanso: false,
          ejercicios: [],
        });
      }
      setWizardData((prev) => ({ ...prev, days: initialDays }));
    }
  }, [wizardData.microcycleDays, wizardData.days.length]);

  const updateWizardData = (section, data) => {
    setWizardData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  // Crear mesociclo completo
  const createCompleteMesocycle = async (status = "draft") => {
    setLoading(true);
    setError(null);

    try {
      console.log(
        "🎯 Creando mesociclo con datos:",
        wizardData,
        "Estado:",
        status
      );

      // Generar microciclos con la plantilla de días
      const microcycles = [];
      for (let i = 0; i < wizardData.microcycleCount; i++) {
        const isDeload = wizardData.deloadIndices.includes(i);
        microcycles.push({
          name: `Microciclo ${i + 1}${isDeload ? " (Descarga)" : ""}`,
          isDeload: isDeload,
          days: wizardData.days.map((day) => ({
            dia: day.dia,
            nombre: day.nombre,
            esDescanso: day.esDescanso,
            exercises: (day.ejercicios || []).map((ej, idx) => {
              // Expandir grupos de sets en sets individuales
              const expandedSets = [];
              let orderCounter = 1;

              (ej.setGroups || []).forEach((group) => {
                const quantity = parseInt(group.quantity) || 1;
                // Crear 'quantity' sets con la misma configuración
                for (let i = 0; i < quantity; i++) {
                  expandedSets.push({
                    reps: String(group.reps || "0"), // ✅ Mantener como string para soportar "8-10"
                    load: 0, // Inicialmente sin carga, se asigna después
                    expectedRir: group.rirEsperado || "",
                    descanso: parseInt(group.descanso) || 0,
                    order: orderCounter++,
                    isAmrap: false, // Por defecto no es AMRAP (se configura después en edición)
                    amrapInstruction: null,
                    amrapNotes: null,
                  });
                }
              });

              return {
                nombre: ej.nombre,
                grupoMuscular: ej.grupoMuscular,
                orden: idx + 1,
                sets: expandedSets,
              };
            }),
          })),
        });
      }

      // Preparar payload para el nuevo endpoint
      // El nombre se genera automáticamente: "Mesociclo X"
      const mesoNumero = wizardData.mesocycle.numero || mesocycleNumber;
      const finalName = `Mesociclo ${mesoNumero}`;

      const payload = {
        name: finalName,
        startDate: wizardData.mesocycle.startDate,
        objetivo: wizardData.mesocycle.objetivo,
        status: status, // 'draft' o 'published'
        microcycles: microcycles,
      };

      console.log("📤 Payload para backend:", JSON.stringify(payload, null, 2));

      // Usar el nuevo endpoint específico para crear mesociclo dentro de macrociclo
      const response = await fetch(
        `${VITE_API_URL}/macrocycle/${macrocycleId}/mesocycle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el mesociclo");
      }

      const result = await response.json();

      const statusText = status === "draft" ? "borrador" : "publicado";
      console.log(`✅ Mesociclo guardado como ${statusText}:`, result);
      setLoading(false);

      if (onComplete) {
        onComplete(result);
      }
    } catch (err) {
      setLoading(false);
      setError(
        "Error al crear el mesociclo: " +
          (err.response?.data?.message || err.message)
      );
      console.error("❌ Error creando mesociclo:", err);
    }
  };

  // Estilos
  const isMobile = window.innerWidth < 768;

  const wizardStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.85)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: isMobile ? "10px" : "20px",
    overflowY: "auto",
  };

  const containerStyle = {
    background: "linear-gradient(145deg, #2a2a2a, #1f1f1f)",
    borderRadius: "20px",
    maxWidth: "900px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    overflowX: "hidden",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
    color: "#fff",
    boxSizing: "border-box",
  };

  const headerStyle = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: isMobile ? "20px" : "30px",
    borderRadius: "20px 20px 0 0",
    textAlign: "center",
    position: "sticky",
    top: 0,
    zIndex: 10,
  };

  const stepIndicatorStyle = {
    display: "flex",
    justifyContent: "center",
    gap: isMobile ? "8px" : "12px",
    marginTop: "20px",
  };

  const stepCircleStyle = (stepNumber) => ({
    width: isMobile ? "35px" : "45px",
    height: isMobile ? "35px" : "45px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: isMobile ? "16px" : "18px",
    background:
      currentStep === stepNumber
        ? "#ffd700"
        : currentStep > stepNumber
        ? "#4caf50"
        : "rgba(255, 255, 255, 0.2)",
    color:
      currentStep === stepNumber || currentStep > stepNumber
        ? "#1a1a1a"
        : "#fff",
    border: currentStep === stepNumber ? "3px solid #fff" : "none",
    transition: "all 0.3s ease",
  });

  const contentStyle = {
    padding: isMobile ? "20px" : "30px",
    boxSizing: "border-box",
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
  };

  const buttonStyle = (type) => {
    const baseStyle = {
      padding: isMobile ? "12px 20px" : "14px 28px",
      borderRadius: "10px",
      border: "none",
      fontWeight: "700",
      fontSize: isMobile ? "14px" : "16px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    };

    if (type === "primary") {
      return {
        ...baseStyle,
        background: "linear-gradient(135deg, #ffd700 0%, #ffb300 100%)",
        color: "#1a1a1a",
        boxShadow: "0 4px 15px rgba(255, 215, 0, 0.3)",
      };
    }

    return {
      ...baseStyle,
      background: "rgba(255, 255, 255, 0.1)",
      color: "#fff",
      border: "2px solid rgba(255, 255, 255, 0.2)",
    };
  };

  return (
    <div style={wizardStyle}>
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ position: "relative" }}>
            <h2 style={{ margin: 0, fontSize: isMobile ? "20px" : "24px" }}>
              📝 Crear Mesociclo
            </h2>
            <button
              onClick={onCancel}
              style={{
                position: "absolute",
                top: "-5px",
                right: "0",
                background: "rgba(255, 255, 255, 0.2)",
                border: "none",
                borderRadius: "50%",
                width: "35px",
                height: "35px",
                color: "#fff",
                fontSize: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
          <p
            style={{
              margin: "10px 0 0 0",
              opacity: 0.9,
              fontSize: isMobile ? "13px" : "15px",
            }}
          >
            Alumno: <strong>{studentName}</strong>
          </p>

          {/* Indicador de pasos */}
          <div style={stepIndicatorStyle}>
            <div style={stepCircleStyle(1)}>1</div>
            <div style={stepCircleStyle(2)}>2</div>
            <div style={stepCircleStyle(3)}>3</div>
            <div style={stepCircleStyle(4)}>4</div>
            <div style={stepCircleStyle(5)}>5</div>
          </div>

          <div
            style={{
              marginTop: "15px",
              fontSize: isMobile ? "13px" : "14px",
              fontWeight: "600",
            }}
          >
            {currentStep === 1 && "Paso 1: Configurar Mesociclo"}
            {currentStep === 2 && "Paso 2: Configurar Microciclos"}
            {currentStep === 3 && "Paso 3: Plantilla de Días"}
            {currentStep === 4 && "Paso 4: Configurar Ejercicios"}
            {currentStep === 5 && "Paso 5: Revisar y Crear"}
          </div>
        </div>

        {/* Contenido */}
        <div style={contentStyle}>
          {error && (
            <div
              style={{
                background: "rgba(244, 67, 54, 0.2)",
                border: "2px solid #f44336",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "20px",
                color: "#ff6b6b",
              }}
            >
              <strong>⚠️ Error:</strong> {error}
            </div>
          )}

          {/* STEP 1: Mesociclo */}
          {currentStep === 1 && (
            <StepMesocycle
              data={wizardData.mesocycle}
              onChange={(data) => updateWizardData("mesocycle", data)}
              mesocycleNumber={mesocycleNumber}
            />
          )}

          {/* STEP 2: Cantidad de Microciclos */}
          {currentStep === 2 && (
            <StepMicrocycleCount
              count={wizardData.microcycleCount}
              onChange={(count) => updateWizardData("microcycleCount", count)}
              deloadIndices={wizardData.deloadIndices}
              onDeloadChange={(indices) =>
                updateWizardData("deloadIndices", indices)
              }
            />
          )}

          {/* STEP 3: Plantilla de Días */}
          {currentStep === 3 && (
            <StepDaysTemplate
              days={wizardData.microcycleDays}
              onChange={(days) => {
                updateWizardData("microcycleDays", days);
                // Resetear días cuando cambia la cantidad
                const newDays = [];
                for (let i = 1; i <= days; i++) {
                  newDays.push({
                    dia: i,
                    nombre: `Día ${i}`,
                    esDescanso: false,
                    ejercicios: [],
                  });
                }
                updateWizardData("days", newDays);
              }}
            />
          )}

          {/* STEP 4: Configurar Ejercicios */}
          {currentStep === 4 && (
            <StepExercises
              days={wizardData.days}
              microcycleCount={wizardData.microcycleCount}
              onChange={(days) => updateWizardData("days", days)}
            />
          )}

          {/* STEP 5: Resumen */}
          {currentStep === 5 && (
            <StepSummary
              mesocycle={wizardData.mesocycle}
              microcycleCount={wizardData.microcycleCount}
              microcycleDays={wizardData.microcycleDays}
              days={wizardData.days}
            />
          )}

          {/* Botones de navegación */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "30px",
              justifyContent: "space-between",
            }}
          >
            <button
              onClick={() => {
                if (currentStep === 1) {
                  onCancel();
                } else {
                  setCurrentStep(currentStep - 1);
                }
              }}
              style={buttonStyle("secondary")}
            >
              {currentStep === 1 ? "Cancelar" : "← Anterior"}
            </button>

            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                style={buttonStyle("primary")}
              >
                Siguiente →
              </button>
            ) : (
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexDirection: isMobile ? "column" : "row",
                }}
              >
                <button
                  onClick={() => createCompleteMesocycle("draft")}
                  style={{
                    ...buttonStyle("secondary"),
                    flex: 1,
                    backgroundColor: "#555",
                    border: "2px solid #777",
                  }}
                  disabled={loading}
                >
                  {loading ? "⏳ Guardando..." : "💾 Guardar como Borrador"}
                </button>
                <button
                  onClick={() => createCompleteMesocycle("published")}
                  style={{
                    ...buttonStyle("primary"),
                    flex: 1,
                    backgroundColor: "#4caf50",
                    border: "2px solid #66bb6a",
                  }}
                  disabled={loading}
                >
                  {loading ? "⏳ Publicando..." : "✅ Publicar y Asignar"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// STEP 1: Configurar Mesociclo
// ============================================
const StepMesocycle = ({ data, onChange, mesocycleNumber = 1 }) => {
  const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(255, 255, 255, 0.05)",
    color: "#fff",
    fontSize: "16px",
  };

  return (
    <div>
      <h3 style={{ color: "#ffd700", marginBottom: "20px" }}>
        📋 Configuración del Mesociclo
      </h3>

      {/* Info del próximo número */}
      <div
        style={{
          background: "rgba(102, 126, 234, 0.1)",
          border: "1px solid #667eea",
          borderRadius: "10px",
          padding: "15px",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        <span style={{ color: "#667eea", fontSize: "14px" }}>
          💡 El próximo mesociclo sugerido es el <strong>N° {mesocycleNumber}</strong>
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 120px",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}
          >
            Fecha de Inicio *
          </label>
          <input
            type="date"
            value={data.startDate}
            onChange={(e) => onChange({ ...data, startDate: e.target.value })}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}
          >
            N° Mesociclo *
          </label>
          <input
            type="number"
            min="1"
            value={data.numero || mesocycleNumber}
            onChange={(e) => onChange({ ...data, numero: parseInt(e.target.value) || mesocycleNumber })}
            style={{ ...inputStyle, textAlign: 'center', fontSize: '20px', fontWeight: '600' }}
            required
          />
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}
        >
          Objetivo *
        </label>
        <textarea
          value={data.objetivo}
          onChange={(e) => onChange({ ...data, objetivo: e.target.value })}
          placeholder="Describe el objetivo principal de este mesociclo"
          rows={4}
          style={{
            ...inputStyle,
            resize: "vertical",
            fontFamily: "inherit",
          }}
          required
        />
      </div>

      <div
        style={{
          background: "rgba(76, 175, 80, 0.1)",
          border: "2px solid rgba(76, 175, 80, 0.3)",
          borderRadius: "10px",
          padding: "15px",
          marginTop: "20px",
        }}
      >
        <p style={{ margin: 0, color: "#81c784", fontSize: "14px" }}>
          💡 <strong>Consejo:</strong> Define un nombre descriptivo, fechas
          realistas y un objetivo claro. En el siguiente paso definirás cuántos
          microciclos quieres crear dentro de este mesociclo.
        </p>
      </div>
    </div>
  );
};

// ============================================
// STEP 2: Cantidad de Microciclos
// ============================================
const StepMicrocycleCount = ({
  count,
  onChange,
  deloadIndices,
  onDeloadChange,
}) => {
  const handleCountChange = (newCount) => {
    // Permitir campo vacío temporalmente para poder escribir
    if (newCount === '') {
      onChange(1);
      return;
    }
    const num = parseInt(newCount);
    if (!isNaN(num) && num >= 1 && num <= 12) {
      onChange(num);
    }
  };

  const toggleDeload = (microIndex) => {
    const newDeloadIndices = deloadIndices.includes(microIndex)
      ? deloadIndices.filter((i) => i !== microIndex)
      : [...deloadIndices, microIndex];
    onDeloadChange(newDeloadIndices);
  };

  return (
    <div>
      <h3 style={{ color: "#ffd700", marginBottom: "20px" }}>
        📆 Configuración de Microciclos
      </h3>

      <div style={{ marginBottom: "25px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "12px",
            fontWeight: "600",
            fontSize: "16px",
          }}
        >
          Cantidad de microciclos a crear:
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={() => count > 1 && handleCountChange(count - 1)}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              border: "2px solid rgba(255, 215, 0, 0.3)",
              background: count > 1 ? "rgba(255, 215, 0, 0.2)" : "rgba(255, 255, 255, 0.05)",
              color: count > 1 ? "#ffd700" : "#666",
              fontSize: "24px",
              fontWeight: "bold",
              cursor: count > 1 ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            −
          </button>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={count}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              if (val === '') {
                handleCountChange('');
              } else {
                const num = parseInt(val);
                if (num >= 1 && num <= 12) {
                  handleCountChange(val);
                }
              }
            }}
            style={{
              width: "80px",
              padding: "10px",
              borderRadius: "8px",
              border: "2px solid rgba(255, 215, 0, 0.3)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#fff",
              fontSize: "24px",
              fontWeight: "bold",
              textAlign: "center",
              WebkitAppearance: "none",
              MozAppearance: "textfield",
            }}
          />
          <button
            type="button"
            onClick={() => count < 12 && handleCountChange(count + 1)}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              border: "2px solid rgba(255, 215, 0, 0.3)",
              background: count < 12 ? "rgba(255, 215, 0, 0.2)" : "rgba(255, 255, 255, 0.05)",
              color: count < 12 ? "#ffd700" : "#666",
              fontSize: "24px",
              fontWeight: "bold",
              cursor: count < 12 ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            +
          </button>
        </div>
        <p style={{ fontSize: "13px", color: "#aaa", marginTop: "8px" }}>
          Se crearán {count} microciclos idénticos con la plantilla que
          configures
        </p>
      </div>

      {/* Lista de microciclos con opción de descarga */}
      {count > 0 && (
        <div style={{ marginBottom: "25px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "12px",
              fontWeight: "600",
              fontSize: "16px",
            }}
          >
            Semanas de Descarga (opcional):
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "10px",
            }}
          >
            {Array.from({ length: count }, (_, i) => (
              <div
                key={i}
                onClick={() => toggleDeload(i)}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: deloadIndices.includes(i)
                    ? "2px solid #2196f3"
                    : "2px solid rgba(255, 255, 255, 0.1)",
                  background: deloadIndices.includes(i)
                    ? "rgba(33, 150, 243, 0.2)"
                    : "rgba(255, 255, 255, 0.05)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    marginBottom: "4px",
                  }}
                >
                  {deloadIndices.includes(i) ? "🔵" : "💪"}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: deloadIndices.includes(i) ? "#2196f3" : "#fff",
                  }}
                >
                  Micro {i + 1}
                </div>
                {deloadIndices.includes(i) && (
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#64b5f6",
                      marginTop: "2px",
                    }}
                  >
                    DESCARGA
                  </div>
                )}
              </div>
            ))}
          </div>
          <p style={{ fontSize: "12px", color: "#aaa", marginTop: "10px" }}>
            Click en un microciclo para marcarlo como semana de descarga
          </p>
        </div>
      )}

      <div
        style={{
          background: "rgba(33, 150, 243, 0.1)",
          border: "2px solid rgba(33, 150, 243, 0.3)",
          borderRadius: "10px",
          padding: "15px",
          marginTop: "20px",
        }}
      >
        <p style={{ margin: "0 0 10px 0", color: "#64b5f6", fontSize: "14px" }}>
          💡 <strong>Consejo:</strong> La mayoría de las rutinas usan de 4 a 8
          microciclos por mesociclo. Cada microciclo típicamente dura 1 semana
          (7 días).
        </p>
        <p style={{ margin: 0, color: "#64b5f6", fontSize: "13px" }}>
          🔵 <strong>Semana de Descarga:</strong> Se recomienda cada 3-4
          microciclos para permitir recuperación. Reduce cargas 20-30% y aumenta
          RIR +2-3 puntos.
        </p>
      </div>
    </div>
  );
};

// ============================================
// STEP 3: Plantilla de Días
// ============================================
const StepDaysTemplate = ({ days, onChange }) => (
  <div>
    <h3 style={{ color: "#ffd700", marginBottom: "20px" }}>
      🗓️ Plantilla de Microciclo
    </h3>

    <div style={{ marginBottom: "25px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "12px",
          fontWeight: "600",
          fontSize: "16px",
        }}
      >
        ¿Cuántos días durará cada microciclo?
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          type="button"
          onClick={() => days > 1 && onChange(days - 1)}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "8px",
            border: "2px solid rgba(255, 215, 0, 0.3)",
            background: days > 1 ? "rgba(255, 215, 0, 0.2)" : "rgba(255, 255, 255, 0.05)",
            color: days > 1 ? "#ffd700" : "#666",
            fontSize: "24px",
            fontWeight: "bold",
            cursor: days > 1 ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          −
        </button>
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={days}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, '');
            if (val === '') {
              onChange(7);
            } else {
              const num = parseInt(val);
              if (num >= 1 && num <= 14) {
                onChange(num);
              }
            }
          }}
          style={{
            width: "80px",
            padding: "10px",
            borderRadius: "8px",
            border: "2px solid rgba(255, 215, 0, 0.3)",
            background: "rgba(255, 255, 255, 0.05)",
            color: "#fff",
            fontSize: "24px",
            fontWeight: "bold",
            textAlign: "center",
            WebkitAppearance: "none",
            MozAppearance: "textfield",
          }}
        />
        <button
          type="button"
          onClick={() => days < 14 && onChange(days + 1)}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "8px",
            border: "2px solid rgba(255, 215, 0, 0.3)",
            background: days < 14 ? "rgba(255, 215, 0, 0.2)" : "rgba(255, 255, 255, 0.05)",
            color: days < 14 ? "#ffd700" : "#666",
            fontSize: "24px",
            fontWeight: "bold",
            cursor: days < 14 ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          +
        </button>
      </div>
      <p style={{ fontSize: "13px", color: "#aaa", marginTop: "8px" }}>
        Cada microciclo tendrá {days} días
      </p>
    </div>

    <div
      style={{
        background: "rgba(33, 150, 243, 0.1)",
        border: "2px solid rgba(33, 150, 243, 0.3)",
        borderRadius: "10px",
        padding: "15px",
        marginTop: "20px",
      }}
    >
      <p style={{ margin: 0, color: "#64b5f6", fontSize: "14px" }}>
        💡 <strong>Consejo:</strong> Lo más común es usar 7 días (1 semana). En
        el siguiente paso definirás qué días son de entrenamiento y agregarás
        los ejercicios.
      </p>
    </div>
  </div>
);

// ============================================
// STEP 4: Configurar Ejercicios
// ============================================
const StepExercises = ({ days, microcycleCount, onChange }) => {
  const toggleRest = (dayIndex) => {
    const newDays = [...days];
    newDays[dayIndex].esDescanso = !newDays[dayIndex].esDescanso;
    if (newDays[dayIndex].esDescanso) {
      newDays[dayIndex].ejercicios = [];
    }
    onChange(newDays);
  };

  const addExercise = (dayIndex) => {
    const newDays = [...days];
    if (!newDays[dayIndex].ejercicios) {
      newDays[dayIndex].ejercicios = [];
    }
    newDays[dayIndex].ejercicios.push({
      exerciseId: null,
      nombre: "",
      grupoMuscular: "",
      setGroups: [
        // Iniciar con 1 grupo de sets por defecto (3 sets normales)
        {
          reps: "",
          rirEsperado: "",
          descanso: "",
          quantity: 3, // × 3 sets
        },
      ],
    });
    onChange(newDays);
  };

  const removeExercise = (dayIndex, exerciseIndex) => {
    const newDays = [...days];
    newDays[dayIndex].ejercicios.splice(exerciseIndex, 1);
    onChange(newDays);
  };

  const updateExercise = (dayIndex, exerciseIndex, field, value) => {
    const newDays = [...days];
    newDays[dayIndex].ejercicios[exerciseIndex][field] = value;
    onChange(newDays);
  };

  const addSetGroup = (dayIndex, exerciseIndex) => {
    const newDays = [...days];
    const exercise = newDays[dayIndex].ejercicios[exerciseIndex];
    if (!exercise.setGroups) {
      exercise.setGroups = [];
    }
    exercise.setGroups.push({
      reps: "",
      rirEsperado: "",
      descanso: "",
      quantity: 1,
    });
    onChange(newDays);
  };

  const removeSetGroup = (dayIndex, exerciseIndex, groupIndex) => {
    const newDays = [...days];
    newDays[dayIndex].ejercicios[exerciseIndex].setGroups.splice(groupIndex, 1);
    onChange(newDays);
  };

  const updateSetGroup = (
    dayIndex,
    exerciseIndex,
    groupIndex,
    field,
    value
  ) => {
    const newDays = [...days];
    newDays[dayIndex].ejercicios[exerciseIndex].setGroups[groupIndex][field] =
      value;
    onChange(newDays);
  };

  const inputStyle = {
    padding: "6px",
    borderRadius: "4px",
    border: "1px solid #444",
    background: "#333",
    color: "#fff",
    fontSize: "13px",
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
  };

  return (
    <div>
      <h3 style={{ color: "#ffd700", marginBottom: "20px" }}>
        💪 Configurar Ejercicios por Día
      </h3>

      <p style={{ color: "#aaa", marginBottom: "20px", fontSize: "14px" }}>
        Esta plantilla se aplicará a{" "}
        <strong>los {microcycleCount} microciclos</strong> que especificaste.
        Define qué días son de descanso y agrega ejercicios a los días de
        entrenamiento.
      </p>

      <div style={{ display: "grid", gap: "15px" }}>
        {days.map((day, dayIndex) => (
          <div
            key={day.dia}
            style={{
              background: day.esDescanso
                ? "rgba(255, 152, 0, 0.1)"
                : "rgba(76, 175, 80, 0.1)",
              border: `2px solid ${
                day.esDescanso
                  ? "rgba(255, 152, 0, 0.3)"
                  : "rgba(76, 175, 80, 0.3)"
              }`,
              borderRadius: "10px",
              padding: "15px",
              boxSizing: "border-box",
              width: "100%",
              maxWidth: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                Día {day.dia}
              </div>
              <button
                onClick={() => toggleRest(dayIndex)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  background: day.esDescanso ? "#ff9800" : "#4caf50",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                {day.esDescanso ? "⏭️ Descanso" : "💪 Ejercicio"}
              </button>
            </div>

            {day.esDescanso ? (
              <p
                style={{
                  margin: "10px 0 0 0",
                  fontSize: "13px",
                  color: "#ff9800",
                }}
              >
                Día de descanso - Haz clic en el botón para cambiarlo a día de
                entrenamiento
              </p>
            ) : (
              <>
                {/* Ejercicios */}
                {(day.ejercicios || []).map((ejercicio, exerciseIndex) => (
                  <div
                    key={exerciseIndex}
                    style={{
                      marginBottom: "8px",
                      padding: "8px",
                      background: "#333",
                      borderRadius: "4px",
                      boxSizing: "border-box",
                      width: "100%",
                      maxWidth: "100%",
                    }}
                  >
                    {/* Fila 1: Selector de ejercicio */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "3fr auto",
                        gap: "8px",
                        alignItems: "center",
                        marginBottom: "8px",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      <ExerciseCatalogSelector
                        value={{
                          nombre: ejercicio.nombre,
                          grupoMuscular: ejercicio.grupoMuscular,
                        }}
                        onChange={(data) => {
                          if (data.nombre) {
                            updateExercise(
                              dayIndex,
                              exerciseIndex,
                              "nombre",
                              data.nombre
                            );
                          }
                          if (data.grupoMuscular) {
                            updateExercise(
                              dayIndex,
                              exerciseIndex,
                              "grupoMuscular",
                              data.grupoMuscular
                            );
                          }
                          if (data.exerciseId) {
                            updateExercise(
                              dayIndex,
                              exerciseIndex,
                              "exerciseId",
                              data.exerciseId
                            );
                          }
                        }}
                        style={inputStyle}
                      />

                      <button
                        onClick={() => removeExercise(dayIndex, exerciseIndex)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "4px",
                          border: "none",
                          background: "#d32f2f",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Grupos de Sets */}
                    <div style={{ marginTop: "10px" }}>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#aaa",
                          marginBottom: "8px",
                          fontWeight: "600",
                        }}
                      >
                        Sets Programados:
                      </div>

                      {(ejercicio.setGroups || []).map((group, groupIndex) => (
                        <div
                          key={groupIndex}
                          style={{
                            background: "#2a2a2a",
                            border: "1px solid #444",
                            borderRadius: "6px",
                            padding: "10px",
                            marginBottom: "8px",
                          }}
                        >
                          {/* Header del grupo */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "8px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: "bold",
                                color: "#fff",
                              }}
                            >
                              Grupo {groupIndex + 1}
                            </span>
                            {(ejercicio.setGroups || []).length > 1 && (
                              <button
                                onClick={() =>
                                  removeSetGroup(
                                    dayIndex,
                                    exerciseIndex,
                                    groupIndex
                                  )
                                }
                                style={{
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  border: "none",
                                  background: "#d32f2f",
                                  color: "#fff",
                                  cursor: "pointer",
                                  fontSize: "10px",
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {/* Campos del grupo - Layout mejorado */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {/* Fila 1: Reps y RIR */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                              <div>
                                <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "4px" }}>
                                  Reps
                                </label>
                                <input
                                  type="text"
                                  placeholder="8-10"
                                  value={group.reps}
                                  onChange={(e) =>
                                    updateSetGroup(dayIndex, exerciseIndex, groupIndex, "reps", e.target.value)
                                  }
                                  style={{
                                    ...inputStyle,
                                    fontSize: "14px",
                                    padding: "10px",
                                    textAlign: "center",
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "4px" }}>
                                  RIR
                                </label>
                                <input
                                  type="text"
                                  placeholder="2-3"
                                  value={group.rirEsperado}
                                  onChange={(e) =>
                                    updateSetGroup(dayIndex, exerciseIndex, groupIndex, "rirEsperado", e.target.value)
                                  }
                                  style={{
                                    ...inputStyle,
                                    fontSize: "14px",
                                    padding: "10px",
                                    textAlign: "center",
                                  }}
                                />
                              </div>
                            </div>
                            
                            {/* Fila 2: Descanso y Sets */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                              <div>
                                <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "4px" }}>
                                  Descanso (min)
                                </label>
                                <input
                                  type="text"
                                  placeholder="2"
                                  value={group.descanso}
                                  onChange={(e) =>
                                    updateSetGroup(dayIndex, exerciseIndex, groupIndex, "descanso", e.target.value)
                                  }
                                  style={{
                                    ...inputStyle,
                                    fontSize: "14px",
                                    padding: "10px",
                                    textAlign: "center",
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "4px" }}>
                                  Cant. Sets
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={group.quantity || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '') {
                                      updateSetGroup(dayIndex, exerciseIndex, groupIndex, "quantity", 1);
                                    } else {
                                      const num = parseInt(val);
                                      if (!isNaN(num) && num >= 1 && num <= 10) {
                                        updateSetGroup(dayIndex, exerciseIndex, groupIndex, "quantity", num);
                                      }
                                    }
                                  }}
                                  style={{
                                    ...inputStyle,
                                    fontSize: "14px",
                                    padding: "10px",
                                    textAlign: "center",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Botón para agregar grupo de sets */}
                      <button
                        onClick={() => addSetGroup(dayIndex, exerciseIndex)}
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "4px",
                          border: "1px dashed #4caf50",
                          background: "rgba(76, 175, 80, 0.1)",
                          color: "#4caf50",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        + Agregar Grupo de Sets
                      </button>
                    </div>
                  </div>
                ))}

                {/* Botón agregar ejercicio */}
                <button
                  onClick={() => addExercise(dayIndex)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#4caf50",
                    color: "#fff",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "13px",
                    marginTop: "8px",
                  }}
                >
                  + Ejercicio
                </button>

                {/* Mensaje si no hay ejercicios */}
                {(!day.ejercicios || day.ejercicios.length === 0) && (
                  <p
                    style={{
                      color: "#666",
                      fontStyle: "italic",
                      textAlign: "center",
                      margin: "8px 0 0 0",
                      fontSize: "13px",
                    }}
                  >
                    Haz clic en "+ Ejercicio" para agregar ejercicios a este día
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          background: "rgba(33, 150, 243, 0.1)",
          border: "2px solid rgba(33, 150, 243, 0.3)",
          borderRadius: "10px",
          padding: "15px",
          marginTop: "20px",
        }}
      >
        <p style={{ margin: 0, color: "#64b5f6", fontSize: "14px" }}>
          💡 <strong>Importante:</strong> Esta plantilla se replicará en todos
          los {microcycleCount} microciclos. Si quieres hacer ajustes
          específicos a cada microciclo, podrás editarlos después de crearlos.
        </p>
      </div>
    </div>
  );
};

// ============================================
// STEP 5: Resumen
// ============================================
const StepSummary = ({ mesocycle, microcycleCount, microcycleDays, days }) => {
  const isMobile = window.innerWidth < 768;
  const trainingDays = days.filter((d) => !d.esDescanso).length;
  const restDays = days.filter((d) => d.esDescanso).length;
  const totalExercises = days.reduce(
    (sum, day) => sum + (day.ejercicios?.length || 0),
    0
  );

  return (
    <div>
      <h3 style={{ color: "#ffd700", marginBottom: "20px" }}>
        📋 Resumen del Mesociclo
      </h3>

      {/* Mesociclo */}
      <div
        style={{
          background: "rgba(102, 126, 234, 0.1)",
          border: "2px solid rgba(102, 126, 234, 0.3)",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h4 style={{ color: "#667eea", margin: "0 0 15px 0" }}>Mesociclo</h4>
        <div style={{ fontSize: "14px", lineHeight: "1.8" }}>
          <div>
            <strong>Nombre:</strong> {mesocycle.name}
          </div>
          <div>
            <strong>Inicio:</strong> {mesocycle.startDate}
          </div>
          <div>
            <strong>Fin:</strong> Se definirá al finalizar
          </div>
          <div>
            <strong>Objetivo:</strong> {mesocycle.objetivo}
          </div>
        </div>
      </div>

      {/* Microciclos */}
      <div
        style={{
          background: "rgba(76, 175, 80, 0.1)",
          border: "2px solid rgba(76, 175, 80, 0.3)",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h4 style={{ color: "#4caf50", margin: "0 0 15px 0" }}>Microciclos</h4>
        <div style={{ fontSize: "14px", lineHeight: "1.8" }}>
          <div>
            <strong>Cantidad:</strong> {microcycleCount} microciclos
          </div>
          <div>
            <strong>Duración:</strong> {microcycleDays} días por microciclo
          </div>
          <div>
            <strong>Total días:</strong> {microcycleCount * microcycleDays} días
          </div>
        </div>
      </div>

      {/* Días */}
      <div
        style={{
          background: "rgba(255, 215, 0, 0.1)",
          border: "2px solid rgba(255, 215, 0, 0.3)",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h4 style={{ color: "#ffd700", margin: "0 0 15px 0" }}>
          Plantilla de Días
        </h4>
        <div style={{ fontSize: "14px", lineHeight: "1.8" }}>
          <div>
            <strong>Días de entrenamiento:</strong> {trainingDays} por
            microciclo
          </div>
          <div>
            <strong>Días de descanso:</strong> {restDays} por microciclo
          </div>
          <div>
            <strong>Total ejercicios:</strong> {totalExercises} por microciclo
          </div>
          <div style={{ marginTop: "10px", color: "#aaa", fontSize: "13px" }}>
            Total de entrenamientos: {trainingDays * microcycleCount}
          </div>
        </div>
      </div>

      {/* Confirmación */}
      <div
        style={{
          background: "rgba(76, 175, 80, 0.15)",
          border: "2px solid #4caf50",
          borderRadius: "10px",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h4 style={{ color: "#81c784", margin: "0 0 12px 0" }}>
          ✅ ¿Todo se ve correcto?
        </h4>
        <p style={{ color: "#a5d6a7", margin: "0 0 12px 0", fontSize: "14px" }}>
          Revisa la información anterior. Luego elige cómo guardar el mesociclo:
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: "12px",
            marginTop: "12px",
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: "rgba(85, 85, 85, 0.2)",
              borderRadius: "8px",
              border: "1px solid rgba(119, 119, 119, 0.3)",
            }}
          >
            <strong style={{ color: "#bbb" }}>💾 Borrador:</strong>
            <p style={{ color: "#999", margin: "8px 0 0 0", fontSize: "13px" }}>
              Solo tú podrás verlo. Edítalo cuando quieras.
            </p>
          </div>
          <div
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(76, 175, 80, 0.3)",
            }}
          >
            <strong style={{ color: "#81c784" }}>✅ Publicar:</strong>
            <p
              style={{
                color: "#a5d6a7",
                margin: "8px 0 0 0",
                fontSize: "13px",
              }}
            >
              El alumno podrá verlo y entrenar con esta rutina.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MesocycleWizard;
