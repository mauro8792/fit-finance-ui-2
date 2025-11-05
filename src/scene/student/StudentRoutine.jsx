import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import HistoryIcon from "@mui/icons-material/History";
import TodayIcon from "@mui/icons-material/Today";
import {
  Box,
  Button,
  CircularProgress,
  Fab,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import EditSetModal from "../../components/EditSetModal";
import RestTimerWidget from "../../components/RestTimerWidget";
import { useAuthStore } from "../../hooks";
import { useRoutineStore } from "../../hooks/useRoutineStore";

export const StudentRoutine = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { student } = useAuthStore();
  const {
    getAllMacroCycles,
    getMesocyclesByMacro,
    fetchMicrocyclesByMesocycle,
  } = useRoutineStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [macros, setMacros] = useState([]);
  const [selectedMacroId, setSelectedMacroId] = useState("");
  const [mesos, setMesos] = useState([]);
  const [selectedMesoId, setSelectedMesoId] = useState("");
  const [micros, setMicros] = useState([]);
  const [mesoIdx, setMesoIdx] = useState(0);
  const [microIdx, setMicroIdx] = useState(0);
  const [diaIdx, setDiaIdx] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [selectedExerciseForSet, setSelectedExerciseForSet] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const [historyViewMode, setHistoryViewMode] = useState("friendly"); // 'friendly' o 'compact'

  // Timer de descanso
  const [showTimer, setShowTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);

  useEffect(() => {
    const fetchMacros = async () => {
      if (!student?.id) {
        setError("No se encontró el estudiante logueado.");
        setLoading(false);
        return;
      }
      try {
        const allMacros = await getAllMacroCycles();
        const myMacros = allMacros.filter((m) => m.studentId === student.id);
        setMacros(myMacros);

        // ✅ MEJORA: Auto-seleccionar si hay solo un macrociclo
        if (myMacros.length === 1) {
          setSelectedMacroId(myMacros[0].id);
        } else if (!myMacros.length) {
          setError("No tenés rutinas asignadas.");
        }
      } catch (err) {
        setError(err.message || "Error cargando macrocycles");
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
          setSelectedMesoId("");
          setError("No hay mesociclos en tu rutina.");
        }
      } catch (err) {
        setError(err.message || "Error cargando mesocycles");
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
        if (!microsResult.length) setError("No hay microciclos en tu rutina.");
        else setError(null);
      } catch (err) {
        setError(err.message || "Error cargando microcycles");
      } finally {
        setLoading(false);
      }
    };
    fetchMicros();
  }, [selectedMesoId, fetchMicrocyclesByMesocycle]);

  const handleEditSet = (set, exercise) => {
    setSelectedSet(set);
    setSelectedExerciseForSet(exercise);
    setEditModalOpen(true);
  };

  const handleStartTimer = (duration) => {
    setTimerDuration(duration);
    setShowTimer(true);
  };

  const handleTimerComplete = () => {
    // Opcional: hacer algo cuando el timer termina
  };

  const handleTimerDismiss = () => {
    setShowTimer(false);
  };

  // Función para comparar fechas ignorando la hora
  const isToday = (fecha) => {
    if (!fecha) return false;
    const today = new Date();
    const dayDate = new Date(fecha + "T12:00:00");
    return (
      today.getFullYear() === dayDate.getFullYear() &&
      today.getMonth() === dayDate.getMonth() &&
      today.getDate() === dayDate.getDate()
    );
  };

  // Función para encontrar el día de hoy en los microciclos
  const findTodayDay = () => {
    if (!micros || micros.length === 0) return null;

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // Formato YYYY-MM-DD

    for (let microIdx = 0; microIdx < micros.length; microIdx++) {
      const micro = micros[microIdx];
      if (!micro.days) continue;

      const diasConEjercicios = micro.days
        .filter(
          (day) => !day.esDescanso && day.exercises && day.exercises.length > 0
        )
        .sort((a, b) => {
          const getDayNumber = (day) => {
            if (day.dia) return parseInt(day.dia) || 0;
            const match = day.nombre?.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          };
          return getDayNumber(a) - getDayNumber(b);
        });

      for (let diaIdx = 0; diaIdx < diasConEjercicios.length; diaIdx++) {
        const day = diasConEjercicios[diaIdx];
        if (day.fecha) {
          const dayDate = new Date(day.fecha + "T12:00:00");
          const dayDateStr = dayDate.toISOString().split("T")[0];

          if (dayDateStr === todayStr) {
            return { microIdx, diaIdx };
          }
        }
      }
    }
    return null;
  };

  // Función para navegar al día de hoy
  const navigateToToday = () => {
    const todayDay = findTodayDay();
    if (todayDay) {
      setMicroIdx(todayDay.microIdx);
      setDiaIdx(todayDay.diaIdx);
      // Hacer scroll al inicio del contenido
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Verificar si el día actual es hoy
  const isCurrentDayToday = () => {
    if (!micros || micros.length === 0 || !micros[microIdx]?.days) return false;

    const diasConEjercicios = micros[microIdx].days
      .filter(
        (day) => !day.esDescanso && day.exercises && day.exercises.length > 0
      )
      .sort((a, b) => {
        const getDayNumber = (day) => {
          if (day.dia) return parseInt(day.dia) || 0;
          const match = day.nombre?.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        };
        return getDayNumber(a) - getDayNumber(b);
      });

    const diaActual = diasConEjercicios[diaIdx];
    return diaActual ? isToday(diaActual.fecha) : false;
  };

  // Función para obtener el historial de un ejercicio
  const getExerciseHistory = (exercise) => {
    if (!exercise || !micros || micros.length === 0) return [];

    const history = [];
    const exerciseName = exercise.nombre || exercise.name;
    const exerciseId = exercise.id;

    // Obtener el número del día actual para priorizar el mismo día en microciclos anteriores
    const getCurrentDayNumber = () => {
      if (!micros[microIdx]?.days) return null;
      const diasConEjercicios = micros[microIdx].days
        .filter(
          (day) => !day.esDescanso && day.exercises && day.exercises.length > 0
        )
        .sort((a, b) => {
          const getDayNumber = (day) => {
            if (day.dia) return parseInt(day.dia) || 0;
            const match = day.nombre?.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          };
          return getDayNumber(a) - getDayNumber(b);
        });
      const diaActual = diasConEjercicios[diaIdx];
      if (diaActual?.dia) return parseInt(diaActual.dia);
      const match = diaActual?.nombre?.match(/\d+/);
      return match ? parseInt(match[0]) : null;
    };
    const currentDayNumber = getCurrentDayNumber();

    // Buscar el ejercicio en todos los microciclos anteriores al actual
    for (let i = 0; i < micros.length; i++) {
      const micro = micros[i];
      if (!micro.days) continue;

      // Solo buscar en microciclos anteriores al actual
      if (i >= microIdx) continue;

      const diasConEjercicios = micro.days
        .filter(
          (day) => !day.esDescanso && day.exercises && day.exercises.length > 0
        )
        .sort((a, b) => {
          const getDayNumber = (day) => {
            if (day.dia) return parseInt(day.dia) || 0;
            const match = day.nombre?.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          };
          return getDayNumber(a) - getDayNumber(b);
        });

      // Priorizar el mismo día si está disponible
      const dayOrder =
        currentDayNumber !== null
          ? [...diasConEjercicios].sort((a, b) => {
              const getDayNumber = (day) => {
                if (day.dia) return parseInt(day.dia) || 0;
                const match = day.nombre?.match(/\d+/);
                return match ? parseInt(match[0]) : 0;
              };
              const aNum = getDayNumber(a);
              const bNum = getDayNumber(b);
              // Si uno coincide con el día actual, priorizarlo
              if (aNum === currentDayNumber && bNum !== currentDayNumber)
                return -1;
              if (bNum === currentDayNumber && aNum !== currentDayNumber)
                return 1;
              return aNum - bNum;
            })
          : diasConEjercicios;

      for (const day of dayOrder) {
        if (!day.exercises) continue;

        // Buscar el ejercicio por ID o por nombre
        const foundExercise = day.exercises.find(
          (ej) =>
            ej.id === exerciseId || (ej.nombre || ej.name) === exerciseName
        );

        if (
          foundExercise &&
          foundExercise.sets &&
          foundExercise.sets.length > 0
        ) {
          // Obtener la carga promedio y máxima de los sets
          const sets = foundExercise.sets.filter((s) => s.load > 0);
          if (sets.length > 0) {
            const maxLoad = Math.max(...sets.map((s) => s.load));
            const avgLoad =
              sets.reduce((sum, s) => sum + s.load, 0) / sets.length;
            const maxReps = Math.max(...sets.map((s) => s.reps || 0));
            const avgRir = sets.some((s) => s.actualRir > 0)
              ? sets
                  .filter((s) => s.actualRir > 0)
                  .reduce((sum, s) => sum + s.actualRir, 0) /
                sets.filter((s) => s.actualRir > 0).length
              : null;

            const dayNumber = day.dia ? parseInt(day.dia) : null;
            const isSameDay =
              currentDayNumber !== null && dayNumber === currentDayNumber;

            history.push({
              microName: micro.name,
              microNumber: micro.name.match(/\d+/)
                ? parseInt(micro.name.match(/\d+/)[0])
                : i + 1,
              dayName: day.nombre || `Día ${day.dia}`,
              dayNumber,
              fecha: day.fecha,
              maxLoad,
              avgLoad,
              maxReps,
              avgRir,
              sets: sets.length,
              microIndex: i,
              isSameDay, // Marcar si es el mismo día
            });
          }
        }
      }
    }

    // Ordenar: primero por si es el mismo día (prioridad), luego por microciclo (más reciente primero)
    return history.sort((a, b) => {
      if (a.isSameDay && !b.isSameDay) return -1;
      if (!a.isSameDay && b.isSameDay) return 1;
      return b.microIndex - a.microIndex;
    });
  };

  // Función para abrir el modal de historial
  const handleOpenHistory = (exercise) => {
    setSelectedExercise(exercise);
    const history = getExerciseHistory(exercise);
    setExerciseHistory(history);
    setHistoryModalOpen(true);
  };

  const handleSaveSet = async (form) => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    const token = localStorage.getItem("token");

    // Guardar el estado actual de navegación antes de hacer cambios
    const currentMicroId = micros[microIdx]?.id;
    const currentDayId = (() => {
      const diasConEjercicios = micros[microIdx].days
        .filter(
          (day) => !day.esDescanso && day.exercises && day.exercises.length > 0
        )
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
    if (selectedSet.id && selectedSet.id.toString().startsWith("temp-")) {
      // Usar el exerciseId del set temporal si está disponible
      let ejercicioId = selectedSet.exerciseId;

      // Si no hay exerciseId, buscar el ejercicio usando la lógica anterior (fallback)
      if (!ejercicioId) {
        const diasConEjercicios = micros[microIdx].days.filter(
          (day) => !day.esDescanso && day.exercises && day.exercises.length > 0
        );
        const diaActual = diasConEjercicios[diaIdx];
        const ejercicio = diaActual.exercises.find((ej) =>
          selectedSet.id.includes(`temp-${ej.id}`)
        );
        ejercicioId = ejercicio?.id;
      }

      if (ejercicioId) {
        // Crear nuevo set
        response = await fetch(`${apiUrl}/exercise/${ejercicioId}/sets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            order: selectedSet.order || 1,
          }),
        });
      }
    } else {
      // Actualizar set existente
      response = await fetch(`${apiUrl}/set/${selectedSet.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
    }

    if (!response || !response.ok) {
      const errorData = await response?.json();
      throw new Error(errorData?.message || "Error al guardar");
    }

    // Recargar los microciclos y mantener la navegación en el mismo lugar
    const microsResult = await fetchMicrocyclesByMesocycle(selectedMesoId);
    setMicros(microsResult);

    // Restaurar la navegación al mismo microciclo y día
    if (currentMicroId && currentDayId) {
      // Encontrar el índice del microciclo actual
      const newMicroIdx = microsResult.findIndex(
        (micro) => micro.id === currentMicroId
      );
      if (newMicroIdx !== -1) {
        setMicroIdx(newMicroIdx);

        // Encontrar el índice del día actual dentro del microciclo
        const diasConEjercicios = microsResult[newMicroIdx].days
          .filter(
            (day) =>
              !day.esDescanso && day.exercises && day.exercises.length > 0
          )
          .sort((a, b) => {
            const getDayNumber = (day) => {
              if (day.dia) return parseInt(day.dia) || 0;
              const match = day.nombre?.match(/\d+/);
              return match ? parseInt(match[0]) : 0;
            };
            return getDayNumber(a) - getDayNumber(b);
          });

        const newDayIdx = diasConEjercicios.findIndex(
          (day) => day.id === currentDayId
        );
        if (newDayIdx !== -1) {
          setDiaIdx(newDayIdx);
        }
      }
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        px: { xs: 0.5, sm: 2 },
        py: { xs: 0.5, sm: 1 },
        ...(isMobile && {
          boxSizing: "border-box",
        }),
      }}
    >
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={200}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">
          {error}
        </Typography>
      ) : (
        <>
          {/* Macrocycle selector - Solo mostrar carousel si hay más de 1 */}
          {macros.length > 1 ? (
            <Tabs
              value={macros.findIndex((m) => m.id === Number(selectedMacroId))}
              onChange={(_, v) => {
                setSelectedMacroId(macros[v]?.id || "");
                setSelectedMesoId("");
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
                width: "100%",
                maxWidth: "100%",
                overflow: "hidden",
                "& .MuiTabs-scroller": {
                  overflow: "auto !important",
                },
                "& .MuiTabs-scrollButtons": {
                  width: { xs: 28, sm: 32 },
                  color: "#ffe082",
                },
                "& .MuiTab-root": {
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  color: "#fff",
                  margin: { xs: "0 1px", sm: "0 3px" },
                  borderRadius: { xs: "8px", sm: "10px" },
                  minHeight: { xs: 36, sm: 48 },
                  fontSize: { xs: "0.75rem", sm: "1rem" },
                  fontWeight: 600,
                  backdropFilter: "blur(15px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  transition: "all 0.3s ease",
                  minWidth: { xs: 70, sm: 120 },
                  maxWidth: { xs: 100, sm: "none" },
                  padding: { xs: "6px 10px", sm: "8px 16px" },
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                  lineHeight: 1.2,
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(255, 255, 255, 0.1)",
                  },
                },
                "& .MuiTab-root.Mui-selected": {
                  backgroundColor: "#ffe082",
                  color: "#222",
                  fontWeight: 700,
                  transform: "scale(1.03)",
                  boxShadow: "0 6px 16px rgba(255, 224, 130, 0.4)",
                  border: "2px solid #ffe082",
                },
                "& .MuiTabs-indicator": {
                  display: "none",
                },
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
                textAlign: "center",
                py: { xs: 1, sm: 2 },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  backgroundColor: "#ffe082",
                  color: "#222",
                  fontWeight: 700,
                  padding: { xs: "8px 16px", sm: "12px 24px" },
                  borderRadius: { xs: "8px", sm: "10px" },
                  display: "inline-block",
                  fontSize: { xs: "0.9rem", sm: "1.1rem" },
                  boxShadow: "0 4px 12px rgba(255, 224, 130, 0.3)",
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
                fontSize: { xs: "0.8rem", sm: "1rem" },
                px: { xs: 1, sm: 2 },
                lineHeight: 1.4,
                wordBreak: "break-word",
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
                    setSelectedMesoId(mesos[v]?.id || "");
                    // El resto se resetea en el useEffect de selectedMesoId
                  }}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{
                    mb: { xs: 1, sm: 1 },
                    minHeight: { xs: 36, sm: 48 },
                    width: "100%",
                    maxWidth: "100%",
                    overflow: "hidden",
                    "& .MuiTabs-scroller": {
                      overflow: "auto !important",
                    },
                    "& .MuiTabs-scrollButtons": {
                      width: { xs: 28, sm: 32 },
                      color: "#20b2aa",
                    },
                    "& .MuiTab-root": {
                      backgroundColor: "rgba(32, 178, 170, 0.15)",
                      color: "#20b2aa",
                      margin: { xs: "0 1px", sm: "0 3px" },
                      borderRadius: { xs: "8px", sm: "10px" },
                      minHeight: { xs: 36, sm: 48 },
                      fontSize: { xs: "0.75rem", sm: "1rem" },
                      fontWeight: 600,
                      backdropFilter: "blur(15px)",
                      border: "1px solid rgba(255, 152, 0, 0.25)",
                      transition: "all 0.3s ease",
                      minWidth: { xs: 70, sm: 120 },
                      maxWidth: { xs: 100, sm: "none" },
                      padding: { xs: "6px 10px", sm: "8px 16px" },
                      textTransform: "none",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      boxShadow: "0 2px 6px rgba(255, 152, 0, 0.1)",
                      lineHeight: 1.2,
                      "&:hover": {
                        backgroundColor: "rgba(32, 178, 170, 0.25)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(32, 178, 170, 0.2)",
                      },
                    },
                    "& .MuiTab-root.Mui-selected": {
                      backgroundColor: "#20b2aa",
                      color: "#fff",
                      fontWeight: 700,
                      transform: "scale(1.03)",
                      boxShadow: "0 6px 16px rgba(32, 178, 170, 0.5)",
                      border: "2px solid #20b2aa",
                    },
                    "& .MuiTabs-indicator": {
                      display: "none",
                    },
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
                    textAlign: "center",
                    py: { xs: 1, sm: 1.5 },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      backgroundColor: "#20b2aa",
                      color: "#fff",
                      fontWeight: 700,
                      padding: { xs: "6px 14px", sm: "10px 20px" },
                      borderRadius: { xs: "8px", sm: "10px" },
                      display: "inline-block",
                      fontSize: { xs: "0.85rem", sm: "1rem" },
                      boxShadow: "0 4px 12px rgba(32, 178, 170, 0.4)",
                    }}
                  >
                    🎯 {mesos[0].name}
                  </Typography>
                </Box>
              ) : null}
              {/* Microcycle navigation */}
              {selectedMesoId && micros.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: { xs: 1, sm: 1 },
                    gap: { xs: 1, sm: 1.5 },
                    px: { xs: 0.5, sm: 0 },
                    py: { xs: 0.5, sm: 0 },
                    justifyContent: "center",
                  }}
                >
                  {/* Left Arrow */}
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (microIdx > 0) {
                        setMicroIdx((prev) => prev - 1);
                        setDiaIdx(0);
                      }
                    }}
                    disabled={microIdx <= 0}
                    sx={{
                      backgroundColor:
                        microIdx <= 0
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(255, 224, 130, 0.2)",
                      color:
                        microIdx <= 0 ? "rgba(255, 255, 255, 0.3)" : "#ffe082",
                      backdropFilter: "blur(10px)",
                      border: `1px solid ${
                        microIdx <= 0
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(255, 224, 130, 0.4)"
                      }`,
                      width: { xs: 32, sm: 40 },
                      height: { xs: 32, sm: 40 },
                      boxShadow:
                        microIdx <= 0
                          ? "none"
                          : "0 2px 8px rgba(255, 224, 130, 0.2)",
                      "&:hover": {
                        backgroundColor:
                          microIdx <= 0
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(255, 224, 130, 0.3)",
                        transform: microIdx <= 0 ? "none" : "translateY(-1px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <ArrowBackIosNewIcon
                      fontSize={isMobile ? "small" : "medium"}
                    />
                  </IconButton>

                  {/* Contenedor de microciclos con mejor scroll */}
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      gap: { xs: 0.5, sm: 0.8 },
                      overflowX: "auto",
                      scrollBehavior: "smooth",
                      py: { xs: 0.4, sm: 0.5 },
                      px: { xs: 0.5, sm: 1.2 },
                      mx: { xs: 0, sm: 0 },
                      maxWidth: "100%",
                      justifyContent: "center",
                      WebkitOverflowScrolling: "touch",
                      scrollbarWidth: "thin",
                      "&::-webkit-scrollbar": {
                        height: "4px",
                      },
                      "&::-webkit-scrollbar-track": {
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "3px",
                        margin: "0 8px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(255, 224, 130, 0.7)",
                        borderRadius: "3px",
                        "&:hover": {
                          backgroundColor: "rgba(255, 224, 130, 0.9)",
                        },
                      },
                    }}
                  >
                    {(() => {
                      // Obtener los microciclos ordenados
                      const sortedMicros = micros.sort((a, b) => {
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
                        startIdx = Math.max(
                          0,
                          Math.min(
                            currentPos - Math.floor(windowSize / 2),
                            sortedMicros.length - windowSize
                          )
                        );

                        visibleMicros = sortedMicros.slice(
                          startIdx,
                          startIdx + windowSize
                        );
                      }

                      return visibleMicros.map((micro, displayIdx) => {
                        const realIdx =
                          isMobile && sortedMicros.length > 3
                            ? startIdx + displayIdx
                            : sortedMicros.findIndex((m) => m.id === micro.id);

                        return (
                          <Button
                            key={micro.id}
                            variant={
                              realIdx === microIdx ? "contained" : "outlined"
                            }
                            size="small"
                            sx={{
                              minWidth: { xs: "75px", sm: "110px" },
                              maxWidth: { xs: "95px", sm: "none" },
                              height: { xs: "36px", sm: "40px" },
                              flexShrink: 0,
                              bgcolor:
                                realIdx === microIdx
                                  ? "#ffe082"
                                  : "rgba(255, 255, 255, 0.08)",
                              color: realIdx === microIdx ? "#222" : "#fff",
                              fontWeight: realIdx === microIdx ? 700 : 600,
                              fontSize: { xs: "0.65rem", sm: "0.85rem" },
                              backdropFilter: "blur(15px)",
                              border:
                                realIdx === microIdx
                                  ? "2px solid #ffe082"
                                  : "1px solid rgba(255, 255, 255, 0.15)",
                              borderRadius: { xs: "8px", sm: "10px" },
                              transition: "all 0.25s ease",
                              py: { xs: 0.4, sm: 0.8 },
                              px: { xs: 0.5, sm: 1 },
                              textTransform: "none",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              lineHeight: 1.2,
                              boxShadow:
                                realIdx === microIdx
                                  ? "0 4px 12px rgba(255, 224, 130, 0.4)"
                                  : "0 2px 6px rgba(0, 0, 0, 0.1)",
                              ...(displayIdx === visibleMicros.length - 1 && {
                                mr: { xs: 0.5, sm: 1 },
                              }),
                              "&:hover": {
                                backgroundColor:
                                  realIdx === microIdx
                                    ? "#ffe082"
                                    : "rgba(255, 255, 255, 0.15)",
                                transform: "translateY(-2px)",
                                boxShadow:
                                  realIdx === microIdx
                                    ? "0 6px 16px rgba(255, 224, 130, 0.5)"
                                    : "0 4px 10px rgba(255, 255, 255, 0.1)",
                              },
                              "&:active": {
                                transform: "translateY(0px)",
                              },
                            }}
                            onClick={() => {
                              setMicroIdx(realIdx);
                              setDiaIdx(0);
                            }}
                          >
                            {isMobile ? `M${realIdx + 1}` : micro.name}
                          </Button>
                        );
                      });
                    })()}
                  </Box>

                  <IconButton
                    size="small"
                    onClick={() => {
                      if (microIdx < micros.length - 1) {
                        setMicroIdx((prev) => prev + 1);
                        setDiaIdx(0);
                      }
                    }}
                    disabled={microIdx >= micros.length - 1}
                    sx={{
                      backgroundColor:
                        microIdx >= micros.length - 1
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(255, 224, 130, 0.2)",
                      color:
                        microIdx >= micros.length - 1
                          ? "rgba(255, 255, 255, 0.3)"
                          : "#ffe082",
                      backdropFilter: "blur(10px)",
                      border: `1px solid ${
                        microIdx >= micros.length - 1
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(255, 224, 130, 0.4)"
                      }`,
                      width: { xs: 32, sm: 40 },
                      height: { xs: 32, sm: 40 },
                      boxShadow:
                        microIdx >= micros.length - 1
                          ? "none"
                          : "0 2px 8px rgba(255, 224, 130, 0.2)",
                      "&:hover": {
                        backgroundColor:
                          microIdx >= micros.length - 1
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(255, 224, 130, 0.3)",
                        transform:
                          microIdx >= micros.length - 1
                            ? "none"
                            : "translateY(-1px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <ArrowForwardIosIcon
                      fontSize={isMobile ? "small" : "medium"}
                    />
                  </IconButton>
                </Box>
              )}
              {/* Días selector - Solo días con ejercicios */}
              {selectedMesoId &&
                micros.length > 0 &&
                micros[microIdx]?.days &&
                (() => {
                  const daysWithExercises = micros[microIdx].days.filter(
                    (day) =>
                      !day.esDescanso &&
                      day.exercises &&
                      day.exercises.length > 0
                  );

                  return (
                    <Tabs
                      value={diaIdx}
                      onChange={(_, v) => setDiaIdx(v)}
                      variant={
                        daysWithExercises.length <= 3
                          ? "standard"
                          : "scrollable"
                      }
                      scrollButtons={
                        daysWithExercises.length <= 3 ? false : "auto"
                      }
                      centered={daysWithExercises.length <= 3}
                      sx={{
                        mb: 2,
                        minHeight: { xs: 40, sm: 48 },
                        width: "100%",
                        maxWidth: "100%",
                        overflow: "hidden",
                        "& .MuiTabs-scroller": {
                          overflow: "auto !important",
                        },
                        "& .MuiTabs-scrollButtons": {
                          width: { xs: 28, sm: 32 },
                          color: "#2196f3",
                        },
                        "& .MuiTab-root": {
                          backgroundColor: "rgba(33, 150, 243, 0.15)",
                          color: "#2196f3",
                          margin: { xs: "0 2px", sm: "0 4px" },
                          borderRadius: { xs: "10px", sm: "12px" },
                          minHeight: { xs: 40, sm: 48 },
                          fontSize: { xs: "0.8rem", sm: "1rem" },
                          fontWeight: 600,
                          backdropFilter: "blur(15px)",
                          border: "1px solid rgba(33, 150, 243, 0.25)",
                          transition: "all 0.3s ease",
                          minWidth: { xs: 75, sm: 100 },
                          maxWidth: { xs: 95, sm: "none" },
                          textTransform: "none",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          boxShadow: "0 2px 6px rgba(33, 150, 243, 0.1)",
                          lineHeight: 1.2,
                          "&:hover": {
                            backgroundColor: "rgba(33, 150, 243, 0.25)",
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(33, 150, 243, 0.2)",
                          },
                        },
                        "& .MuiTab-root.Mui-selected": {
                          backgroundColor: "#2196f3",
                          color: "#fff",
                          fontWeight: 700,
                          transform: "scale(1.03)",
                          boxShadow: "0 6px 16px rgba(33, 150, 243, 0.5)",
                          border: "2px solid #2196f3",
                        },
                        "& .MuiTabs-indicator": {
                          display: "none",
                        },
                      }}
                    >
                      {micros[microIdx].days
                        .filter(
                          (day) =>
                            !day.esDescanso &&
                            day.exercises &&
                            day.exercises.length > 0
                        )
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
              {selectedMesoId &&
                micros.length > 0 &&
                micros[microIdx]?.days &&
                (() => {
                  // Filtrar días con ejercicios y ordenarlos
                  const diasConEjercicios = micros[microIdx].days
                    .filter(
                      (day) =>
                        !day.esDescanso &&
                        day.exercises &&
                        day.exercises.length > 0
                    )
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
                      <Typography
                        variant="body2"
                        color="#1976d2"
                        align="center"
                        mb={0.5}
                        sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
                      >
                        <strong>
                          {diaActual.nombre || `Día ${diaActual.dia}`}
                        </strong>
                        {diaActual.fecha ? (
                          <span
                            style={{
                              color: "#4caf50",
                              fontWeight: 600,
                              background: "rgba(76, 175, 80, 0.1)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              marginLeft: "8px",
                              fontSize: "0.9em",
                            }}
                          >
                            📅{" "}
                            {new Date(
                              diaActual.fecha + "T12:00:00"
                            ).toLocaleDateString("es-ES", {
                              weekday: "short",
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                            })}
                          </span>
                        ) : (
                          <span
                            style={{
                              color: "#20b2aa",
                              fontWeight: 500,
                              background: "rgba(32, 178, 170, 0.1)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              marginLeft: "8px",
                              fontSize: "0.9em",
                            }}
                          >
                            ⏳ Sin entrenar
                          </span>
                        )}
                      </Typography>
                      <Box
                        sx={{
                          flex: 1,
                          overflow: "auto",
                          pb: showTimer ? "100px" : "20px",
                          "&::-webkit-scrollbar": {
                            width: "8px",
                          },
                          "&::-webkit-scrollbar-track": {
                            background: "rgba(255, 255, 255, 0.05)",
                            borderRadius: "4px",
                          },
                          "&::-webkit-scrollbar-thumb": {
                            background: "rgba(255, 224, 130, 0.5)",
                            borderRadius: "4px",
                            "&:hover": {
                              background: "rgba(255, 224, 130, 0.7)",
                            },
                          },
                        }}
                      >
                        <Stack spacing={2}>
                          {diaActual.exercises
                            .sort((a, b) => {
                              // Ordenar por campo 'orden' si existe, sino por índice
                              const ordenA = a.orden || 0;
                              const ordenB = b.orden || 0;
                              return ordenA - ordenB;
                            })
                            .map((ej, i) => (
                              <Box
                                key={ej.id || i}
                                sx={{
                                  bgcolor: "#ffe082",
                                  borderRadius: 3,
                                  boxShadow:
                                    "0 8px 32px rgba(255, 224, 130, 0.4)",
                                  mb: 2,
                                  overflow: "hidden",
                                  border: "1px solid rgba(255, 255, 255, 0.1)",
                                }}
                              >
                                <Box sx={{ p: { xs: 0.5, sm: 1 } }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="h6"
                                      fontWeight="bold"
                                      align="center"
                                      color="#000"
                                      sx={{
                                        fontSize: { xs: "1rem", sm: "1.2rem" },
                                      }}
                                    >
                                      {ej.nombre || ej.name}
                                    </Typography>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenHistory(ej)}
                                      sx={{
                                        color: "#2196f3",
                                        backgroundColor:
                                          "rgba(33, 150, 243, 0.1)",
                                        "&:hover": {
                                          backgroundColor:
                                            "rgba(33, 150, 243, 0.2)",
                                        },
                                        width: { xs: 28, sm: 32 },
                                        height: { xs: 28, sm: 32 },
                                      }}
                                      title="Ver historial"
                                    >
                                      <HistoryIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    color="#000"
                                    align="center"
                                    sx={{
                                      fontSize: { xs: "0.9rem", sm: "1rem" },
                                      opacity: 0.8,
                                    }}
                                  >
                                    {/* Corregir datos intercambiados entre series y repeticiones */}
                                    {(() => {
                                      const series = ej.series || "";
                                      const reps =
                                        ej.repeticiones || ej.repRange || "";

                                      // Si series contiene un guión (ej: "10-12"), probablemente son repeticiones intercambiadas
                                      const correctSeries =
                                        series.includes("-") &&
                                        !reps.includes("-")
                                          ? reps
                                          : series;
                                      const correctReps =
                                        series.includes("-") &&
                                        !reps.includes("-")
                                          ? series
                                          : reps;

                                      return `${
                                        ej.grupoMuscular || ej.muscle
                                      } · ${correctSeries} series · Reps: ${correctReps} · Descanso: ${
                                        ej.descanso || ej.tempo
                                      }`;
                                    })()}
                                  </Typography>
                                  <Box
                                    sx={{
                                      mt: 1,
                                      overflow: "hidden",
                                      width: "100%",
                                    }}
                                  >
                                    <Box
                                      sx={{ overflowX: "auto", width: "100%" }}
                                    >
                                      <table
                                        style={{
                                          width: "100%",
                                          minWidth: isMobile ? "280px" : "auto",
                                          background:
                                            "rgba(255, 255, 255, 0.95)",
                                          fontSize: isMobile
                                            ? "0.7em"
                                            : "0.9em",
                                          borderCollapse: "separate",
                                          borderSpacing: "0",
                                          borderRadius: "12px",
                                          overflow: "hidden",
                                          backdropFilter: "blur(10px)",
                                          tableLayout: isMobile
                                            ? "fixed"
                                            : "auto",
                                        }}
                                      >
                                        <thead>
                                          <tr
                                            style={{
                                              backgroundColor:
                                                "rgba(33, 33, 33, 0.8)",
                                            }}
                                          >
                                            <th
                                              style={{
                                                fontWeight: "bold",
                                                borderBottom: "none",
                                                fontSize: isMobile
                                                  ? "0.65em"
                                                  : "0.8em",
                                                textAlign: "center",
                                                padding: isMobile
                                                  ? "6px 2px"
                                                  : "8px 4px",
                                                textTransform: "uppercase",
                                                color: "#fff",
                                                width: isMobile
                                                  ? "18%"
                                                  : "16.67%",
                                                borderTopLeftRadius: "12px",
                                              }}
                                            >
                                              {isMobile
                                                ? "REPS"
                                                : "REPETICIONES"}
                                            </th>
                                            <th
                                              style={{
                                                fontWeight: "bold",
                                                borderBottom: "none",
                                                fontSize: isMobile
                                                  ? "0.65em"
                                                  : "0.8em",
                                                textAlign: "center",
                                                padding: isMobile
                                                  ? "6px 2px"
                                                  : "8px 4px",
                                                textTransform: "uppercase",
                                                color: "#fff",
                                                width: isMobile
                                                  ? "14%"
                                                  : "16.67%",
                                              }}
                                            >
                                              REAL
                                            </th>
                                            <th
                                              style={{
                                                fontWeight: "bold",
                                                borderBottom: "none",
                                                fontSize: isMobile
                                                  ? "0.65em"
                                                  : "0.8em",
                                                textAlign: "center",
                                                padding: isMobile
                                                  ? "6px 2px"
                                                  : "8px 4px",
                                                textTransform: "uppercase",
                                                color: "#fff",
                                                width: isMobile
                                                  ? "16%"
                                                  : "16.67%",
                                              }}
                                            >
                                              CARGA
                                            </th>
                                            <th
                                              style={{
                                                fontWeight: "bold",
                                                borderBottom: "none",
                                                fontSize: isMobile
                                                  ? "0.65em"
                                                  : "0.8em",
                                                textAlign: "center",
                                                padding: isMobile
                                                  ? "6px 2px"
                                                  : "8px 4px",
                                                textTransform: "uppercase",
                                                color: "#fff",
                                                width: isMobile
                                                  ? "17%"
                                                  : "16.67%",
                                              }}
                                            >
                                              {isMobile ? "RIR E" : "RIR ESP"}
                                            </th>
                                            <th
                                              style={{
                                                fontWeight: "bold",
                                                borderBottom: "none",
                                                fontSize: isMobile
                                                  ? "0.65em"
                                                  : "0.8em",
                                                textAlign: "center",
                                                padding: isMobile
                                                  ? "6px 2px"
                                                  : "8px 4px",
                                                textTransform: "uppercase",
                                                color: "#fff",
                                                width: isMobile
                                                  ? "17%"
                                                  : "16.67%",
                                              }}
                                            >
                                              {isMobile ? "RIR R" : "RIR REAL"}
                                            </th>
                                            <th
                                              style={{
                                                fontWeight: "bold",
                                                borderBottom: "none",
                                                fontSize: isMobile
                                                  ? "0.65em"
                                                  : "0.8em",
                                                textAlign: "center",
                                                padding: isMobile
                                                  ? "6px 2px"
                                                  : "8px 4px",
                                                textTransform: "uppercase",
                                                color: "#fff",
                                                width: isMobile
                                                  ? "18%"
                                                  : "16.67%",
                                                borderTopRightRadius: "12px",
                                              }}
                                            >
                                              RPE
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {(() => {
                                            // Asegurar que siempre hay el número correcto de sets
                                            let sets = ej.sets || [];

                                            // Corregir el número de series si están intercambiadas
                                            const series = ej.series || "";
                                            const reps =
                                              ej.repeticiones ||
                                              ej.repRange ||
                                              "";
                                            const correctSeries =
                                              series.includes("-") &&
                                              !reps.includes("-")
                                                ? reps
                                                : series;
                                            const numSeries =
                                              parseInt(correctSeries) || 3;

                                            // Crear un array con todos los órdenes que deberían existir
                                            const expectedOrders = Array.from(
                                              { length: numSeries },
                                              (_, i) => i + 1
                                            );

                                            // Identificar qué órdenes faltan
                                            const existingOrders = sets.map(
                                              (s) => s.order || 0
                                            );
                                            const missingOrders =
                                              expectedOrders.filter(
                                                (order) =>
                                                  !existingOrders.includes(
                                                    order
                                                  )
                                              );

                                            // Crear sets temporales para los órdenes que faltan
                                            missingOrders.forEach((order) => {
                                              sets.push({
                                                id: `temp-${
                                                  ej.id
                                                }-${order}-${Date.now()}`,
                                                reps: 0,
                                                load: 0,
                                                actualRir: 0,
                                                actualRpe: 0,
                                                notes: "",
                                                order: order,
                                                exerciseId: ej.id, // Agregar referencia al ejercicio
                                              });
                                            });

                                            // Ordenar sets por order
                                            sets.sort(
                                              (a, b) =>
                                                (a.order || 0) - (b.order || 0)
                                            );

                                            return sets.map((serie, j) => {
                                              const isLastRow =
                                                j === sets.length - 1;
                                              return (
                                                <tr
                                                  key={serie.id || j}
                                                  style={{
                                                    cursor: "pointer",
                                                    backgroundColor:
                                                      j % 2 === 0
                                                        ? "rgba(255, 255, 255, 0.8)"
                                                        : "rgba(240, 240, 240, 0.8)",
                                                    transition: "all 0.2s ease",
                                                    minHeight: "48px",
                                                  }}
                                                  onClick={() =>
                                                    handleEditSet(serie, ej)
                                                  }
                                                  onMouseEnter={(e) => {
                                                    e.target.closest(
                                                      "tr"
                                                    ).style.backgroundColor =
                                                      "rgba(255, 193, 7, 0.3)";
                                                    e.target.closest(
                                                      "tr"
                                                    ).style.transform =
                                                      "scale(1.02)";
                                                  }}
                                                  onMouseLeave={(e) => {
                                                    e.target.closest(
                                                      "tr"
                                                    ).style.backgroundColor =
                                                      j % 2 === 0
                                                        ? "rgba(255, 255, 255, 0.8)"
                                                        : "rgba(240, 240, 240, 0.8)";
                                                    e.target.closest(
                                                      "tr"
                                                    ).style.transform =
                                                      "scale(1)";
                                                  }}
                                                >
                                                  <td
                                                    style={{
                                                      fontSize: isMobile
                                                        ? "0.8em"
                                                        : "0.9em",
                                                      textAlign: "center",
                                                      padding: isMobile
                                                        ? "8px 2px"
                                                        : "12px 4px",
                                                      textTransform: "none",
                                                      color: "#222",
                                                      fontWeight: "500",
                                                      ...(isLastRow && {
                                                        borderBottomLeftRadius:
                                                          "12px",
                                                      }),
                                                    }}
                                                  >
                                                    {ej.repeticiones ||
                                                      ej.repRange}
                                                  </td>
                                                  <td
                                                    style={{
                                                      fontSize: isMobile
                                                        ? "0.8em"
                                                        : "0.9em",
                                                      textAlign: "center",
                                                      padding: isMobile
                                                        ? "8px 2px"
                                                        : "12px 4px",
                                                      textTransform: "none",
                                                      color: "#222",
                                                      fontWeight:
                                                        serie.reps > 0
                                                          ? "bold"
                                                          : "normal",
                                                    }}
                                                  >
                                                    {serie.reps || 0}
                                                  </td>
                                                  <td
                                                    style={{
                                                      fontSize: isMobile
                                                        ? "0.8em"
                                                        : "0.9em",
                                                      textAlign: "center",
                                                      padding: isMobile
                                                        ? "8px 2px"
                                                        : "12px 4px",
                                                      textTransform: "none",
                                                      color: "#222",
                                                      fontWeight:
                                                        serie.load > 0
                                                          ? "bold"
                                                          : "normal",
                                                    }}
                                                  >
                                                    {serie.load || 0}
                                                  </td>
                                                  <td
                                                    style={{
                                                      fontSize: isMobile
                                                        ? "0.8em"
                                                        : "0.9em",
                                                      textAlign: "center",
                                                      padding: isMobile
                                                        ? "8px 2px"
                                                        : "12px 4px",
                                                      textTransform: "none",
                                                      color: "#222",
                                                      fontWeight: "500",
                                                    }}
                                                  >
                                                    {ej.rirEsperado ||
                                                      serie.expectedRir ||
                                                      0}
                                                  </td>
                                                  <td
                                                    style={{
                                                      fontSize: isMobile
                                                        ? "0.8em"
                                                        : "0.9em",
                                                      textAlign: "center",
                                                      padding: isMobile
                                                        ? "8px 2px"
                                                        : "12px 4px",
                                                      textTransform: "none",
                                                      color: "#222",
                                                      fontWeight:
                                                        serie.actualRir > 0
                                                          ? "bold"
                                                          : "normal",
                                                    }}
                                                  >
                                                    {serie.actualRir || 0}
                                                  </td>
                                                  <td
                                                    style={{
                                                      fontSize: isMobile
                                                        ? "0.8em"
                                                        : "0.9em",
                                                      textAlign: "center",
                                                      padding: isMobile
                                                        ? "8px 2px"
                                                        : "12px 4px",
                                                      textTransform: "none",
                                                      color: "#222",
                                                      fontWeight:
                                                        serie.actualRpe > 0
                                                          ? "bold"
                                                          : "normal",
                                                      ...(isLastRow && {
                                                        borderBottomRightRadius:
                                                          "12px",
                                                      }),
                                                    }}
                                                  >
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
                                    const series = ej.series || "";
                                    const reps =
                                      ej.repeticiones || ej.repRange || "";
                                    const correctSeries =
                                      series.includes("-") &&
                                      !reps.includes("-")
                                        ? reps
                                        : series;
                                    const numSeries =
                                      parseInt(correctSeries) || 3;

                                    // Si faltan sets, completar con sets temporales
                                    while (sets.length < numSeries) {
                                      const newOrder = sets.length + 1;
                                      sets.push({
                                        id: `temp-${
                                          ej.id
                                        }-${newOrder}-${Date.now()}`,
                                        notes: "",
                                      });
                                    }

                                    return (
                                      sets &&
                                      sets.some((s) => s.notes) && (
                                        <Box sx={{ mt: 1 }}>
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                              fontSize: {
                                                xs: "0.85rem",
                                                sm: "0.95rem",
                                              },
                                              textAlign: "center",
                                              bgcolor: "#fffde7",
                                              borderRadius: 2,
                                              p: 1,
                                            }}
                                          >
                                            <strong>Observaciones:</strong>{" "}
                                            {sets
                                              .filter((s) => s.notes)
                                              .map((s) => s.notes)
                                              .join(" · ")}
                                          </Typography>
                                        </Box>
                                      )
                                    );
                                  })()}
                                </Box>
                              </Box>
                            ))}
                        </Stack>
                      </Box>
                    </>
                  ) : null;
                })()}
            </>
          )}
        </>
      )}
      {/* Timer de descanso widget */}
      {showTimer && (
        <RestTimerWidget
          restTime={timerDuration}
          onComplete={handleTimerComplete}
          onDismiss={handleTimerDismiss}
        />
      )}

      <EditSetModal
        open={editModalOpen}
        set={selectedSet || {}}
        restTime={
          selectedExerciseForSet
            ? (parseInt(selectedExerciseForSet.descanso) || 0) * 60
            : 0
        }
        onSave={handleSaveSet}
        onClose={() => setEditModalOpen(false)}
        onStartTimer={handleStartTimer}
      />

      {/* Modal de Historial del Ejercicio */}
      {historyModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: isMobile ? "16px" : "24px",
          }}
          onClick={() => setHistoryModalOpen(false)}
        >
          <div
            style={{
              background: "#222",
              padding: isMobile ? 16 : 24,
              borderRadius: 12,
              minWidth: isMobile ? "90%" : 500,
              maxWidth: isMobile ? "95%" : 600,
              maxHeight: "80vh",
              overflowY: "auto",
              color: "#fff",
              boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{
                  color: "#ffe082",
                  fontSize: { xs: "1.2rem", sm: "1.5rem" },
                }}
              >
                💪 {selectedExercise?.nombre || selectedExercise?.name}
              </Typography>
              <Button
                size="small"
                onClick={() =>
                  setHistoryViewMode(
                    historyViewMode === "friendly" ? "compact" : "friendly"
                  )
                }
                sx={{
                  color: "#fff",
                  fontSize: "0.75rem",
                  textTransform: "none",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                }}
              >
                {historyViewMode === "friendly" ? "📊 Compacto" : "💚 Amigable"}
              </Button>
            </Box>

            {exerciseHistory.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Typography variant="h6" sx={{ color: "#999", mb: 1 }}>
                  📭
                </Typography>
                <Typography align="center" color="text.secondary">
                  No hay historial disponible para este ejercicio en microciclos
                  anteriores.
                </Typography>
              </Box>
            ) : historyViewMode === "friendly" ? (
              // VERSIÓN FRIENDLY - Más visual y amigable
              <Stack spacing={2.5}>
                {exerciseHistory.map((entry, index) => {
                  // Calcular progresión (comparar con la sesión más reciente anterior)
                  // El índice 0 es el más reciente, así que comparamos con el siguiente en el array (más antiguo)
                  // Pero queremos mostrar "cuánto subiste desde la última vez", así que comparamos con el más reciente anterior
                  const nextEntry = exerciseHistory[index + 1]; // Más antiguo en el tiempo
                  const loadChange = nextEntry
                    ? entry.maxLoad - nextEntry.maxLoad
                    : 0;
                  const loadChangePercent =
                    nextEntry && nextEntry.maxLoad > 0
                      ? ((loadChange / nextEntry.maxLoad) * 100).toFixed(0)
                      : null;

                  return (
                    <Box
                      key={index}
                      sx={{
                        bgcolor: entry.isSameDay
                          ? "linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.1) 100%)"
                          : "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)",
                        borderRadius: 3,
                        p: 3,
                        border: entry.isSameDay
                          ? "2px solid #4caf50"
                          : "1px solid rgba(255, 255, 255, 0.15)",
                        transition: "all 0.3s ease",
                        position: "relative",
                        overflow: "hidden",
                        "&::before": entry.isSameDay
                          ? {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "4px",
                              height: "100%",
                              bgcolor: "#4caf50",
                              borderRadius: "3px 0 0 3px",
                            }
                          : {},
                        "&:hover": {
                          transform: "translateY(-4px) scale(1.02)",
                          boxShadow: entry.isSameDay
                            ? "0 8px 24px rgba(76, 175, 80, 0.3)"
                            : "0 8px 24px rgba(0, 0, 0, 0.3)",
                        },
                      }}
                    >
                      {/* Header con fecha y badge */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{
                              color: entry.isSameDay ? "#4caf50" : "#fff",
                              fontSize: { xs: "1rem", sm: "1.1rem" },
                              mb: 0.5,
                            }}
                          >
                            {entry.microName}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#999", fontSize: "0.85rem" }}
                          >
                            {entry.dayName}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          {entry.isSameDay && (
                            <Box
                              sx={{
                                bgcolor: "#4caf50",
                                color: "#fff",
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                mb: 1,
                                display: "inline-block",
                              }}
                            >
                              ⭐ Mismo día
                            </Box>
                          )}
                          {entry.fecha && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#999",
                                fontSize: "0.8rem",
                                display: "block",
                                mt: entry.isSameDay ? 0.5 : 0,
                              }}
                            >
                              📅{" "}
                              {new Date(
                                entry.fecha + "T12:00:00"
                              ).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "short",
                                year: "2-digit",
                              })}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Carga principal destacada */}
                      <Box
                        sx={{
                          bgcolor: "rgba(255, 224, 130, 0.2)",
                          borderRadius: 2,
                          p: 2,
                          mb: 2,
                          border: "1px solid rgba(255, 224, 130, 0.3)",
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#ffe082",
                            display: "block",
                            fontSize: "0.85rem",
                            mb: 0.5,
                          }}
                        >
                          💪 Carga Máxima
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            sx={{ color: "#fff" }}
                          >
                            {entry.maxLoad}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#999", fontSize: "1rem" }}
                          >
                            kg
                          </Typography>
                          {loadChangePercent && (
                            <Typography
                              variant="caption"
                              sx={{
                                bgcolor:
                                  loadChange > 0
                                    ? "rgba(76, 175, 80, 0.3)"
                                    : loadChange < 0
                                    ? "rgba(244, 67, 54, 0.3)"
                                    : "rgba(158, 158, 158, 0.3)",
                                color:
                                  loadChange > 0
                                    ? "#4caf50"
                                    : loadChange < 0
                                    ? "#f44336"
                                    : "#9e9e9e",
                                px: 1,
                                py: 0.3,
                                borderRadius: 1,
                                fontSize: "0.7rem",
                                fontWeight: "bold",
                              }}
                            >
                              {loadChange > 0
                                ? "↑"
                                : loadChange < 0
                                ? "↓"
                                : "="}{" "}
                              {Math.abs(loadChangePercent)}%
                            </Typography>
                          )}
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#999",
                            fontSize: "0.75rem",
                            mt: 0.5,
                            display: "block",
                          }}
                        >
                          Promedio: {Math.round(entry.avgLoad)} kg
                        </Typography>
                      </Box>

                      {/* Métricas secundarias en fila */}
                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        <Box
                          sx={{
                            flex: 1,
                            bgcolor: "rgba(33, 150, 243, 0.15)",
                            borderRadius: 2,
                            p: 1.5,
                            textAlign: "center",
                            border: "1px solid rgba(33, 150, 243, 0.2)",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#2196f3",
                              display: "block",
                              mb: 0.5,
                              fontSize: "0.75rem",
                            }}
                          >
                            🔢 Reps
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{ color: "#fff" }}
                          >
                            {entry.maxReps}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            flex: 1,
                            bgcolor: "rgba(76, 175, 80, 0.15)",
                            borderRadius: 2,
                            p: 1.5,
                            textAlign: "center",
                            border: "1px solid rgba(76, 175, 80, 0.2)",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#4caf50",
                              display: "block",
                              mb: 0.5,
                              fontSize: "0.75rem",
                            }}
                          >
                            📊 Sets
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{ color: "#fff" }}
                          >
                            {entry.sets}
                          </Typography>
                        </Box>

                        {entry.avgRir !== null && (
                          <Box
                            sx={{
                              flex: 1,
                              bgcolor: "rgba(32, 178, 170, 0.15)",
                              borderRadius: 2,
                              p: 1.5,
                              textAlign: "center",
                              border: "1px solid rgba(32, 178, 170, 0.2)",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#20b2aa",
                                display: "block",
                                mb: 0.5,
                                fontSize: "0.75rem",
                              }}
                            >
                              ⚡ RIR
                            </Typography>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              sx={{ color: "#fff" }}
                            >
                              {entry.avgRir.toFixed(1)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            ) : (
              // VERSIÓN COMPACTA - La original
              <Stack spacing={2}>
                {exerciseHistory.map((entry, index) => (
                  <Box
                    key={index}
                    sx={{
                      bgcolor: entry.isSameDay
                        ? "rgba(76, 175, 80, 0.15)"
                        : "rgba(255, 255, 255, 0.05)",
                      borderRadius: 2,
                      p: 2,
                      border: entry.isSameDay
                        ? "2px solid #4caf50"
                        : "1px solid rgba(255, 255, 255, 0.1)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: entry.isSameDay
                          ? "rgba(76, 175, 80, 0.2)"
                          : "rgba(255, 255, 255, 0.08)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{
                            color: entry.isSameDay ? "#4caf50" : "#2196f3",
                          }}
                        >
                          {entry.microName} - {entry.dayName}
                        </Typography>
                        {entry.isSameDay && (
                          <Typography
                            variant="caption"
                            sx={{
                              bgcolor: "#4caf50",
                              color: "#fff",
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontWeight: "bold",
                            }}
                          >
                            Mismo día
                          </Typography>
                        )}
                      </Box>
                      {entry.fecha && (
                        <Typography variant="caption" sx={{ color: "#4caf50" }}>
                          📅{" "}
                          {new Date(
                            entry.fecha + "T12:00:00"
                          ).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          })}
                        </Typography>
                      )}
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 1.5,
                        mt: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: "rgba(255, 224, 130, 0.15)",
                          borderRadius: 1,
                          p: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "#ffe082", display: "block" }}
                        >
                          Carga Máx
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          sx={{ color: "#fff" }}
                        >
                          {entry.maxLoad} kg
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          bgcolor: "rgba(255, 224, 130, 0.15)",
                          borderRadius: 1,
                          p: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "#ffe082", display: "block" }}
                        >
                          Carga Prom
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          sx={{ color: "#fff" }}
                        >
                          {Math.round(entry.avgLoad)} kg
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          bgcolor: "rgba(33, 150, 243, 0.15)",
                          borderRadius: 1,
                          p: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "#2196f3", display: "block" }}
                        >
                          Reps Máx
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          sx={{ color: "#fff" }}
                        >
                          {entry.maxReps}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          bgcolor: "rgba(76, 175, 80, 0.15)",
                          borderRadius: 1,
                          p: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "#4caf50", display: "block" }}
                        >
                          Sets
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          sx={{ color: "#fff" }}
                        >
                          {entry.sets}
                        </Typography>
                      </Box>
                    </Box>

                    {entry.avgRir !== null && (
                      <Box
                        sx={{
                          mt: 1.5,
                          pt: 1.5,
                          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <Typography variant="caption" sx={{ color: "#20b2aa" }}>
                          RIR Promedio:{" "}
                          <strong>{entry.avgRir.toFixed(1)}</strong>
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
              </Stack>
            )}

            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Button
                onClick={() => setHistoryModalOpen(false)}
                variant="contained"
                sx={{
                  backgroundColor: "#2196f3",
                  color: "#fff",
                  fontWeight: 600,
                  px: 4,
                  "&:hover": {
                    backgroundColor: "#1976d2",
                  },
                }}
              >
                Cerrar
              </Button>
            </Box>
          </div>
        </div>
      )}

      {/* Botón flotante para navegar al día de hoy - se muestra solo cuando NO estás viendo el día de hoy */}
      {selectedMesoId &&
        micros.length > 0 &&
        findTodayDay() !== null &&
        !isCurrentDayToday() && (
          <Fab
            color="primary"
            aria-label="Ir al día de hoy"
            onClick={navigateToToday}
            sx={{
              position: "fixed",
              bottom: { xs: 80, sm: 24 },
              right: { xs: 16, sm: 24 },
              backgroundColor: "#2196f3",
              color: "#fff",
              zIndex: 1000,
              boxShadow: "0 4px 12px rgba(33, 150, 243, 0.4)",
              "&:hover": {
                backgroundColor: "#1976d2",
                boxShadow: "0 6px 16px rgba(33, 150, 243, 0.6)",
                transform: "scale(1.05)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <TodayIcon />
          </Fab>
        )}
    </Box>
  );
};
