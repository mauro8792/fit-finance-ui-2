import { useState, useEffect } from 'react';
import { getEnvVariables } from '../helpers';

const { VITE_API_URL } = getEnvVariables();

/**
 * Selector en cascada de ejercicios del catálogo
 * 1. Primero selecciona el grupo muscular
 * 2. Luego selecciona el ejercicio específico de ese grupo
 */
const ExerciseCatalogSelector = ({ value, onChange, style }) => {
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar grupos musculares al montar
  useEffect(() => {
    loadMuscleGroups();
  }, []);

  // Cargar ejercicios cuando cambia el grupo seleccionado
  useEffect(() => {
    if (selectedGroup) {
      loadExercises(selectedGroup);
    } else {
      setExercises([]);
    }
  }, [selectedGroup]);

  const loadMuscleGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${VITE_API_URL}/exercise-catalog/muscle-groups`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMuscleGroups(data);
      } else {
        setError('Error al cargar grupos musculares');
      }
    } catch (err) {
      setError('Error de red al cargar grupos musculares');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadExercises = async (muscleGroup) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${VITE_API_URL}/exercise-catalog?muscleGroup=${encodeURIComponent(muscleGroup)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setExercises(data);
      } else {
        setError('Error al cargar ejercicios');
      }
    } catch (err) {
      setError('Error de red al cargar ejercicios');
      console.error(err);
    }
  };

  const handleGroupChange = (e) => {
    const group = e.target.value;
    setSelectedGroup(group);
    setSelectedExercise(null);
    
    // Limpiar selección de ejercicio
    if (onChange) {
      onChange({
        exerciseId: null,
        nombre: '',
        grupoMuscular: group
      });
    }
  };

  const handleExerciseChange = (e) => {
    const exerciseId = parseInt(e.target.value);
    const exercise = exercises.find(ex => ex.id === exerciseId);
    
    if (exercise) {
      setSelectedExercise(exercise);
      
      if (onChange) {
        onChange({
          exerciseId: exercise.id,
          nombre: exercise.name,
          grupoMuscular: exercise.muscleGroup
        });
      }
    }
  };

  const selectStyle = {
    padding: '6px',
    borderRadius: '4px',
    border: '1px solid #444',
    background: '#333',
    color: '#fff',
    fontSize: '13px',
    boxSizing: 'border-box',
    width: '100%',
    minWidth: 0,
    ...style
  };

  if (loading) {
    return (
      <div style={{ color: '#aaa', fontSize: '13px', fontStyle: 'italic' }}>
        Cargando catálogo...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: '#f44336', fontSize: '13px' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
      {/* Selector de grupo muscular */}
      <select
        value={selectedGroup}
        onChange={handleGroupChange}
        style={selectStyle}
      >
        <option value="">Grupo muscular</option>
        {muscleGroups.map((group, index) => (
          <option key={index} value={group}>
            {group}
          </option>
        ))}
      </select>

      {/* Selector de ejercicio */}
      <select
        value={selectedExercise?.id || ''}
        onChange={handleExerciseChange}
        disabled={!selectedGroup}
        style={{
          ...selectStyle,
          opacity: selectedGroup ? 1 : 0.5
        }}
      >
        <option value="">
          {selectedGroup ? 'Selecciona ejercicio' : 'Primero elige grupo'}
        </option>
        {exercises.map((exercise) => (
          <option key={exercise.id} value={exercise.id}>
            {exercise.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ExerciseCatalogSelector;
