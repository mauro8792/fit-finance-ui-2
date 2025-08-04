
import MicrocycleEditor from '../../components/MicrocycleEditor';
import { useNavigate, useParams } from 'react-router-dom';
import { useRoutineStore } from '../../hooks/useRoutineStore';
import { useEffect, useState } from 'react';

const MicrocycleEdit = () => {
  const { mesocycleId, microcycleId } = useParams();
  const navigate = useNavigate();
  const { getMicrocycleById, updateMicrocycle, fetchMicrocyclesByMesocycle, createMicrocycle } = useRoutineStore();
  const [initialStructure, setInitialStructure] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (microcycleId) {
      getMicrocycleById(microcycleId).then(data => {
        setInitialStructure(data);
        setLoading(false);
      });
    } else {
      // Si es nuevo, podrías traer el último microciclo para duplicar estructura
      fetchMicrocyclesByMesocycle(mesocycleId).then(list => {
        setInitialStructure(list.length > 0 ? list[list.length - 1] : null);
        setLoading(false);
      });
    }
    // eslint-disable-next-line
  }, [microcycleId, mesocycleId]);

  const handleSubmit = async (payload) => {
    // Asignar 'order' secuencial a cada set dentro de cada ejercicio en cada día
    const structureWithOrder = {
      ...payload,
      days: payload.days?.map(day => ({
        ...day,
        exercises: day.exercises?.map(ex => ({
          ...ex,
          sets: Array.isArray(ex.sets)
            ? ex.sets.map((set, idx) => ({
                ...set,
                order: idx // fuerza el valor siempre
              }))
            : []
        })) || []
      })) || [],
      exercises: Array.isArray(payload.exercises)
        ? payload.exercises.map(ex => ({
            ...ex,
            sets: Array.isArray(ex.sets)
              ? ex.sets.map((set, idx) => ({
                  ...set,
                  order: idx // fuerza el valor siempre
                }))
              : []
          }))
        : []
    };
    if (microcycleId) {
      await updateMicrocycle(microcycleId, structureWithOrder);
    } else {
      // Aquí deberías llamar a la función para crear un microciclo
      // await createMicrocycle(mesocycleId, structureWithOrder);
    }
    navigate(-1);
  };

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', margin: 40 }}>Cargando...</div>;

  return (
    <MicrocycleEditor
      initialStructure={initialStructure}
      onSubmit={handleSubmit}
      createMicrocycle={createMicrocycle}
      mesocycleId={mesocycleId}
      onDuplicateStructure={() => initialStructure}
    />
  );
};

export default MicrocycleEdit;
