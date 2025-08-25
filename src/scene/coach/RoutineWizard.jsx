import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCompleteRoutine as createCompleteRoutineAPI } from '../../api/fitFinanceApi';

const RoutineWizard = ({ studentId, studentName, onCancel, onComplete }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estado del wizard
  const [wizardData, setWizardData] = useState({
    // Step 1: Macrociclo
    macrocycle: {
      nombre: '',
      fechaInicio: '',
      fechaFin: '',
      objetivo: ''
    },
    // Step 2: Mesociclos
    mesociclos: [],
    cantidadMesociclos: 1,
    // Step 3: Microciclos
    microciclos: [], // Array de arrays por mesociclo
    // Step 4: Ejercicios por día
    ejerciciosPorDia: [],
    // Calculated data
    timeline: {
      totalDias: 0,
      totalSemanas: 0,
      fechas: {}
    }
  });

  // Inicializar mesociclos automáticamente cuando cambia la cantidad
  useEffect(() => {
    const cantidad = wizardData.cantidadMesociclos;
    if (cantidad > 0 && wizardData.mesociclos.length !== cantidad) {
      const nuevosMesociclos = Array.from({ length: cantidad }, (_, i) => ({
        nombre: `Mesociclo ${i + 1}`,
        fechaInicio: '',
        fechaFin: '',
        objetivo: ''
      }));
      setWizardData(prev => ({
        ...prev,
        mesociclos: nuevosMesociclos
      }));
    }
  }, [wizardData.cantidadMesociclos]);

  // Validaciones por paso
  const validateStep = (step) => {
    console.log('🔍 Validando paso:', step);
    console.log('📊 Estado actual wizardData:', wizardData);
    
    switch (step) {
      case 1: {
        const { nombre, fechaInicio, fechaFin, objetivo } = wizardData.macrocycle;
        console.log('📝 Datos macrociclo:', { nombre, fechaInicio, fechaFin, objetivo });
        
        const isValid = (nombre && nombre.trim()) && fechaInicio && fechaFin && (objetivo && objetivo.trim());
        console.log('✅ ¿Es válido paso 1?:', isValid);
        return isValid;
      }
      case 2:
        return wizardData.mesociclos.length > 0 &&
               wizardData.mesociclos.every(m => m.fechaInicio && m.fechaFin && (m.objetivo && m.objetivo.trim()));
      case 3:
        return wizardData.microciclos.length > 0 &&
               wizardData.microciclos.every(micro => 
                 micro.cantidadMicrociclos > 0 &&
                 micro.plantillaDias &&
                 micro.plantillaDias.some(dia => !dia.esDescanso && dia.ejercicios && dia.ejercicios.length > 0)
               );
      case 4:
        return true; // Preview no requiere validación
      default:
        return false;
    }
  };

  // Navegación
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
      setError(null);
    } else {
      setError('Por favor completa todos los campos requeridos');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const goToStep = (step) => {
    if (step <= currentStep || validateStep(step - 1)) {
      setCurrentStep(step);
      setError(null);
    }
  };

  // Actualizar datos del wizard
  const updateWizardData = (section, data) => {
    setWizardData(prev => {
      if (section === 'macrocycle') {
        return {
          ...prev,
          [section]: { ...prev[section], ...data }
        };
      }
      return {
        ...prev,
        [section]: data
      };
    });
  };

  // 🚀 Crear rutina completa (CONECTADO CON BACKEND)
  const createCompleteRoutine = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🎯 Iniciando creación de rutina con datos:', wizardData);

      // Preparar los datos según el formato del DTO
      const payload = {
        studentId: studentId, // Usar el studentId del prop
        macrocycle: {
          nombre: wizardData.macrocycle.nombre,
          fechaInicio: wizardData.macrocycle.fechaInicio,
          fechaFin: wizardData.macrocycle.fechaFin,
          objetivo: wizardData.macrocycle.objetivo,
        },
        mesociclos: wizardData.mesociclos.map(meso => ({
          nombre: meso.nombre,
          fechaInicio: meso.fechaInicio,
          fechaFin: meso.fechaFin,
          objetivo: meso.objetivo,
        })),
        microciclos: wizardData.microciclos.map(micro => ({
          mesocicloIndex: micro.mesocicloIndex,
          cantidadMicrociclos: micro.cantidadMicrociclos,
          plantillaDias: micro.plantillaDias.map(dia => ({
            dia: dia.dia,
            nombre: dia.nombre,
            esDescanso: dia.esDescanso,
            ejercicios: dia.esDescanso ? [] : dia.ejercicios.map((ej, ejercicioIndex) => ({
              nombre: ej.nombre,
              grupoMuscular: ej.grupoMuscular,
              series: ej.series,
              repeticiones: ej.repeticiones,
              descanso: ej.descanso,
              rirEsperado: ej.rirEsperado,
              orden: ejercicioIndex + 1, // Agregar el orden basado en el índice
            })),
          })),
        })),
      };

      console.log('📤 Enviando payload al backend:', payload);

      // Llamar a la API real
      const result = await createCompleteRoutineAPI(payload);
      
      console.log('✅ Rutina creada exitosamente:', result);
      
      setLoading(false);
      
      // Completar wizard
      setTimeout(() => {
        onComplete && onComplete();
        // Navegar al detalle del macrociclo creado
        if (result.macrocycleId) {
          console.log('🧭 Navegando a rutina creada:', result.macrocycleId);
          // navigate(`/coach/routine/${result.macrocycleId}`);
        }
      }, 1000);

    } catch (err) {
      setLoading(false);
      setError('Error al crear la rutina: ' + (err.response?.data?.message || err.message));
      console.error('❌ Error creando rutina:', err);
    }
  };

  // Estilos
  const isMobile = window.innerWidth < 768;
  
  const wizardStyle = {
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
    padding: isMobile ? '10px' : '20px'
  };

  const containerStyle = {
    maxWidth: isMobile ? '95vw' : '900px',
    maxHeight: isMobile ? '95vh' : '90vh',
    width: '100%',
    margin: '0 auto',
    background: '#222',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: isMobile ? '16px' : '20px',
    textAlign: 'center',
    flexShrink: 0
  };

  const progressStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px'
  };

  const stepIndicatorStyle = (step) => ({
    width: isMobile ? '30px' : '35px',
    height: isMobile ? '30px' : '35px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: isMobile ? '12px' : '14px',
    background: step <= currentStep ? '#ffd700' : '#444',
    color: step <= currentStep ? '#222' : '#888',
    border: step === currentStep ? '2px solid #fff' : 'none'
  });

  const contentStyle = {
    padding: isMobile ? '16px' : '24px',
    flex: 1,
    overflow: 'auto',
    minHeight: 0
  };

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    padding: isMobile ? '16px' : '20px',
    borderTop: '1px solid #333',
    flexShrink: 0
  };

  const buttonStyle = (variant = 'primary') => ({
    padding: isMobile ? '8px 16px' : '10px 20px',
    borderRadius: '6px',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: isMobile ? '14px' : '15px',
    background: variant === 'primary' ? '#ffd700' : 
                variant === 'secondary' ? '#666' : '#444',
    color: variant === 'primary' ? '#222' : '#fff',
    opacity: loading ? 0.7 : 1,
    transition: 'all 0.2s'
  });

  return (
    <div style={wizardStyle}>
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ position: 'relative' }}>
            <h2 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px' }}>
              🧙‍♂️ Crear Rutina Completa
            </h2>
            <button
              onClick={onCancel}
              style={{
                position: 'absolute',
                top: '-5px',
                right: '0',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '16px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              ✕
            </button>
          </div>
          <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: isMobile ? '13px' : '14px' }}>
            Alumno: <strong>{studentName}</strong>
          </p>
          
          {/* Progress Indicator */}
          <div style={progressStyle}>
            {[1, 2, 3, 4, 5].map(step => (
              <div key={step} style={stepIndicatorStyle(step)}>
                {step}
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '8px', fontSize: isMobile ? '12px' : '13px', opacity: 0.8 }}>
            {currentStep === 1 && 'Paso 1: Configurar Macrociclo'}
            {currentStep === 2 && 'Paso 2: Configurar Mesociclos'}
            {currentStep === 3 && 'Paso 3: Configurar Microciclos'}
            {currentStep === 4 && 'Paso 4: Preview y Confirmación'}
            {currentStep === 5 && 'Paso 5: Creando Rutina...'}
          </div>
        </div>

        {/* Content Area */}
        <div style={contentStyle}>
          {error && (
            <div style={{
              background: '#d32f2f',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Step 1: Macrociclo */}
          {currentStep === 1 && (
            <StepMacrocycle 
              data={wizardData.macrocycle}
              onChange={(data) => updateWizardData('macrocycle', data)}
            />
          )}

          {/* Step 2: Mesociclos */}
          {currentStep === 2 && (
            <StepMesociclos 
              cantidadMesociclos={wizardData.cantidadMesociclos}
              mesociclos={wizardData.mesociclos}
              onCantidadChange={(cantidad) => updateWizardData('cantidadMesociclos', cantidad)}
              onMesocicloChange={(index, field, value) => {
                const nuevosMesociclos = [...wizardData.mesociclos];
                nuevosMesociclos[index] = { ...nuevosMesociclos[index], [field]: value };
                updateWizardData('mesociclos', nuevosMesociclos);
              }}
            />
          )}

          {/* Step 3: Microciclos */}
          {currentStep === 3 && (
            <StepMicrociclos 
              mesociclos={wizardData.mesociclos}
              microciclos={wizardData.microciclos}
              onMicrocicloUpdate={(mesocicloIndex, microcicloData) => {
                const nuevosMicrociclos = [...wizardData.microciclos];
                nuevosMicrociclos[mesocicloIndex] = microcicloData;
                updateWizardData('microciclos', nuevosMicrociclos);
              }}
            />
          )}

          {/* Step 4: Preview */}
          {currentStep === 4 && (
            <StepPreview 
              wizardData={wizardData}
              onEdit={(step) => goToStep(step)}
            />
          )}

          {/* Step 5: Creation */}
          {currentStep === 5 && (
            <StepCreation 
              loading={loading}
              onComplete={createCompleteRoutine}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div style={buttonContainerStyle}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={onCancel}
                style={buttonStyle('cancel')}
                disabled={loading}
              >
                Cancelar
              </button>
              {currentStep > 1 && (
                <button 
                  onClick={prevStep}
                  style={buttonStyle('secondary')}
                  disabled={loading}
                >
                  ← Anterior
                </button>
              )}
            </div>
            
            <div>
              {currentStep < 4 ? (
                <button 
                  onClick={nextStep}
                  style={buttonStyle('primary')}
                  disabled={loading}
                >
                  Siguiente →
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentStep(5)}
                  style={buttonStyle('primary')}
                  disabled={loading}
                >
                  🚀 Crear Rutina Completa
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente Step 1: Macrociclo
const StepMacrocycle = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #444',
    background: '#333',
    color: '#fff',
    fontSize: '16px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#ffd700'
  };

  return (
    <div>
      <h3 style={{ color: '#ffd700', marginBottom: '24px', textAlign: 'center' }}>
        📝 Configuración del Macrociclo
      </h3>
      
      <div style={{ display: 'grid', gap: '20px' }}>
        <div>
          <label style={labelStyle}>Nombre del Macrociclo *</label>
          <input
            type="text"
            placeholder="ej: Hipertrofia General, Fuerza Máxima, etc."
            value={data.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Fecha de Inicio *</label>
            <input
              type="date"
              value={data.fechaInicio}
              onChange={(e) => handleChange('fechaInicio', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Fecha de Fin *</label>
            <input
              type="date"
              value={data.fechaFin}
              onChange={(e) => handleChange('fechaFin', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Objetivo *</label>
          <textarea
            placeholder="Describe el objetivo principal de este macrociclo"
            value={data.objetivo}
            onChange={(e) => handleChange('objetivo', e.target.value)}
            rows={3}
            style={{...inputStyle, resize: 'vertical'}}
          />
        </div>
      </div>

      <div style={{ 
        marginTop: '24px', 
        padding: '16px', 
        background: '#1a472a', 
        borderRadius: '8px',
        border: '1px solid #4caf50'
      }}>
        <p style={{ margin: 0, color: '#81c784' }}>
          💡 <strong>Consejo:</strong> Define un nombre descriptivo, fechas realistas y un objetivo claro. 
          En el siguiente paso definirás cuántos mesociclos quieres crear dentro de este macrociclo.
        </p>
      </div>
    </div>
  );
};

// Componente Step 3: Microciclos
const StepMicrociclos = ({ mesociclos, microciclos, onMicrocicloUpdate }) => {
  const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #444',
    background: '#333',
    color: '#fff',
    fontSize: '14px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    color: '#ffd700',
    fontWeight: '600'
  };

  // Inicializar microciclos si no existen
  React.useEffect(() => {
    if (mesociclos.length > 0 && (!microciclos || microciclos.length !== mesociclos.length)) {
      const inicialMicrociclos = mesociclos.map((meso, index) => ({
        mesocicloIndex: index,
        mesocicloNombre: meso.nombre,
        cantidadMicrociclos: 4, // Valor por defecto
        plantillaDias: [
          { dia: 1, nombre: 'Día 1', ejercicios: [], esDescanso: false },
          { dia: 2, nombre: 'Día 2', ejercicios: [], esDescanso: false },
          { dia: 3, nombre: 'Día 3', ejercicios: [], esDescanso: false },
          { dia: 4, nombre: 'Día 4', ejercicios: [], esDescanso: false },
          { dia: 5, nombre: 'Día 5', ejercicios: [], esDescanso: false },
          { dia: 6, nombre: 'Día 6', ejercicios: [], esDescanso: false },
          { dia: 7, nombre: 'Día 7', ejercicios: [], esDescanso: true }
        ]
      }));
      
      // Inicializar todos los microciclos
      inicialMicrociclos.forEach((microData, index) => {
        onMicrocicloUpdate(index, microData);
      });
    }
  }, [mesociclos, onMicrocicloUpdate]);

  const handleCantidadChange = (mesocicloIndex, cantidad) => {
    const microActual = microciclos[mesocicloIndex] || {};
    onMicrocicloUpdate(mesocicloIndex, {
      ...microActual,
      cantidadMicrociclos: cantidad
    });
  };

  const handleEjercicioAdd = (mesocicloIndex, diaIndex) => {
    const microActual = microciclos[mesocicloIndex] || {};
    const nuevaPlantilla = [...(microActual.plantillaDias || [])];
    
    if (!nuevaPlantilla[diaIndex]) {
      nuevaPlantilla[diaIndex] = { dia: diaIndex + 1, nombre: `Día ${diaIndex + 1}`, ejercicios: [] };
    }
    
    nuevaPlantilla[diaIndex].ejercicios.push({
      nombre: '',
      grupoMuscular: '',
      series: '',
      repeticiones: '',
      descanso: '',
      rirEsperado: ''
    });

    onMicrocicloUpdate(mesocicloIndex, {
      ...microActual,
      plantillaDias: nuevaPlantilla
    });
  };

  const handleEjercicioChange = (mesocicloIndex, diaIndex, ejercicioIndex, field, value) => {
    const microActual = microciclos[mesocicloIndex] || {};
    const nuevaPlantilla = [...(microActual.plantillaDias || [])];
    
    if (nuevaPlantilla[diaIndex] && nuevaPlantilla[diaIndex].ejercicios[ejercicioIndex]) {
      nuevaPlantilla[diaIndex].ejercicios[ejercicioIndex][field] = value;
      
      onMicrocicloUpdate(mesocicloIndex, {
        ...microActual,
        plantillaDias: nuevaPlantilla
      });
    }
  };

  const handleEjercicioRemove = (mesocicloIndex, diaIndex, ejercicioIndex) => {
    const microActual = microciclos[mesocicloIndex] || {};
    const nuevaPlantilla = [...(microActual.plantillaDias || [])];
    
    if (nuevaPlantilla[diaIndex]) {
      nuevaPlantilla[diaIndex].ejercicios.splice(ejercicioIndex, 1);
      
      onMicrocicloUpdate(mesocicloIndex, {
        ...microActual,
        plantillaDias: nuevaPlantilla
      });
    }
  };

  const handleDiaEliminar = (mesocicloIndex, diaIndex) => {
    const microActual = microciclos[mesocicloIndex] || {};
    const nuevaPlantilla = [...(microActual.plantillaDias || [])];
    
    // Marcar día como descanso (sin ejercicios)
    nuevaPlantilla[diaIndex] = {
      ...nuevaPlantilla[diaIndex],
      ejercicios: [],
      esDescanso: true
    };

    onMicrocicloUpdate(mesocicloIndex, {
      ...microActual,
      plantillaDias: nuevaPlantilla
    });
  };

  return (
    <div>
      <h3 style={{ color: '#ffd700', marginBottom: '24px', textAlign: 'center' }}>
        📆 Configurar Microciclos (Plantilla)
      </h3>

      <div style={{
        marginBottom: '24px',
        padding: '16px',
        background: '#1a472a',
        borderRadius: '8px',
        border: '1px solid #4caf50'
      }}>
        <p style={{ margin: 0, color: '#81c784', fontSize: '14px' }}>
          💡 <strong>Cómo funciona:</strong> Configura 1 microciclo plantilla con sus días y ejercicios. 
          Este patrón se repetirá automáticamente según la cantidad que especifiques.
        </p>
      </div>

      {/* Por cada mesociclo */}
      {mesociclos.map((meso, mesocicloIndex) => {
        const microData = microciclos[mesocicloIndex] || {};
        
        return (
          <div key={mesocicloIndex} style={{
            marginBottom: '32px',
            padding: '24px',
            background: '#2a2a2a',
            borderRadius: '12px',
            border: '2px solid #667eea'
          }}>
            <h4 style={{ color: '#667eea', marginBottom: '20px' }}>
              📋 {meso.nombre}
            </h4>

            {/* Cantidad de microciclos */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>
                Cantidad de microciclos a crear:
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={microData.cantidadMicrociclos || 4}
                onChange={(e) => handleCantidadChange(mesocicloIndex, parseInt(e.target.value) || 1)}
                style={{...inputStyle, maxWidth: '120px'}}
              />
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#ccc' }}>
                Se crearán {microData.cantidadMicrociclos || 4} microciclos idénticos con esta plantilla
              </p>
            </div>

            {/* Plantilla de días */}
            <div>
              <h5 style={{ color: '#ffd700', marginBottom: '16px' }}>
                🗓️ Plantilla de Microciclo (7 días)
              </h5>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                {(microData.plantillaDias || []).map((dia, diaIndex) => (
                  <div key={diaIndex} style={{
                    padding: '16px',
                    background: '#1a1a1a',
                    borderRadius: '8px',
                    border: dia.esDescanso ? '2px solid #ff9800' : '2px solid #4caf50'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '12px'
                    }}>
                      <h6 style={{ 
                        color: dia.esDescanso ? '#ff9800' : '#4caf50', 
                        margin: 0,
                        fontWeight: 'bold'
                      }}>
                        {dia.nombre} {dia.esDescanso ? '(Descanso)' : ''}
                      </h6>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {!dia.esDescanso && (
                          <button
                            onClick={() => handleEjercicioAdd(mesocicloIndex, diaIndex)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: 'none',
                              background: '#4caf50',
                              color: '#fff',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            + Ejercicio
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDiaEliminar(mesocicloIndex, diaIndex)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            background: '#ff9800',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          {dia.esDescanso ? 'Activar' : 'Descanso'}
                        </button>
                      </div>
                    </div>

                    {/* Ejercicios del día */}
                    {!dia.esDescanso && dia.ejercicios && dia.ejercicios.map((ejercicio, ejercicioIndex) => (
                      <div key={ejercicioIndex} style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr auto',
                        gap: '8px',
                        alignItems: 'center',
                        marginBottom: '8px',
                        padding: '8px',
                        background: '#333',
                        borderRadius: '4px'
                      }}>
                        <input
                          type="text"
                          placeholder="Nombre del ejercicio"
                          value={ejercicio.nombre}
                          onChange={(e) => handleEjercicioChange(mesocicloIndex, diaIndex, ejercicioIndex, 'nombre', e.target.value)}
                          style={{...inputStyle, padding: '6px'}}
                        />
                        
                        <input
                          type="text"
                          placeholder="Grupo muscular"
                          value={ejercicio.grupoMuscular}
                          onChange={(e) => handleEjercicioChange(mesocicloIndex, diaIndex, ejercicioIndex, 'grupoMuscular', e.target.value)}
                          style={{...inputStyle, padding: '6px'}}
                        />
                        
                        <input
                          type="text"
                          placeholder="Series"
                          value={ejercicio.series}
                          onChange={(e) => handleEjercicioChange(mesocicloIndex, diaIndex, ejercicioIndex, 'series', e.target.value)}
                          style={{...inputStyle, padding: '6px'}}
                        />
                        
                        <input
                          type="text"
                          placeholder="Reps"
                          value={ejercicio.repeticiones}
                          onChange={(e) => handleEjercicioChange(mesocicloIndex, diaIndex, ejercicioIndex, 'repeticiones', e.target.value)}
                          style={{...inputStyle, padding: '6px'}}
                        />
                        
                        <input
                          type="text"
                          placeholder="Descanso"
                          value={ejercicio.descanso}
                          onChange={(e) => handleEjercicioChange(mesocicloIndex, diaIndex, ejercicioIndex, 'descanso', e.target.value)}
                          style={{...inputStyle, padding: '6px'}}
                        />
                        
                        <input
                          type="text"
                          placeholder="RIR esperado"
                          value={ejercicio.rirEsperado}
                          onChange={(e) => handleEjercicioChange(mesocicloIndex, diaIndex, ejercicioIndex, 'rirEsperado', e.target.value)}
                          style={{...inputStyle, padding: '6px'}}
                        />
                        
                        <button
                          onClick={() => handleEjercicioRemove(mesocicloIndex, diaIndex, ejercicioIndex)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            background: '#d32f2f',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Mensaje cuando no hay ejercicios */}
                    {!dia.esDescanso && (!dia.ejercicios || dia.ejercicios.length === 0) && (
                      <p style={{ 
                        color: '#666', 
                        fontStyle: 'italic', 
                        textAlign: 'center',
                        margin: '8px 0'
                      }}>
                        Haz clic en "+ Ejercicio" para agregar ejercicios a este día
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen del mesociclo */}
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: '#1a472a',
              borderRadius: '6px',
              border: '1px solid #4caf50'
            }}>
              <p style={{ margin: 0, color: '#81c784', fontSize: '13px' }}>
                📊 <strong>Resumen:</strong> Se crearán {microData.cantidadMicrociclos || 4} microciclos. 
                Total de días de entrenamiento: {((microData.plantillaDias || []).filter(d => !d.esDescanso).length * (microData.cantidadMicrociclos || 4))}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Componente Step 2: Mesociclos
const StepMesociclos = ({ cantidadMesociclos, mesociclos, onCantidadChange, onMesocicloChange }) => {
  const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #444',
    background: '#333',
    color: '#fff',
    fontSize: '14px'
  };

  return (
    <div>
      <h3 style={{ color: '#ffd700', marginBottom: '24px', textAlign: 'center' }}>
        📅 Configuración de Mesociclos
      </h3>

      {/* Configuración de cantidad */}
      <div style={{ 
        padding: '20px',
        background: '#2a2a2a',
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#ffd700' }}>
          ¿Cuántos mesociclos quieres crear? *
        </label>
        <input
          type="number"
          min="1"
          max="6"
          value={cantidadMesociclos}
          onChange={(e) => onCantidadChange(parseInt(e.target.value) || 1)}
          style={{...inputStyle, maxWidth: '120px'}}
        />
        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#ccc' }}>
          Recomendado: 2-4 mesociclos por macrociclo
        </p>
      </div>

      {/* Lista de mesociclos */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {mesociclos.map((meso, index) => (
          <div key={index} style={{
            padding: '20px',
            background: '#1a1a1a',
            borderRadius: '8px',
            border: '2px solid #ffd700'
          }}>
            <h4 style={{ color: '#ffd700', marginBottom: '16px' }}>
              {meso.nombre}
            </h4>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#ccc' }}>
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    value={meso.fechaInicio}
                    onChange={(e) => onMesocicloChange(index, 'fechaInicio', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#ccc' }}>
                    Fecha de Fin *
                  </label>
                  <input
                    type="date"
                    value={meso.fechaFin}
                    onChange={(e) => onMesocicloChange(index, 'fechaFin', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#ccc' }}>
                  Objetivo del Mesociclo *
                </label>
                <textarea
                  placeholder="ej: Adaptación anatómica, Desarrollo de fuerza, etc."
                  value={meso.objetivo}
                  onChange={(e) => onMesocicloChange(index, 'objetivo', e.target.value)}
                  rows={2}
                  style={{...inputStyle, resize: 'vertical'}}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: '#1a472a',
        borderRadius: '8px',
        border: '1px solid #4caf50'
      }}>
        <p style={{ margin: 0, color: '#81c784' }}>
          💡 <strong>Tip:</strong> Cada mesociclo debe tener un objetivo específico y fechas coherentes con el macrociclo.
          En el siguiente paso configurarás los microciclos para cada mesociclo.
        </p>
      </div>
    </div>
  );
};

// Componente Step 4: Preview
const StepPreview = ({ wizardData, onEdit }) => {
  // Calcular totales
  const totalMesociclos = wizardData.mesociclos.length;
  const totalMicrociclos = wizardData.microciclos.reduce((total, micro) => total + (micro.cantidadMicrociclos || 0), 0);
  const totalDiasEntrenamiento = wizardData.microciclos.reduce((total, micro) => {
    const diasConEjercicios = (micro.plantillaDias || []).filter(dia => !dia.esDescanso && dia.ejercicios && dia.ejercicios.length > 0).length;
    return total + (diasConEjercicios * (micro.cantidadMicrociclos || 0));
  }, 0);

  const cardStyle = {
    padding: '20px',
    background: '#2a2a2a',
    borderRadius: '12px',
    marginBottom: '16px'
  };

  const editButtonStyle = {
    padding: '6px 12px',
    borderRadius: '4px',
    border: 'none',
    background: '#ffd700',
    color: '#222',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
  };

  return (
    <div>
      <h3 style={{ color: '#ffd700', marginBottom: '24px', textAlign: 'center' }}>
        👀 Preview de la Rutina Completa
      </h3>

      {/* Resumen general */}
      <div style={{
        ...cardStyle,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        <h4 style={{ margin: '0 0 12px 0' }}>📊 Resumen General</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalMesociclos}</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Mesociclos</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalMicrociclos}</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Microciclos</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalDiasEntrenamiento}</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Días de Entrenamiento</div>
          </div>
        </div>
      </div>

      {/* Macrociclo */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ color: '#ffd700', margin: 0 }}>🎯 Macrociclo</h4>
          <button onClick={() => onEdit(1)} style={editButtonStyle}>
            Editar
          </button>
        </div>
        <div style={{ color: '#ccc' }}>
          <p><strong>Nombre:</strong> {wizardData.macrocycle.nombre}</p>
          <p><strong>Objetivo:</strong> {wizardData.macrocycle.objetivo}</p>
          <p><strong>Período:</strong> {wizardData.macrocycle.fechaInicio} → {wizardData.macrocycle.fechaFin}</p>
        </div>
      </div>

      {/* Mesociclos */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ color: '#667eea', margin: 0 }}>
            📅 Mesociclos ({totalMesociclos})
          </h4>
          <button onClick={() => onEdit(2)} style={editButtonStyle}>
            Editar
          </button>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gap: '12px'
        }}>
          {wizardData.mesociclos.map((meso, index) => (
            <div key={index} style={{
              padding: '12px',
              background: '#1a1a1a',
              borderRadius: '6px',
              border: '1px solid #667eea'
            }}>
              <div style={{ fontWeight: 'bold', color: '#667eea', marginBottom: '4px' }}>{meso.nombre}</div>
              <div style={{ color: '#ccc', fontSize: '14px' }}>
                <div><strong>Objetivo:</strong> {meso.objetivo}</div>
                <div><strong>Período:</strong> {meso.fechaInicio} → {meso.fechaFin}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Microciclos */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ color: '#4caf50', margin: 0 }}>
            � Plantillas de Microciclos
          </h4>
          <button onClick={() => onEdit(3)} style={editButtonStyle}>
            Editar
          </button>
        </div>

        {wizardData.microciclos.map((micro, index) => (
          <div key={index} style={{
            marginBottom: '16px',
            padding: '16px',
            background: '#1a1a1a',
            borderRadius: '8px',
            border: '1px solid #4caf50'
          }}>
            <h5 style={{ color: '#4caf50', marginBottom: '12px' }}>
              {micro.mesocicloNombre} - {micro.cantidadMicrociclos} microciclos
            </h5>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
              {(micro.plantillaDias || []).map((dia, diaIndex) => (
                <div key={diaIndex} style={{
                  padding: '8px',
                  background: dia.esDescanso ? '#333' : '#2a5e2a',
                  borderRadius: '4px',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontWeight: 'bold', color: dia.esDescanso ? '#ff9800' : '#4caf50' }}>
                    {dia.nombre}
                  </div>
                  <div style={{ color: '#ccc', marginTop: '4px' }}>
                    {dia.esDescanso ? 'Descanso' : `${dia.ejercicios ? dia.ejercicios.length : 0} ejercicios`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmación */}
      <div style={{
        ...cardStyle,
        background: '#1a472a',
        border: '2px solid #4caf50',
        textAlign: 'center'
      }}>
        <h4 style={{ color: '#81c784', margin: '0 0 12px 0' }}>
          ✅ ¿Todo se ve correcto?
        </h4>
        <p style={{ color: '#a5d6a7', margin: 0, fontSize: '14px' }}>
          Revisa la información anterior. Una vez que hagas clic en &quot;Crear Rutina Completa&quot;, 
          se creará todo el plan de entrenamiento para el alumno.
        </p>
      </div>
    </div>
  );
};

// Componente Step 5: Creación
const StepCreation = ({ loading, onComplete }) => {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      {loading ? (
        <div>
          <div style={{
            width: '80px',
            height: '80px',
            border: '4px solid #333',
            borderTop: '4px solid #ffd700',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }} />
          <h3 style={{ color: '#ffd700', marginBottom: '16px' }}>
            🚀 Creando rutina completa...
          </h3>
          <p style={{ color: '#ccc', fontSize: '14px' }}>
            Por favor espera mientras procesamos toda la información.
          </p>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <h3 style={{ color: '#4caf50', marginBottom: '16px' }}>
            ¡Rutina creada exitosamente!
          </h3>
          <p style={{ color: '#ccc', marginBottom: '24px' }}>
            La rutina completa ha sido creada y asignada al alumno.
          </p>
          <button
            onClick={onComplete}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: '#4caf50',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Continuar
          </button>
        </div>
      )}
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default RoutineWizard;
