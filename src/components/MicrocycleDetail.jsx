import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import fitFinanceApi from "../api/fitFinanceApi";
import EditSetModal from "./EditSetModal";

const MicrocycleDetail = () => {
  const { id } = useParams();
  const [microcycle, setMicrocycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);

  useEffect(() => {
    fitFinanceApi.get(`/microcycle/${id}`)
      .then((res) => setMicrocycle(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEditSet = (set) => {
    setSelectedSet(set);
    setEditModalOpen(true);
  };

  const handleSaveSet = async (form) => {
    // Llama al backend para actualizar el set
    const token = localStorage.getItem('token');
    await fitFinanceApi.patch(`/set/${selectedSet.id}`, form, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Refresca el microciclo
    const res = await fitFinanceApi.get(`/microcycle/${id}`);
    setMicrocycle(res.data);
  };

  if (loading) return <div>Cargando...</div>;
  if (!microcycle) return <div>No se encontró el microciclo.</div>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", background: "#222", color: "#fff", padding: 24, borderRadius: 12 }}>
      <h2 style={{ color: "#FFD600" }}>{microcycle.name}</h2>
      <p>
        <b>Inicio:</b> {microcycle.startDate} <b>Fin:</b> {microcycle.endDate}
      </p>
      {microcycle.days && microcycle.days.length > 0 ? (
        microcycle.days.map((day) => (
          <div key={day.id} style={{ marginBottom: 24, border: "1px solid #FFD600", borderRadius: 8, padding: 12 }}>
            <h4 style={{ color: "#FFD600" }}>Día {day.number}</h4>
            {day.exercises && day.exercises.length > 0 ? (
              day.exercises.map((ex) => (
                <div key={ex.id} style={{ marginBottom: 12 }}>
                  <b>{ex.name}</b> <span style={{ color: "#FFD600" }}>({ex.muscle})</span><br />
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    <span style={{ marginRight: 16 }}>Rango de reps: <b>{ex.repRange}</b></span>
                  </div>
                  <table style={{ width: "100%", marginTop: 8, background: "#333", color: "#fff", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#FFD600", color: "#222" }}>
                        <th style={{ textAlign: 'center' }}>Rango de reps</th>
                        <th style={{ textAlign: 'center' }}>REPS</th>
                        <th style={{ textAlign: 'center' }}>CARGA (KG)</th>
                        <th style={{ textAlign: 'center' }}>RIR ESPERADO</th>
                        <th style={{ textAlign: 'center' }}>RIR REAL</th>
                        <th style={{ textAlign: 'center' }}>RPE REAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ex.sets && ex.sets.length > 0 ? (
                        ex.sets.map((set) => (
                          <tr key={set.id} style={{ cursor: 'pointer' }} onClick={() => handleEditSet(set)}>
                            <td style={{ textAlign: 'center' }}>{ex.repRange}</td>
                            <td style={{ textAlign: 'center' }}>{set.reps}</td>
                            <td style={{ textAlign: 'center' }}>{set.load}</td>
                            <td style={{ textAlign: 'center' }}>{set.expectedRir}</td>
                            <td style={{ textAlign: 'center' }}>{set.actualRir}</td>
                            <td style={{ textAlign: 'center' }}>{set.actualRpe}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={6} style={{ textAlign: 'center' }}>Sin sets</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              <div>Sin ejercicios</div>
            )}
          </div>
        ))
      ) : (
        <div>Sin días cargados</div>
      )}
      <EditSetModal
        open={editModalOpen}
        set={selectedSet || {}}
        onSave={handleSaveSet}
        onClose={() => setEditModalOpen(false)}
      />
    </div>
  );
};

export default MicrocycleDetail;
