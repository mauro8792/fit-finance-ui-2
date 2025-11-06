# 🏋️ Plan de Mejoras: Experiencia del Alumno

## 📋 Contexto
Mejorar la experiencia del alumno al registrar sus entrenamientos, inspirándose en apps modernas como Heavy, manteniendo el balance entre flexibilidad del alumno y estructura del coach.

---

## 🎯 Funcionalidades Propuestas

### 🥇 **PRIORIDAD 1: Agregar Sets Extra**

#### Descripción
Permitir al alumno agregar sets adicionales a los planificados por el coach, sin modificar la rutina base.

#### Casos de Uso
- ✅ El alumno se siente bien y quiere hacer más volumen
- ✅ Progresión natural del entrenamiento
- ✅ Días con más energía
- ✅ Calentamiento extra (sets con menos carga)

#### UI/UX Propuesto
```
┌─────────────────────────────────────┐
│  Press Banca                        │
│  Pectoral · 3 series · 10-12 reps  │
├─────────────────────────────────────┤
│  Set 1  [12] reps  [50] kg  RIR [7]│ ✅
│  Set 2  [12] reps  [50] kg  RIR [7]│ ✅
│  Set 3  [10] reps  [50] kg  RIR [8]│ ✅
│                                      │
│  [➕ Agregar Set Extra]              │
│                                      │
│  Set 4* [10] reps  [45] kg  RIR [6]│ ✅ (Extra)
└─────────────────────────────────────┘
```

#### Reglas de Negocio
- ✅ Sets extras se marcan visualmente (con asterisco o badge "Extra")
- ✅ Se guardan en la misma estructura de `sets`
- ✅ El coach puede verlos diferenciados en el dashboard
- ✅ No modifican la rutina original (solo esa sesión)
- ✅ Se pueden eliminar solo los sets extras
- ✅ Límite: máximo 5 sets extras por ejercicio

#### Cambios Técnicos

**Backend:**
- `SetEntity`: Agregar campo `isExtra: boolean` (default: false)
- Validación: permitir más sets que `exercise.series`
- API: No requiere cambios, ya acepta arrays de sets

**Frontend:**
- `StudentRoutine.jsx`: Botón "+ Agregar Set Extra"
- `EditSetModal.jsx`: Indicador visual si es set extra
- Estado local para manejar sets dinámicos

#### Estimación
**Esfuerzo:** 2-3 horas  
**Complejidad:** Baja

---

### 🥈 **PRIORIDAD 2: Ver Historial Previo del Ejercicio**

#### Descripción
Mostrar al alumno los datos de la última vez que realizó ese ejercicio antes de comenzar.

#### Casos de Uso
- ✅ Saber qué carga/reps hizo la última vez
- ✅ Mantener progresión (sobrecarga progresiva)
- ✅ Evitar retrocesos sin darse cuenta
- ✅ Motivación al ver mejoras

#### UI/UX Propuesto
```
┌─────────────────────────────────────┐
│  Press Banca                        │
│  Pectoral · 3 series · 10-12 reps  │
│                                      │
│  📊 Última vez (hace 3 días):       │
│  ┌─────────────────────────────┐   │
│  │ Set 1: 12 × 50kg (RIR 7) ✅ │   │
│  │ Set 2: 12 × 50kg (RIR 7) ✅ │   │
│  │ Set 3: 10 × 50kg (RIR 8) ✅ │   │
│  └─────────────────────────────┘   │
│  Volumen total: 1,600 kg            │
│                                      │
│  [Completar Sets de Hoy]            │
└─────────────────────────────────────┐
```

#### Reglas de Negocio
- ✅ Mostrar solo si existe historial previo
- ✅ Buscar en el mismo microciclo, mismo día, mismo ejercicio
- ✅ Si no hay en este microciclo, buscar en el anterior
- ✅ Mostrar fecha relativa ("hace 3 días", "hace 1 semana")
- ✅ Colapsable para no ocupar mucho espacio

#### Cambios Técnicos

**Backend:**
- Ya existe la data, solo necesitamos una consulta optimizada
- Endpoint opcional: `GET /api/exercise/:id/last-session`

**Frontend:**
- `StudentRoutine.jsx`: Lógica para obtener historial
- Reutilizar función `getExerciseHistory` que ya existe
- Componente `ExerciseHistoryPreview`

#### Estimación
**Esfuerzo:** 3-4 horas  
**Complejidad:** Media

---

### 🥉 **PRIORIDAD 3: Notas por Ejercicio**

#### Descripción
Campo de texto opcional para que el alumno deje comentarios sobre cada ejercicio.

#### Casos de Uso
- ✅ Reportar molestias o dolor
- ✅ Feedback sobre dificultad
- ✅ Razones de cambios (ej: "Máquina ocupada, usé mancuernas")
- ✅ Coach recibe contexto valioso

#### UI/UX Propuesto
```
┌─────────────────────────────────────┐
│  Press Banca                        │
│  3 series completadas ✅            │
│                                      │
│  💬 Notas (opcional):               │
│  ┌─────────────────────────────┐   │
│  │ Me costó el último set,     │   │
│  │ bajé 5kg. Sentí cansancio   │   │
│  │ en el hombro derecho.       │   │
│  └─────────────────────────────┘   │
│                                      │
│  [Guardar]                          │
└─────────────────────────────────────┘
```

#### Reglas de Negocio
- ✅ Campo opcional (no obligatorio)
- ✅ Máximo 500 caracteres
- ✅ Se guarda al completar el ejercicio
- ✅ Coach puede ver las notas en su dashboard
- ✅ Útil para ajustar futuras rutinas

#### Cambios Técnicos

**Backend:**
- `Exercise` o crear nueva entidad `ExerciseNote`
- Opción 1: Agregar `notes: string` a cada registro de ejercicio completado
- Opción 2: Tabla separada con relación `exercise_id` + `completed_date`

**Frontend:**
- `StudentRoutine.jsx`: TextField expandible
- Se muestra al finalizar todos los sets
- Auto-save opcional

#### Estimación
**Esfuerzo:** 2-3 horas  
**Complejidad:** Baja-Media

---

### 🔹 **PRIORIDAD 4: Marcar Set como Fallido/Saltado**

#### Descripción
Permitir marcar sets que no se completaron o se fallaron.

#### UI/UX Propuesto
```
┌─────────────────────────────────────┐
│  Set 2                              │
│  [✅ Completado]  [⚠️ Fallido]       │
│  [🚫 Saltado]                       │
└─────────────────────────────────────┘
```

#### Casos de Uso
- ✅ Trackear lesiones o días malos
- ✅ Diferenciar "no hice" vs "intenté y fallé"
- ✅ Analytics para el coach

#### Estimación
**Esfuerzo:** 2 horas  
**Complejidad:** Baja

---

### 🔹 **PRIORIDAD 5: Indicador de Progreso del Día**

#### Descripción
Barra de progreso visual del entrenamiento.

#### UI/UX Propuesto
```
┌─────────────────────────────────────┐
│  ⚡ Progreso del Día                │
│  ████████░░░░░░░░░░░░ 37%          │
│  3/8 ejercicios completados         │
└─────────────────────────────────────┘
```

#### Estimación
**Esfuerzo:** 1-2 horas  
**Complejidad:** Baja

---

### 🔹 **PRIORIDAD 6: Reordenar Ejercicios** (Opcional)

#### Descripción
Permitir cambiar el orden de ejercicios solo para ese día.

#### Casos de Uso
- ✅ Banco/máquina ocupado
- ✅ Reorganizar por conveniencia

⚠️ **Precaución:** Puede romper la lógica de la rutina del coach

#### Estimación
**Esfuerzo:** 4-6 horas  
**Complejidad:** Alta

---

## 📊 Resumen de Prioridades

| # | Funcionalidad | Esfuerzo | Impacto | Complejidad |
|---|---------------|----------|---------|-------------|
| 1 | Agregar Sets Extra | 2-3h | 🔥 Alto | Baja |
| 2 | Ver Historial Previo | 3-4h | 🔥 Alto | Media |
| 3 | Notas por Ejercicio | 2-3h | 🔥 Alto | Baja-Media |
| 4 | Marcar Fallido/Saltado | 2h | ⚡ Medio | Baja |
| 5 | Indicador Progreso | 1-2h | ⚡ Medio | Baja |
| 6 | Reordenar Ejercicios | 4-6h | ❄️ Bajo | Alta |

---

## 🚀 Plan de Implementación

### **Fase 1: MVP (Funcionalidad Core)** 🎯
**Tiempo estimado:** 1-2 días  
**Incluye:**
- ✅ Agregar Sets Extra
- ✅ Ver Historial Previo

**Entregable:** Alumno puede hacer más volumen y ver su progreso

---

### **Fase 2: Feedback Loop** 📝
**Tiempo estimado:** 0.5-1 día  
**Incluye:**
- ✅ Notas por Ejercicio

**Entregable:** Coach recibe feedback del alumno

---

### **Fase 3: Polish & UX** ✨
**Tiempo estimado:** 0.5 días  
**Incluye:**
- ✅ Indicador de Progreso
- ✅ Marcar Set como Fallido

**Entregable:** Experiencia más pulida

---

### **Fase 4: Avanzado (Opcional)** 🔮
**Tiempo estimado:** TBD  
**Incluye:**
- ❓ Reordenar Ejercicios
- ❓ Otras funcionalidades

---

## ✅ Checklist de Implementación

### Agregar Sets Extra
- [ ] Backend: Agregar campo `isExtra` a `SetEntity`
- [ ] Backend: Migración de base de datos
- [ ] Backend: Validar que se permitan sets extras
- [ ] Frontend: Botón "+ Agregar Set Extra"
- [ ] Frontend: Badge visual para sets extras
- [ ] Frontend: Lógica para eliminar solo sets extras
- [ ] Testing: Casos de uso principales
- [ ] Coach Dashboard: Mostrar sets extras diferenciados

### Ver Historial Previo
- [ ] Backend: Endpoint optimizado (opcional)
- [ ] Frontend: Componente `ExerciseHistoryPreview`
- [ ] Frontend: Lógica para buscar historial
- [ ] Frontend: UI colapsable
- [ ] Frontend: Fecha relativa
- [ ] Testing: Con y sin historial previo

### Notas por Ejercicio
- [ ] Backend: Decidir estructura (campo o tabla)
- [ ] Backend: Migración
- [ ] Backend: Endpoint para guardar/obtener notas
- [ ] Frontend: TextField expandible
- [ ] Frontend: Auto-save (opcional)
- [ ] Coach Dashboard: Mostrar notas del alumno
- [ ] Testing: Límite de caracteres

---

## 🎨 Consideraciones de Diseño

### Principios
1. **No intrusivo:** No interrumpir el flujo del alumno
2. **Progresivo:** Mostrar funciones avanzadas gradualmente
3. **Coherente:** Mantener el estilo actual de la app
4. **Móvil first:** Optimizar para pantallas pequeñas

### Colores
- Sets normales: Fondo actual (amarillo/blanco)
- Sets extras: Fondo verde claro + badge "Extra"
- Sets fallidos: Fondo rojo claro + badge "Fallido"
- Sets saltados: Fondo gris + badge "Saltado"

---

## 🔐 Permisos y Validaciones

### Alumno puede:
- ✅ Agregar sets extras (máx 5 por ejercicio)
- ✅ Eliminar sets extras que agregó
- ✅ Ver su historial previo
- ✅ Agregar notas a ejercicios

### Alumno NO puede:
- ❌ Modificar rutina base (series, reps, descanso)
- ❌ Eliminar sets planificados por el coach
- ❌ Modificar ejercicios de la rutina
- ❌ Cambiar orden (por ahora)

### Coach puede:
- ✅ Ver todos los sets (incluyendo extras)
- ✅ Ver notas del alumno
- ✅ Ver estadísticas diferenciadas
- ✅ Ajustar rutinas basándose en el feedback

---

## 📱 Compatibilidad

- ✅ PWA móvil (iOS/Android)
- ✅ Desktop
- ✅ Tablets
- ✅ Modo offline (sync cuando vuelve conexión)

---

## 📈 Métricas de Éxito

### KPIs
1. **Engagement:**
   - % de alumnos que agregan sets extras
   - Promedio de sets extras por sesión

2. **Feedback:**
   - % de ejercicios con notas
   - Tiempo de coach revisando feedback

3. **Retención:**
   - Aumento en días de entrenamiento completados
   - Reducción en abandono de sesiones

---

## 🔄 Futuras Iteraciones

### Ideas adicionales (backlog)
- 🔮 **Temporizador entre series** (ya implementado en `RestTimerWidget`)
- 🔮 **Recordatorios/notificaciones** de días de entrenamiento
- 🔮 **Comparativa de progreso** (gráficos de mejora)
- 🔮 **Logros/badges** (gamificación)
- 🔮 **Compartir entrenamientos** con amigos
- 🔮 **Modo oscuro**
- 🔮 **Videos de ejercicios** (vinculados al catálogo)
- 🔮 **Super sets / Circuitos**
- 🔮 **Drop sets / Rest-pause**

---

## 📝 Notas del Desarrollo

### Decisiones Importantes
- **Sets extras:** No modifican la rutina base, solo se aplican a esa sesión
- **Historial:** Priorizar mismo microciclo/día para relevancia
- **Notas:** Opcionales para no agregar fricción

### Riesgos
- ⚠️ Sets extras ilimitados podrían llevar a sobreentrenamiento
- ⚠️ Reordenar ejercicios podría romper lógica de rutinas (superseries, etc)

---

## 🎯 Próximos Pasos

1. **Revisar y validar** este plan con el equipo
2. **Priorizar** funcionalidades según feedback
3. **Crear issues/tareas** en el backlog
4. **Implementar Fase 1** (Agregar Sets + Historial)
5. **Iterar** basándose en uso real

---

**Fecha de creación:** 2025-11-06  
**Última actualización:** 2025-11-06  
**Estado:** 📋 Planificado

