import { useState, useEffect } from 'react';
import {
  getNutritionProfile,
  createOrUpdateNutritionProfile,
  calculateSuggestedCalories,
} from '../../api/nutritionApi';

const NutritionProfileCard = ({ studentId, studentName, isOpen, onClose, onSave }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(isOpen || false); // Puede abrirse directamente en modo edición
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Si isOpen cambia externamente, actualizar editing
  useEffect(() => {
    if (isOpen !== undefined) {
      setEditing(isOpen);
    }
  }, [isOpen]);
  
  // Form state
  const [formData, setFormData] = useState({
    sex: 'M',
    age: 25,
    currentWeight: 70,
    heightCm: 170,
    bodyFatPercentage: 15,
    trainingDaysPerWeek: 4,
    activityFactor: 0.15,
    targetDailyCalories: 2000,
    targetProteinGrams: 140,
    targetCarbsGrams: 200,
    targetFatGrams: 55,
    notes: '',
  });
  
  // Objetivo: deficit, maintenance, surplus
  const [goal, setGoal] = useState('maintenance');
  const [lastCalculation, setLastCalculation] = useState(null); // Guardar último cálculo base

  const isMobile = window.innerWidth < 600;

  useEffect(() => {
    loadProfile();
  }, [studentId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNutritionProfile(studentId);
      if (data) {
        setProfile(data);
        setFormData({
          sex: data.sex || 'M',
          age: data.age || 25,
          currentWeight: data.currentWeight || 70,
          heightCm: data.heightCm || 170,
          bodyFatPercentage: data.bodyFatPercentage || 15,
          trainingDaysPerWeek: data.trainingDaysPerWeek || 4,
          activityFactor: data.activityFactor || 0.15,
          targetDailyCalories: data.targetDailyCalories || 2000,
          targetProteinGrams: data.targetProteinGrams || 140,
          targetCarbsGrams: data.targetCarbsGrams || 200,
          targetFatGrams: data.targetFatGrams || 55,
          notes: data.notes || '',
        });
      }
    } catch (err) {
      // Si no hay perfil, no es error crítico
      console.log('No hay perfil nutricional aún');
    } finally {
      setLoading(false);
    }
  };

  const [calculating, setCalculating] = useState(false);

  const GOAL_CONFIG = {
    deficit: { label: '🔥 Bajar de peso', factor: 0.85, description: '-15% calorías' },
    maintenance: { label: '⚖️ Mantener peso', factor: 1.0, description: 'Sin cambios' },
    surplus: { label: '💪 Subir de peso', factor: 1.10, description: '+10% calorías' },
  };

  // Función para aplicar el objetivo a un cálculo base
  const applyGoalToCalculation = (maintenance, weight, selectedGoal) => {
    const goalFactor = GOAL_CONFIG[selectedGoal].factor;
    const adjustedCalories = Math.round(maintenance * goalFactor);
    
    // Recalcular macros para las calorías ajustadas
    const protein = Math.round(weight * 1.8); // 1.8g/kg
    const fat = Math.round(weight * 0.8);      // 0.8g/kg
    const proteinCal = protein * 4;
    const fatCal = fat * 9;
    const carbsCal = adjustedCalories - proteinCal - fatCal;
    const carbs = Math.max(Math.round(carbsCal / 4), 100);
    
    return { adjustedCalories, protein, carbs, fat };
  };

  // Cuando cambia el objetivo, recalcular si hay un cálculo previo
  const handleGoalChange = (newGoal) => {
    setGoal(newGoal);
    
    if (lastCalculation) {
      const { adjustedCalories, protein, carbs, fat } = applyGoalToCalculation(
        lastCalculation.maintenance,
        lastCalculation.weight,
        newGoal
      );
      
      setFormData(prev => ({
        ...prev,
        targetDailyCalories: adjustedCalories,
        targetProteinGrams: protein,
        targetCarbsGrams: carbs,
        targetFatGrams: fat,
      }));
      
      const goalLabel = GOAL_CONFIG[newGoal].label;
      setSuccessMessage(`${goalLabel}: ${adjustedCalories} kcal (de ${lastCalculation.maintenance} kcal mantenimiento)`);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleCalculateSuggested = async () => {
    try {
      setCalculating(true);
      setError(null);
      
      const result = await calculateSuggestedCalories({
        weight: parseFloat(formData.currentWeight),
        heightCm: parseFloat(formData.heightCm),
        age: parseInt(formData.age),
        sex: formData.sex,
        activityFactor: parseFloat(formData.activityFactor),
        trainingDaysPerWeek: parseInt(formData.trainingDaysPerWeek),
      });
      
      console.log('Resultado cálculo:', result);
      
      // Guardar cálculo base para cambios de objetivo
      const weight = parseFloat(formData.currentWeight);
      setLastCalculation({ maintenance: result.maintenance, weight, tmb: result.tmb });
      
      // Aplicar objetivo
      const { adjustedCalories, protein, carbs, fat } = applyGoalToCalculation(
        result.maintenance,
        weight,
        goal
      );
      
      setFormData(prev => ({
        ...prev,
        targetDailyCalories: adjustedCalories,
        targetProteinGrams: protein,
        targetCarbsGrams: carbs,
        targetFatGrams: fat,
      }));
      
      const goalLabel = GOAL_CONFIG[goal].label;
      setSuccessMessage(`✅ TMB: ${result.tmb} kcal | Mantenimiento: ${result.maintenance} kcal | ${goalLabel}: ${adjustedCalories} kcal`);
      setTimeout(() => setSuccessMessage(null), 8000);
    } catch (err) {
      console.error('Error calculando calorías:', err);
      setError('Error al calcular. Verificá los datos ingresados.');
    } finally {
      setCalculating(false);
    }
  };

  // Calcular calorías automáticamente: (P × 4) + (C × 4) + (G × 9)
  const calculateCaloriesFromMacros = (protein, carbs, fat) => {
    const p = parseInt(protein) || 0;
    const c = parseInt(carbs) || 0;
    const f = parseInt(fat) || 0;
    return (p * 4) + (c * 4) + (f * 9);
  };

  // Cuando cambia un macro, recalcular calorías
  const handleMacroChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    
    // Recalcular calorías con los nuevos valores
    const newCalories = calculateCaloriesFromMacros(
      field === 'targetProteinGrams' ? value : newFormData.targetProteinGrams,
      field === 'targetCarbsGrams' ? value : newFormData.targetCarbsGrams,
      field === 'targetFatGrams' ? value : newFormData.targetFatGrams
    );
    
    setFormData({
      ...newFormData,
      targetDailyCalories: newCalories,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      await createOrUpdateNutritionProfile(studentId, {
        ...formData,
        currentWeight: parseFloat(formData.currentWeight),
        heightCm: parseFloat(formData.heightCm),
        age: parseInt(formData.age),
        bodyFatPercentage: parseFloat(formData.bodyFatPercentage),
        trainingDaysPerWeek: parseInt(formData.trainingDaysPerWeek),
        activityFactor: parseFloat(formData.activityFactor),
        targetDailyCalories: parseInt(formData.targetDailyCalories),
        targetProteinGrams: parseInt(formData.targetProteinGrams),
        targetCarbsGrams: parseInt(formData.targetCarbsGrams),
        targetFatGrams: parseInt(formData.targetFatGrams),
      });
      
      setSuccessMessage('✅ Objetivos guardados correctamente');
      setEditing(false);
      loadProfile();
      
      // Llamar callbacks externos si existen
      if (onSave) {
        const savedProfile = await getNutritionProfile(studentId);
        onSave(savedProfile);
      }
      if (onClose) onClose();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Error al guardar los objetivos');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #444',
    background: '#2a2a2a',
    color: '#fff',
    fontSize: 14,
    width: '100%',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4,
    display: 'block',
  };

  const macroBoxStyle = (color) => ({
    background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`,
    border: `1px solid ${color}44`,
    borderRadius: 10,
    padding: 12,
    textAlign: 'center',
    flex: 1,
    minWidth: 80,
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 20, color: 'rgba(255,255,255,0.7)' }}>
        Cargando...
      </div>
    );
  }

  // Vista resumida (sin perfil o no editando)
  if (!editing && !profile) {
    return (
      <div style={{ textAlign: 'center', padding: 16 }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>🎯</div>
        <div style={{ fontSize: 14, color: '#fff', marginBottom: 12 }}>
          Sin objetivos nutricionales
        </div>
        <button
          onClick={() => setEditing(true)}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: 'rgba(0,0,0,0.4)',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          ➕ Configurar Objetivos
        </button>
      </div>
    );
  }

  // Vista resumida con perfil existente
  if (!editing && profile) {
    return (
      <div style={{ padding: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>🎯 Objetivos</span>
          <button
            onClick={() => setEditing(true)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: 'none',
              background: 'rgba(0,0,0,0.4)',
              color: '#fff',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            ✏️ Editar
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>
            {profile.targetDailyCalories}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>kcal/día</div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>
              {profile.targetProteinGrams}g
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Proteína</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6' }}>
              {profile.targetCarbsGrams}g
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Carbos</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>
              {profile.targetFatGrams}g
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Grasas</div>
          </div>
        </div>

        {profile.currentWeight && (
          <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
            Peso: {profile.currentWeight}kg | {profile.trainingDaysPerWeek}x/sem
          </div>
        )}
      </div>
    );
  }

  // Formulario de edición (modal/overlay) - HORIZONTAL
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setEditing(false);
          if (onClose) onClose();
        }
      }}
    >
      <div
        style={{
          background: '#1a1a1a',
          borderRadius: 16,
          width: '100%',
          maxWidth: 900,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: 16,
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
              🎯 Objetivos Nutricionales
            </div>
            <div style={{ fontSize: 12, color: '#888' }}>{studentName}</div>
          </div>
          <button
            onClick={() => {
              setEditing(false);
              if (onClose) onClose();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: 24,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content - Layout horizontal 2 columnas */}
        <div style={{
          padding: 16,
          overflowY: 'auto',
          flex: 1,
        }}>
          {/* Mensajes de error/éxito */}
          {error && (
            <div style={{
              background: '#ef444422',
              border: '1px solid #ef4444',
              borderRadius: 8,
              padding: 10,
              marginBottom: 12,
              color: '#ef4444',
              fontSize: 13,
            }}>
              {error}
            </div>
          )}

          {successMessage && (
            <div style={{
              background: '#22c55e22',
              border: '1px solid #22c55e',
              borderRadius: 8,
              padding: 10,
              marginBottom: 12,
              color: '#22c55e',
              fontSize: 13,
            }}>
              {successMessage}
            </div>
          )}

          {/* Grid de 2 columnas */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            
            {/* COLUMNA IZQUIERDA - Datos del alumno */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>
                📋 Datos del alumno
              </div>
              
              {/* Fila 1: Sexo, Edad, Peso, Altura */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Sexo</label>
                  <select
                    value={formData.sex}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="M">M</option>
                    <option value="F">F</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Edad</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1.5 }}>
                  <label style={labelStyle}>Peso (kg)</label>
                  <input
                    type="number"
                    value={formData.currentWeight}
                    onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1.5 }}>
                  <label style={labelStyle}>Altura (cm)</label>
                  <input
                    type="number"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Fila 2: %Grasa, Días, Actividad */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>% Grasa</label>
                  <input
                    type="number"
                    value={formData.bodyFatPercentage}
                    onChange={(e) => setFormData({ ...formData, bodyFatPercentage: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Días/sem</label>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={formData.trainingDaysPerWeek}
                    onChange={(e) => setFormData({ ...formData, trainingDaysPerWeek: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={labelStyle}>Actividad</label>
                  <select
                    value={formData.activityFactor}
                    onChange={(e) => setFormData({ ...formData, activityFactor: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="0.10">Sedentario</option>
                    <option value="0.15">Ligero</option>
                    <option value="0.20">Moderado</option>
                    <option value="0.25">Activo</option>
                    <option value="0.30">Muy activo</option>
                  </select>
                </div>
              </div>

              {/* Selector de objetivo */}
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>🎯 Objetivo</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {Object.entries(GOAL_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleGoalChange(key)}
                      style={{
                        flex: 1,
                        padding: '8px 4px',
                        borderRadius: 6,
                        border: goal === key ? '2px solid #22c55e' : '1px solid #444',
                        background: goal === key 
                          ? key === 'deficit' ? '#ef444433' 
                          : key === 'surplus' ? '#3b82f633' 
                          : '#22c55e33'
                          : '#2a2a2a',
                        color: goal === key ? '#fff' : '#aaa',
                        cursor: 'pointer',
                        fontSize: 10,
                        fontWeight: goal === key ? 600 : 400,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 16, marginBottom: 2 }}>
                        {key === 'deficit' ? '🔥' : key === 'surplus' ? '💪' : '⚖️'}
                      </div>
                      <div>{key === 'deficit' ? 'Bajar' : key === 'surplus' ? 'Subir' : 'Mantener'}</div>
                      <div style={{ fontSize: 9, opacity: 0.7 }}>{config.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCalculateSuggested}
                disabled={calculating}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 8,
                  border: '1px solid #667eea',
                  background: calculating ? '#667eea22' : 'transparent',
                  color: '#667eea',
                  fontWeight: 600,
                  cursor: calculating ? 'wait' : 'pointer',
                  fontSize: 13,
                }}
              >
                {calculating ? '⏳ Calculando...' : '🧮 Calcular calorías'}
              </button>
            </div>

            {/* COLUMNA DERECHA - Objetivos */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>
                🎯 Objetivos diarios
              </div>

              {/* Calorías destacadas - AUTOMÁTICAS */}
              <div style={{ 
                background: 'linear-gradient(135deg, #22c55e22 0%, #16a34a11 100%)',
                border: '2px solid #22c55e',
                borderRadius: 12,
                padding: 16,
                textAlign: 'center',
                marginBottom: 12,
              }}>
                <label style={{ ...labelStyle, color: '#22c55e', fontSize: 11 }}>CALORÍAS DIARIAS (auto)</label>
                <div style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: '#22c55e',
                  marginBottom: 4,
                }}>
                  {formData.targetDailyCalories}
                </div>
                <span style={{ color: '#22c55e', fontSize: 14, fontWeight: 600 }}>kcal</span>
                <div style={{ fontSize: 9, color: '#888', marginTop: 6 }}>
                  (P×4) + (C×4) + (G×9)
                </div>
              </div>

              {/* Macros en fila */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <div style={macroBoxStyle('#ef4444')}>
                  <label style={{ ...labelStyle, color: '#ef4444', fontSize: 10 }}>PROTEÍNA 🥩</label>
                  <input
                    type="number"
                    value={formData.targetProteinGrams}
                    onChange={(e) => handleMacroChange('targetProteinGrams', e.target.value)}
                    style={{
                      ...inputStyle,
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  />
                  <span style={{ color: '#ef4444', fontSize: 11 }}>g</span>
                </div>
                <div style={macroBoxStyle('#3b82f6')}>
                  <label style={{ ...labelStyle, color: '#3b82f6', fontSize: 10 }}>CARBOS 💧</label>
                  <input
                    type="number"
                    value={formData.targetCarbsGrams}
                    onChange={(e) => handleMacroChange('targetCarbsGrams', e.target.value)}
                    style={{
                      ...inputStyle,
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  />
                  <span style={{ color: '#3b82f6', fontSize: 11 }}>g</span>
                </div>
                <div style={macroBoxStyle('#f59e0b')}>
                  <label style={{ ...labelStyle, color: '#f59e0b', fontSize: 10 }}>GRASAS 🧈</label>
                  <input
                    type="number"
                    value={formData.targetFatGrams}
                    onChange={(e) => handleMacroChange('targetFatGrams', e.target.value)}
                    style={{
                      ...inputStyle,
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  />
                  <span style={{ color: '#f59e0b', fontSize: 11 }}>g</span>
                </div>
              </div>

              {/* Notas */}
              <div>
                <label style={labelStyle}>Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Indicaciones especiales..."
                  style={{
                    ...inputStyle,
                    minHeight: 60,
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: 16,
          borderTop: '1px solid #333',
          display: 'flex',
          gap: 12,
        }}>
          <button
            onClick={() => {
              setEditing(false);
              if (onClose) onClose();
            }}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 8,
              border: '1px solid #444',
              background: 'transparent',
              color: '#aaa',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#fff',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Guardando...' : '✓ Guardar Objetivos'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NutritionProfileCard;

