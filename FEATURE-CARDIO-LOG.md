# 🏃 Feature: Registro de Actividad Aeróbica (Cardio)

## 📋 Descripción

Permitir a los alumnos registrar actividades aeróbicas/cardio cualquier día (de entreno o no). El coach podrá ver un resumen de la actividad aeróbica del alumno.

---

## 🎯 Tipos de Actividades

| Emoji | Tipo | Key |
|-------|------|-----|
| 🚴 | Bicicleta | `bike` |
| 🚶 | Caminata | `walk` |
| 🏃 | Trote / Running | `run` |
| 🏊 | Natación | `swim` |
| ⚽ | Fútbol / Deporte | `sport` |
| 🏋️ | HIIT / Cardio gym | `hiit` |
| 🧘 | Yoga / Stretching | `yoga` |
| ➕ | Otro | `other` |

---

## 📊 Datos a Registrar

| Campo | Tipo | Requerido | Ejemplo |
|-------|------|-----------|---------|
| `activity_type` | enum | ✅ | `bike` |
| `date` | date | ✅ | `2025-12-05` |
| `duration_minutes` | int | ✅ | `45` |
| `distance_km` | decimal | ❌ | `15.5` |
| `calories_burned` | int | ❌ | `350` |
| `intensity` | enum | ✅ | `medium` |
| `steps` | int | ❌ | `8500` (solo para walk) |
| `notes` | text | ❌ | `"Ruta por el parque"` |

### Niveles de Intensidad
- `low` - Baja (recuperación activa)
- `medium` - Media (zona aeróbica)
- `high` - Alta (intervalos, sprints)

---

## 🗄️ Estructura de Base de Datos

### Tabla: `cardio_log`

```sql
CREATE TABLE cardio_log (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id),
  date DATE NOT NULL,
  activity_type VARCHAR(20) NOT NULL,
  duration_minutes INT NOT NULL,
  distance_km DECIMAL(5,2),
  calories_burned INT,
  intensity VARCHAR(10) NOT NULL DEFAULT 'medium',
  steps INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cardio_log_student_date ON cardio_log(student_id, date);
```

---

## 🔌 API Endpoints

### Alumno
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/cardio/:studentId` | Crear registro |
| `GET` | `/cardio/:studentId` | Listar registros (con filtros de fecha) |
| `GET` | `/cardio/:studentId/today` | Registros de hoy |
| `GET` | `/cardio/:studentId/week` | Resumen semanal |
| `PUT` | `/cardio/:id` | Actualizar registro |
| `DELETE` | `/cardio/:id` | Eliminar registro |

### Coach
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/cardio/:studentId/summary` | Resumen para el coach |

---

## 📱 Diseño UI

### Vista Alumno - Dashboard o sección dedicada

```
┌─────────────────────────────────────┐
│ 🏃 Mi Cardio                        │
├─────────────────────────────────────┤
│ 📅 Hoy                              │
│ ┌─────────────────────────────────┐ │
│ │ 🚴 Bicicleta      45min  15km   │ │
│ │    Alta intensidad              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [+ Agregar Actividad]               │
├─────────────────────────────────────┤
│ 📊 Esta semana                      │
│ Total: 2h 30min | 3 actividades     │
└─────────────────────────────────────┘
```

### Modal - Agregar Cardio

```
┌─────────────────────────────────────┐
│ 🏃 Registrar Cardio            [X] │
├─────────────────────────────────────┤
│ Tipo de actividad:                  │
│ [🚴] [🚶] [🏃] [🏊] [⚽] [🏋️] [➕]  │
│                                     │
│ Duración:        [___] min          │
│ Distancia:       [___] km (opcional)│
│ Calorías:        [___] kcal (opc.)  │
│                                     │
│ Intensidad:                         │
│ (○) Baja  (●) Media  (○) Alta       │
│                                     │
│ Notas: [_______________________]    │
│                                     │
│         [Cancelar]  [💾 Guardar]    │
└─────────────────────────────────────┘
```

### Vista Coach - En Tab Entrenamiento o nuevo tab

```
┌─────────────────────────────────────┐
│ 🏃 Actividad Aeróbica - Semana      │
├─────────────────────────────────────┤
│ Total: 3h 45min                     │
│ Sesiones: 5                         │
│ Promedio/día: 32min                 │
│                                     │
│ Por tipo:                           │
│ 🚴 Bici: 1h 30min (40%)             │
│ 🏃 Running: 1h 15min (33%)          │
│ 🚶 Caminata: 1h (27%)               │
└─────────────────────────────────────┘
```

---

## ✅ Checklist de Implementación

### Fase 1: Backend ✅
- [x] Crear entidad `CardioLog` (`fit-finance/src/cardio/entities/cardio-log.entity.ts`)
- [x] Crear DTOs (`create-cardio.dto.ts`, `update-cardio.dto.ts`)
- [x] Crear módulo `CardioModule`
- [x] Crear servicio `CardioService`
- [x] Crear controlador `CardioController`
- [x] Crear migración de DB
- [x] Probar endpoints con curl

### Fase 2: Frontend - Alumno ✅
- [x] Crear `cardioApi.js` con llamadas al backend
- [x] Crear componente `CardioSection` 
- [x] Crear modal `AddCardioModal`
- [x] Mostrar lista de cardio del día
- [x] Mostrar resumen semanal
- [x] Agregar ruta `/student/cardio`
- [x] Agregar ítem "Cardio" en el menú lateral

### Fase 3: Frontend - Coach ✅
- [x] Agregar card de cardio en `StudentDetail` (tab Entrenamiento)
- [x] Mostrar resumen semanal del alumno
- [x] Mostrar detalle por actividad

### Fase 4: Mejoras opcionales (Backlog)
- [ ] Gráfico de tendencia de cardio
- [ ] Integración con nutrición (calorías quemadas)
- [ ] Metas de cardio semanal
- [ ] Sincronización con apps externas (Google Fit, Apple Health) - futuro

---

## 🚀 Estado del Feature

**Fecha inicio**: 6/12/2025  
**Estado**: ✅ MVP Completado

---

## 📝 Notas

- El cardio es independiente del entrenamiento de pesas
- Se puede registrar cardio cualquier día
- Las calorías quemadas son opcionales (el alumno puede estimarlas o dejarlas vacías)
- En el futuro se podría calcular calorías automáticamente basado en peso, duración e intensidad

