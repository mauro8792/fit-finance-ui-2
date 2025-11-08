import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import HistoryIcon from "@mui/icons-material/History";
import TodayIcon from "@mui/icons-material/Today";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {
  Box,
  Button,
  CircularProgress,
  Fab,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import EditSetModal from "../../components/EditSetModal";
import RestTimerWidget from "../../components/RestTimerWidget";
import { useAuthStore } from "../../hooks";
import { useRoutineStore } from "../../hooks/useRoutineStore";
import { getEnvVariables } from "../../helpers/getEnvVariables";

const { VITE_API_URL } = getEnvVariables();

// Componente para ejercicios arrastrables
const SortableExercise = ({ exercise, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 1000 : 1,
    cursor: isDragging ? "grabbing" : "default",
    scale: isDragging ? "1.02" : "1",
  };

  // Pasar los attributes y listeners al children mediante función
  const childrenWithDragHandle =
    typeof children === "function"
      ? children({ attributes, listeners })
      : children;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        bgcolor: "#ffe082",
        borderRadius: 3,
        boxShadow: isDragging
          ? "0 12px 48px rgba(255, 224, 130, 0.8)"
          : "0 8px 32px rgba(255, 224, 130, 0.4)",
        mb: 2,
        overflow: "hidden",
        border: isDragging
          ? "2px solid #ffc107"
          : "1px solid rgba(255, 255, 255, 0.1)",
        position: "relative",
      }}
    >
      {childrenWithDragHandle}
    </Box>
  );
};

SortableExercise.propTypes = {
  exercise: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

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
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuExercise, setMenuExercise] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  // Timer de descanso
  const [showTimer, setShowTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);

  // Configuración de drag & drop con activación más sensible
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Activar después de mover 5px (más sensible)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Función para manejar el reordenamiento de ejercicios
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

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
    const exercises = diaActual.exercises;

    const oldIndex = exercises.findIndex((ex) => ex.id === active.id);
    const newIndex = exercises.findIndex((ex) => ex.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reordenar los ejercicios localmente
    const reorderedExercises = arrayMove(exercises, oldIndex, newIndex);

    // Actualizar el campo 'orden' para cada ejercicio
    const updatedExercises = reorderedExercises.map((ex, index) => ({
      ...ex,
      orden: index + 1,
    }));

    // Actualizar el estado local
    setMicros((prevMicros) => {
      const newMicros = [...prevMicros];
      newMicros[microIdx].days[diaIdx].exercises = updatedExercises;
      return newMicros;
    });

    // Actualizar en el backend
    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const token = localStorage.getItem("token");

      await fetch(`${apiUrl}/exercise/reorder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          exercises: updatedExercises.map((ex) => ({
            id: ex.id,
            orden: ex.orden,
          })),
        }),
      });
    } catch (error) {
      console.error("Error al reordenar ejercicios:", error);
      // Revertir cambios en caso de error
      const microsResult = await fetchMicrocyclesByMesocycle(selectedMesoId);
      setMicros(microsResult);
    }
  };

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

  // Cuando selecciona un macrocycle, buscar mesocycles ACTIVOS/PUBLICADOS solamente
  useEffect(() => {
    const fetchMesos = async () => {
      if (!selectedMacroId || !student?.id) return;
      setLoading(true);
      try {
        // 🆕 Usar el nuevo endpoint que filtra por estado
        const response = await fetch(`${VITE_API_URL}/mesocycle/student/${student.id}/active`);
        const data = await response.json();
        
        if (data.mesocycle) {
          // Solo mostrar el mesociclo activo/publicado
          setMesos([data.mesocycle]);
          setMicros([]);
          setMesoIdx(0);
          setMicroIdx(0);
          setDiaIdx(0);
          setSelectedMesoId(data.mesocycle.id);
          setError(null);
        } else {
          setMesos([]);
          setSelectedMesoId("");
          setError(data.message || "No tienes una rutina activa asignada.");
        }
      } catch (err) {
        setError(err.message || "Error cargando rutina activa");
        setMesos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMesos();
  }, [selectedMacroId, student?.id]);

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

  const handleAddExtraSet = async (exercise) => {
    try {
      // Contar cuántos sets extra ya existen para este ejercicio
      const existingSets = exercise.sets || [];
      const extraSetsCount = existingSets.filter((s) => s.isExtra).length;

      // Límite de 5 sets extras
      if (extraSetsCount >= 5) {
        alert("Has alcanzado el límite de 5 sets extras por ejercicio");
        return;
      }

      // Obtener el orden más alto actual
      const maxOrder =
        existingSets.length > 0
          ? Math.max(...existingSets.map((s) => s.order || 0))
          : 0;

      // Crear el nuevo set extra
      const newExtraSet = {
        id: `temp-extra-${exercise.id}-${Date.now()}`,
        reps: 0,
        load: 0,
        actualRir: 0,
        actualRpe: 0,
        notes: "",
        order: maxOrder + 1,
        isExtra: true,
        exerciseId: exercise.id,
      };

      // Actualizar el estado local agregando el set extra
      setMicros((prevMicros) => {
        const newMicros = [...prevMicros];
        const currentMicro = newMicros[microIdx];
        const currentDay = currentMicro.days[diaIdx];
        const exerciseIndex = currentDay.exercises.findIndex(
          (ex) => ex.id === exercise.id
        );

        if (exerciseIndex !== -1) {
          currentDay.exercises[exerciseIndex].sets = [
            ...(currentDay.exercises[exerciseIndex].sets || []),
            newExtraSet,
          ];
        }

        return newMicros;
      });

      // Abrir el modal para editar el set extra inmediatamente
      setSelectedSet(newExtraSet);
      setSelectedExerciseForSet(exercise);
      setEditModalOpen(true);
    } catch (error) {
      console.error("Error al agregar set extra:", error);
      alert("Error al agregar set extra");
    }
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
    console.log("🔍 getExerciseHistory - Start", {
      exerciseId: exercise.id,
      exerciseName:
        exercise.exerciseCatalog?.name || exercise.nombre || exercise.name,
      currentMicroIdx: microIdx,
      totalMicros: micros?.length || 0,
    });

    if (!exercise || !micros || micros.length === 0) return [];

    const history = [];
    const exerciseName =
      exercise.exerciseCatalog?.name || exercise.nombre || exercise.name;
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
            ej.id === exerciseId ||
            (ej.exerciseCatalog?.name || ej.nombre || ej.name) === exerciseName
        );

        if (
          foundExercise &&
          foundExercise.sets &&
          foundExercise.sets.length > 0
        ) {
          // Obtener la carga promedio y máxima de los sets
          const sets = foundExercise.sets.filter((s) => s.load > 0);
          console.log(
            `  📌 Found exercise in M${i + 1}, sets with load:`,
            sets.length
          );
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

            // Calcular días transcurridos correctamente
            let daysDiffCalc = 0;
            if (day.fecha) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              // Parsear la fecha correctamente
              let sessionDate;
              if (day.fecha.includes("/")) {
                // Formato DD/MM/YY o DD/MM/YYYY
                const parts = day.fecha.split("/");
                if (parts.length === 3) {
                  const dayNum = parseInt(parts[0], 10);
                  const month = parseInt(parts[1], 10) - 1;
                  let year = parseInt(parts[2], 10);
                  if (year < 100) {
                    year += 2000;
                  }
                  sessionDate = new Date(year, month, dayNum);
                } else {
                  sessionDate = new Date(day.fecha);
                }
              } else {
                sessionDate = new Date(day.fecha + "T12:00:00");
              }

              sessionDate.setHours(0, 0, 0, 0);
              daysDiffCalc = Math.floor(
                (today - sessionDate) / (1000 * 60 * 60 * 24)
              );
            }

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
              sets: foundExercise.sets, // ✅ Guardar el array completo de sets
              totalSets: sets.length, // ✅ Guardar también el número de sets
              microIndex: i,
              isSameDay, // Marcar si es el mismo día
              daysDiff: daysDiffCalc, // ✅ Calcular días transcurridos
            });
          }
        }
      }
    }

    // Ordenar: primero por si es el mismo día (prioridad), luego por microciclo (más reciente primero)
    const sortedHistory = history.sort((a, b) => {
      if (a.isSameDay && !b.isSameDay) return -1;
      if (!a.isSameDay && b.isSameDay) return 1;
      return b.microIndex - a.microIndex;
    });

    console.log(
      "📊 getExerciseHistory - Result:",
      sortedHistory.length,
      "sessions found"
    );
    return sortedHistory;
  };

  // Función para abrir el modal de historial
  const handleOpenHistory = (exercise) => {
    setSelectedExercise(exercise);
    const history = getExerciseHistory(exercise);
    setExerciseHistory(history);
    setHistoryModalOpen(true);
  };

  // Funciones para el menú de opciones
  const handleOpenMenu = (event, exercise) => {
    console.log('🎯 handleOpenMenu LLAMADO');
    console.log('📍 event.currentTarget:', event.currentTarget);
    console.log('🏋️ exercise:', exercise);
    setMenuAnchorEl(event.currentTarget);
    setMenuExercise(exercise);
    console.log('✅ Estados actualizados');
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuExercise(null);
  };

  // Funciones para el modal de video
  const handleOpenVideo = (url) => {
    console.log('🎬 handleOpenVideo - URL original:', url);
    
    // Convertir URL de YouTube a formato embed
    let embedUrl = url;
    
    // Si es una URL de búsqueda de YouTube, no la podemos embedear
    if (url.includes('youtube.com/results')) {
      console.log('⚠️ URL de búsqueda de YouTube, abriendo en nueva pestaña');
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Convertir URL normal de YouTube a embed
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
      console.log('✅ Convertido a embed URL:', embedUrl);
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
      console.log('✅ Convertido a embed URL:', embedUrl);
    }
    
    setVideoUrl(embedUrl);
    setVideoModalOpen(true);
    console.log('✅ Modal de video abierto');
  };

  const handleCloseVideo = () => {
    setVideoModalOpen(false);
    setVideoUrl("");
  };

  const handleMenuAction = (action) => {
    console.log('🎯 handleMenuAction LLAMADO con acción:', action);
    console.log('📋 menuExercise existe?', !!menuExercise);
    
    if (!menuExercise) {
      console.log('❌ menuExercise es null/undefined, abortando');
      return;
    }
    
    console.log('📋 menuExercise completo:', menuExercise);
    
    // Guardar referencia al ejercicio antes de cerrar el menú
    const exercise = menuExercise;
    
    // Cerrar el menú PRIMERO
    handleCloseMenu();
    
    // Ejecutar acción DESPUÉS con un pequeño delay
    setTimeout(() => {
      console.log('⏰ Ejecutando acción después del timeout:', action);
      
      switch (action) {
        case 'history':
          console.log('📊 Abriendo historial...');
          handleOpenHistory(exercise);
          break;
        case 'addSet':
          console.log('➕ Agregando set extra...');
          handleAddExtraSet(exercise);
          break;
        case 'video':
          const videoUrlToOpen = exercise.exerciseCatalog?.videoUrl;
          console.log('🎥 Intentando abrir video:', videoUrlToOpen);
          if (videoUrlToOpen) {
            console.log('✅ Abriendo video en modal...');
            handleOpenVideo(videoUrlToOpen);
          } else {
            console.log('❌ No hay videoUrl disponible');
            alert('Este ejercicio no tiene video disponible');
          }
          break;
        default:
          console.log('⚠️ Acción no reconocida:', action);
          break;
      }
    }, 100);
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
        // Crear nuevo set (excluir el id temporal y exerciseId)
        // eslint-disable-next-line no-unused-vars
        const { id, exerciseId, ...setDataWithoutId } = form;
        response = await fetch(`${apiUrl}/exercise/${ejercicioId}/sets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...setDataWithoutId,
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
                                  ? micro.isDeload
                                    ? "#64b5f6"
                                    : "#ffe082"
                                  : micro.isDeload
                                  ? "rgba(33, 150, 243, 0.15)"
                                  : "rgba(255, 255, 255, 0.08)",
                              color: realIdx === microIdx ? "#222" : micro.isDeload ? "#64b5f6" : "#fff",
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
                            {micro.isDeload && "🔵 "}
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
              
              {/* Alert de Semana de Descarga */}
              {micros.length > 0 && micros[microIdx]?.isDeload && (
                <Alert
                  severity="info"
                  icon="🔵"
                  sx={{
                    mt: 2,
                    mb: 2,
                    backgroundColor: "rgba(33, 150, 243, 0.15)",
                    color: "#64b5f6",
                    border: "1px solid rgba(33, 150, 243, 0.3)",
                    borderRadius: "12px",
                    backdropFilter: "blur(10px)",
                    "& .MuiAlert-icon": {
                      color: "#64b5f6",
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Semana de Descarga
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#90caf9" }}>
                    Reduce las cargas un 20-30% y aumenta el RIR +2-3 puntos. Esta semana es para recuperación y adaptación.
                  </Typography>
                </Alert>
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
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={diaActual.exercises.map((ex) => ex.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <Stack spacing={3}>
                              {diaActual.exercises
                                .sort((a, b) => {
                                  // Ordenar por campo 'orden' si existe, sino por índice
                                  const ordenA = a.orden || 0;
                                  const ordenB = b.orden || 0;
                                  return ordenA - ordenB;
                                })
                                .map((ej) => (
                                  <SortableExercise key={ej.id} exercise={ej}>
                                    {({ attributes, listeners }) => (
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
                                              fontSize: {
                                                xs: "1rem",
                                                sm: "1.2rem",
                                              },
                                            }}
                                          >
                                            {ej.exerciseCatalog?.name ||
                                              ej.nombre ||
                                              ej.name ||
                                              "Ejercicio"}
                                          </Typography>
                                          <IconButton
                                            size="small"
                                            {...attributes}
                                            {...listeners}
                                            sx={{
                                              color: "rgba(0, 0, 0, 0.5)",
                                              backgroundColor:
                                                "rgba(0, 0, 0, 0.05)",
                                              "&:hover": {
                                                backgroundColor:
                                                  "rgba(255, 193, 7, 0.2)",
                                                color: "rgba(0, 0, 0, 0.7)",
                                              },
                                              width: { xs: 28, sm: 32 },
                                              height: { xs: 28, sm: 32 },
                                              cursor: "grab",
                                              "&:active": {
                                                cursor: "grabbing",
                                              },
                                              touchAction: "none",
                                              mr: 1,
                                            }}
                                            title="Reordenar ejercicio"
                                          >
                                            <DragIndicatorIcon fontSize="small" />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => handleOpenMenu(e, ej)}
                                            sx={{
                                              color: "rgba(0, 0, 0, 0.7)",
                                              backgroundColor:
                                                "rgba(0, 0, 0, 0.05)",
                                              "&:hover": {
                                                backgroundColor:
                                                  "rgba(0, 0, 0, 0.1)",
                                              },
                                              width: { xs: 32, sm: 36 },
                                              height: { xs: 32, sm: 36 },
                                            }}
                                            title="Opciones"
                                          >
                                            <MoreVertIcon fontSize="small" />
                                          </IconButton>
                                        </Box>

                                        <Typography
                                          variant="body2"
                                          color="#000"
                                          align="center"
                                          sx={{
                                            fontSize: {
                                              xs: "0.9rem",
                                              sm: "1rem",
                                            },
                                            opacity: 0.8,
                                          }}
                                        >
                                          {/* Corregir datos intercambiados entre series y repeticiones */}
                                          {(() => {
                                            const series = ej.series || "";
                                            const reps =
                                              ej.repeticiones ||
                                              ej.repRange ||
                                              "";

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
                                              ej.exerciseCatalog?.muscleGroup ||
                                              ej.grupoMuscular ||
                                              ej.muscle
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
                                            sx={{
                                              overflowX: "auto",
                                              width: "100%",
                                            }}
                                          >
                                            <table
                                              style={{
                                                width: "100%",
                                                minWidth: isMobile
                                                  ? "280px"
                                                  : "auto",
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
                                                      textTransform:
                                                        "uppercase",
                                                      color: "#fff",
                                                      width: isMobile
                                                        ? "18%"
                                                        : "16.67%",
                                                      borderTopLeftRadius:
                                                        "12px",
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
                                                      textTransform:
                                                        "uppercase",
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
                                                      textTransform:
                                                        "uppercase",
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
                                                      textTransform:
                                                        "uppercase",
                                                      color: "#fff",
                                                      width: isMobile
                                                        ? "17%"
                                                        : "16.67%",
                                                    }}
                                                  >
                                                    {isMobile
                                                      ? "RIR E"
                                                      : "RIR ESP"}
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
                                                      textTransform:
                                                        "uppercase",
                                                      color: "#fff",
                                                      width: isMobile
                                                        ? "17%"
                                                        : "16.67%",
                                                    }}
                                                  >
                                                    {isMobile
                                                      ? "RIR R"
                                                      : "RIR REAL"}
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
                                                      textTransform:
                                                        "uppercase",
                                                      color: "#fff",
                                                      width: isMobile
                                                        ? "18%"
                                                        : "16.67%",
                                                      borderTopRightRadius:
                                                        "12px",
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
                                                  const series =
                                                    ej.series || "";
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
                                                    parseInt(correctSeries) ||
                                                    3;

                                                  // Crear un array con todos los órdenes que deberían existir
                                                  const expectedOrders =
                                                    Array.from(
                                                      { length: numSeries },
                                                      (_, i) => i + 1
                                                    );

                                                  // Identificar qué órdenes faltan
                                                  const existingOrders =
                                                    sets.map(
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
                                                  missingOrders.forEach(
                                                    (order) => {
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
                                                    }
                                                  );

                                                  // Ordenar sets por order
                                                  sets.sort(
                                                    (a, b) =>
                                                      (a.order || 0) -
                                                      (b.order || 0)
                                                  );

                                                  return sets.map(
                                                    (serie, j) => {
                                                      const isLastRow =
                                                        j === sets.length - 1;
                                                      const isExtraSet =
                                                        serie.isExtra === true;
                                                      const isAmrapSet =
                                                        serie.isAmrap === true;
                                                      const setStatus =
                                                        serie.status ||
                                                        "completed";

                                                      // Determinar color de fondo según estado
                                                      let bgColor, borderColor;
                                                      if (
                                                        setStatus === "failed"
                                                      ) {
                                                        bgColor =
                                                          "rgba(244, 67, 54, 0.15)"; // Rojo claro para fallidos
                                                        borderColor = "#f44336";
                                                      } else if (
                                                        setStatus === "skipped"
                                                      ) {
                                                        bgColor =
                                                          "rgba(255, 152, 0, 0.15)"; // Naranja claro para saltados
                                                        borderColor = "#ff9800";
                                                      } else if (isAmrapSet) {
                                                        bgColor =
                                                          "rgba(255, 193, 7, 0.15)"; // Amarillo dorado para AMRAP
                                                        borderColor = "#ffc107";
                                                      } else if (isExtraSet) {
                                                        bgColor =
                                                          "rgba(76, 175, 80, 0.15)"; // Verde claro para extras
                                                        borderColor = "#4caf50";
                                                      } else {
                                                        bgColor =
                                                          j % 2 === 0
                                                            ? "rgba(255, 255, 255, 0.8)"
                                                            : "rgba(240, 240, 240, 0.8)";
                                                        borderColor = "none";
                                                      }

                                                      return (
                                                        <tr
                                                          key={serie.id || j}
                                                          style={{
                                                            cursor: "pointer",
                                                            backgroundColor:
                                                              bgColor,
                                                            borderLeft:
                                                              borderColor !==
                                                              "none"
                                                                ? `4px solid ${borderColor}`
                                                                : "none",
                                                            transition:
                                                              "all 0.2s ease",
                                                            minHeight: "48px",
                                                          }}
                                                          onClick={() =>
                                                            handleEditSet(
                                                              serie,
                                                              ej
                                                            )
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
                                                              bgColor;
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
                                                              textAlign:
                                                                "center",
                                                              padding: isMobile
                                                                ? "8px 2px"
                                                                : "12px 4px",
                                                              textTransform:
                                                                "none",
                                                              color: "#222",
                                                              fontWeight: "500",
                                                              ...(isLastRow && {
                                                                borderBottomLeftRadius:
                                                                  "12px",
                                                              }),
                                                            }}
                                                          >
                                                            <div
                                                              style={{
                                                                display: "flex",
                                                                alignItems:
                                                                  "center",
                                                                justifyContent:
                                                                  "center",
                                                                gap: "4px",
                                                              }}
                                                            >
                                                              {setStatus ===
                                                                "failed" && (
                                                                <span
                                                                  style={{
                                                                    fontSize:
                                                                      "1.2em",
                                                                  }}
                                                                >
                                                                  ❌
                                                                </span>
                                                              )}
                                                              {setStatus ===
                                                                "skipped" && (
                                                                <span
                                                                  style={{
                                                                    fontSize:
                                                                      "1.2em",
                                                                  }}
                                                                >
                                                                  ⏭️
                                                                </span>
                                                              )}
                                                              {isAmrapSet && (
                                                                <span
                                                                  style={{
                                                                    fontSize:
                                                                      "0.7em",
                                                                    backgroundColor:
                                                                      "#ffc107",
                                                                    color:
                                                                      "#000",
                                                                    padding:
                                                                      "2px 6px",
                                                                    borderRadius:
                                                                      "4px",
                                                                    fontWeight:
                                                                      "bold",
                                                                  }}
                                                                >
                                                                  🔥 AMRAP
                                                                </span>
                                                              )}
                                                              {setStatus ===
                                                                "completed" &&
                                                                isExtraSet &&
                                                                !isAmrapSet && (
                                                                  <span
                                                                    style={{
                                                                      fontSize:
                                                                        "0.7em",
                                                                      backgroundColor:
                                                                        "#4caf50",
                                                                      color:
                                                                        "white",
                                                                      padding:
                                                                        "2px 6px",
                                                                      borderRadius:
                                                                        "4px",
                                                                      fontWeight:
                                                                        "bold",
                                                                    }}
                                                                  >
                                                                    EXTRA
                                                                  </span>
                                                                )}
                                                              {setStatus ===
                                                                "completed" &&
                                                                !isExtraSet &&
                                                                !isAmrapSet && (
                                                                  <span>
                                                                    {ej.repeticiones ||
                                                                      ej.repRange}
                                                                  </span>
                                                                )}
                                                            </div>
                                                          </td>
                                                          <td
                                                            style={{
                                                              fontSize: isMobile
                                                                ? "0.8em"
                                                                : "0.9em",
                                                              textAlign:
                                                                "center",
                                                              padding: isMobile
                                                                ? "8px 2px"
                                                                : "12px 4px",
                                                              textTransform:
                                                                "none",
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
                                                              textAlign:
                                                                "center",
                                                              padding: isMobile
                                                                ? "8px 2px"
                                                                : "12px 4px",
                                                              textTransform:
                                                                "none",
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
                                                              textAlign:
                                                                "center",
                                                              padding: isMobile
                                                                ? "8px 2px"
                                                                : "12px 4px",
                                                              textTransform:
                                                                "none",
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
                                                              textAlign:
                                                                "center",
                                                              padding: isMobile
                                                                ? "8px 2px"
                                                                : "12px 4px",
                                                              textTransform:
                                                                "none",
                                                              color: "#222",
                                                              fontWeight:
                                                                serie.actualRir >
                                                                0
                                                                  ? "bold"
                                                                  : "normal",
                                                            }}
                                                          >
                                                            {serie.actualRir ||
                                                              0}
                                                          </td>
                                                          <td
                                                            style={{
                                                              fontSize: isMobile
                                                                ? "0.8em"
                                                                : "0.9em",
                                                              textAlign:
                                                                "center",
                                                              padding: isMobile
                                                                ? "8px 2px"
                                                                : "12px 4px",
                                                              textTransform:
                                                                "none",
                                                              color: "#222",
                                                              fontWeight:
                                                                serie.actualRpe >
                                                                0
                                                                  ? "bold"
                                                                  : "normal",
                                                              ...(isLastRow && {
                                                                borderBottomRightRadius:
                                                                  "12px",
                                                              }),
                                                            }}
                                                          >
                                                            {serie.actualRpe ||
                                                              0}
                                                          </td>
                                                        </tr>
                                                      );
                                                    }
                                                  );
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
                                                  <strong>
                                                    Observaciones:
                                                  </strong>{" "}
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
                                    )}
                                  </SortableExercise>
                                ))}
                            </Stack>
                          </SortableContext>
                        </DndContext>
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
                flexDirection: "column",
                gap: 2,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
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
                  💪{" "}
                  {selectedExercise?.exerciseCatalog?.name ||
                    selectedExercise?.nombre ||
                    selectedExercise?.name}
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

              {/* Botón de Video Tutorial */}
              {selectedExercise?.exerciseCatalog?.videoUrl && (
                <Button
                  variant="contained"
                  startIcon={<span style={{ fontSize: "1.2em" }}>▶️</span>}
                  onClick={() => {
                    handleCloseMenu();
                    setHistoryModalOpen(false);
                    handleOpenVideo(selectedExercise.exerciseCatalog.videoUrl);
                  }}
                  sx={{
                    background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: { xs: '0.85rem', sm: '0.95rem' },
                    padding: { xs: '8px 16px', sm: '10px 24px' },
                    borderRadius: '8px',
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(255, 68, 68, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #cc0000 0%, #990000 100%)',
                      boxShadow: '0 6px 16px rgba(255, 68, 68, 0.6)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Ver Técnica del Ejercicio
                </Button>
              )}
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
            ) : (
              <>
                {/* Resumen de última sesión - DESTACADO */}
                {(() => {
                  const history = getExerciseHistory(selectedExercise);
                  if (!history || history.length === 0) return null;

                  // Filtrar sesiones completadas
                  const completedSessions = history.filter((session) => {
                    const hasSets = session.sets && session.sets.length > 0;
                    const hasCompletedSets = session.sets?.some(
                      (s) => s.reps > 0 || s.load > 0
                    );
                    return hasSets && hasCompletedSets;
                  });

                  if (completedSessions.length === 0) return null;

                  // Obtener la sesión más reciente
                  const sortedByRecent = [...completedSessions].sort(
                    (a, b) => b.microIndex - a.microIndex
                  );
                  const lastSession = sortedByRecent[0];

                  // Calcular volumen total
                  const totalVolume = lastSession.sets.reduce(
                    (sum, set) => sum + (set.reps || 0) * (set.load || 0),
                    0
                  );

                  const maxLoad =
                    lastSession.maxLoad ||
                    Math.max(
                      ...(lastSession.sets?.map((s) => s.load || 0) || [0])
                    );

                  return (
                    <Box
                      sx={{
                        bgcolor:
                          "linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(33, 150, 243, 0.1) 100%)",
                        borderRadius: 3,
                        p: 2.5,
                        mb: 3,
                        border: "2px solid #2196f3",
                        boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#2196f3",
                          fontWeight: 700,
                          mb: 1.5,
                          fontSize: { xs: "0.95rem", sm: "1.1rem" },
                        }}
                      >
                        📊 Última vez registrada
                      </Typography>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 1.5,
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            bgcolor: "rgba(255,255,255,0.1)",
                            p: 1.5,
                            borderRadius: 2,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: "#bbb", display: "block", mb: 0.5 }}
                          >
                            Carga Máx
                          </Typography>
                          <Typography
                            variant="h5"
                            sx={{ color: "#fff", fontWeight: 700 }}
                          >
                            {maxLoad} kg
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            bgcolor: "rgba(255,255,255,0.1)",
                            p: 1.5,
                            borderRadius: 2,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: "#bbb", display: "block", mb: 0.5 }}
                          >
                            Volumen Total
                          </Typography>
                          <Typography
                            variant="h5"
                            sx={{ color: "#fff", fontWeight: 700 }}
                          >
                            {totalVolume} kg
                          </Typography>
                        </Box>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "#bbb", display: "block", mb: 1 }}
                        >
                          Sets realizados:
                        </Typography>
                        <Stack spacing={0.5}>
                          {lastSession.sets &&
                            lastSession.sets.slice(0, 4).map((set, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  bgcolor: "rgba(255,255,255,0.05)",
                                  px: 1.5,
                                  py: 0.8,
                                  borderRadius: 1,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#fff",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  Set {idx + 1}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#fff",
                                    fontWeight: 600,
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  {set.reps || 0} × {set.load || 0}kg
                                  {set.actualRir > 0 && (
                                    <span
                                      style={{
                                        color: "#ff9800",
                                        marginLeft: "6px",
                                      }}
                                    >
                                      RIR {set.actualRir}
                                    </span>
                                  )}
                                </Typography>
                              </Box>
                            ))}
                          {lastSession.sets && lastSession.sets.length > 4 && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#999",
                                fontSize: "0.7rem",
                                textAlign: "center",
                                pt: 0.5,
                              }}
                            >
                              +{lastSession.sets.length - 4} sets más
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    </Box>
                  );
                })()}
              </>
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

      {/* Menú de Opciones del Ejercicio */}
      {console.log('🎨 Renderizando Menu. menuAnchorEl:', menuAnchorEl, 'open:', Boolean(menuAnchorEl))}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        sx={{
          zIndex: 99999,
        }}
        PaperProps={{
          sx: {
            background: 'linear-gradient(145deg, #2a2a2a, #1f1f1f)',
            color: '#fff',
            minWidth: 200,
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            zIndex: 99999,
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={(e) => {
            console.log('🖱️ Click en MenuItem: history');
            e.stopPropagation();
            handleMenuAction('history');
          }}
          sx={{
            py: 1.5,
            px: 2,
            '&:hover': {
              background: 'rgba(33, 150, 243, 0.1)',
            }
          }}
        >
          <ListItemIcon sx={{ color: '#2196f3' }}>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Ver Historial" 
            sx={{ color: '#fff' }}
          />
        </MenuItem>
        
        <MenuItem 
          onClick={(e) => {
            console.log('🖱️ Click en MenuItem: addSet');
            e.stopPropagation();
            handleMenuAction('addSet');
          }}
          sx={{
            py: 1.5,
            px: 2,
            '&:hover': {
              background: 'rgba(76, 175, 80, 0.1)',
            }
          }}
        >
          <ListItemIcon sx={{ color: '#4caf50' }}>
            <AddCircleOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Agregar Set Extra" 
            sx={{ color: '#fff' }}
          />
        </MenuItem>
        
        {menuExercise?.exerciseCatalog?.videoUrl && (
          <MenuItem 
            onClick={(e) => {
              console.log('🖱️ Click en MenuItem: video');
              e.stopPropagation();
              handleMenuAction('video');
            }}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                background: 'rgba(255, 68, 68, 0.1)',
              }
            }}
          >
            <ListItemIcon sx={{ color: '#ff4444' }}>
              <VideoLibraryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Ver Técnica" 
              sx={{ color: '#fff' }}
            />
          </MenuItem>
        )}
      </Menu>

      {/* Modal de Video */}
      {videoModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: isMobile ? "16px" : "24px",
          }}
          onClick={handleCloseVideo}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: isMobile ? "100%" : "900px",
              aspectRatio: "16/9",
              background: "#000",
              borderRadius: isMobile ? "8px" : "12px",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón Cerrar */}
            <IconButton
              onClick={handleCloseVideo}
              sx={{
                position: "absolute",
                top: isMobile ? 8 : 12,
                right: isMobile ? 8 : 12,
                zIndex: 100000,
                background: "rgba(0,0,0,0.7)",
                color: "#fff",
                width: { xs: 36, sm: 44 },
                height: { xs: 36, sm: 44 },
                "&:hover": {
                  background: "rgba(255,0,0,0.8)",
                  transform: "scale(1.1)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <span style={{ fontSize: isMobile ? "1.2em" : "1.5em" }}>✕</span>
            </IconButton>

            {/* iframe de YouTube */}
            <iframe
              src={videoUrl}
              title="Video del ejercicio"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
            />
          </div>
        </div>
      )}
    </Box>
  );
};
export default StudentRoutine;
