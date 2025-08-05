import { Box, Typography, CircularProgress, Button, Tabs, Tab, IconButton, Stack } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Header } from '../../components';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../hooks';
import { useRoutineStore } from '../../hooks/useRoutineStore';
import EditSetModal from '../../components/EditSetModal';

import { Layout } from '../../components';



export const StudentRoutine = () => {
  const navigate = useNavigate();
  const { student } = useAuthStore();
  const { getAllMacroCycles, getMesocyclesByMacro, fetchMicrocyclesByMesocycle } = useRoutineStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [macros, setMacros] = useState([]);
  const [selectedMacroId, setSelectedMacroId] = useState('');
  const [mesos, setMesos] = useState([]);
  const [selectedMesoId, setSelectedMesoId] = useState('');
  const [micros, setMicros] = useState([]);
  const [mesoIdx, setMesoIdx] = useState(0);
  const [microIdx, setMicroIdx] = useState(0);
  const [diaIdx, setDiaIdx] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);

  useEffect(() => {
    const fetchMacros = async () => {
      if (!student?.id) {
        setError('No se encontró el estudiante logueado.');
        setLoading(false);
        return;
      }
      try {
        const allMacros = await getAllMacroCycles();
        const myMacros = allMacros.filter(m => m.studentId === student.id);
        setMacros(myMacros);
        if (!myMacros.length) setError('No tenés rutinas asignadas.');
      } catch (err) {
        setError(err.message || 'Error cargando macrocycles');
      } finally {
        setLoading(false);
      }
    };
    fetchMacros();
  }, [student, getAllMacroCycles]);


  // Cuando selecciona un macrocycle, buscar mesocycles y seleccionar el primero automáticamente
  useEffect(() => {
    const fetchMesos = async () => {
      if (!selectedMacroId) return;
      setLoading(true);
      try {
        const mesosResult = await getMesocyclesByMacro(selectedMacroId);
        setMesos(mesosResult);
        setMicros([]);
        setMesoIdx(0);
        setMicroIdx(0);
        setDiaIdx(0);
        if (mesosResult.length > 0) {
          setSelectedMesoId(mesosResult[0].id);
        } else {
          setSelectedMesoId('');
          setError('No hay mesociclos en tu rutina.');
        }
      } catch (err) {
        setError(err.message || 'Error cargando mesocycles');
      } finally {
        setLoading(false);
      }
    };
    fetchMesos();
  }, [selectedMacroId, getMesocyclesByMacro]);


  // Cuando selecciona un mesocycle, buscar microcycles y seleccionar el primero automáticamente
  useEffect(() => {
    const fetchMicros = async () => {
      if (!selectedMesoId) return;
      setLoading(true);
      try {
        const microsResult = await fetchMicrocyclesByMesocycle(selectedMesoId);
        setMicros(microsResult);
        setMicroIdx(0);
        setDiaIdx(0);
        if (!microsResult.length) setError('No hay microciclos en tu rutina.');
        else setError(null);
      } catch (err) {
        setError(err.message || 'Error cargando microcycles');
      } finally {
        setLoading(false);
      }
    };
    fetchMicros();
  }, [selectedMesoId, fetchMicrocyclesByMesocycle]);

  const handleEditSet = (set) => {
    setSelectedSet(set);
    setEditModalOpen(true);
  };

  const handleSaveSet = async (form) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${apiUrl}/set/${selectedSet.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar');
      }
      
      // Actualizar el estado local en lugar de recargar todo
      setMicros(prevMicros => 
        prevMicros.map(micro => 
          micro.id === micros[microIdx].id ? {
            ...micro,
            days: micro.days.map(day => 
              day.id === micros[microIdx].days[diaIdx].id ? {
                ...day,
                exercises: day.exercises.map(exercise => ({
                  ...exercise,
                  sets: exercise.sets.map(set => 
                    set.id === selectedSet.id ? { ...set, ...form } : set
                  )
                }))
              } : day
            )
          } : micro
        )
      );
    } catch (err) {
      throw err;
    }
  };

  return (
    <Layout>
      <>
        <Header title="Rutina de Entrenamiento" subtitle="Visualiza y edita tu rutina" />
        <Box mb={2}>
          <button onClick={() => navigate(-1)} style={{ padding: 8, borderRadius: 4, background: '#70d8bd', color: '#fff', border: 'none', cursor: 'pointer', width: '100%', maxWidth: 320 }}>
            Volver al Dashboard
          </button>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">{error}</Typography>
        ) : (
          <>
            {/* Macrocycle selector */}
            <Tabs
              value={macros.findIndex(m => m.id === Number(selectedMacroId))}
              onChange={(_, v) => {
                setSelectedMacroId(macros[v]?.id || '');
                setSelectedMesoId('');
                setMicros([]);
                setMesoIdx(0);
                setMicroIdx(0);
                setDiaIdx(0);
              }}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 1, minHeight: { xs: 36, sm: 48 } }}
            >
              {macros.map((macro) => (
                <Tab key={macro.id} label={macro.name} sx={{ fontSize: { xs: '0.85rem', sm: '1rem' }, minWidth: { xs: 80, sm: 120 } }} />
              ))}
            </Tabs>
            {/* Si no hay macro seleccionado, mostrar mensaje y no mostrar nada más */}
            {!selectedMacroId && (
              <Typography align="center" color="text.secondary" sx={{ mt: 4, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                Seleccioná un macro para ver los mesociclos y microciclos
              </Typography>
            )}
            {/* Mesocycle selector */}
            {selectedMacroId && (
              <>
                <Tabs
                  value={mesoIdx}
                  onChange={(_, v) => {
                    setMesoIdx(v);
                    setSelectedMesoId(mesos[v]?.id || '');
                    // El resto se resetea en el useEffect de selectedMesoId
                  }}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ mb: 1, minHeight: { xs: 36, sm: 48 } }}
                >
                  {mesos.map((meso) => (
                    <Tab key={meso.id} label={meso.name} sx={{ fontSize: { xs: '0.85rem', sm: '1rem' }, minWidth: { xs: 80, sm: 120 } }} />
                  ))}
                </Tabs>
                {/* Microcycle selector con flechas y solo 3 visibles */}
                {selectedMesoId && micros.length > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (microIdx > 0) { setMicroIdx(microIdx - 1); setDiaIdx(0); }
                      }}
                      disabled={microIdx === 0}
                    >
                      <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
                      {micros
                        .map((micro, i) => ({ ...micro, idx: i }))
                        .filter((_, i) => Math.abs(i - microIdx) <= 1)
                        .map((micro) => (
                          <Button
                            key={micro.idx}
                            variant={micro.idx === microIdx ? 'contained' : 'outlined'}
                            size="small"
                            sx={{ minWidth: { xs: 70, sm: 90 }, bgcolor: micro.idx === microIdx ? '#ffe082' : undefined, color: '#222', fontWeight: 700, fontSize: { xs: '0.85rem', sm: '1rem' } }}
                            onClick={() => { setMicroIdx(micro.idx); setDiaIdx(0); }}
                          >
                            {micro.name}
                          </Button>
                        ))}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (microIdx < micros.length - 1) { setMicroIdx(microIdx + 1); setDiaIdx(0); }
                      }}
                      disabled={microIdx === micros.length - 1}
                    >
                      <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                {/* Días selector */}
                {selectedMesoId && micros.length > 0 && micros[microIdx]?.days && (
                  <Tabs
                    value={diaIdx}
                    onChange={(_, v) => setDiaIdx(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ mb: 2, minHeight: { xs: 36, sm: 48 } }}
                  >
                    {micros[microIdx].days.map((day) => (
                      <Tab key={day.id} label={`Día ${day.number}`} sx={{ fontSize: { xs: '0.85rem', sm: '1rem' }, minWidth: { xs: 70, sm: 100 } }} />
                    ))}
                  </Tabs>
                )}
                {/* Ejercicios del día */}
                {selectedMesoId && micros.length > 0 && micros[microIdx]?.days && micros[microIdx].days[diaIdx] && (
                  <>
                    <Typography variant="body2" color="#1976d2" align="center" mb={0.5} sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                      Fecha: {micros[microIdx].days[diaIdx].date ? micros[microIdx].days[diaIdx].date.slice(0,10) : ''} {micros[microIdx].days[diaIdx].observations ? '· ' + micros[microIdx].days[diaIdx].observations : ''}
                    </Typography>
                    <Stack spacing={2}>
                      {micros[microIdx].days[diaIdx].exercises && micros[microIdx].days[diaIdx].exercises.map((ej, i) => (
                        <Box key={ej.id || i} sx={{ bgcolor: '#ff9800', borderRadius: 3, boxShadow: 3, mb: 1 }}>
                          <Box sx={{ p: { xs: 0.5, sm: 1 } }}>
                            <Typography variant="h6" fontWeight="bold" align="center" color="#222" sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                              {ej.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                              {ej.muscle} · {ej.type} · Tempo: {ej.tempo}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <table style={{ width: '100%', background: 'transparent', fontSize: '0.9em', borderCollapse: 'collapse' }}>
                                <thead>
                                  <tr>
                                    <th style={{ fontWeight: 'bold', borderBottom: 'none', fontSize: '0.85em', textAlign: 'center', padding: '4px', textTransform: 'uppercase' }}>RANGO REPS</th>
                                    <th style={{ fontWeight: 'bold', borderBottom: 'none', fontSize: '0.85em', textAlign: 'center', padding: '4px', textTransform: 'uppercase' }}>REPS</th>
                                    <th style={{ fontWeight: 'bold', borderBottom: 'none', fontSize: '0.85em', textAlign: 'center', padding: '4px', textTransform: 'uppercase' }}>CARGA</th>
                                    <th style={{ fontWeight: 'bold', borderBottom: 'none', fontSize: '0.85em', textAlign: 'center', padding: '4px', textTransform: 'uppercase' }}>RIR ESP</th>
                                    <th style={{ fontWeight: 'bold', borderBottom: 'none', fontSize: '0.85em', textAlign: 'center', padding: '4px', textTransform: 'uppercase' }}>RIR REAL</th>
                                    <th style={{ fontWeight: 'bold', borderBottom: 'none', fontSize: '0.85em', textAlign: 'center', padding: '4px', textTransform: 'uppercase' }}>RPE</th>
                                    {/* Ocultar columna Obs en mobile */}
                                    <th style={{ fontWeight: 'bold', borderBottom: 'none', fontSize: '0.85em', textAlign: 'center', padding: '4px', textTransform: 'uppercase', display: 'none' }} className="obs-col">OBS</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {ej.sets && ej.sets.map((serie, j) => (
                                    <tr key={serie.id || j} style={{ cursor: 'pointer' }} onClick={() => handleEditSet(serie)}>
                                      <td style={{ fontSize: '0.95em', textAlign: 'center', padding: '4px', textTransform: 'none' }}>{ej.repRange}</td>
                                      <td style={{ fontSize: '0.95em', textAlign: 'center', padding: '4px', textTransform: 'none' }}>{serie.reps}</td>
                                      <td style={{ fontSize: '0.95em', textAlign: 'center', padding: '4px', textTransform: 'none' }}>{serie.load}</td>
                                      <td style={{ fontSize: '0.95em', textAlign: 'center', padding: '4px', textTransform: 'none' }}>{serie.expectedRir}</td>
                                      <td style={{ fontSize: '0.95em', textAlign: 'center', padding: '4px', textTransform: 'none' }}>{serie.actualRir}</td>
                                      <td style={{ fontSize: '0.95em', textAlign: 'center', padding: '4px', textTransform: 'none' }}>{serie.actualRpe}</td>
                                      {/* Ocultar columna Obs en mobile */}
                                      <td style={{ fontSize: '0.95em', textAlign: 'center', padding: '4px', textTransform: 'none', display: 'none' }} className="obs-col">{serie.notes}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </Box>
                            {/* Mostrar observaciones debajo de la tabla en mobile si existen */}
                            {ej.sets && ej.sets.some(s => s.notes) && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' }, textAlign: 'center', bgcolor: '#fffde7', borderRadius: 2, p: 1 }}>
                                  <strong>Observaciones:</strong> {ej.sets.filter(s => s.notes).map(s => s.notes).join(' · ')}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </>
                )}
              </>
            )}
          </>
        )}
        <EditSetModal
          open={editModalOpen}
          set={selectedSet || {}}
          onSave={handleSaveSet}
          onClose={() => setEditModalOpen(false)}
        />
      </>
    </Layout>
  )}