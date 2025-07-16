import MicrocycleEditor from '../../components/MicrocycleEditor';
import { useNavigate, useParams } from 'react-router-dom';
import { useRoutineStore } from '../../hooks/useRoutineStore';
import { useEffect, useState } from 'react';

const MicrocycleEdit = () => {
  const { mesocycleId, microcycleId } = useParams();
  const navigate = useNavigate();
  const { getMicrocycleById, updateMicrocycle, fetchMicrocyclesByMesocycle } = useRoutineStore();
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
    if (microcycleId) {
      await updateMicrocycle(microcycleId, payload);
    } else {
      // Aquí deberías llamar a la función para crear un microciclo
      // await createMicrocycle(mesocycleId, payload);
    }
    navigate(-1);
  };

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', margin: 40 }}>Cargando...</div>;

  return (
    <MicrocycleEditor
      initialStructure={initialStructure}
      onSubmit={handleSubmit}
      onDuplicateStructure={() => initialStructure}
    />
  );
};

export default MicrocycleEdit;
