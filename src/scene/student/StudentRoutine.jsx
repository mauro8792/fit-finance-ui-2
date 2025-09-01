import { Box, Typography, CircularProgress, Button, Tabs, Tab, IconButton, Stack, useMediaQuery, useTheme } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../hooks';
import { useRoutineStore } from '../../hooks/useRoutineStore';
import EditSetModal from '../../components/EditSetModal';



export const StudentRoutine = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
        
        // ✅ MEJORA: Auto-seleccionar si hay solo un macrociclo
        if (myMacros.length === 1) {
          setSelectedMacroId(myMacros[0].id);
        } else if (!myMacros.length) {
          setError('No tenés rutinas asignadas.');
        }
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
    
    // Guardar el estado actual de navegación antes de hacer cambios
    const currentMicroId = micros[microIdx]?.id;
    const currentDayId = (() => {
      const diasConEjercicios = micros[microIdx].days
        .filter(day => !day.esDescanso && day.exercises && day.exercises.length > 0)
        .sort((a, b) => {
          const getDayNumber = (day) => {
            if (day.dia) return parseInt(day.dia) || 0;
            const match = day.nombre?.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          };
          return getDayNumber(a) - getDayNumber(b);
        });
      return diasConEjercicios[diaIdx]?.id;
    })();
    
    let response;
    
    // Si es un set temporal (nuevo), crearlo
    if (selectedSet.id && selectedSet.id.toString().startsWith('temp-')) {
      // Usar el exerciseId del set temporal si está disponible
      let ejercicioId = selectedSet.exerciseId;
      
      // Si no hay exerciseId, buscar el ejercicio usando la lógica anterior (fallback)
      if (!ejercicioId) {
        const diasConEjercicios = micros[microIdx].days.filter(day => 
          !day.esDescanso && day.exercises && day.exercises.length > 0
        );
        const diaActual = diasConEjercicios[diaIdx];
        const ejercicio = diaActual.exercises.find(ej => 
          selectedSet.id.includes(`temp-${ej.id}`)
        );
        ejercicioId = ejercicio?.id;
      }
      
      if (ejercicioId) {
        // Crear nuevo set
        response = await fetch(`${apiUrl}/exercise/${ejercicioId}/sets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            order: selectedSet.order || 1
          }),
        });
      }
    } else {
      // Actualizar set existente
      response = await fetch(`${apiUrl}/set/${selectedSet.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
    }
    
    if (!response || !response.ok) {
      const errorData = await response?.json();
      throw new Error(errorData?.message || 'Error al guardar');
    }
    
    // Recargar los microciclos y mantener la navegación en el mismo lugar
    const microsResult = await fetchMicrocyclesByMesocycle(selectedMesoId);
    setMicros(microsResult);
    
    // Restaurar la navegación al mismo microciclo y día
    if (currentMicroId && currentDayId) {
      // Encontrar el índice del microciclo actual
      const newMicroIdx = microsResult.findIndex(micro => micro.id === currentMicroId);
      if (newMicroIdx !== -1) {
        setMicroIdx(newMicroIdx);
        
        // Encontrar el índice del día actual dentro del microciclo
        const diasConEjercicios = microsResult[newMicroIdx].days
          .filter(day => !day.esDescanso && day.exercises && day.exercises.length > 0)
          .sort((a, b) => {
            const getDayNumber = (day) => {
              if (day.dia) return parseInt(day.dia) || 0;
              const match = day.nombre?.match(/\d+/);
              return match ? parseInt(match[0]) : 0;
            };
            return getDayNumber(a) - getDayNumber(b);
          });
        
        const newDayIdx = diasConEjercicios.findIndex(day => day.id === currentDayId);
        if (newDayIdx !== -1) {
          setDiaIdx(newDayIdx);
        }
      }
    }
  };

  return (
      <Box sx={{ 
        width: '100%', 
        maxWidth: '100vw',
        minHeight: isMobile ? 'calc(100vh - 120px)' : '100%',
        overflow: 'hidden',
        px: { xs: 0.5, sm: 2 },
        py: { xs: 0.5, sm: 1 },
        ...(isMobile && {
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        })
      }}>
        
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">{error}</Typography>
        ) : (
          <>
            {/* Macrocycle selector - Solo mostrar carousel si hay más de 1 */}
            {macros.length > 1 ? (
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
                allowScrollButtonsMobile
                sx={{ 
                  mb: { xs: 1, sm: 1 }, 
                  minHeight: { xs: 36, sm: 48 },
                  width: '100%',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  '& .MuiTabs-scroller': {
                    overflow: 'auto !important'
                  },
                  '& .MuiTabs-scrollButtons': {
                    width: { xs: 28, sm: 32 },
                    color: '#ffe082'
                  },
                  '& .MuiTab-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    margin: { xs: '0 1px', sm: '0 3px' },
                    borderRadius: { xs: '8px', sm: '10px' },
                    minHeight: { xs: 36, sm: 48 },
                    fontSize: { xs: '0.75rem', sm: '1rem' },
                    fontWeight: 600,
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    transition: 'all 0.3s ease',
                    minWidth: { xs: 70, sm: 120 },
                    maxWidth: { xs: 100, sm: 'none' },
                    padding: { xs: '6px 10px', sm: '8px 16px' },
                    textTransform: 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                  lineHeight: 1.2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(255, 255, 255, 0.1)'
                  }
                },
                '& .MuiTab-root.Mui-selected': {
                  backgroundColor: '#ffe082',
                  color: '#222',
                  fontWeight: 700,
                  transform: 'scale(1.03)',
                  boxShadow: '0 6px 16px rgba(255, 224, 130, 0.4)',
                  border: '2px solid #ffe082'
                },
                '& .MuiTabs-indicator': {
                  display: 'none'
                }
              }}
            >
              {macros.map((macro) => (
                <Tab key={macro.id} label={macro.name} />
              ))}
            </Tabs>
            ) : macros.length === 1 ? (
              // Mostrar solo el título cuando hay un único macrociclo
              <Box
                sx={{
                  mb: { xs: 1, sm: 1 },
                  textAlign: 'center',
                  py: { xs: 1, sm: 2 }
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    backgroundColor: '#ffe082',
                    color: '#222',
                    fontWeight: 700,
                    padding: { xs: '8px 16px', sm: '12px 24px' },
                    borderRadius: { xs: '8px', sm: '10px' },
                    display: 'inline-block',
                    fontSize: { xs: '0.9rem', sm: '1.1rem' },
                    boxShadow: '0 4px 12px rgba(255, 224, 130, 0.3)'
                  }}
                >
                  📋 {macros[0].name}
                </Typography>
              </Box>
            ) : null}
            {/* Si no hay macro seleccionado Y hay múltiples macros, mostrar mensaje */}
            {!selectedMacroId && macros.length > 1 && (
              <Typography 
                align="center" 
                color="text.secondary" 
                sx={{ 
                  mt: { xs: 2, sm: 4 }, 
                  fontSize: { xs: '0.8rem', sm: '1rem' },
                  px: { xs: 1, sm: 2 },
                  lineHeight: 1.4,
                  wordBreak: 'break-word'
                }}
              >
                Seleccioná un programa para ver tu rutina
              </Typography>
            )}
            {/* Mesocycle selector - Solo mostrar carousel si hay más de 1 */}
            {selectedMacroId && (
              <>
                {mesos.length > 1 ? (
                  <Tabs
                    value={mesoIdx}
                    onChange={(_, v) => {
                      setMesoIdx(v);
                      setSelectedMesoId(mesos[v]?.id || '');
                      // El resto se resetea en el useEffect de selectedMesoId
                    }}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{ 
                      mb: { xs: 1, sm: 1 }, 
                      minHeight: { xs: 36, sm: 48 },
                      width: '100%',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      '& .MuiTabs-scroller': {
                        overflow: 'auto !important'
                      },
                      '& .MuiTabs-scrollButtons': {
                        width: { xs: 28, sm: 32 },
                        color: '#20b2aa'
                      },
                      '& .MuiTab-root': {
                        backgroundColor: 'rgba(32, 178, 170, 0.15)',
                        color: '#20b2aa',
                        margin: { xs: '0 1px', sm: '0 3px' },
                        borderRadius: { xs: '8px', sm: '10px' },
                        minHeight: { xs: 36, sm: 48 },
                        fontSize: { xs: '0.75rem', sm: '1rem' },
                        fontWeight: 600,
                        backdropFilter: 'blur(15px)',
                        border: '1px solid rgba(255, 152, 0, 0.25)',
                        transition: 'all 0.3s ease',
                        minWidth: { xs: 70, sm: 120 },
                        maxWidth: { xs: 100, sm: 'none' },
                        padding: { xs: '6px 10px', sm: '8px 16px' },
                        textTransform: 'none',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        boxShadow: '0 2px 6px rgba(255, 152, 0, 0.1)',
                        lineHeight: 1.2,
                        '&:hover': {
                          backgroundColor: 'rgba(32, 178, 170, 0.25)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(32, 178, 170, 0.2)'
                        }
                      },
                      '& .MuiTab-root.Mui-selected': {
                        backgroundColor: '#20b2aa',
                        color: '#fff',
                        fontWeight: 700,
                        transform: 'scale(1.03)',
                        boxShadow: '0 6px 16px rgba(32, 178, 170, 0.5)',
                        border: '2px solid #20b2aa'
                      },
                      '& .MuiTabs-indicator': {
                        display: 'none'
                      }
                    }}
                  >
                    {mesos.map((meso) => (
                      <Tab key={meso.id} label={meso.name} />
                    ))}
                  </Tabs>
                ) : mesos.length === 1 ? (
                  // Mostrar solo el título cuando hay un único mesociclo
                  <Box
                    sx={{
                      mb: { xs: 1, sm: 1 },
                      textAlign: 'center',
                      py: { xs: 1, sm: 1.5 }
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        backgroundColor: '#20b2aa',
                        color: '#fff',
                        fontWeight: 700,
                        padding: { xs: '6px 14px', sm: '10px 20px' },
                        borderRadius: { xs: '8px', sm: '10px' },
                        display: 'inline-block',
                        fontSize: { xs: '0.85rem', sm: '1rem' },
                        boxShadow: '0 4px 12px rgba(32, 178, 170, 0.4)'
                      }}
                    >
                      🎯 {mesos[0].name}
                    </Typography>
                  </Box>
                ) : null}
                {/* Microcycle navigation */}
                {selectedMesoId && micros.length > 0 && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: { xs: 1, sm: 1 }, 
                    gap: { xs: 1, sm: 1.5 },
                    px: { xs: 0.5, sm: 0 },
                    py: { xs: 0.5, sm: 0 },
                    justifyContent: 'center'
                  }}>
                    {/* Left Arrow */}
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (microIdx > 0) {
                          setMicroIdx(prev => prev - 1);
                          setDiaIdx(0);
                        }
                      }}
                      disabled={microIdx <= 0}
                      sx={{
                        backgroundColor: microIdx <= 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 224, 130, 0.2)',
                        color: microIdx <= 0 ? 'rgba(255, 255, 255, 0.3)' : '#ffe082',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${microIdx <= 0 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 224, 130, 0.4)'}`,
                        width: { xs: 32, sm: 40 },
                        height: { xs: 32, sm: 40 },
                        boxShadow: microIdx <= 0 ? 'none' : '0 2px 8px rgba(255, 224, 130, 0.2)',
                        '&:hover': {
                          backgroundColor: microIdx <= 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 224, 130, 0.3)',
                          transform: microIdx <= 0 ? 'none' : 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <ArrowBackIosNewIcon fontSize={isMobile ? 'small' : 'medium'} />
                    </IconButton>
                    
                    {/* Contenedor de microciclos con mejor scroll */}
                    <Box 
                      sx={{ 
                        flex: 1,
                        display: 'flex',
                        gap: { xs: 0.5, sm: 0.8 },
                        overflowX: 'auto',
                        scrollBehavior: 'smooth',
                        py: { xs: 0.4, sm: 0.5 },
                        px: { xs: 0.5, sm: 1.2 },
                        mx: { xs: 0, sm: 0 },
                        maxWidth: '100%',
                        justifyContent: 'center',
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'thin',
                        '&::-webkit-scrollbar': {
                          height: '4px',
                        },
                        '&::-webkit-scrollbar-track': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '3px',
                          margin: '0 8px'
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: 'rgba(255, 224, 130, 0.7)',
                          borderRadius: '3px',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 224, 130, 0.9)'
                          }
                        }
                      }}
                    >
                      {(() => {
                        // Obtener los microciclos ordenados
                        const sortedMicros = micros
                          .sort((a, b) => {
                            const getNumber = (name) => {
                              const match = name.match(/\d+/);
                              return match ? parseInt(match[0]) : 0;
                            };
                            return getNumber(a.name) - getNumber(b.name);
                          });

                        // Calcular ventana visible en móvil
                        let visibleMicros = sortedMicros;
                        let startIdx = 0;
                        
                        if (isMobile && sortedMicros.length > 3) {
                          // Mostrar una ventana de 3 microciclos centrada en el actual
                          const windowSize = 3;
                          const currentPos = microIdx;
                          
                          // Calcular el inicio de la ventana
                          startIdx = Math.max(0, Math.min(
                            currentPos - Math.floor(windowSize / 2),
                            sortedMicros.length - windowSize
                          ));
                          
                          visibleMicros = sortedMicros.slice(startIdx, startIdx + windowSize);
                        }

                        return visibleMicros.map((micro, displayIdx) => {
                          const realIdx = isMobile && sortedMicros.length > 3 
                            ? startIdx + displayIdx 
                            : sortedMicros.findIndex(m => m.id === micro.id);
                          
                          return (
                            <Button
                              key={micro.id}
                              variant={realIdx === microIdx ? 'contained' : 'outlined'}
                              size="small"
                              sx={{ 
                                minWidth: { xs: '75px', sm: '110px' },
                                maxWidth: { xs: '95px', sm: 'none' },
                                height: { xs: '36px', sm: '40px' },
                                flexShrink: 0,
                                bgcolor: realIdx === microIdx ? '#ffe082' : 'rgba(255, 255, 255, 0.08)', 
                                color: realIdx === microIdx ? '#222' : '#fff',
                                fontWeight: realIdx === microIdx ? 700 : 600, 
                                fontSize: { xs: '0.65rem', sm: '0.85rem' },
                                backdropFilter: 'blur(15px)',
                                border: realIdx === microIdx ? '2px solid #ffe082' : '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: { xs: '8px', sm: '10px' },
                                transition: 'all 0.25s ease',
                                py: { xs: 0.4, sm: 0.8 },
                                px: { xs: 0.5, sm: 1 },
                                textTransform: 'none',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: 1.2,
                                boxShadow: realIdx === microIdx ? '0 4px 12px rgba(255, 224, 130, 0.4)' : '0 2px 6px rgba(0, 0, 0, 0.1)',
                                ...(displayIdx === visibleMicros.length - 1 && { mr: { xs: 0.5, sm: 1 } }),
                                '&:hover': {
                                  backgroundColor: realIdx === microIdx ? '#ffe082' : 'rgba(255, 255, 255, 0.15)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: realIdx === microIdx ? '0 6px 16px rgba(255, 224, 130, 0.5)' : '0 4px 10px rgba(255, 255, 255, 0.1)'
                                },
                                '&:active': {
                                  transform: 'translateY(0px)'
                                }
                              }}
                              onClick={() => { setMicroIdx(realIdx); setDiaIdx(0); }}
                            >
                              {isMobile ? 
                                `M${realIdx + 1}` : 
                                micro.name
                              }
                            </Button>
                          );
                        });
                      })()}
                    </Box>

                    <IconButton
                      size="small"
                      onClick={() => {
                        if (microIdx < micros.length - 1) { 
                          setMicroIdx(prev => prev + 1); 
                          setDiaIdx(0); 
                        }
                      }}
                      disabled={microIdx >= micros.length - 1}
                      sx={{
                        backgroundColor: microIdx >= micros.length - 1 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 224, 130, 0.2)',
                        color: microIdx >= micros.length - 1 ? 'rgba(255, 255, 255, 0.3)' : '#ffe082',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${microIdx >= micros.length - 1 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 224, 130, 0.4)'}`,
                        width: { xs: 32, sm: 40 },
                        height: { xs: 32, sm: 40 },
                        boxShadow: microIdx >= micros.length - 1 ? 'none' : '0 2px 8px rgba(255, 224, 130, 0.2)',
                        '&:hover': {
                          backgroundColor: microIdx >= micros.length - 1 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 224, 130, 0.3)',
                          transform: microIdx >= micros.length - 1 ? 'none' : 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <ArrowForwardIosIcon fontSize={isMobile ? 'small' : 'medium'} />
                    </IconButton>
                  </Box>
                )}
                {/* Días selector - Solo días con ejercicios */}
                {selectedMesoId && micros.length > 0 && micros[microIdx]?.days && (() => {
                  const daysWithExercises = micros[microIdx].days
                    .filter(day => !day.esDescanso && day.exercises && day.exercises.length > 0);
                  
                  return (
                    <Tabs
                      value={diaIdx}
                      onChange={(_, v) => setDiaIdx(v)}
                      variant={daysWithExercises.length <= 3 ? "standard" : "scrollable"}
                      scrollButtons={daysWithExercises.length <= 3 ? false : "auto"}
                      centered={daysWithExercises.length <= 3}
                      sx={{ 
                        mb: 2, 
                        minHeight: { xs: 40, sm: 48 },
                        width: '100%',
                        maxWidth: '100%',
                        overflow: 'hidden',
                      '& .MuiTabs-scroller': {
                        overflow: 'auto !important'
                      },
                      '& .MuiTabs-scrollButtons': {
                        width: { xs: 28, sm: 32 },
                        color: '#2196f3'
                      },
                      '& .MuiTab-root': {
                        backgroundColor: 'rgba(33, 150, 243, 0.15)',
                        color: '#2196f3',
                        margin: { xs: '0 2px', sm: '0 4px' },
                        borderRadius: { xs: '10px', sm: '12px' },
                        minHeight: { xs: 40, sm: 48 },
                        fontSize: { xs: '0.8rem', sm: '1rem' },
                        fontWeight: 600,
                        backdropFilter: 'blur(15px)',
                        border: '1px solid rgba(33, 150, 243, 0.25)',
                        transition: 'all 0.3s ease',
                        minWidth: { xs: 75, sm: 100 },
                        maxWidth: { xs: 95, sm: 'none' },
                        textTransform: 'none',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        boxShadow: '0 2px 6px rgba(33, 150, 243, 0.1)',
                        lineHeight: 1.2,
                        '&:hover': {
                          backgroundColor: 'rgba(33, 150, 243, 0.25)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)'
                        }
                      },
                      '& .MuiTab-root.Mui-selected': {
                        backgroundColor: '#2196f3',
                        color: '#fff',
                        fontWeight: 700,
                        transform: 'scale(1.03)',
                        boxShadow: '0 6px 16px rgba(33, 150, 243, 0.5)',
                        border: '2px solid #2196f3'
                      },
                      '& .MuiTabs-indicator': {
                        display: 'none'
                      }
                    }}
                  >
                    {micros[microIdx].days
                      .filter(day => !day.esDescanso && day.exercises && day.exercises.length > 0)
                      .sort((a, b) => {
                        // Ordenar por número de día
                        const getDayNumber = (day) => {
                          // Primero intentar con el campo 'dia' si existe
                          if (day.dia) return parseInt(day.dia) || 0;
                          // Si no, extraer número del nombre
                          const match = day.nombre?.match(/\d+/);
                          return match ? parseInt(match[0]) : 0;
                        };
                        return getDayNumber(a) - getDayNumber(b);
                      })
                      .map((day, index) => (
                        <Tab 
                          key={day.id} 
                          label={`DÍA ${day.dia || index + 1}`}
                        />
                      ))}
                    </Tabs>
                  );
                })()}
                {/* Ejercicios del día */}
                {selectedMesoId && micros.length > 0 && micros[microIdx]?.days && (() => {
                  // Filtrar días con ejercicios y ordenarlos
                  const diasConEjercicios = micros[microIdx].days
                    .filter(day => !day.esDescanso && day.exercises && day.exercises.length > 0)
                    .sort((a, b) => {
                      // Ordenar por número de día
                      const getDayNumber = (day) => {
                        // Primero intentar con el campo 'dia' si existe
                        if (day.dia) return parseInt(day.dia) || 0;
                        // Si no, extraer número del nombre
                        const match = day.nombre?.match(/\d+/);
                        return match ? parseInt(match[0]) : 0;
                      };
                      return getDayNumber(a) - getDayNumber(b);
                    });
                  const diaActual = diasConEjercicios[diaIdx];
                  
                  return diaActual ? (
                    <>
                      <Typography variant="body2" color="#1976d2" align="center" mb={0.5} sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                        <strong>{diaActual.nombre || `Día ${diaActual.dia}`}</strong>
                        {diaActual.fecha ? (
                          <span style={{ 
                            color: '#4caf50', 
                            fontWeight: 600,
                            background: 'rgba(76, 175, 80, 0.1)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            marginLeft: '8px',
                            fontSize: '0.9em'
                          }}>
                            📅 {new Date(diaActual.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
                              weekday: 'short',
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit'
                            })}
                          </span>
                        ) : (
                          <span style={{ 
                            color: '#20b2aa', 
                            fontWeight: 500,
                            background: 'rgba(32, 178, 170, 0.1)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            marginLeft: '8px',
                            fontSize: '0.9em'
                          }}>
                            ⏳ Sin entrenar
                          </span>
                        )}
                      </Typography>
                      <Stack spacing={2}>
                        {diaActual.exercises
                          .sort((a, b) => {
                            // Ordenar por campo 'orden' si existe, sino por índice
                            const ordenA = a.orden || 0;
                            const ordenB = b.orden || 0;
                            return ordenA - ordenB;
                          })
                          .map((ej, i) => (
                          <Box key={ej.id || i} sx={{ 
                            bgcolor: '#ffe082', 
                            borderRadius: 3, 
                            boxShadow: '0 8px 32px rgba(255, 224, 130, 0.4)', 
                            mb: 2,
                            overflow: 'hidden',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}>
                            <Box sx={{ p: { xs: 0.5, sm: 1 } }}>
                              <Typography variant="h6" fontWeight="bold" align="center" color="#000" sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                                {ej.nombre || ej.name}
                              </Typography>
                              <Typography variant="body2" color="#000" align="center" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, opacity: 0.8 }}>
                                {/* Corregir datos intercambiados entre series y repeticiones */}
                                {(() => {
                                  const series = ej.series || '';
                                  const reps = ej.repeticiones || ej.repRange || '';
                                  
                                  // Si series contiene un guión (ej: "10-12"), probablemente son repeticiones intercambiadas
                                  const correctSeries = series.includes('-') && !reps.includes('-') ? reps : series;
                                  const correctReps = series.includes('-') && !reps.includes('-') ? series : reps;
                                  
                                  return `${ej.grupoMuscular || ej.muscle} · ${correctSeries} series · Reps: ${correctReps} · Descanso: ${ej.descanso || ej.tempo}`;
                                })()}
                              </Typography>
                            <Box sx={{ mt: 1, overflow: 'hidden', width: '100%' }}>
                              <Box sx={{ overflowX: 'auto', width: '100%' }}>
                              <table style={{ 
                                width: '100%', 
                                minWidth: isMobile ? '280px' : 'auto',
                                background: 'rgba(255, 255, 255, 0.95)', 
                                fontSize: isMobile ? '0.7em' : '0.9em', 
                                borderCollapse: 'separate',
                                borderSpacing: '0',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                backdropFilter: 'blur(10px)',
                                tableLayout: isMobile ? 'fixed' : 'auto'
                              }}>
                                <thead>
                                  <tr style={{ backgroundColor: 'rgba(33, 33, 33, 0.8)' }}>
                                    <th style={{ 
                                      fontWeight: 'bold', 
                                      borderBottom: 'none', 
                                      fontSize: isMobile ? '0.65em' : '0.8em', 
                                      textAlign: 'center', 
                                      padding: isMobile ? '6px 2px' : '8px 4px', 
                                      textTransform: 'uppercase', 
                                      color: '#fff',
                                      width: isMobile ? '18%' : '16.67%',
                                      borderTopLeftRadius: '12px'
                                    }}>
                                      {isMobile ? 'REPS' : 'REPETICIONES'}
                                    </th>
                                    <th style={{ 
                                      fontWeight: 'bold', 
                                      borderBottom: 'none', 
                                      fontSize: isMobile ? '0.65em' : '0.8em', 
                                      textAlign: 'center', 
                                      padding: isMobile ? '6px 2px' : '8px 4px', 
                                      textTransform: 'uppercase', 
                                      color: '#fff',
                                      width: isMobile ? '14%' : '16.67%'
                                    }}>
                                      REAL
                                    </th>
                                    <th style={{ 
                                      fontWeight: 'bold', 
                                      borderBottom: 'none', 
                                      fontSize: isMobile ? '0.65em' : '0.8em', 
                                      textAlign: 'center', 
                                      padding: isMobile ? '6px 2px' : '8px 4px', 
                                      textTransform: 'uppercase', 
                                      color: '#fff',
                                      width: isMobile ? '16%' : '16.67%'
                                    }}>
                                      CARGA
                                    </th>
                                    <th style={{ 
                                      fontWeight: 'bold', 
                                      borderBottom: 'none', 
                                      fontSize: isMobile ? '0.65em' : '0.8em', 
                                      textAlign: 'center', 
                                      padding: isMobile ? '6px 2px' : '8px 4px', 
                                      textTransform: 'uppercase', 
                                      color: '#fff',
                                      width: isMobile ? '17%' : '16.67%'
                                    }}>
                                      {isMobile ? 'RIR E' : 'RIR ESP'}
                                    </th>
                                    <th style={{ 
                                      fontWeight: 'bold', 
                                      borderBottom: 'none', 
                                      fontSize: isMobile ? '0.65em' : '0.8em', 
                                      textAlign: 'center', 
                                      padding: isMobile ? '6px 2px' : '8px 4px', 
                                      textTransform: 'uppercase', 
                                      color: '#fff',
                                      width: isMobile ? '17%' : '16.67%'
                                    }}>
                                      {isMobile ? 'RIR R' : 'RIR REAL'}
                                    </th>
                                    <th style={{ 
                                      fontWeight: 'bold', 
                                      borderBottom: 'none', 
                                      fontSize: isMobile ? '0.65em' : '0.8em', 
                                      textAlign: 'center', 
                                      padding: isMobile ? '6px 2px' : '8px 4px', 
                                      textTransform: 'uppercase', 
                                      color: '#fff',
                                      width: isMobile ? '18%' : '16.67%',
                                      borderTopRightRadius: '12px'
                                    }}>
                                      RPE
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(() => {
                                    // Asegurar que siempre hay el número correcto de sets
                                    let sets = ej.sets || [];
                                    
                                    // Corregir el número de series si están intercambiadas
                                    const series = ej.series || '';
                                    const reps = ej.repeticiones || ej.repRange || '';
                                    const correctSeries = series.includes('-') && !reps.includes('-') ? reps : series;
                                    const numSeries = parseInt(correctSeries) || 3;
                                    
                                    // Crear un array con todos los órdenes que deberían existir
                                    const expectedOrders = Array.from({ length: numSeries }, (_, i) => i + 1);
                                    
                                    // Identificar qué órdenes faltan
                                    const existingOrders = sets.map(s => s.order || 0);
                                    const missingOrders = expectedOrders.filter(order => !existingOrders.includes(order));
                                    
                                    // Crear sets temporales para los órdenes que faltan
                                    missingOrders.forEach(order => {
                                      sets.push({
                                        id: `temp-${ej.id}-${order}-${Date.now()}`,
                                        reps: 0,
                                        load: 0,
                                        actualRir: 0,
                                        actualRpe: 0,
                                        notes: '',
                                        order: order,
                                        exerciseId: ej.id // Agregar referencia al ejercicio
                                      });
                                    });
                                    
                                    // Ordenar sets por order
                                    sets.sort((a, b) => (a.order || 0) - (b.order || 0));
                                    
                                    return sets.map((serie, j) => {
                                      const isLastRow = j === sets.length - 1;
                                      return (
                                      <tr 
                                        key={serie.id || j} 
                                        style={{ 
                                          cursor: 'pointer',
                                          backgroundColor: j % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(240, 240, 240, 0.8)',
                                          transition: 'all 0.2s ease',
                                          minHeight: '48px'
                                        }} 
                                        onClick={() => handleEditSet(serie)}
                                        onMouseEnter={(e) => {
                                          e.target.closest('tr').style.backgroundColor = 'rgba(255, 193, 7, 0.3)';
                                          e.target.closest('tr').style.transform = 'scale(1.02)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.target.closest('tr').style.backgroundColor = j % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(240, 240, 240, 0.8)';
                                          e.target.closest('tr').style.transform = 'scale(1)';
                                        }}
                                      >
                                        <td style={{ 
                                          fontSize: isMobile ? '0.8em' : '0.9em', 
                                          textAlign: 'center', 
                                          padding: isMobile ? '8px 2px' : '12px 4px', 
                                          textTransform: 'none', 
                                          color: '#222', 
                                          fontWeight: '500',
                                          ...(isLastRow && { borderBottomLeftRadius: '12px' })
                                        }}>
                                          {ej.repeticiones || ej.repRange}
                                        </td>
                                        <td style={{ 
                                          fontSize: isMobile ? '0.8em' : '0.9em', 
                                          textAlign: 'center', 
                                          padding: isMobile ? '8px 2px' : '12px 4px', 
                                          textTransform: 'none', 
                                          color: '#222', 
                                          fontWeight: serie.reps > 0 ? 'bold' : 'normal' 
                                        }}>
                                          {serie.reps || 0}
                                        </td>
                                        <td style={{ 
                                          fontSize: isMobile ? '0.8em' : '0.9em', 
                                          textAlign: 'center', 
                                          padding: isMobile ? '8px 2px' : '12px 4px', 
                                          textTransform: 'none', 
                                          color: '#222', 
                                          fontWeight: serie.load > 0 ? 'bold' : 'normal' 
                                        }}>
                                          {serie.load || 0}
                                        </td>
                                        <td style={{ 
                                          fontSize: isMobile ? '0.8em' : '0.9em', 
                                          textAlign: 'center', 
                                          padding: isMobile ? '8px 2px' : '12px 4px', 
                                          textTransform: 'none', 
                                          color: '#222', 
                                          fontWeight: '500' 
                                        }}>
                                          {ej.rirEsperado || serie.expectedRir || 0}
                                        </td>
                                        <td style={{ 
                                          fontSize: isMobile ? '0.8em' : '0.9em', 
                                          textAlign: 'center', 
                                          padding: isMobile ? '8px 2px' : '12px 4px', 
                                          textTransform: 'none', 
                                          color: '#222', 
                                          fontWeight: serie.actualRir > 0 ? 'bold' : 'normal' 
                                        }}>
                                          {serie.actualRir || 0}
                                        </td>
                                        <td style={{ 
                                          fontSize: isMobile ? '0.8em' : '0.9em', 
                                          textAlign: 'center', 
                                          padding: isMobile ? '8px 2px' : '12px 4px', 
                                          textTransform: 'none', 
                                          color: '#222', 
                                          fontWeight: serie.actualRpe > 0 ? 'bold' : 'normal',
                                          ...(isLastRow && { borderBottomRightRadius: '12px' })
                                        }}>
                                          {serie.actualRpe || 0}
                                        </td>
                                      </tr>
                                      );
                                    });
                                  })()}
                                </tbody>
                              </table>
                              </Box>
                            </Box>
                            {/* Mostrar observaciones debajo de la tabla en mobile si existen */}
                            {(() => {
                              // Usar la misma lógica para obtener sets
                              let sets = ej.sets || [];
                              
                              // Corregir el número de series si están intercambiadas
                              const series = ej.series || '';
                              const reps = ej.repeticiones || ej.repRange || '';
                              const correctSeries = series.includes('-') && !reps.includes('-') ? reps : series;
                              const numSeries = parseInt(correctSeries) || 3;
                              
                              // Si faltan sets, completar con sets temporales
                              while (sets.length < numSeries) {
                                const newOrder = sets.length + 1;
                                sets.push({
                                  id: `temp-${ej.id}-${newOrder}-${Date.now()}`,
                                  notes: ''
                                });
                              }
                              
                              return sets && sets.some(s => s.notes) && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' }, textAlign: 'center', bgcolor: '#fffde7', borderRadius: 2, p: 1 }}>
                                    <strong>Observaciones:</strong> {sets.filter(s => s.notes).map(s => s.notes).join(' · ')}
                                  </Typography>
                                </Box>
                              );
                            })()}
                          </Box>
                        </Box>
                        ))}
                      </Stack>
                    </>
                  ) : null;
                })()}
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
      </Box>
  )}