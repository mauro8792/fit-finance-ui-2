import React, { useState } from 'react';
import ExerciseCatalogSelector from './ExerciseCatalogSelector';
import CreateExerciseDialog from './CreateExerciseDialog';

const defaultSet = { reps: 0, load: 0, expectedRir: 0, actualRir: 0, actualRpe: 0, notes: '' };
const defaultExercise = { name: '', muscle: '', type: '', repRange: '', tempo: '', sets: [ { ...defaultSet } ] };
const defaultDay = (n) => ({ number: n, date: '', exercises: [] });

export default function MicrocycleEditor({ initialStructure, onSubmit, mesocycleId, createMicrocycle }) {
  const [microcycleCount, setMicrocycleCount] = useState(1);
  // Si hay estructura previa, la usamos, sino arrancamos sin días
  const [days, setDays] = useState(
    initialStructure?.days?.length > 0
      ? initialStructure.days.map((d, i) => ({ ...d, number: i + 1 }))
      : []
  );
  
  // Estados para dialogs del catálogo
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [currentDayIdx, setCurrentDayIdx] = useState(null);
  
  // Agregar día
  const addDay = () => {
    setDays(prev => [
      ...prev,
      defaultDay(prev.length + 1)
    ]);
  };

  // Eliminar día
  const removeDay = (idx) => {
    setDays(prev => prev.filter((_, i) => i !== idx).map((d, i) => ({ ...d, number: i + 1 })));
  };
  const [name, setName] = useState(initialStructure?.name || '');
  // Mantener los campos extra si existen
  const [startDate] = useState(initialStructure?.startDate || '');
  const [endDate] = useState(initialStructure?.endDate || '');
  const [objetivo] = useState(initialStructure?.objetivo || '');

  // Abrir selector de ejercicios del catálogo
  const openExerciseSelector = (dayIdx) => {
    setCurrentDayIdx(dayIdx);
    setSelectorOpen(true);
  };

  // Cuando se selecciona un ejercicio del catálogo
  const handleSelectExercise = (exercise) => {
    if (currentDayIdx !== null) {
      const newExercise = {
        ...defaultExercise,
        name: exercise.name,
        muscle: exercise.muscleGroup,
        exerciseCatalogId: exercise.id, // Guardar la referencia
      };
      setDays(days => days.map((d, i) => 
        i === currentDayIdx 
          ? { ...d, exercises: [...d.exercises, newExercise] } 
          : d
      ));
    }
  };

  // Cuando se crea un nuevo ejercicio personalizado
  const handleExerciseCreated = (newExercise) => {
    // Automáticamente agregarlo al día actual
    handleSelectExercise(newExercise);
  };

  // Función legacy (mantener por si se usa en otro lado)
  const addExercise = (dayIdx) => {
    openExerciseSelector(dayIdx);
  };

  // Editar ejercicio
  const updateExercise = (dayIdx, exIdx, field, value) => {
    setDays(days => days.map((d, i) =>
      i === dayIdx ? {
        ...d,
        exercises: d.exercises.map((ex, j) => j === exIdx ? { ...ex, [field]: value } : ex)
      } : d
    ));
  };

  // Agregar set a un ejercicio
  const addSet = (dayIdx, exIdx) => {
    setDays(days => days.map((d, i) =>
      i === dayIdx ? {
        ...d,
        exercises: d.exercises.map((ex, j) =>
          j === exIdx ? { ...ex, sets: [ ...ex.sets, { ...defaultSet } ] } : ex
        )
      } : d
    ));
  };

  // Editar set
  const updateSet = (dayIdx, exIdx, setIdx, field, value) => {
    setDays(days => days.map((d, i) =>
      i === dayIdx ? {
        ...d,
        exercises: d.exercises.map((ex, j) =>
          j === exIdx ? {
            ...ex,
            sets: ex.sets.map((s, k) => k === setIdx ? { ...s, [field]: value } : s)
          } : ex
        )
      } : d
    ));
  };

  // Duplicar estructura de otro microciclo

  // Enviar al backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Armar el payload incluyendo los campos extra si existen
    // Agregar el campo 'order' a cada set
    const daysWithOrderedSets = days.map(day => ({
      ...day,
      exercises: day.exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map((set, idx) => ({ ...set, order: idx + 1 }))
      }))
    }));
    const basePayload = { name, days: daysWithOrderedSets };
    if (startDate) basePayload.startDate = startDate;
    if (endDate) basePayload.endDate = endDate;
    if (objetivo) basePayload.objetivo = objetivo;
    if (microcycleCount <= 1) {
      onSubmit && onSubmit(basePayload);
    } else {
      for (let i = 1; i <= microcycleCount; i++) {
        const nombre = `Microciclo ${i}`;
        await createMicrocycle(mesocycleId, { ...basePayload, name: nombre });
      }
      alert(`${microcycleCount} microciclos creados correctamente.`);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#222', color: '#fff', padding: 24, borderRadius: 12, maxWidth: 900, margin: '0 auto' }}>
      <h2>Crear/Editar Microciclo</h2>
      <label>Nombre del microciclo:
        <input value={name} onChange={e => setName(e.target.value)} style={{ marginLeft: 8 }} required />
      </label>
      <label style={{ marginLeft: 24 }}>Cantidad de microciclos a crear:
        <input type="number" min={1} value={microcycleCount} onChange={e => setMicrocycleCount(Math.max(1, Number(e.target.value)))} style={{ marginLeft: 8, width: 60 }} />
      </label>
      <hr />
      {days.map((day, dayIdx) => (
        <div key={day.number} style={{ border: '1px solid #ffd700', borderRadius: 8, margin: '18px 0', padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <b style={{ fontSize: 18 }}>DÍA {day.number}</b>
            <button type="button" onClick={() => removeDay(dayIdx)} style={{ marginLeft: 16, background: '#ffd700', color: '#222', borderRadius: 4, fontWeight: 700, padding: '2px 10px' }}>Eliminar día</button>
            <button type="button" onClick={() => addExercise(dayIdx)} style={{ marginLeft: 16 }}>Agregar ejercicio</button>
          </div>
          <div style={{ marginTop: 10 }}>
            {day.exercises.map((ex, exIdx) => (
              <div key={exIdx} style={{ background: '#333', borderRadius: 6, margin: '10px 0', padding: 10 }}>
                <input placeholder="Nombre" value={ex.name} onChange={e => updateExercise(dayIdx, exIdx, 'name', e.target.value)} style={{ marginRight: 8, width: 180 }} />
                <input placeholder="Músculo objetivo" value={ex.muscle} onChange={e => updateExercise(dayIdx, exIdx, 'muscle', e.target.value)} style={{ marginRight: 8, width: 140 }} />
                <input placeholder="Rango reps" value={ex.repRange || ''} onChange={e => updateExercise(dayIdx, exIdx, 'repRange', e.target.value)} style={{ marginRight: 8, width: 120 }} />
                <input type="text" inputMode="numeric" min={1} pattern="[0-9]*" placeholder="Series" value={ex.sets?.length || 1} onChange={e => {
                  const n = Math.max(1, parseInt(e.target.value) || 1);
                  setDays(days => days.map((d, i) =>
                    i === dayIdx ? {
                      ...d,
                      exercises: d.exercises.map((ex2, j) =>
                        j === exIdx ? {
                          ...ex2,
                          sets: Array.from({ length: n }, (_, idx) =>
                            ex2.sets && ex2.sets[idx]
                              ? { ...ex2.sets[idx] }
                              : { ...defaultSet }
                          )
                        } : ex2
                      )
                    } : d
                  ));
                }} style={{ marginRight: 8, width: 70 }} />
                <input placeholder="RIR esperado" value={ex.expectedRir || ''} onChange={e => updateExercise(dayIdx, exIdx, 'expectedRir', e.target.value)} style={{ marginRight: 8, width: 100 }} />
                {/* Ya no se muestran los campos de la serie, solo la cantidad de series generadas */}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button type="button" onClick={addDay} style={{ background: '#ffd700', color: '#222', fontWeight: 700, fontSize: 16, border: 'none', borderRadius: 8, padding: '8px 24px', marginTop: 10 }}>Agregar día</button>
      <button type="submit" style={{ background: '#ffd700', color: '#222', fontWeight: 700, fontSize: 18, border: 'none', borderRadius: 8, padding: '12px 32px', marginTop: 18 }}>Guardar microciclo</button>
      
      {/* Dialogs del catálogo de ejercicios */}
      <ExerciseCatalogSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={handleSelectExercise}
        onCreateNew={() => {
          setSelectorOpen(false);
          setCreateDialogOpen(true);
        }}
      />
      
      <CreateExerciseDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleExerciseCreated}
      />
    </form>
  );
}
